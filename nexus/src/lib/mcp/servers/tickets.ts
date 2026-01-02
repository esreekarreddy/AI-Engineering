/**
 * Tickets MCP Server
 * Simulates Jira/Linear ticket system
 */

import type { MCPServer, MCPTool, MCPResource, MCPPrompt } from "../types";

// Synthetic ticket data
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed";
  priority: "P0" | "P1" | "P2" | "P3";
  assignee: string | null;
  labels: string[];
  created: string;
  updated: string;
  comments: { author: string; text: string; timestamp: string }[];
}

// Generate synthetic tickets
function generateTickets(): Ticket[] {
  const titles = [
    "Login fails on Safari browser",
    "Password reset email not sent",
    "API rate limiting not working correctly",
    "Dashboard loading very slowly",
    "User profile picture not updating",
    "Search results returning duplicates",
    "Mobile app crashes on startup",
    "Payment processing timeout errors",
    "Two-factor authentication broken",
    "Export to CSV missing columns",
    "Notification emails going to spam",
    "Session expires too quickly",
    "Dark mode colors incorrect",
    "File upload size limit too small",
    "Websocket connection drops frequently",
    "Database connection pool exhausted",
    "Memory leak in background worker",
    "Caching not invalidating properly",
    "Pagination broken on large datasets",
    "Timezone display incorrect",
    "SSL certificate renewal needed",
    "CORS errors blocking API calls",
    "User permissions not applied correctly",
    "Audit log missing entries",
    "Backup job failing silently",
    "Email templates rendering incorrectly",
    "Mobile push notifications delayed",
    "Search indexing stuck",
    "Analytics data not aggregating",
    "Webhook delivery failing",
    "OAuth integration broken after update",
    "Image optimization not working",
    "CDN cache not purging",
    "Rate limiter blocking valid requests",
    "Form validation too aggressive",
    "Dropdown menu z-index issues",
    "Keyboard navigation broken",
    "Screen reader labels missing",
    "Color contrast too low",
    "Touch targets too small on mobile",
    "Infinite scroll not loading more",
    "Filter state not persisting",
    "Sort order inconsistent",
    "Bulk actions timing out",
    "Import failing on large files",
    "Export stuck at 99%",
    "Real-time updates not working",
    "Comments not saving",
    "Attachments failing to upload",
    "Mentions not triggering notifications",
  ];

  const descriptions = [
    "Users are reporting that this issue occurs randomly",
    "This has been happening since the last deployment",
    "Multiple customers have complained about this",
    "Reproducible 100% of the time with specific steps",
    "Only affects a subset of users",
    "Started appearing after the security update",
    "Causing significant business impact",
    "Need to investigate root cause further",
    "Temporary workaround available",
    "Blocking several customer workflows",
  ];

  const assignees = [
    "alice@example.com",
    "bob@example.com",
    "charlie@example.com",
    "diana@example.com",
    null,
    null,
  ];

  const labelSets = [
    ["bug", "auth"],
    ["bug", "performance"],
    ["bug", "ui"],
    ["bug", "api"],
    ["bug", "mobile"],
    ["bug", "security"],
    ["feature", "enhancement"],
    ["bug", "database"],
    ["bug", "integration"],
    ["maintenance"],
  ];

  const tickets: Ticket[] = [];

  for (let i = 0; i < 50; i++) {
    const created = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const updated = new Date(created.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    tickets.push({
      id: `TKT-${String(i + 1).padStart(3, "0")}`,
      title: titles[i % titles.length],
      description: descriptions[i % descriptions.length],
      status: ["open", "in_progress", "closed"][Math.floor(Math.random() * 3)] as Ticket["status"],
      priority: ["P0", "P1", "P2", "P3"][Math.floor(Math.random() * 4)] as Ticket["priority"],
      assignee: assignees[Math.floor(Math.random() * assignees.length)],
      labels: labelSets[Math.floor(Math.random() * labelSets.length)],
      created: created.toISOString(),
      updated: updated.toISOString(),
      comments: Math.random() > 0.5 ? [
        {
          author: assignees.filter(Boolean)[Math.floor(Math.random() * 4)] as string,
          text: "Looking into this now.",
          timestamp: updated.toISOString(),
        },
      ] : [],
    });
  }

  return tickets;
}

const tickets = generateTickets();

// Tool definitions
const tools: MCPTool[] = [
  {
    name: "searchTickets",
    description: "Search tickets by query, status, or priority. Returns matching tickets.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query to match against title and description" },
        status: { type: "string", description: "Filter by status", enum: ["open", "in_progress", "closed", "all"] },
        priority: { type: "string", description: "Filter by priority", enum: ["P0", "P1", "P2", "P3", "all"] },
        limit: { type: "number", description: "Maximum results to return (default: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "getTicket",
    description: "Get detailed information about a specific ticket by ID.",
    parameters: {
      type: "object",
      properties: {
        ticketId: { type: "string", description: "Ticket ID (e.g., TKT-001)" },
      },
      required: ["ticketId"],
    },
  },
  {
    name: "listTickets",
    description: "List all tickets with optional filters.",
    parameters: {
      type: "object",
      properties: {
        status: { type: "string", description: "Filter by status", enum: ["open", "in_progress", "closed", "all"] },
        priority: { type: "string", description: "Filter by priority", enum: ["P0", "P1", "P2", "P3", "all"] },
        limit: { type: "number", description: "Maximum results (default: 20)" },
      },
    },
  },
  {
    name: "createTicket",
    description: "Create a new ticket in the system.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Ticket title" },
        description: { type: "string", description: "Detailed description" },
        priority: { type: "string", description: "Priority level", enum: ["P0", "P1", "P2", "P3"] },
      },
      required: ["title"],
    },
  },
  {
    name: "updateTicket",
    description: "Update an existing ticket's status or assignee.",
    parameters: {
      type: "object",
      properties: {
        ticketId: { type: "string", description: "Ticket ID" },
        status: { type: "string", description: "New status", enum: ["open", "in_progress", "closed"] },
        assignee: { type: "string", description: "New assignee email" },
      },
      required: ["ticketId"],
    },
  },
];

