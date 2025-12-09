# SR TERMINAL (V2.2)

> **Live Demo**: [sr-terminal.vercel.app](https://sr-terminal.vercel.app)
>
> **"God Tier" Web-Based Operating System** — Built with Next.js 16, WebContainers, and React.

## 🌌 Overview

SR Terminal is a high-performance, in-browser operating system capable of running Node.js runtime environments entirely client-side. It features a cinematic visual design ("Aerospace" Theme), advanced file management, and specific optimizations for stability and usability.

## ✨ Features

### 🖥️ Core OS

- **In-Memory Filesystem**: powered by `@webcontainer/api`, providing a fast, ephemeral dev environment.
- **Cinematic Bootloader**: Matrix-style initialization sequence.
- **Multi-Terminal**: Tabbed interface support for parallel shell sessions.

### ⚡ "God Tier" UX

- **Custom Modals**: Fully themed dialogs for file creation and confirmation (no browser alerts).
- **Resource Monitor**: Real-time stats for VFS usage and Heap Memory.
- **Smart Execution**: "Run Preview" automatically saves dirty files before execution.

### 📂 File Management

- **Create/Delete**: Manage files directly from the explorer.
- **Download**: Export files to your local machine.
- **Monaco Editor**: VS Code-like editing experience with syntax highlighting.

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

## 🛠️ Architecture

- **Next.js App Router**: Core framework.
- **Zustand**: Global state management (`useFileStore`, `useModalStore`).
- **WebContainers**: Micro-VM for Node.js execution.
- **XTerm.js**: Terminal rendering.
- **Tailwind v4**: High-performance atomic styling.

## ⚠️ Important Notes

- **Ephemerality**: The file system is **in-memory**. Reloading the page will reset the state (this is by design).
- **Security**: Requires `Cross-Origin-Embedder-Policy: require-corp` (configured in `next.config.ts`).

---

v2.2 - Build 2024.12
