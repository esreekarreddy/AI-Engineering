/**
 * Ollama Client Types
 * Types for interacting with Ollama's local API
 */

// Model configuration
export interface OllamaModel {
  id: string;
  name: string;
  description: string;
  speed: "ultra-fast" | "fast" | "medium" | "slow";
}

export const AVAILABLE_MODELS: OllamaModel[] = [
  {
    id: "mistral:7b",
    name: "Mistral 7B",
    description: "Fastest option, excellent for function calling",
    speed: "fast",
  },
  {
    id: "llama3.1:8b",
    name: "Llama 3.1 8B",
    description: "Best accuracy for complex reasoning",
    speed: "medium",
  },
  {
    id: "functiongemma",
    name: "FunctionGemma",
    description: "Ultra-small, specialized for tool use",
    speed: "ultra-fast",
  },
];

// Chat message types
export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

// Tool definition for Ollama
export interface OllamaTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, ToolParameter>;
      required?: string[];
    };
  };
}

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  enum?: string[];
}

// Ollama API request/response types
export interface OllamaChatRequest {
  model: string;
  messages: ChatMessage[];
  tools?: OllamaTool[];
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
  };
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: "assistant";
    content: string;
    tool_calls?: ToolCall[];
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

// Connection status
export type OllamaStatus = "checking" | "connected" | "disconnected";

// Model list response
export interface OllamaTagsResponse {
  models: {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
  }[];
}
