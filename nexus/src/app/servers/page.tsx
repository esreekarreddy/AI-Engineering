"use client";

import { useState } from "react";
import { Server, Wrench, Database, MessageSquare, ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

// Synthetic server definitions
const servers = [
  {
    id: "tickets",
    name: "nexus://tickets",
    description: "Simulated Jira/Linear ticket system for bug tracking and project management",
    icon: "🎫",
    tools: [
      {
        name: "searchTickets",
        description: "Search tickets by query, status, or priority",
        parameters: {
          query: { type: "string", description: "Search query" },
          status: { type: "string", enum: ["open", "in_progress", "closed", "all"], description: "Filter by status" },
          priority: { type: "string", enum: ["P0", "P1", "P2", "P3", "all"], description: "Filter by priority" },
        },
      },
      {
        name: "getTicket",
        description: "Get detailed information about a specific ticket",
        parameters: {
          ticketId: { type: "string", description: "Ticket ID (e.g., TKT-001)" },
        },
      },
      {
        name: "createTicket",
        description: "Create a new ticket in the system",
        parameters: {
          title: { type: "string", description: "Ticket title" },
          description: { type: "string", description: "Detailed description" },
          priority: { type: "string", enum: ["P0", "P1", "P2", "P3"], description: "Priority level" },
        },
      },
      {
        name: "updateTicket",
        description: "Update an existing ticket",
        parameters: {
          ticketId: { type: "string", description: "Ticket ID" },
          status: { type: "string", enum: ["open", "in_progress", "closed"], description: "New status" },
          assignee: { type: "string", description: "Assignee email" },
        },
      },
      {
        name: "listTickets",
        description: "List all tickets with optional filters",
        parameters: {
          limit: { type: "number", description: "Maximum number of tickets to return" },
          status: { type: "string", enum: ["open", "in_progress", "closed", "all"], description: "Filter by status" },
        },
      },
    ],
    resources: [
      { uri: "tickets://all", name: "All Tickets", description: "Complete list of all tickets" },
      { uri: "tickets://open", name: "Open Tickets", description: "Currently open tickets" },
      { uri: "tickets://critical", name: "Critical Tickets", description: "P0 and P1 priority tickets" },
    ],
    prompts: [
      {
        name: "summarize_ticket",
        description: "Generate a summary for a ticket",
        arguments: [{ name: "ticketId", required: true, description: "The ticket to summarize" }],
      },
      {
        name: "triage_report",
        description: "Generate a triage report for open tickets",
        arguments: [{ name: "priority", required: false, description: "Filter by priority" }],
      },
    ],
  },
  {
    id: "wiki",
    name: "nexus://wiki",
    description: "Simulated Confluence/Notion documentation system",
    icon: "📚",
    tools: [
      {
        name: "searchPages",
        description: "Search wiki pages by keyword",
        parameters: {
          query: { type: "string", description: "Search query" },
          space: { type: "string", description: "Filter by space (e.g., engineering, product)" },
        },
      },
      {
        name: "getPage",
        description: "Get the full content of a wiki page",
        parameters: {
          pageId: { type: "string", description: "Page ID (e.g., DOC-001)" },
        },
      },
      {
        name: "createPage",
        description: "Create a new wiki page",
        parameters: {
          title: { type: "string", description: "Page title" },
          content: { type: "string", description: "Page content in markdown" },
          space: { type: "string", description: "Space to create in" },
        },
      },
      {
        name: "updatePage",
        description: "Update an existing wiki page",
        parameters: {
          pageId: { type: "string", description: "Page ID" },
          content: { type: "string", description: "New content" },
        },
      },
    ],
    resources: [
      { uri: "wiki://all", name: "All Pages", description: "Complete list of wiki pages" },
      { uri: "wiki://engineering", name: "Engineering Docs", description: "Technical documentation" },
      { uri: "wiki://runbooks", name: "Runbooks", description: "Incident response runbooks" },
    ],
    prompts: [
      {
        name: "summarize_page",
        description: "Generate a summary of a wiki page",
        arguments: [{ name: "pageId", required: true, description: "The page to summarize" }],
      },
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[var(--success)]" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
      )}
    </button>
  );
}

interface ServerCardProps {
  server: typeof servers[0];
}

function ServerCard({ server }: ServerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"tools" | "resources" | "prompts">("tools");

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
      >
        <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl">
          {server.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[var(--text-primary)]">{server.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--success-muted)] text-[var(--success)]">
              Active
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{server.description}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            {server.tools.length} tools
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            {server.resources.length} resources
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            {server.prompts.length} prompts
          </span>
          {expanded ? (
            <ChevronDown className="w-5 h-5 text-[var(--text-secondary)]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] animate-fade-in">
          {/* Tabs */}
          <div className="flex border-b border-[var(--border-subtle)]">
            {(["tools", "resources", "prompts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2.5 text-sm font-medium capitalize transition-colors
                  ${activeTab === tab
                    ? "text-[var(--accent-violet)] border-b-2 border-[var(--accent-violet)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === "tools" && (
              <div className="space-y-3">
                {server.tools.map((tool) => (
                  <div
                    key={tool.name}
                    className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <code className="text-sm font-mono text-[var(--accent-cyan)]">{tool.name}()</code>
                      <CopyButton text={JSON.stringify(tool, null, 2)} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{tool.description}</p>
                    <div className="text-xs text-[var(--text-muted)]">
                      <span className="font-medium">Parameters:</span>
                      <pre className="mt-1 p-2 rounded bg-[var(--bg-primary)] overflow-x-auto">
                        {JSON.stringify(tool.parameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="space-y-2">
                {server.resources.map((resource) => (
                  <div
                    key={resource.uri}
                    className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                  >
                    <div>
                      <code className="text-sm font-mono text-[var(--accent-cyan)]">{resource.uri}</code>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{resource.description}</p>
                    </div>
                    <CopyButton text={resource.uri} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "prompts" && (
              <div className="space-y-2">
                {server.prompts.map((prompt) => (
                  <div
                    key={prompt.name}
                    className="p-3 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-sm font-mono text-[var(--accent-violet)]">{prompt.name}</code>
                      <CopyButton text={JSON.stringify(prompt, null, 2)} />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{prompt.description}</p>
                    {prompt.arguments.length > 0 && (
                      <div className="mt-2 text-xs text-[var(--text-muted)]">
                        <span className="font-medium">Arguments:</span>{" "}
                        {prompt.arguments.map((arg) => (
                          <span key={arg.name} className="inline-flex items-center gap-1 mx-1">
                            <code>{arg.name}</code>
                            {arg.required && <span className="text-[var(--error)]">*</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ServersPage() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Server className="w-5 h-5 text-[var(--accent-violet)]" />
          <h1 className="text-xl font-semibold">MCP Servers</h1>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Browse the synthetic MCP servers available for agent testing. Each server exposes tools, resources, and prompts.
        </p>

        {/* Server List */}
        <div className="space-y-4">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </div>
    </div>
  );
}
