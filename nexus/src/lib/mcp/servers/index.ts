/**
 * MCP Server Registry
 * Central registry of all available MCP servers
 */

import { ticketsServer } from "./tickets";
import { wikiServer } from "./wiki";
import type { MCPServer, MCPTool } from "../types";
import type { OllamaTool } from "../../ollama/types";

// All available servers
export const servers: MCPServer[] = [ticketsServer, wikiServer];

// Get server by ID
export function getServer(serverId: string): MCPServer | undefined {
  return servers.find((s) => s.id === serverId);
}

// Get all tools across all servers
export function getAllTools(): { server: MCPServer; tool: MCPTool }[] {
  return servers.flatMap((server) =>
    server.tools.map((tool) => ({ server, tool }))
  );
}

// Convert MCP tools to Ollama tool format
export function getOllamaTools(): OllamaTool[] {
  return servers.flatMap((server) =>
    server.tools.map((tool) => ({
      type: "function" as const,
      function: {
        name: `${server.id}_${tool.name}`,
        description: `[${server.name}] ${tool.description}`,
        parameters: {
          type: "object" as const,
          properties: tool.parameters.properties,
          required: tool.parameters.required,
        },
      },
    }))
  );
}

// Execute a tool by full name (serverId_toolName)
export async function executeTool(
  fullToolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const [serverId, ...toolNameParts] = fullToolName.split("_");
  const toolName = toolNameParts.join("_");
  
  const server = getServer(serverId);
  if (!server) {
    throw new Error(`Server not found: ${serverId}`);
  }
  
  const tool = server.tools.find((t) => t.name === toolName);
  if (!tool) {
    throw new Error(`Tool not found: ${toolName} in server ${serverId}`);
  }
  
  return server.executeTool(toolName, args);
}

// Get tool info from full name
export function getToolInfo(fullToolName: string): { server: MCPServer; tool: MCPTool } | null {
  const [serverId, ...toolNameParts] = fullToolName.split("_");
  const toolName = toolNameParts.join("_");
  
  const server = getServer(serverId);
  if (!server) return null;
  
  const tool = server.tools.find((t) => t.name === toolName);
  if (!tool) return null;
  
  return { server, tool };
}

export { ticketsServer, wikiServer };
