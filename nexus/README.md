# SR Nexus

**Advanced MCP Agent Debugging Platform**

> A cinematic, interactive platform for building, testing, and debugging MCP-powered AI agents with real-time decision tree visualization, synthetic enterprise environments, and comprehensive debugging tools.

## 🚀 Live Demo

[Coming Soon]

## 📸 Screenshots

_Coming Soon_

## ✨ Features

### Core Capabilities

- **Real-time Decision Tree Visualization** — Watch AI reasoning unfold as an interactive graph
- **Synthetic Enterprise Environment** — Pre-built fake services (Tickets, Wiki) with 100+ items
- **Model Switching** — Compare Mistral 7B, Llama 3.1, and FunctionGemma performance
- **MCP Protocol Native** — Full Model Context Protocol support

### Advanced Features

- **Time-Travel Debugging** — Replay and branch from any execution point
- **Multi-Agent Orchestration** — Run multiple agents collaborating on tasks
- **Performance Profiler** — Token usage, latency breakdown, bottleneck detection
- **Evaluation Suite** — Grade agent correctness against ground truth

### Developer Experience

- **Server Browser** — Explore all synthetic MCP servers
- **Tools Explorer** — View all tool definitions and schemas
- **Resources Viewer** — Browse available resources and metadata
- **Prompts Library** — Test prompt templates with custom inputs

## 🛠️ Tech Stack

| Layer         | Technology                |
| ------------- | ------------------------- |
| Framework     | Next.js 16 (App Router)   |
| Language      | TypeScript                |
| Styling       | Tailwind CSS v4           |
| State         | Zustand                   |
| Visualization | React Flow                |
| Editor        | Monaco Editor             |
| Charts        | Recharts                  |
| Animation     | Framer Motion             |
| MCP           | @modelcontextprotocol/sdk |
| LLM           | Ollama (Local)            |

## 📋 Prerequisites

- Node.js 18+
- Ollama installed locally
- One of the following models:
  - `ollama pull mistral:7b` (Recommended - fastest)
  - `ollama pull llama3.1:8b` (Best accuracy)
  - `ollama pull functiongemma` (Experimental)

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/esreekarreddy/AI-Engineering.git
cd AI-Engineering/nexus

# Install dependencies
npm install

# Start Ollama (in another terminal)
ollama serve

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Documentation

See [SPEC.md](./SPEC.md) for detailed specifications and architecture.

## 🔒 Privacy

- **100% Local** — All AI inference runs on your machine via Ollama
- **No Cloud APIs** — Zero external API calls for LLM
- **Local Storage** — All traces and history stored in browser
- **Reset Option** — Clear all data with one click

## 📜 License

MIT

## 👤 Author

**Sreekar Reddy**

- Portfolio: [sreekarreddy.com](https://sreekarreddy.com)
- GitHub: [@esreekarreddy](https://github.com/esreekarreddy)
