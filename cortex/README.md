# Cortex

> **Live Demo:** [sr-cortex.vercel.app](https://sr-cortex.vercel.app)

A multi-agent code review system that runs locally using Ollama. Six specialized AI agents analyze your code from different perspectives—architecture, security, performance, and more—then produce ranked, actionable findings.

## 🌐 Overview

Cortex convenes a "council" of AI specialists to review your code. Each agent has a distinct role and preferred model, producing findings that are cross-validated and ranked by severity. The result is a comprehensive code review that would typically require multiple human experts.

## 🤖 AI Integration

**Runtime:** Ollama (local inference server)

**Agent Configuration:**

| Agent          | Specialty     | Default Model     | Purpose                                 |
| -------------- | ------------- | ----------------- | --------------------------------------- |
| **Moderator**  | Orchestration | mistral-small3.2  | Coordinates review, synthesizes verdict |
| **Architect**  | Design        | mistral-small3.2  | Structure, patterns, maintainability    |
| **Sentinel**   | Security      | deepseek-coder-v2 | Bugs, vulnerabilities, edge cases       |
| **Optimizer**  | Performance   | phi4              | Bottlenecks, complexity, efficiency     |
| **Maintainer** | Quality       | mistral-small3.2  | Tests, error handling, DX               |
| **Verifier**   | Validation    | deepseek-r1       | Cross-checks claims against code        |

**Technical Details:**

- Streaming responses with real-time chat updates
- `keep_alive: 0` for immediate model unloading (memory efficiency)
- Automatic fallback to available models if preferred model is missing
- Configurable temperature and context window per agent

## ✨ Features

### 🏛️ Multi-Agent Council

- **Parallel Analysis** — Agents review concurrently for faster results
- **Specialized Perspectives** — Each agent focuses on their domain expertise
- **Cross-Validation** — Verifier challenges claims from other agents
- **Synthesized Verdict** — Moderator produces final ranked output

### 🎯 Intelligent Findings

- **Severity Ranking** — P0 (Critical) to P3 (Minor) classification
- **Evidence-Based** — Each finding cites specific code locations
- **Actionable Fixes** — Concrete patch snippets included
- **Trade-off Analysis** — Notes potential downsides of suggested changes

### 💾 Memory Optimized

- **Sequential Unloading** — Models freed after each agent completes
- **8GB Viable** — Works with smaller models on limited hardware
- **Large Model Support** — 32GB+ enables deepseek-coder-v2, llama3.3:70b

### 🎨 Developer Experience

- **Monaco Editor** — VS Code-grade code input with syntax highlighting
- **Real-Time Chat** — Watch agents discuss in the council panel
- **Verdict Dashboard** — Sortable findings with severity badges
- **Dark UI** — Glassmorphism design with agent-colored accents

## 🚀 Getting Started

### Prerequisites

1. **Install Ollama** — [ollama.ai/download](https://ollama.ai/download)
2. **Pull models:**
   ```bash
   ollama pull mistral
   ollama pull deepseek-coder
   ollama pull phi3
   ```
3. **Start Ollama:**
   ```bash
   ollama serve
   ```

### Run Cortex

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

## 📖 Usage

1. **Paste code** into the Monaco editor
2. **Click "Review"** to convene the council
3. **Watch agents** discuss in the Chat panel
4. **Review findings** in the Verdict panel (sorted by severity)
5. **Apply fixes** based on agent suggestions

## 🏗️ Architecture

```
cortex/
├── src/
│   ├── app/
│   │   ├── api/ollama/       # Ollama proxy bridge with streaming
│   │   └── page.tsx          # Main council UI
│   ├── components/
│   │   ├── council/          # AgentCard, CouncilChat, VerdictPanel
│   │   ├── editor/           # Monaco code editor
│   │   └── ui/               # Badge, CyberButton, GlassPanel
│   └── lib/
│       ├── agents/
│       │   ├── orchestrator.ts  # Council coordination logic
│       │   ├── prompts.ts       # Agent-specific system prompts
│       │   └── types.ts         # Agent/Finding TypeScript types
│       ├── ollama/
│       │   └── client.ts        # Ollama API wrapper
│       └── store.ts             # Zustand global state
```

## 💻 System Requirements

| RAM   | Capability                                     |
| ----- | ---------------------------------------------- |
| 8GB   | Small models (phi3, llama3:8b)                 |
| 16GB  | Medium models (mistral, llama3)                |
| 32GB+ | Large models (deepseek-coder-v2, llama3.3:70b) |

## 🔒 Security Notes

- **100% Local** — Code never leaves your machine
- **No External APIs** — All inference via localhost:11434
- **Open Source** — Full codebase transparency

---

_Built by [Sreekar Reddy](https://github.com/esreekarreddy)_
