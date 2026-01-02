/**
 * Agent Runner
 * Orchestrates the agent execution loop with tool calling
 */

import { chat } from "../ollama/client";
import type { ChatMessage } from "../ollama/types";
import { getOllamaTools, executeTool } from "../mcp/servers";
import type { TraceStep, Trace } from "../mcp/types";
import { generateStepId } from "../store/agent";
import { safeJsonParseSimple } from "../security";

const SYSTEM_PROMPT = `You are an AI assistant with access to two MCP (Model Context Protocol) servers:

1. **nexus://tickets** - A ticket/issue tracking system (like Jira/Linear) with these tools:
   - tickets_searchTickets: Search tickets by query
   - tickets_getTicket: Get ticket details by ID
   - tickets_listTickets: List tickets with filters
   - tickets_createTicket: Create a new ticket
   - tickets_updateTicket: Update ticket status

2. **nexus://wiki** - A documentation system (like Confluence/Notion) with these tools:
   - wiki_searchPages: Search wiki pages
   - wiki_getPage: Get page content by ID
   - wiki_listPages: List pages with filters
   - wiki_createPage: Create a new page

When the user asks a question:
1. Think about which tools you need to use
2. Call the appropriate tools to gather information
3. Synthesize the results into a helpful response

Always use tools when you need real data. Do not make up information.
Format your responses clearly with markdown when helpful.`;

export interface AgentRunnerCallbacks {
  onStepAdded: (step: TraceStep) => void;
  onTokensUsed: (count: number) => void;
  onComplete: (trace: Trace) => void;
  onError: (error: Error) => void;
}

export async function runAgent(
  query: string,
  model: string,
  callbacks: AgentRunnerCallbacks
): Promise<Trace> {
  const startTime = Date.now();
  const steps: TraceStep[] = [];
  let totalTokens = 0;

  // Helper to add and report steps
  const addStep = (step: TraceStep) => {
    steps.push(step);
    callbacks.onStepAdded(step);
  };

  // Add user query step
  addStep({
    id: generateStepId(),
    type: "user",
    timestamp: Date.now(),
    content: query,
  });

  // Build messages
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: query },
  ];

  // Get tools in Ollama format
  const tools = getOllamaTools();

  try {
    // Main agent loop
    let iterations = 0;
    const maxIterations = 10;

    while (iterations < maxIterations) {
      iterations++;

      // Add planning step
      addStep({
        id: generateStepId(),
        type: "planning",
        timestamp: Date.now(),
        content: `Thinking... (iteration ${iterations})`,
      });

      // Call Ollama
      const response = await chat(model, messages, tools);

      // Track tokens
      const promptTokens = response.prompt_eval_count || 0;
      const evalTokens = response.eval_count || 0;
      totalTokens += promptTokens + evalTokens;
      callbacks.onTokensUsed(promptTokens + evalTokens);

      const assistantMessage = response.message;

      // Check for tool calls
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        // Process each tool call
        for (const toolCall of assistantMessage.tool_calls) {
          const toolName = toolCall.function.name;
          let toolArgs: Record<string, unknown>;

          try {
            // Safe parsing with fallback
            toolArgs = safeJsonParseSimple<Record<string, unknown>>(
              toolCall.function.arguments,
              {}
            );
          } catch {
            toolArgs = {};
          }

          // Add tool call step
          addStep({
            id: generateStepId(),
            type: "tool_call",
            timestamp: Date.now(),
            content: `Calling ${toolName}`,
            toolName,
            toolArgs,
          });

          // Execute the tool
          try {
            const result = await executeTool(toolName, toolArgs);

            // Add tool result step
            addStep({
              id: generateStepId(),
              type: "tool_result",
              timestamp: Date.now(),
              content: `Result from ${toolName}`,
              toolName,
              toolResult: result,
            });

            // Add tool result to messages
            messages.push({
              role: "assistant",
              content: "",
              tool_calls: [toolCall],
            });
            messages.push({
              role: "tool",
              content: JSON.stringify(result),
              tool_call_id: toolCall.id,
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";

            addStep({
              id: generateStepId(),
              type: "error",
              timestamp: Date.now(),
              content: `Tool error: ${errorMessage}`,
              toolName,
            });

            // Add error to messages so LLM knows
            messages.push({
              role: "assistant",
              content: "",
              tool_calls: [toolCall],
            });
            messages.push({
              role: "tool",
              content: JSON.stringify({ error: errorMessage }),
              tool_call_id: toolCall.id,
            });
          }
        }
      } else {
        // No tool calls - this is the final response
        addStep({
          id: generateStepId(),
          type: "response",
          timestamp: Date.now(),
          content: assistantMessage.content,
          tokens: evalTokens,
          duration: response.eval_duration ? response.eval_duration / 1e6 : undefined,
        });

        // Build and return trace
        const trace: Trace = {
          id: `trace_${Date.now()}`,
          query,
          model,
          steps,
          startTime,
          endTime: Date.now(),
          totalTokens,
          success: true,
        };

        callbacks.onComplete(trace);
        return trace;
      }
    }

    // Max iterations reached
    addStep({
      id: generateStepId(),
      type: "error",
      timestamp: Date.now(),
      content: "Maximum iterations reached. Stopping execution.",
    });

    const trace: Trace = {
      id: `trace_${Date.now()}`,
      query,
      model,
      steps,
      startTime,
      endTime: Date.now(),
      totalTokens,
      success: false,
    };

    callbacks.onComplete(trace);
    return trace;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    addStep({
      id: generateStepId(),
      type: "error",
      timestamp: Date.now(),
      content: `Agent error: ${errorMessage}`,
    });

    const trace: Trace = {
      id: `trace_${Date.now()}`,
      query,
      model,
      steps,
      startTime,
      endTime: Date.now(),
      totalTokens,
      success: false,
    };

    callbacks.onError(error instanceof Error ? error : new Error(errorMessage));
    callbacks.onComplete(trace);
    return trace;
  }
}
