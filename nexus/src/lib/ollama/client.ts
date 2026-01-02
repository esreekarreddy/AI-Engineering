/**
 * Ollama Client
 * Handles communication with local Ollama instance
 */

import type {
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaStatus,
  OllamaTagsResponse,
  ChatMessage,
  OllamaTool,
} from "./types";

const OLLAMA_BASE_URL = "http://localhost:11434";

/**
 * Check if Ollama is running and accessible
 */
export async function checkConnection(): Promise<OllamaStatus> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    });
    
    if (response.ok) {
      return "connected";
    }
    return "disconnected";
  } catch {
    return "disconnected";
  }
}

/**
 * Get list of available models from Ollama
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }
    
    const data: OllamaTagsResponse = await response.json();
    return data.models.map((m) => m.name);
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

/**
 * Send a chat request to Ollama with optional tools
 */
export async function chat(
  model: string,
  messages: ChatMessage[],
  tools?: OllamaTool[]
): Promise<OllamaChatResponse> {
  const request: OllamaChatRequest = {
    model,
    messages,
    tools,
    stream: false,
    options: {
      temperature: 0.7,
    },
  };

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama chat failed: ${error}`);
  }

  return response.json();
}

/**
 * Send a chat request with streaming response
 */
export async function* chatStream(
  model: string,
  messages: ChatMessage[],
  tools?: OllamaTool[]
): AsyncGenerator<OllamaChatResponse> {
  const request: OllamaChatRequest = {
    model,
    messages,
    tools,
    stream: true,
    options: {
      temperature: 0.7,
    },
  };

  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama chat failed: ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Parse complete JSON objects from buffer
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const parsed = JSON.parse(line);
          // Basic validation - ensure it's an object
          if (parsed && typeof parsed === 'object' && !('__proto__' in parsed)) {
            yield parsed as OllamaChatResponse;
          } else {
            console.warn("Invalid streaming response structure:", line.slice(0, 100));
          }
        } catch {
          console.warn("Failed to parse streaming response:", line.slice(0, 100));
        }
      }
    }
  }
}

/**
 * Calculate tokens per second from response
 */
export function calculateTokensPerSecond(response: OllamaChatResponse): number {
  if (!response.eval_count || !response.eval_duration) {
    return 0;
  }
  // eval_duration is in nanoseconds
  const seconds = response.eval_duration / 1e9;
  return response.eval_count / seconds;
}

/**
 * Format duration in human readable format
 */
export function formatDuration(nanoseconds: number): string {
  const ms = nanoseconds / 1e6;
  if (ms < 1000) {
    return `${ms.toFixed(0)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}
