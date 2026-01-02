/**
 * Wiki MCP Server
 * Simulates Confluence/Notion documentation system
 */

import type { MCPServer, MCPTool, MCPResource, MCPPrompt } from "../types";

// Synthetic wiki page data
export interface WikiPage {
  id: string;
  title: string;
  space: "engineering" | "product" | "runbooks" | "general";
  content: string;
  author: string;
  created: string;
  lastModified: string;
  tags: string[];
  linkedPages: string[];
}

// Generate synthetic wiki pages
function generateWikiPages(): WikiPage[] {
  const pages: WikiPage[] = [
    {
      id: "DOC-001",
      title: "Authentication System Overview",
      space: "engineering",
      content: `# Authentication System

## Overview
Our authentication system uses JWT tokens for secure session management.

## Components
- **Identity Provider**: Handles user verification
- **Token Service**: Issues and validates JWT tokens
- **Session Manager**: Tracks active sessions

## Token Structure
\`\`\`json
{
  "sub": "user_id",
  "exp": 1234567890,
  "iat": 1234567890,
  "roles": ["user", "admin"]
}
\`\`\`

## Security Considerations
- Tokens expire after 24 hours
- Refresh tokens are stored securely
- All tokens are signed with RS256`,
      author: "alice@example.com",
      created: "2024-01-15T10:00:00Z",
      lastModified: "2024-12-01T14:30:00Z",
      tags: ["auth", "security", "jwt"],
      linkedPages: ["DOC-002", "DOC-010"],
    },
    {
      id: "DOC-002",
      title: "API Rate Limiting",
      space: "engineering",
      content: `# API Rate Limiting

## Configuration
Rate limits are configured per endpoint and user tier.

| Tier | Requests/minute | Burst |
|------|-----------------|-------|
| Free | 60 | 10 |
| Pro | 600 | 100 |
| Enterprise | 6000 | 1000 |

## Headers
- \`X-RateLimit-Limit\`: Maximum requests
- \`X-RateLimit-Remaining\`: Requests left
- \`X-RateLimit-Reset\`: Reset timestamp

## Handling 429 Errors
When rate limited, back off exponentially.`,
      author: "bob@example.com",
      created: "2024-02-20T09:00:00Z",
      lastModified: "2024-11-15T11:00:00Z",
      tags: ["api", "rate-limiting", "performance"],
      linkedPages: ["DOC-001"],
    },
    {
      id: "DOC-003",
      title: "Database Schema",
      space: "engineering",
      content: `# Database Schema

## Tables

### users
- id (uuid, primary key)
- email (varchar, unique)
- password_hash (varchar)
- created_at (timestamp)
- updated_at (timestamp)

### sessions
- id (uuid, primary key)
- user_id (uuid, foreign key)
- token (varchar)
- expires_at (timestamp)

## Indexes
- users_email_idx on users(email)
- sessions_user_id_idx on sessions(user_id)`,
      author: "charlie@example.com",
      created: "2024-01-10T08:00:00Z",
      lastModified: "2024-10-20T16:00:00Z",
      tags: ["database", "schema", "postgresql"],
      linkedPages: ["DOC-001"],
    },
    {
      id: "DOC-004",
      title: "Deployment Guide",
      space: "engineering",
      content: `# Deployment Guide

## Prerequisites
- Docker installed
- kubectl configured
- AWS credentials set

## Steps
1. Build the image: \`docker build -t app:latest .\`
2. Push to ECR: \`docker push ...\`
3. Deploy: \`kubectl apply -f k8s/\`

## Rollback
\`kubectl rollout undo deployment/app\``,
      author: "diana@example.com",
      created: "2024-03-01T12:00:00Z",
      lastModified: "2024-12-10T09:00:00Z",
      tags: ["deployment", "kubernetes", "docker"],
      linkedPages: [],
    },
    {
      id: "DOC-005",
      title: "Incident Response Runbook",
      space: "runbooks",
      content: `# Incident Response Runbook

## Severity Levels
- **SEV1**: Complete service outage
- **SEV2**: Major feature degraded
- **SEV3**: Minor feature affected
- **SEV4**: Low impact issue

## Response Steps
1. Acknowledge the incident
2. Assess severity
3. Communicate status
4. Investigate root cause
5. Implement fix
6. Write postmortem

## On-Call Rotation
Check PagerDuty for current on-call.`,
      author: "alice@example.com",
      created: "2024-04-01T10:00:00Z",
      lastModified: "2024-11-30T14:00:00Z",
      tags: ["incident", "runbook", "on-call"],
      linkedPages: ["DOC-006"],
    },
    {
      id: "DOC-006",
      title: "Database Outage Runbook",
      space: "runbooks",
      content: `# Database Outage Runbook

## Symptoms
- 5xx errors from API
- "Connection refused" in logs
- High latency alerts

## Quick Checks
1. Check RDS status in AWS Console
2. Verify security group rules
3. Check connection pool exhaustion

## Recovery Steps
1. If pool exhaustion: restart application pods
2. If RDS issue: initiate failover
3. If corruption: restore from snapshot

## Contact
Database team Slack: #db-support`,
      author: "charlie@example.com",
      created: "2024-04-15T11:00:00Z",
      lastModified: "2024-12-05T10:00:00Z",
      tags: ["database", "runbook", "outage"],
      linkedPages: ["DOC-005", "DOC-003"],
    },
    {
      id: "DOC-007",
      title: "Product Roadmap Q1 2025",
      space: "product",
      content: `# Product Roadmap Q1 2025

## Themes
1. Performance improvements
2. Mobile experience
3. Enterprise features

## Key Deliverables
- [ ] Search performance 2x faster
- [ ] Native mobile app launch
- [ ] SSO integration
- [ ] Audit logging`,
      author: "diana@example.com",
      created: "2024-12-01T09:00:00Z",
      lastModified: "2024-12-15T15:00:00Z",
      tags: ["roadmap", "product", "planning"],
      linkedPages: [],
    },
    {
      id: "DOC-008",
      title: "Onboarding Checklist",
      space: "general",
      content: `# New Employee Onboarding

## Day 1
- [ ] Get laptop
- [ ] Set up email
- [ ] Join Slack channels
- [ ] Meet your buddy

## Week 1
- [ ] Complete security training
- [ ] Set up dev environment
- [ ] Review architecture docs
- [ ] Submit first PR`,
      author: "bob@example.com",
      created: "2024-05-01T08:00:00Z",
      lastModified: "2024-09-20T12:00:00Z",
      tags: ["onboarding", "hr", "new-hire"],
      linkedPages: ["DOC-004"],
    },
    {
      id: "DOC-009",
      title: "API Versioning Strategy",
      space: "engineering",
      content: `# API Versioning Strategy

## Current Version: v2

## URL Format
\`/api/v2/resource\`

## Deprecation Policy
- Minimum 6 months notice
- Migration guide provided
- Sunset headers in responses

## Breaking Changes
Always require new version for:
- Removing fields
- Changing types
- Modifying auth`,
      author: "alice@example.com",
      created: "2024-06-10T10:00:00Z",
      lastModified: "2024-11-25T11:00:00Z",
      tags: ["api", "versioning", "standards"],
      linkedPages: ["DOC-002"],
    },
    {
      id: "DOC-010",
      title: "Security Best Practices",
      space: "engineering",
      content: `# Security Best Practices

## Code
- Never log sensitive data
- Use parameterized queries
- Validate all inputs

## Infrastructure
- Rotate secrets regularly
- Use least privilege
- Enable MFA everywhere

## Incident Handling
Report to security@example.com`,
      author: "charlie@example.com",
      created: "2024-07-01T09:00:00Z",
      lastModified: "2024-12-12T14:00:00Z",
      tags: ["security", "best-practices", "standards"],
      linkedPages: ["DOC-001", "DOC-005"],
    },
  ];

  // Add more pages dynamically
  for (let i = 11; i <= 30; i++) {
    pages.push({
      id: `DOC-${String(i).padStart(3, "0")}`,
      title: `Technical Document ${i}`,
      space: ["engineering", "product", "runbooks", "general"][i % 4] as WikiPage["space"],
      content: `# Document ${i}\n\nThis is a placeholder document for testing purposes.\n\n## Section 1\nContent here.\n\n## Section 2\nMore content.`,
      author: ["alice@example.com", "bob@example.com", "charlie@example.com", "diana@example.com"][i % 4],
      created: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString(),
      lastModified: new Date(Date.now() - (15 - i % 15) * 24 * 60 * 60 * 1000).toISOString(),
      tags: ["documentation"],
      linkedPages: [],
    });
  }

  return pages;
}

