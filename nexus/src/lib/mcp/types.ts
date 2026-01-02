/**
 * MCP Types
 * Type definitions for Model Context Protocol primitives
 */

// Tool definition
export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, MCPParameter>;
    required?: string[];
  };
}

export interface MCPParameter {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  enum?: string[];
  default?: unknown;
}

// Resource definition
export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

// Prompt definition
export interface MCPPrompt {
  name: string;
  description: string;
  arguments: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required: boolean;
}

// Server definition
export interface MCPServer {
  id: string;
  name: string;
  description: string;
  icon: string;
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  
  // Handler functions
  executeTool: (toolName: string, args: Record<string, unknown>) => Promise<unknown>;
  getResource: (uri: string) => Promise<unknown>;
  renderPrompt: (promptName: string, args: Record<string, unknown>) => string;
}

// Tool execution result
export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Agent trace types
export interface TraceStep {
  id: string;
  type: "user" | "planning" | "tool_call" | "tool_result" | "response" | "error";
  timestamp: number;
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  tokens?: number;
  duration?: number;
}

export interface Trace {
  id: string;
  query: string;
  model: string;
  steps: TraceStep[];
  startTime: number;
  endTime?: number;
  totalTokens: number;
  success: boolean;
}
