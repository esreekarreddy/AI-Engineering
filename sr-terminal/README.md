# SR Terminal

> **Live Demo:** [sr-terminal.vercel.app](https://sr-terminal.vercel.app)

A browser-based operating system with an integrated AI coding assistant. Runs a complete Node.js runtime entirely client-side using WebContainers, with on-device AI inference powered by WebLLM.

## 🌐 Overview

SR Terminal brings a full development environment to the browser — no backend required. It combines a WebContainer-powered Node.js runtime, a Monaco code editor, a multi-tabbed terminal interface, and an AI assistant that runs entirely on your GPU using Microsoft's Phi-3 model.

## 🤖 AI Integration

**Model:** Microsoft Phi-3-mini-4k-instruct (3.8B parameters)

**Runtime:** WebLLM (MLC) with WebGPU acceleration

**Capabilities:**

- Natural language to code generation
- Code explanation and debugging assistance
- Contextual suggestions based on current file
- Fully private — no data leaves your browser

**Technical Details:**

- Model quantized to 4-bit (q4f16) for efficient browser execution
- Runs in a dedicated Web Worker to prevent UI blocking
- Progress callback for real-time download status
- Automatic model caching via IndexedDB

## ✨ Features

### 🖥️ WebContainer Runtime

- **In-Memory Filesystem** — Fast, ephemeral development environment
- **Node.js 18 Execution** — Run JavaScript/TypeScript directly in the browser
- **npm Support** — Install packages and run scripts

### 💻 Terminal Interface

- **Multi-Tab Support** — Run parallel shell sessions
- **XTerm.js Rendering** — Full terminal emulation with ANSI color support
- **Command History** — Navigate previous commands with arrow keys

### 📝 Monaco Editor

- **VS Code Experience** — Syntax highlighting, IntelliSense, error detection
- **Multi-Language Support** — JavaScript, TypeScript, JSON, Markdown, and more
- **Integrated File Explorer** — Create, edit, delete, and download files

### 📊 Resource Monitor

- **VFS Usage** — Track virtual filesystem consumption
- **Heap Memory** — Monitor JavaScript heap allocation
- **Real-Time Updates** — Live stats in the status bar

### 🎨 Design System

- **Aerospace Theme** — Cinematic dark interface with subtle gradients
- **Custom Modals** — Themed dialogs replacing browser defaults
- **Smooth Animations** — Framer Motion transitions throughout

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

## 🏗️ Architecture

```
sr-terminal/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/
│   │   ├── ai/           # AI Chat interface
│   │   ├── editor/       # Monaco code editor
│   │   ├── filesystem/   # File tree explorer
│   │   ├── os/           # Resource monitor, bootloader
│   │   ├── terminal/     # XTerm.js terminal
│   │   └── ui/           # Shared UI components
│   └── lib/
│       ├── ai/           # WebLLM engine & worker
│       ├── file-store.ts # Zustand file state
│       └── webcontainer.ts # WebContainer singleton
```

## ⚠️ Requirements

- **Modern Browser** — Chrome/Edge 113+ with WebGPU support
- **GPU** — WebGPU-capable graphics for AI inference
- **Memory** — 4GB+ RAM recommended for model loading

## 🔒 Security Notes

- **Cross-Origin Isolation** — Requires `Cross-Origin-Embedder-Policy: require-corp`
- **Ephemeral Storage** — Filesystem resets on page reload (by design)
- **Local AI** — All inference happens on-device, no external API calls

---

_Built by [Sreekar Reddy](https://sreekarreddy.com) • [GitHub](https://github.com/esreekarreddy)_