// Resource definitions
const resources: MCPResource[] = [
  { uri: "tickets://all", name: "All Tickets", description: "Complete list of all tickets" },
  { uri: "tickets://open", name: "Open Tickets", description: "Currently open tickets" },
  { uri: "tickets://critical", name: "Critical Tickets", description: "P0 and P1 priority tickets" },
];

// Prompt definitions
const prompts: MCPPrompt[] = [
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
];

// Tool execution handler
// Tool execution handler
async function executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  switch (toolName) {
    case "searchTickets": {
      if (typeof args.query !== "string") {
        throw new Error("Missing or invalid argument: query must be a string");
      }
      const query = args.query.toLowerCase();
      const status = args.status as string | undefined;
      const priority = args.priority as string | undefined;
      const limit = (args.limit as number) || 10;

      let results = tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query)
      );

      if (status && status !== "all") {
        results = results.filter((t) => t.status === status);
      }

      if (priority && priority !== "all") {
        results = results.filter((t) => t.priority === priority);
      }

      return results.slice(0, limit).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignee: t.assignee,
      }));
    }

    case "getTicket": {
      if (typeof args.ticketId !== "string") {
        throw new Error("Missing or invalid argument: ticketId must be a string");
      }
      const ticketId = args.ticketId;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }
      return ticket;
    }

    case "listTickets": {
      const status = args.status as string | undefined;
      const priority = args.priority as string | undefined;
      const limit = (args.limit as number) || 20;

      let results = [...tickets];

      if (status && status !== "all") {
        results = results.filter((t) => t.status === status);
      }

      if (priority && priority !== "all") {
        results = results.filter((t) => t.priority === priority);
      }

      return results.slice(0, limit).map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
      }));
    }

    case "createTicket": {
      if (typeof args.title !== "string") {
        throw new Error("Missing or invalid argument: title must be a string");
      }
      const newTicket: Ticket = {
        id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
        title: args.title,
        description: typeof args.description === "string" ? args.description : "",
        status: "open",
        priority: (args.priority as Ticket["priority"]) || "P2",
        assignee: null,
        labels: [],
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        comments: [],
      };
      tickets.push(newTicket);
      return { success: true, ticket: newTicket };
    }

    case "updateTicket": {
      if (typeof args.ticketId !== "string") {
        throw new Error("Missing or invalid argument: ticketId must be a string");
      }
      const ticketId = args.ticketId;
      const ticket = tickets.find((t) => t.id === ticketId);
      if (!ticket) {
        throw new Error(`Ticket ${ticketId} not found`);
      }

      if (args.status && typeof args.status === "string") {
        ticket.status = args.status as Ticket["status"];
      }
      if (args.assignee && typeof args.assignee === "string") {
        ticket.assignee = args.assignee;
      }
      ticket.updated = new Date().toISOString();

      return { success: true, ticket };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Resource handler
async function getResource(uri: string): Promise<unknown> {
  switch (uri) {
    case "tickets://all":
      return tickets;
    case "tickets://open":
      return tickets.filter((t) => t.status === "open");
    case "tickets://critical":
      return tickets.filter((t) => t.priority === "P0" || t.priority === "P1");
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

// Prompt renderer
function renderPrompt(promptName: string, args: Record<string, unknown>): string {
  switch (promptName) {
    case "summarize_ticket": {
      const ticket = tickets.find((t) => t.id === args.ticketId);
      if (!ticket) {
        return `Ticket ${args.ticketId} not found.`;
      }
      return `Please summarize the following ticket:\n\nID: ${ticket.id}\nTitle: ${ticket.title}\nDescription: ${ticket.description}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}`;
    }

    case "triage_report": {
      const openTickets = tickets.filter((t) => t.status === "open");
      const filtered = args.priority
        ? openTickets.filter((t) => t.priority === args.priority)
        : openTickets;

      return `Generate a triage report for the following ${filtered.length} open tickets:\n\n${filtered
        .map((t) => `- ${t.id}: ${t.title} (${t.priority})`)
        .join("\n")}`;
    }

    default:
      return `Unknown prompt: ${promptName}`;
  }
}

// Export the server
export const ticketsServer: MCPServer = {
  id: "tickets",
  name: "nexus://tickets",
  description: "Simulated Jira/Linear ticket system for bug tracking and project management",
  icon: "🎫",
  tools,
  resources,
  prompts,
  executeTool,
  getResource,
  renderPrompt,
};

// Export tickets for direct access if needed
export { tickets };
