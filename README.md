# AI Engineering

A portfolio of production-grade AI applications showcasing **local-first inference**, **multi-agent orchestration**, **generative UI**, and **in-browser AI execution**. Each project demonstrates advanced architectural patterns and modern web technologies.

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

**AI Models (via Ollama):**
| Agent | Role | Default Model |
|-------|------|---------------|
| Moderator | Orchestration & Verdict | mistral-small3.2 |
| Architect | Structure & Patterns | mistral-small3.2 |
| Sentinel | Security & Bugs | deepseek-coder-v2 |
| Optimizer | Performance | phi4 |
| Maintainer | Tests & Refactoring | mistral-small3.2 |
| Verifier | Claim Validation | deepseek-r1 |

**Key Features:**

- **Multi-Agent Parallel Analysis** — 6 specialized agents review code concurrently
- **100% Local Execution** — Code never leaves your machine
- **Memory-Optimized Pipeline** — Models unload after each agent call (`keep_alive: 0`)
- **Severity-Ranked Findings** — Issues sorted P0 (Critical) to P3 (Minor)
- **Actionable Fix Suggestions** — Each finding includes concrete code patches

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

| Capability              | Implementation                          |
| ----------------------- | --------------------------------------- |
| In-Browser AI           | WebLLM (WebGPU), Transformers.js (WASM) |
| Local LLM Orchestration | Ollama API with streaming responses     |
| Browser-Based Node.js   | WebContainers for sandboxed execution   |
| State Management        | Zustand with TypeScript                 |
| UI Framework            | Next.js 16 App Router + Tailwind CSS v4 |

---

_Built by [Sreekar Reddy](https://github.com/esreekarreddy)_
