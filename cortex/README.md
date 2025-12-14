# Cortex

> **Live Demo:** [sr-cortex.vercel.app](https://sr-cortex.vercel.app)

A multi-agent code review system powered by Ollama Cloud. Six specialized AI agents analyze your code from different perspectives—architecture, security, performance, and more—then produce ranked, actionable findings.

## 🌐 Overview

Cortex convenes a "council" of AI specialists to review your code. Each agent has a distinct role and specialized model, producing findings that are cross-validated and ranked by severity. The result is a comprehensive code review that would typically require multiple human experts.

## 🤖 AI Integration

**Runtime:** Ollama Cloud API (no local setup required)

**Agent Configuration:**

| Agent          | Specialty     | Cloud Model        | Purpose                                 |
| -------------- | ------------- | ------------------ | --------------------------------------- |
| **Moderator**  | Orchestration | gpt-oss:120b       | Coordinates review, synthesizes verdict |
| **Architect**  | Design        | gpt-oss:120b       | Structure, patterns, maintainability    |
| **Sentinel**   | Security      | deepseek-v3.1:671b | Bugs, vulnerabilities, edge cases       |
| **Optimizer**  | Performance   | qwen3-coder:480b   | Bottlenecks, complexity, efficiency     |
| **Maintainer** | Quality       | devstral-2:123b    | Tests, error handling, DX               |
| **Verifier**   | Validation    | gpt-oss:120b       | Cross-checks claims against code        |

**Technical Details:**

- Streaming responses with real-time chat updates
- Automatic retry with exponential backoff on rate limits
- Per-agent error recovery (review continues if one agent fails)
- Access code protection to prevent API abuse

## ✨ Features

### 🏛️ Multi-Agent Council

- **Sequential Analysis** — Agents review one-by-one for optimal results
- **Specialized Perspectives** — Each agent focuses on their domain expertise
- **Cross-Validation** — Verifier challenges claims from other agents
- **Synthesized Verdict** — Moderator produces final ranked output

### 🎯 Intelligent Findings

- **Severity Ranking** — P0 (Critical) to P3 (Minor) classification
- **Evidence-Based** — Each finding cites specific code locations
- **Actionable Fixes** — Concrete patch snippets included
- **Trade-off Analysis** — Notes potential downsides of suggested changes

### ☁️ Cloud-Powered

- **No Local Setup** — Runs on Ollama's cloud infrastructure
- **Massive Models** — Access 120B-671B parameter models
- **Free Tier Available** — Start reviewing code immediately
- **Access Protected** — Secure code required to prevent abuse

### 🛡️ Robust Error Handling

- **Rate Limit Recovery** — Automatic retry with exponential backoff
- **Agent Failover** — Review continues even if one agent fails
- **Meaningful Errors** — Clear messages for auth, model, and network issues

### 🎨 Developer Experience

- **Monaco Editor** — VS Code-grade code input with syntax highlighting
- **Real-Time Chat** — Watch agents discuss in the council panel
- **Verdict Dashboard** — Sortable findings with severity badges
- **Dark UI** — Glassmorphism design with agent-colored accents

## 🚀 Getting Started

### For Users

1. Visit [sr-cortex.vercel.app](https://sr-cortex.vercel.app)
2. Enter the access code
3. Paste your code and click "Review Code"

### For Developers (Self-Hosting)

1. Get an API key from [ollama.com](https://ollama.com/settings/keys)
2. Set environment variables:
   ```
   OLLAMA_API_KEY=your_api_key
   CORTEX_ACCESS_CODE=your_secret_code  # Optional
   ```
3. Deploy to Vercel or run locally:
   ```bash
   npm install
   npm run dev
   ```

## 🏗️ Architecture

```
cortex/
├── src/
│   ├── app/
│   │   ├── api/ollama/       # Ollama Cloud proxy with auth
│   │   └── page.tsx          # Main council UI
│   ├── components/
│   │   ├── council/          # AgentCard, CouncilChat, VerdictPanel
│   │   ├── editor/           # Monaco code editor
│   │   └── ui/               # AccessGate, CyberButton, GlassPanel
│   └── lib/
│       ├── agents/
│       │   ├── orchestrator.ts  # Error-resilient council logic
│       │   ├── prompts.ts       # Agent-specific system prompts
│       │   └── types.ts         # Cloud model configurations
│       ├── ollama/
│       │   └── client.ts        # Cloud API client
│       └── store.ts             # Zustand global state
```

## 🔒 Security

- **Access Protected** — Secret code required to use the app
- **API Key Server-Side** — Never exposed to the client
- **No Code Storage** — Your code is not stored after review

---

_Built by [Sreekar Reddy](https://github.com/esreekarreddy)_
