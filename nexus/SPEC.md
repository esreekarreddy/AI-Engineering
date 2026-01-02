# SR Nexus — Technical Specification

> Reference document for building the SR Nexus MCP Agent Debugging Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [MCP Protocol Integration](#mcp-protocol-integration)
4. [Synthetic Servers](#synthetic-servers)
5. [Ollama Integration](#ollama-integration)
6. [UI/UX Design](#uiux-design)
7. [Feature Specifications](#feature-specifications)
8. [Data Storage](#data-storage)
9. [Development Phases](#development-phases)

---

## Overview

### What is SR Nexus?

SR Nexus is an advanced debugging and visualization platform for AI agents built on the Model Context Protocol (MCP). It allows developers to:

- **See how AI thinks** — Real-time decision tree visualization
- **Test against fake services** — Synthetic enterprise data
- **Debug agent behavior** — Time-travel through execution
- **Compare models** — Switch between Mistral, Llama, FunctionGemma

### Core Value Proposition

| Existing Tool | Limitation                  | SR Nexus Solution                 |
| ------------- | --------------------------- | --------------------------------- |
| MCP Inspector | Tests individual tools only | Full agent workflow visualization |
| LangSmith     | Cloud-based, requires API   | 100% local with Ollama            |
| Console logs  | Hard to understand flow     | Interactive decision trees        |

---

## Architecture

### High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SR Nexus (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Agent     │  │  Server    │  │  Decision  │  │  Settings  │ │
│  │  Runner    │  │  Browser   │  │  Tree View │  │  Panel     │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
│        │               │               │               │        │
│        └───────────────┴───────────────┴───────────────┘        │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   Zustand Store   │                        │
│                    │  (State Manager)  │                        │
│                    └─────────┬─────────┘                        │
│                              │                                   │
├──────────────────────────────┼──────────────────────────────────┤
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │                     MCP Client Layer                       │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│          ┌───────────────────┼───────────────────┐              │
│          │                   │                   │              │
│          ▼                   ▼                   ▼              │
│   ┌────────────┐      ┌────────────┐      ┌────────────┐       │
│   │  Tickets   │      │    Wiki    │      │   Future   │       │
│   │   Server   │      │   Server   │      │  Servers   │       │
│   └────────────┘      └────────────┘      └────────────┘       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │   Ollama (Local)   │
                    │  ┌──────────────┐  │
                    │  │ Mistral 7B   │  │
                    │  │ Llama 3.1 8B │  │
                    │  │ FunctionGemma│  │
                    │  └──────────────┘  │
                    └────────────────────┘
```

### Directory Structure

```
nexus/
├── public/
│   └── data/                    # Synthetic data files
│       ├── tickets.json         # 100+ pre-generated tickets
│       └── wiki.json            # 50+ wiki pages
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Main dashboard
│   │   ├── agent/               # Agent runner
│   │   ├── servers/             # Server browser
│   │   ├── traces/              # Trace history
│   │   └── settings/            # Settings page
│   ├── components/
│   │   ├── ui/                  # Base UI components
│   │   ├── layout/              # Layout components
│   │   ├── flow/                # React Flow components
│   │   │   ├── DecisionTree.tsx
│   │   │   ├── AgentNode.tsx
│   │   │   ├── ToolNode.tsx
│   │   │   └── ResultNode.tsx
│   │   ├── servers/             # Server browser components
│   │   └── agent/               # Agent runner components
│   ├── lib/
│   │   ├── mcp/                 # MCP client and servers
│   │   │   ├── client.ts
│   │   │   ├── servers/
│   │   │   │   ├── tickets.ts
│   │   │   │   └── wiki.ts
│   │   │   └── types.ts
│   │   ├── ollama/              # Ollama integration
│   │   │   ├── client.ts
│   │   │   └── models.ts
│   │   ├── store/               # Zustand stores
│   │   │   ├── agent.ts
│   │   │   ├── trace.ts
│   │   │   └── settings.ts
│   │   └── utils/
│   ├── hooks/                   # Custom React hooks
│   └── styles/
│       └── globals.css          # Tailwind + custom styles
├── SPEC.md                      # This file
├── README.md
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## MCP Protocol Integration

### What is MCP?

Model Context Protocol (MCP) is an open standard by Anthropic for connecting LLMs to external tools and data. It uses JSON-RPC 2.0.

### Key Concepts

| Concept      | Description                        | Example                 |
| ------------ | ---------------------------------- | ----------------------- |
| **Server**   | Provides tools, resources, prompts | Ticket system           |
| **Tool**     | Executable function                | `searchTickets(query)`  |
| **Resource** | Data source                        | `tickets://all`         |
| **Prompt**   | Reusable template                  | "Summarize ticket {id}" |

### Our Implementation

Since we're running in-browser, we **simulate** MCP servers rather than using STDIO/HTTP transport:

```typescript
// lib/mcp/servers/tickets.ts
export const ticketsServer = {
  name: "nexus://tickets",
  description: "Simulated Jira/Linear ticket system",

  tools: [
    {
      name: "searchTickets",
      description: "Search tickets by query",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          status: { type: "string", enum: ["open", "closed", "all"] },
        },
        required: ["query"],
      },
    },
    {
      name: "getTicket",
      description: "Get ticket by ID",
      parameters: {
        type: "object",
        properties: {
          ticketId: { type: "string" },
        },
        required: ["ticketId"],
      },
    },
    {
      name: "createTicket",
      description: "Create a new ticket",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["P0", "P1", "P2", "P3"] },
        },
        required: ["title"],
      },
    },
  ],

  resources: [
    {
      uri: "tickets://all",
      name: "All Tickets",
      description: "List of all tickets in the system",
    },
    {
      uri: "tickets://open",
      name: "Open Tickets",
      description: "Currently open tickets",
    },
  ],

  prompts: [
    {
      name: "summarize_ticket",
      description: "Summarize a ticket for status update",
      arguments: [{ name: "ticketId", required: true }],
    },
  ],
};
```

---

## Synthetic Servers

### Server 1: Tickets (nexus://tickets)

Simulates Jira/Linear/GitHub Issues.

**Tools:**
| Tool | Purpose | Parameters |
|------|---------|------------|
| `searchTickets` | Find tickets by keyword | `query`, `status?`, `priority?` |
| `getTicket` | Get single ticket details | `ticketId` |
| `createTicket` | Create new ticket | `title`, `description?`, `priority?` |
| `updateTicket` | Update ticket status | `ticketId`, `status`, `assignee?` |
| `listTickets` | List tickets with filters | `status?`, `priority?`, `limit?` |

**Resources:**
| URI | Contents |
|-----|----------|
| `tickets://all` | All tickets |
| `tickets://open` | Open tickets only |
| `tickets://critical` | P0/P1 tickets |

**Prompts:**
| Name | Purpose |
|------|---------|
| `summarize_ticket` | Create ticket summary |
| `triage_report` | Generate triage report |

**Sample Data (100 tickets):**

```json
{
  "id": "TKT-001",
  "title": "Login fails on Safari browser",
  "description": "Users report that clicking the login button...",
  "status": "open",
  "priority": "P1",
  "assignee": "alice@example.com",
  "labels": ["bug", "auth", "browser"],
  "created": "2024-12-15T10:30:00Z",
  "updated": "2024-12-18T14:22:00Z",
  "comments": [
    {
      "author": "bob@example.com",
      "text": "Confirmed on Safari 17.2",
      "timestamp": "2024-12-16T09:15:00Z"
    }
  ]
}
```

### Server 2: Wiki (nexus://wiki)

Simulates Confluence/Notion/Google Docs.

**Tools:**
| Tool | Purpose | Parameters |
|------|---------|------------|
| `searchPages` | Find wiki pages | `query`, `space?` |
| `getPage` | Get page content | `pageId` |
| `createPage` | Create new page | `title`, `content`, `space?` |
| `updatePage` | Update page | `pageId`, `content` |

**Resources:**
| URI | Contents |
|-----|----------|
| `wiki://all` | All pages |
| `wiki://engineering` | Engineering docs |
| `wiki://runbooks` | Incident runbooks |

**Sample Data (50 pages):**

```json
{
  "id": "DOC-001",
  "title": "Authentication System Overview",
  "space": "engineering",
  "content": "# Authentication\n\nOur system uses JWT tokens for...",
  "lastModified": "2024-12-10T08:00:00Z",
  "author": "alice@example.com",
  "links": ["DOC-002", "DOC-005"]
}
```

---

## Ollama Integration

### Supported Models

| Model             | Command                     | Size  | Speed          | Quality |
| ----------------- | --------------------------- | ----- | -------------- | ------- |
| **Mistral 7B**    | `ollama pull mistral:7b`    | 4.1GB | ⚡⚡⚡ Fastest | ★★★☆☆   |
| **Llama 3.1 8B**  | `ollama pull llama3.1:8b`   | 4.7GB | ⚡⚡ Fast      | ★★★★☆   |
| **FunctionGemma** | `ollama pull functiongemma` | 270MB | ⚡⚡⚡⚡ Tiny  | ★★☆☆☆   |

### API Integration

```typescript
// lib/ollama/client.ts
const OLLAMA_BASE_URL = "http://localhost:11434";

interface OllamaRequest {
  model: string;
  messages: Message[];
  tools?: Tool[];
  stream?: boolean;
}

export async function chat(request: OllamaRequest) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return response.json();
}
```

### Function Calling Format

```typescript
// Example tool call flow
const request = {
  model: "mistral:7b",
  messages: [
    { role: "user", content: "Find all critical bugs" }
  ],
  tools: [
    {
      type: "function",
      function: {
        name: "searchTickets",
        description: "Search tickets",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
            priority: { type: "string" }
          }
        }
      }
    }
  ]
};

// Expected response
{
  message: {
    role: "assistant",
    tool_calls: [
      {
        function: {
          name: "searchTickets",
          arguments: { query: "bug", priority: "P0" }
        }
      }
    ]
  }
}
```

---

## UI/UX Design

### Design Philosophy

Inspired by **Claude.ai**, **Vercel**, and **Linear**:

- Clean, premium dark theme
- Generous whitespace
- Smooth animations
- Clear information hierarchy

### Color Palette

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0b; /* Deep black */
  --bg-secondary: #111113; /* Panel backgrounds */
  --bg-tertiary: #1a1a1d; /* Elevated surfaces */
  --bg-hover: #222225; /* Hover states */

  /* Borders */
  --border-subtle: #27272a;
  --border-default: #3f3f46;

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  /* Accent */
  --accent-primary: #7c3aed; /* Violet */
  --accent-hover: #8b5cf6;
  --accent-cyan: #06b6d4; /* Cyan for highlights */

  /* Status */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                      [Model ▼]     │
│  │  Logo   │                                      [Settings]    │
├──┴─────────┴────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌────────────────────────────────────────┐   │
│  │              │  │                                        │   │
│  │   Sidebar    │  │            Main Content                │   │
│  │              │  │                                        │   │
│  │  ○ Agent     │  │    (Changes based on active route)     │   │
│  │  ○ Servers   │  │                                        │   │
│  │  ○ Traces    │  │                                        │   │
│  │  ○ Settings  │  │                                        │   │
│  │              │  │                                        │   │
│  │              │  │                                        │   │
│  └──────────────┘  └────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Key Pages

#### 1. Agent Runner (`/agent`)

- Task input field
- Start/Stop controls
- Real-time decision tree (React Flow)
- Trace panel on the side

#### 2. Server Browser (`/servers`)

- List of all synthetic servers
- Expandable tool/resource/prompt details
- Schema viewer with JSON display

#### 3. Trace History (`/traces`)

- List of past runs
- Click to replay
- Delete/clear options

#### 4. Settings (`/settings`)

- Model selector
- Clear all data button
- Theme options (future)

---

## Feature Specifications

### Feature 1: Decision Tree Visualization

**Description:** Render agent execution as an interactive graph.

**Node Types:**

```typescript
type NodeType =
  | "user" // User's input query
  | "planning" // Agent thinking/planning
  | "tool" // Tool execution
  | "result" // Tool result
  | "response" // Final response
  | "error"; // Error state
```

**Visual Design:**

- User node: Blue outline
- Planning node: Purple, pulsing while active
- Tool node: Cyan, shows tool name
- Result node: Green for success, red for error
- Response node: White, final answer

**Animation:**

- Nodes appear with fade-in + scale
- Edges draw progressively
- Active node pulses
- Completed nodes have checkmark

### Feature 2: Server Browser

**Description:** Explore all synthetic MCP servers, their tools, resources, and prompts.

**UI Elements:**

- Server cards with name, description
- Expandable sections for:
  - Tools (with parameter schemas)
  - Resources (with URIs)
  - Prompts (with argument definitions)
- Copy schema button
- "Try it" button to test tool

### Feature 3: Model Switcher

**Description:** Switch between Ollama models and see performance differences.

**UI Elements:**

- Dropdown in header
- Models: Mistral 7B, Llama 3.1, FunctionGemma
- Show estimated speed indicator
- Auto-detect available models

### Feature 4: Trace Replay

**Description:** View past agent runs step-by-step.

**UI Elements:**

- Timeline scrubber
- Step counter (1/5, 2/5, etc.)
- Play/pause button
- Speed control (0.5x, 1x, 2x)
- Delete trace button

### Feature 5: Time-Travel Debugging (Advanced)

**Description:** Jump to any step and branch with different inputs.

**UI Elements:**

- Click any node to select
- "Branch from here" button
- New input field
- Side-by-side comparison view

### Feature 6: Multi-Agent Orchestration (Advanced)

**Description:** Run multiple agents with different roles.

**UI Elements:**

- Agent role selector (Triage, Comms, Remediate)
- Parallel trace views
- Shared context indicator
- Conflict highlights

### Feature 7: Performance Profiler (Advanced)

**Description:** Analyze token usage and latency.

**Metrics:**

- Total tokens (input + output)
- Time per step
- Tool execution time
- Context window usage

**UI Elements:**

- Waterfall chart
- Token breakdown pie chart
- "Slow step" warnings

### Feature 8: Evaluation Suite (Advanced)

**Description:** Grade agent against ground truth.

**Metrics:**

- Correctness (found right answer?)
- Efficiency (minimum tools used?)
- Faithfulness (cited evidence?)

**UI Elements:**

- Score card (0-100)
- Pass/fail badges
- Comparison table

---

## Data Storage

### Local Storage Schema

```typescript
interface NexusStorage {
  // Settings
  settings: {
    selectedModel: "mistral:7b" | "llama3.1:8b" | "functiongemma";
    theme: "dark" | "light"; // Future
  };

  // Trace history (limited to last 50)
  traces: Trace[];

  // Metadata
  lastUsed: string; // ISO timestamp
}

interface Trace {
  id: string;
  timestamp: string;
  model: string;
  userQuery: string;
  steps: TraceStep[];
  totalTokens: number;
  durationMs: number;
  success: boolean;
}

interface TraceStep {
  id: string;
  type: "planning" | "tool" | "result" | "response";
  content: string;
  toolName?: string;
  toolArgs?: object;
  toolResult?: object;
  timestamp: string;
  tokens: number;
}
```

### Storage Limits

- Max 50 traces stored
- Oldest traces auto-deleted
- "Clear All Data" button in settings
- Estimated size: ~2-5 MB max

---

## Development Phases

### Phase 1: Foundation (Week 1)

- [ ] Next.js 16 project setup
- [ ] Tailwind CSS v4 configuration
- [ ] Basic layout (sidebar, header, main)
- [ ] Color system and typography
- [ ] Ollama connection check

### Phase 2: MCP Infrastructure (Week 2)

- [ ] Synthetic server definitions
- [ ] Tool executor logic
- [ ] Resource loader
- [ ] Prompt templating
- [ ] Server browser UI

### Phase 3: Agent Core (Week 3)

- [ ] Ollama chat integration
- [ ] Tool calling loop
- [ ] State management with Zustand
- [ ] Basic agent runner UI

### Phase 4: Visualization (Week 4)

- [ ] React Flow integration
- [ ] Custom node components
- [ ] Edge animations
- [ ] Real-time updates

### Phase 5: Advanced Features (Week 5-6)

- [ ] Trace history & replay
- [ ] Model switcher
- [ ] Performance metrics
- [ ] Time-travel debugging

### Phase 6: Polish (Week 7)

- [ ] Animations and micro-interactions
- [ ] Error handling
- [ ] Responsive design
- [ ] Documentation

---

## Open Questions

1. **Should synthetic data be bundled or generated on demand?**

   - Bundled: Simpler, consistent
   - Generated: More variety
   - **Decision:** Bundle 100 tickets + 50 wiki pages

2. **How to handle Ollama not running?**

   - Show connection status indicator
   - Helpful error message with instructions
   - Mock mode for UI testing?

3. **Trace storage limit?**
   - 50 traces seems reasonable
   - Each ~50-100KB max
   - Total ~5MB localStorage usage

---

## Success Criteria

When complete, SR Nexus should:

1. ✅ Connect to local Ollama and detect available models
2. ✅ Display synthetic servers with all tools/resources/prompts
3. ✅ Run an agent task and show decision tree in real-time
4. ✅ Allow model switching with visible performance difference
5. ✅ Store and replay past traces
6. ✅ Provide "Clear Data" functionality
7. ✅ Look premium (Claude/Vercel quality)
8. ✅ Be fully local (no cloud APIs)
