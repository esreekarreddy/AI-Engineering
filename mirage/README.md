# Mirage

> **Live Demo:** [sr-mirage.vercel.app](https://sr-mirage.vercel.app)

A sketch-to-code AI that transforms hand-drawn wireframes into production-ready React components with live preview, powered by tldraw and WebContainers.

## 🌐 Overview

Mirage combines a full-featured drawing canvas with an in-browser Vite development environment. Draw your UI concepts, click "Make It Real," and watch as AI generates working React/Tailwind code rendered in a live preview — all running client-side.

## 🤖 AI Integration

**Models:** Ollama-compatible LLMs (llama3, deepseek-coder, mistral, etc.)

**Runtime:** Local Ollama server with streaming responses

**Capabilities:**

- Scene-to-prompt conversion (shapes, positions, labels extracted)
- React/Tailwind code generation optimized for production
- Iterative refinement via natural language chat
- Context-aware modifications to existing code

**Technical Details:**

- Streaming responses for real-time generation feedback
- Temperature tuned to 0.2 for precise code output
- 4K context window for complex components
- Auto-model selection prioritizing coding-optimized models

## ✨ Features

### 🎨 Canvas-to-Code Pipeline

- **tldraw Integration** — Full-featured vector canvas with shapes, arrows, text
- **Scene Analysis** — Extracts element hierarchy, positions, and labels
- **Instant Generation** — Click "Make It Real" to generate React/JSX

### ⚡ In-Browser Preview

- **WebContainer Runtime** — Complete Vite + React dev server running client-side
- **Hot Module Replacement** — Changes update instantly
- **Zero Backend** — Everything runs locally in your browser

### 💬 Iterative Refinement

- **Chat Interface** — Describe modifications in natural language
- **Code-Aware Edits** — AI reads current code before applying changes
- **Rapid Iteration** — Tweak colors, layout, components conversationally

### 🌙 Design System

- **Cyberpunk Aesthetic** — Dark theme with violet/cyan ambient glows
- **Glassmorphism UI** — Frosted glass panels and subtle blur effects
- **Framer Motion** — Smooth animations and micro-interactions
- **Resizable Panels** — Adjust canvas, preview, and chat proportions

## 🚀 Getting Started

### Prerequisites

1. **Install Ollama** — [ollama.ai/download](https://ollama.ai/download)
2. **Pull a model:**
   ```bash
   ollama pull llama3
   # OR for better code generation:
   ollama pull deepseek-coder
   ```
3. **Start Ollama:**
   ```bash
   ollama serve
   ```

### Run Mirage

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
mirage/
├── src/
│   ├── app/
│   │   ├── api/ollama/     # Ollama proxy bridge
│   │   └── page.tsx        # Main workspace
│   ├── components/
│   │   └── ui/             # ChatPanel, ModelManager, Logo
│   ├── hooks/
│   │   └── use-webcontainer.ts  # WebContainer singleton
│   └── lib/
│       ├── ai/
│       │   ├── engine.ts   # Ollama client with streaming
│       │   └── prompt.ts   # Scene-to-prompt converter
│       ├── templates.ts    # Base Vite project files
│       └── webcontainer.ts # File operations
```

## ⚠️ Requirements

- **Modern Browser** — Chrome/Edge with cross-origin isolation support
- **Ollama** — Running locally on port 11434
- **Memory** — 8GB+ RAM for model inference

## 🔒 Security Notes

- **Cross-Origin Isolation** — Requires `Cross-Origin-Embedder-Policy: require-corp`
- **Local Only** — Ollama bridge connects to `127.0.0.1:11434`
- **Ephemeral Storage** — WebContainer filesystem resets on reload

---

_Built by [Sreekar Reddy](https://github.com/esreekarreddy)_
