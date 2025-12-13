# MIRAGE (v0.3)

> **"Generative UI Engine"** — Draw. Generate. Refine.
>
> Sketch-to-Code AI powered by Next.js 16, tldraw, and WebContainers.

## 🌌 Overview

Mirage is a generative UI engine that transforms your hand-drawn wireframes into working React components. It combines a full-featured drawing canvas (tldraw) with an in-browser Vite development environment (WebContainers), allowing you to see your sketches come alive instantly.

## ✨ Features

### 🎨 Canvas-to-Code

- **tldraw Integration**: Full-featured drawing canvas with shapes, arrows, and text.
- **Scene Analysis**: Converts your drawings into structured AI prompts.
- **Instant Generation**: Click "Make It Real" to generate React/JSX code.

### ⚡ Live Preview

- **In-Browser Runtime**: Complete Vite + React dev server running client-side.
- **Hot Reload**: Changes update instantly without page refresh.
- **Zero Backend**: No server required, everything runs locally.

### 💬 Iterative Refinement

- **Chat Interface**: Describe changes in natural language.
- **AI-Powered Edits**: The AI reads your current code and applies modifications.
- **Rapid Iteration**: Tweak colors, layout, and components conversationally.

### 🌙 Cinematic UX

- **Cyberpunk Aesthetic**: Dark theme with violet/cyan ambient glows.
- **Smooth Animations**: Framer Motion-powered transitions.
- **Resizable Panels**: Adjust canvas, preview, and chat proportions.

## 🚀 Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Run Development Server**:

   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000`.

4. **Draw & Generate**:
   - Sketch your UI on the canvas
   - Click "MAKE IT REAL"
   - Watch the preview on the right

## 🛠️ Architecture

- **Next.js App Router**: Core framework.
- **tldraw**: Vector drawing canvas with persistence.
- **WebContainers**: In-browser Node.js/Vite runtime.
- **Zustand**: Global state management.
- **Framer Motion**: Animation library.
- **Tailwind v4**: Utility-first styling.

## ⚠️ Important Notes

- **AI Required**: Mirage requires a running AI backend (Ollama or compatible) for code generation.
- **Ephemerality**: The WebContainer filesystem resets on page reload.
- **Cross-Origin Headers**: Requires `Cross-Origin-Embedder-Policy: require-corp` (configured in `next.config.ts`).

---

v0.3 - Build 2024.12