const wikiPages = generateWikiPages();

// Tool definitions
const tools: MCPTool[] = [
  {
    name: "searchPages",
    description: "Search wiki pages by keyword in title or content.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        space: { type: "string", description: "Filter by space", enum: ["engineering", "product", "runbooks", "general", "all"] },
        limit: { type: "number", description: "Maximum results (default: 10)" },
      },
      required: ["query"],
    },
  },
  {
    name: "getPage",
    description: "Get the full content of a wiki page by ID.",
    parameters: {
      type: "object",
      properties: {
        pageId: { type: "string", description: "Page ID (e.g., DOC-001)" },
      },
      required: ["pageId"],
    },
  },
  {
    name: "listPages",
    description: "List wiki pages with optional space filter.",
    parameters: {
      type: "object",
      properties: {
        space: { type: "string", description: "Filter by space", enum: ["engineering", "product", "runbooks", "general", "all"] },
        limit: { type: "number", description: "Maximum results (default: 20)" },
      },
    },
  },
  {
    name: "createPage",
    description: "Create a new wiki page.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Page title" },
        content: { type: "string", description: "Page content in markdown" },
        space: { type: "string", description: "Space to create in", enum: ["engineering", "product", "runbooks", "general"] },
      },
      required: ["title", "content"],
    },
  },
];

