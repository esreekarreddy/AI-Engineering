# CORTEX

**AI-Powered Code Review Council**

A multi-agent code review system that runs locally using [Ollama](https://ollama.ai). Six specialized AI agents analyze your code from different perspectives—architecture, security, performance, and more—then produce ranked, actionable findings.

![CORTEX Screenshot](docs/screenshot.png)

## ✨ Features

- **🧠 Multi-Agent Analysis** - 6 specialized agents review your code in parallel
- **🔒 100% Local** - Runs on your machine, code never leaves your computer
- **⚡ Memory Optimized** - Agents unload after use to minimize RAM usage
- **📱 Responsive UI** - Works on desktop and mobile devices
- **🎯 Ranked Findings** - Issues sorted by severity (P0-Critical to P3-Minor)
- **💡 Actionable Fixes** - Each finding includes concrete code suggestions

## 🏛️ The Council

| Agent          | Role                                            | Model             |
| -------------- | ----------------------------------------------- | ----------------- |
| **MODERATOR**  | Orchestrates the review, produces final verdict | mistral-small3.2  |
| **ARCHITECT**  | Reviews structure, patterns, readability        | mistral-small3.2  |
| **SENTINEL**   | Finds bugs, security issues, edge cases         | deepseek-coder-v2 |
| **OPTIMIZER**  | Identifies performance bottlenecks              | phi4              |
| **MAINTAINER** | Suggests tests and refactoring                  | mistral-small3.2  |
| **VERIFIER**   | Validates findings against actual code          | deepseek-r1       |

## 🚀 Getting Started

### Prerequisites

1. **Install Ollama** - [ollama.ai/download](https://ollama.ai/download)
2. **Pull at least one model**:
   ```bash
   ollama pull llama3    # Good starting point
   # OR for better results:
   ollama pull mistral
   ollama pull deepseek-coder
   ```
3. **Start Ollama**:
   ```bash
   ollama serve
   ```

### Run CORTEX

```bash
# Clone the repo
git clone https://github.com/esreekarreddy/AI-Engineering.git
cd AI-Engineering/cortex

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Usage

1. **Paste your code** into the editor
2. **Click "Review"** to convene the council
3. **Watch the agents** discuss in the Chat panel
4. **Review findings** in the Verdict panel (sorted by severity)
5. **Apply suggested fixes** to improve your code

## 💻 System Requirements

| RAM   | Capability                                     |
| ----- | ---------------------------------------------- |
| 8GB   | Small models only (phi3, llama3:8b)            |
| 16GB  | Medium models (mistral, llama3)                |
| 32GB+ | Large models (deepseek-coder-v2, llama3.3:70b) |

**Note**: CORTEX uses `keep_alive: 0` to unload models immediately after each agent call, so you can run multiple large models sequentially even with limited RAM.

## 🔧 Configuration

The system auto-detects available Ollama models and assigns them to agents. To manually configure:

1. Edit `src/lib/agents/types.ts`
2. Update the `defaultModel` and `fallbackModels` for each agent

## 📁 Project Structure

```
cortex/
├── src/
│   ├── app/
│   │   ├── api/ollama/    # Ollama proxy bridge
│   │   └── page.tsx       # Main UI
│   ├── components/
│   │   ├── council/       # Agent cards, chat, verdict
│   │   ├── editor/        # Monaco code editor
│   │   └── ui/            # Reusable components
│   └── lib/
│       ├── agents/        # Agent types, prompts, orchestrator
│       └── ollama/        # Ollama client
```

## 🌐 Deployment

CORTEX is designed for **local use only**. The Ollama bridge connects to `localhost:11434`, which isn't accessible from cloud deployments.

For a public demo, you would need to:

1. Host Ollama on a reachable server
2. Update `OLLAMA_HOST` in `src/app/api/ollama/route.ts`

## 📄 License

MIT

---

Built with ❤️ by [Sreekar Reddy](https://github.com/esreekarreddy)
