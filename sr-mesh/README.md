# SR Mesh

> **Live Demo:** [sr-mesh.vercel.app](https://sr-mesh.vercel.app)

A local-first 3D knowledge graph that uses client-side AI to generate semantic embeddings and visualize note relationships in an interactive star map.

## 🌐 Overview

SR Mesh transforms your notes into a navigable 3D galaxy. Each thought becomes a star, positioned based on semantic similarity using AI embeddings generated entirely in your browser. Related notes cluster together, making it easy to discover connections you never knew existed.

## 🤖 AI Integration

**Model:** Xenova/all-MiniLM-L6-v2 (23MB, 384-dimensional embeddings)

**Runtime:** Transformers.js with ONNX Runtime (WebAssembly)

**Capabilities:**

- Semantic embedding generation for all notes
- Real-time similarity scoring during note creation
- K-means clustering for automatic topic grouping
- Cosine similarity search across your knowledge base

**Technical Details:**

- Model runs in a dedicated Web Worker (non-blocking UI)
- Embeddings cached in IndexedDB for instant retrieval
- K-means++ initialization for balanced cluster colors
- Vector search with configurable similarity thresholds

## ✨ Features

### 🧠 Local AI Engine

- **100% Browser-Based** — No API keys, no server, no data leaves your device
- **Sentence Transformers** — State-of-the-art embeddings via WebAssembly
- **Real-Time Processing** — See related notes as you type
- **Offline-First** — Works without internet after initial model download

### 🌌 3D Visualization

- **Force-Directed Graph** — D3-force-3d physics simulation
- **Semantic Clustering** — Notes auto-grouped by topic (8 color categories)
- **Bloom Post-Processing** — Premium glow effects on nodes
- **Interactive Navigation** — Click nodes to view, edit, or delete

### 🔍 Semantic Search

- **Meaning-Based Queries** — Find notes by concept, not just keywords
- **Similarity Ranking** — Results sorted by semantic closeness
- **Keyboard Shortcuts** — `⌘K` for instant search access
- **Cross-Note Discovery** — Uncover hidden connections in your knowledge

### 💾 Data Management

- **IndexedDB Persistence** — All data stored locally in your browser
- **JSON Export/Import** — Full backup and restore functionality
- **Markdown Export** — Download notes as .md files
- **Reset Brain** — Clear all data with confirmation

## ⌨️ Keyboard Shortcuts

| Shortcut        | Action          |
| --------------- | --------------- |
| `⌘K` / `Ctrl+K` | Open Search     |
| `Escape`        | Close any modal |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🏗️ Architecture

```
sr-mesh/
├── src/
│   ├── app/
│   │   ├── page.tsx        # Main UI with CRUD modals
│   │   └── layout.tsx      # Root layout + Toast provider
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Scene.tsx   # Three.js Canvas + Postprocessing
│   │   │   ├── Galaxy.tsx  # 3D nodes with clustering
│   │   │   └── ErrorBoundary.tsx
│   │   └── ui/
│   │       └── Toast.tsx   # Notifications + dialogs
│   ├── lib/
│   │   ├── db.ts           # IndexedDB + vector search
│   │   ├── clustering.ts   # K-means++ algorithm
│   │   ├── export-import.ts
│   │   └── types.ts
│   └── workers/
│       └── embedding.worker.ts  # AI inference worker
```

## 🛠️ Tech Stack

| Layer       | Technology                            |
| ----------- | ------------------------------------- |
| Framework   | Next.js 16 (App Router)               |
| AI Engine   | Transformers.js + ONNX Runtime (WASM) |
| 3D Graphics | Three.js + React Three Fiber          |
| Physics     | D3-force-3d                           |
| Storage     | IndexedDB with cosine similarity      |
| Styling     | Tailwind CSS v4                       |

## ⚠️ Requirements

- **Modern Browser** — Chrome/Edge/Firefox with WebAssembly support
- **Memory** — 2GB+ RAM for model loading
- **WebGL** — GPU acceleration for 3D rendering

## 🔒 Security Notes

- **Zero Data Transmission** — All processing happens on-device
- **No API Keys** — Model runs locally via WebAssembly
- **Browser Sandbox** — Data isolated in IndexedDB

---

_Built by [Sreekar Reddy](https://sreekarreddy.com) • [GitHub](https://github.com/esreekarreddy)_
