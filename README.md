# AI Engineering

Welcome to the **AI Engineering** repository. This workspace contains a collection of advanced AI-driven projects, focusing on local inference, generative UI, and next-generation in-browser architectures.

## 📂 Projects

### 🤖 AI-Powered Applications

#### 1. [SR Terminal](./sr-terminal)

A high-performance web-based operating system capable of running Node.js entirely in the browser using WebContainers.

**[Live Demo](https://sr-terminal.vercel.app/)**

- **Tech Stack**: Next.js 16, WebContainer API, XTerm.js, Monaco Editor, Zustand.
- **Features**:
  - In-Browser VM: Full Node.js 18 runtime without a server.
  - Multi-Terminal: Tabbed shell interface for parallel sessions.
  - Cinematic UX: Aerospace-themed design with custom modals and resource monitor.
  - File Management: Create, edit, download, and run JS files locally.

#### 2. [Cortex](./cortex)

AI-Powered Code Review Council. A multi-agent code review system that runs locally using Ollama. Six specialized AI agents analyze your code from different perspectives.

**Local Only — Requires [Ollama](https://ollama.ai)**

- **Tech Stack**: Next.js 16, Ollama, TypeScript, Tailwind CSS v4, Zustand.
- **Features**:
  - Multi-Agent Analysis: 6 specialized agents (Moderator, Architect, Sentinel, Optimizer, Maintainer, Verifier).
  - 100% Local: Runs on your machine, code never leaves your computer.
  - Memory Optimized: Agents unload after use to minimize RAM usage.
  - Ranked Findings: Issues sorted by severity (P0-Critical to P3-Minor).

#### 3. [Mirage](./mirage)

A sketch-to-code AI that transforms your drawings into working React components with a live preview.

**Local Only — Generative UI Engine**

- **Tech Stack**: Next.js 16, tldraw, WebContainer API, Framer Motion, Zustand.
- **Features**:
  - Sketch-to-Code: Draw UI wireframes and watch them become real React components.
  - Live Preview: In-browser Vite dev server with hot-reload.
  - Iterative Refinement: Chat with the AI to tweak and improve generated code.
  - Cinematic UI: Cyberpunk-inspired design with ambient glows and smooth animations.

#### 4. [SR Mesh](./sr-mesh)

A local-first 3D knowledge graph that uses client-side AI to generate embeddings and cluster notes semantically.

**Coming Soon**

- **Tech Stack**: Next.js 16, Transformers.js (WebAssembly), React Three Fiber, IndexedDB.
- **Features**:
  - Local AI: 100% privacy-focused, runs `all-MiniLM-L6-v2` entirely in the browser.
  - 3D Visualization: Interactive force-directed graph with physics-based particles.
  - Semantic Search: Find related notes by meaning, not just keywords.
  - Performance: Off-main-thread inference using Web Workers.

---

_Maintained by Sreekar Reddy_
