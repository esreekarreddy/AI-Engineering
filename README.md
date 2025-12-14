# AI Engineering

A portfolio of production-grade AI applications showcasing **cloud AI orchestration**, **local-first inference**, **generative UI**, and **in-browser AI execution**. Each project demonstrates advanced architectural patterns and modern web technologies.

## 📂 Projects

### 1. [SR Terminal](./sr-terminal)

A browser-based operating system with an integrated AI assistant, built entirely client-side using WebContainers and WebLLM.

**[Live Demo](https://sr-terminal.vercel.app/)**

**Tech Stack:** Next.js 16, WebContainer API, WebLLM (MLC), XTerm.js, Monaco Editor, Zustand, Tailwind CSS v4

**AI Model:** Microsoft Phi-3-mini-4k-instruct (3.8B parameters, quantized to 4-bit) — runs entirely in-browser via WebGPU

**Key Features:**

- **In-Browser Node.js Runtime** — Full Node.js 18 execution without a backend server
- **AI Code Assistant** — Natural language to code generation with on-device inference
- **Multi-Terminal Interface** — Tabbed shell sessions with parallel process management
- **Monaco Code Editor** — VS Code-grade editing with syntax highlighting and IntelliSense
- **Resource Monitor** — Real-time VFS and heap memory tracking
- **Aerospace UI** — Cinematic dark theme with custom modals and smooth animations

---

### 2. [Cortex](./cortex)

A multi-agent code review system where six specialized AI agents analyze code from different perspectives, producing ranked findings with actionable fixes.

**[Live Demo](https://sr-cortex.vercel.app/)**

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Zustand, Monaco Editor

**AI Models (via Ollama Cloud):**
| Agent | Role | Cloud Model |
|-------|------|-------------|
| Moderator | Orchestration & Verdict | gpt-oss:120b |
| Architect | Structure & Patterns | gpt-oss:120b |
| Sentinel | Security & Bugs | deepseek-v3.1:671b |
| Optimizer | Performance | qwen3-coder:480b |
| Maintainer | Tests & Refactoring | devstral-2:123b |
| Verifier | Claim Validation | gpt-oss:120b |

**Key Features:**

- **Multi-Agent Cloud Analysis** — 6 specialized agents powered by Ollama Cloud
- **Massive Models** — Access to 120B-671B parameter models
- **Robust Error Handling** — Retry logic, rate limit recovery, agent failover
- **Severity-Ranked Findings** — Issues sorted P0 (Critical) to P3 (Minor)
- **Access Protected** — Secret code prevents API abuse

---

### 3. [Mirage](./mirage)

A sketch-to-code generative engine that transforms hand-drawn wireframes into production-ready React components with live preview.

**[Live Demo](https://sr-mirage.vercel.app/)**

**Tech Stack:** Next.js 16, tldraw, WebContainer API, Framer Motion, Zustand, Tailwind CSS v4

**AI Model:** Ollama-compatible models (llama3, deepseek-coder, mistral) — optimized for React/Tailwind code generation

**Key Features:**

- **Canvas-to-Code Pipeline** — Draw UI wireframes, generate React/JSX instantly
- **In-Browser Vite Runtime** — Complete dev server running client-side with hot-reload
- **Iterative Refinement** — Chat with the AI to modify generated components
- **Scene Analysis** — Converts tldraw shapes into structured AI prompts
- **Cyberpunk Aesthetic** — Dark theme with violet/cyan ambient glows and smooth animations

---

### 4. [SR Mesh](./sr-mesh)

A local-first 3D knowledge graph that uses client-side AI to generate semantic embeddings and visualize note relationships in 3D space.

**[Live Demo](https://sr-mesh.vercel.app/)**

**Tech Stack:** Next.js 16, Transformers.js (WebAssembly), React Three Fiber, IndexedDB, Zustand

**AI Model:** all-MiniLM-L6-v2 (sentence-transformers) — runs entirely in-browser via WASM

**Key Features:**

- **On-Device Embeddings** — 100% privacy-focused inference using Web Workers
- **3D Force-Directed Graph** — Interactive particle visualization with physics simulation
- **Semantic Clustering** — Notes grouped by meaning, not just keywords
- **IndexedDB Persistence** — Offline-first storage with full-text search

---

## 🛠️ Technical Highlights

| Capability             | Implementation                           |
| ---------------------- | ---------------------------------------- |
| Cloud AI Orchestration | Ollama Cloud API with multi-model agents |
| In-Browser AI          | WebLLM (WebGPU), Transformers.js (WASM)  |
| Browser-Based Node.js  | WebContainers for sandboxed execution    |
| State Management       | Zustand with TypeScript                  |
| UI Framework           | Next.js 16 App Router + Tailwind CSS v4  |

---

_Built by [Sreekar Reddy](https://github.com/esreekarreddy)_