// Resource definitions
const resources: MCPResource[] = [
  { uri: "wiki://all", name: "All Pages", description: "Complete list of wiki pages" },
  { uri: "wiki://engineering", name: "Engineering Docs", description: "Technical documentation" },
  { uri: "wiki://runbooks", name: "Runbooks", description: "Incident response runbooks" },
  { uri: "wiki://product", name: "Product Docs", description: "Product documentation" },
];

// Prompt definitions
const prompts: MCPPrompt[] = [
  {
    name: "summarize_page",
    description: "Generate a summary of a wiki page",
    arguments: [{ name: "pageId", required: true, description: "The page to summarize" }],
  },
  {
    name: "find_related",
    description: "Find pages related to a topic",
    arguments: [{ name: "topic", required: true, description: "Topic to search for" }],
  },
];

// Tool execution handler
async function executeTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
  switch (toolName) {
    case "searchPages": {
      if (typeof args.query !== "string") {
        throw new Error("Missing or invalid argument: query must be a string");
      }
      const query = args.query.toLowerCase();
      const space = args.space as string | undefined;
      const limit = (args.limit as number) || 10;

      let results = wikiPages.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query)
      );

      if (space && space !== "all") {
        results = results.filter((p) => p.space === space);
      }

      return results.slice(0, limit).map((p) => ({
        id: p.id,
        title: p.title,
        space: p.space,
        author: p.author,
        lastModified: p.lastModified,
      }));
    }

    case "getPage": {
      if (typeof args.pageId !== "string") {
        throw new Error("Missing or invalid argument: pageId must be a string");
      }
      const pageId = args.pageId;
      const page = wikiPages.find((p) => p.id === pageId);
      if (!page) {
        throw new Error(`Page ${pageId} not found`);
      }
      return page;
    }

    case "listPages": {
      const space = args.space as string | undefined;
      const limit = (args.limit as number) || 20;

      let results = [...wikiPages];

      if (space && space !== "all") {
        results = results.filter((p) => p.space === space);
      }

      return results.slice(0, limit).map((p) => ({
        id: p.id,
        title: p.title,
        space: p.space,
      }));
    }

    case "createPage": {
      if (typeof args.title !== "string") {
        throw new Error("Missing or invalid argument: title must be a string");
      }
      if (typeof args.content !== "string") {
        throw new Error("Missing or invalid argument: content must be a string");
      }
      const newPage: WikiPage = {
        id: `DOC-${String(wikiPages.length + 1).padStart(3, "0")}`,
        title: args.title as string,
        content: args.content as string,
        space: (args.space as WikiPage["space"]) || "general",
        author: "user@example.com",
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tags: [],
        linkedPages: [],
      };
      wikiPages.push(newPage);
      return { success: true, page: newPage };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Resource handler
async function getResource(uri: string): Promise<unknown> {
  switch (uri) {
    case "wiki://all":
      return wikiPages;
    case "wiki://engineering":
      return wikiPages.filter((p) => p.space === "engineering");
    case "wiki://runbooks":
      return wikiPages.filter((p) => p.space === "runbooks");
    case "wiki://product":
      return wikiPages.filter((p) => p.space === "product");
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

// Prompt renderer
function renderPrompt(promptName: string, args: Record<string, unknown>): string {
  switch (promptName) {
    case "summarize_page": {
      const page = wikiPages.find((p) => p.id === args.pageId);
      if (!page) {
        return `Page ${args.pageId} not found.`;
      }
      return `Please summarize the following wiki page:\n\nTitle: ${page.title}\nSpace: ${page.space}\n\nContent:\n${page.content}`;
    }

    case "find_related": {
      const topic = (args.topic as string).toLowerCase();
      const related = wikiPages
        .filter((p) => p.title.toLowerCase().includes(topic) || p.content.toLowerCase().includes(topic))
        .slice(0, 5);

      return `Find pages related to "${args.topic}":\n\n${related
        .map((p) => `- ${p.id}: ${p.title}`)
        .join("\n")}`;
    }

    default:
      return `Unknown prompt: ${promptName}`;
  }
}

// Export the server
export const wikiServer: MCPServer = {
  id: "wiki",
  name: "nexus://wiki",
  description: "Simulated Confluence/Notion documentation system",
  icon: "📚",
  tools,
  resources,
  prompts,
  executeTool,
  getResource,
  renderPrompt,
};

// Export pages for direct access
export { wikiPages };
