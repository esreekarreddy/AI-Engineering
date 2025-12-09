# SR Mesh

**Local-First AI Knowledge Engine** - A 3D knowledge graph that runs entirely in your browser.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/sr-mesh)

🌐 **Live Demo:** [sr-mesh.vercel.app](https://sr-mesh.vercel.app)

---

## ⚡ Features

### Core

- **🧠 Local AI** - Transformer models run in WebAssembly (no server, no API keys)
- **🌌 3D Visualization** - Notes displayed as nodes in an interactive star map
- **🔍 Semantic Search** - Find notes by meaning, not just keywords
- **💾 Offline-First** - All data stored in IndexedDB (your browser)
- **🔒 100% Private** - Zero data leaves your device

### v2.0 Enhancements

- **⚡ Force-Directed Layout** - D3-force-3d physics simulation
- **🎨 K-Means Clustering** - Auto-group notes by topic with 8 colors
- **✨ Bloom Post-Processing** - Premium glow effects
- **🔔 Toast Notifications** - Professional UI feedback
- **⌨️ Keyboard Shortcuts** - `⌘K` for search, `Escape` to close
- **📦 Export/Import** - JSON backup and Markdown export
- **🛡️ Error Boundaries** - Graceful WebGL error handling

---

## ⌨️ Keyboard Shortcuts

| Shortcut        | Action          |
| --------------- | --------------- |
| `⌘K` / `Ctrl+K` | Open Search     |
| `Escape`        | Close any modal |

---

## 🛠️ Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| Framework   | Next.js 16 (App Router)                        |
| AI Engine   | Transformers.js + ONNX Runtime (WebAssembly)   |
| Model       | `Xenova/all-MiniLM-L6-v2` (384-dim embeddings) |
| 3D Graphics | Three.js + React Three Fiber + Postprocessing  |
| Physics     | D3-force-3d (force-directed layout)            |
| Vector DB   | IndexedDB with cosine similarity search        |
| Styling     | Tailwind CSS v4                                |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/sr-mesh.git
cd sr-mesh

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 How It Works

### 1. Adding a Thought

1. Click **"Add Thought"** button
2. Type your note in the editor
3. See real-time **related notes** in sidebar
4. Click **"Save"**
5. A new colored star appears in the 3D galaxy

### 2. Semantic Search

1. Press **`⌘K`** or click **"Search"** button
2. Type a query (e.g., "machine learning ideas")
3. Press Enter
4. Results are ranked by **semantic similarity**

### 3. Clustering

Notes are automatically grouped by semantic similarity:

| Color     | Label     |
| --------- | --------- |
| 🔵 Blue   | Ideas     |
| 🟣 Violet | Insights  |
| 💗 Pink   | Questions |
| 🟠 Orange | Projects  |
| 🟢 Green  | Learning  |
| 🩵 Cyan    | Personal  |
| 🟡 Yellow | Work      |
| 🔴 Red    | Creative  |

### 4. CRUD Operations

- **View**: Click any node to see full content
- **Edit**: Modify content (re-vectorizes automatically)
- **Delete**: Remove with confirmation
- **Clear All**: Settings → Reset Brain

---

## 🧪 Testing

```bash
# Run unit tests
npx vitest run

# Run tests in watch mode
npx vitest
```

Current test coverage:

- Vector math (cosine similarity)
- K-means clustering algorithm

---

## 📁 Project Structure

```
sr-mesh/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main UI with CRUD modals
│   │   ├── layout.tsx        # Root layout + Toast provider
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Scene.tsx     # Three.js Canvas + Postprocessing
│   │   │   ├── Galaxy.tsx    # 3D nodes with clustering
│   │   │   ├── ErrorBoundary.tsx  # WebGL error handling
│   │   │   └── LoadingSkeleton.tsx # Loading animation
│   │   └── ui/
│   │       └── Toast.tsx     # Notifications + confirm dialogs
│   ├── lib/
│   │   ├── db.ts             # IndexedDB + vector search
│   │   ├── clustering.ts     # K-means++ algorithm
│   │   ├── export-import.ts  # Backup/restore utilities
│   │   └── types.ts          # TypeScript interfaces
│   ├── types/
│   │   └── d3-force-3d.d.ts  # Type definitions
│   └── workers/
│       └── embedding.worker.ts   # AI inference worker
└── package.json
```

---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Main Thread                          │
│  ┌───────────┐   ┌───────────┐   ┌────────────────────────┐│
│  │  React    │──▶│ IndexedDB │──▶│  Three.js Renderer     ││
│  │  + Toast  │   │ (Storage) │   │  + D3-Force + Bloom    ││
│  └───────────┘   └───────────┘   └────────────────────────┘│
│        │                                                    │
│        │ K-Means Clustering (useMemo)                       │
│        ▼                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Web Worker                           ││
│  │  ┌─────────────┐   ┌─────────────────────────────────┐ ││
│  │  │ Transformers│──▶│ ONNX Runtime (WebAssembly)      │ ││
│  │  │     .js     │   │ all-MiniLM-L6-v2 (23MB)         │ ││
│  │  └─────────────┘   └─────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

- **Web Worker**: AI inference runs in a separate thread (prevents UI freezing)
- **useMemo**: Force simulation and clustering computed synchronously (no useState in effects)
- **K-Means++**: Better centroid initialization for color variety
- **Error Boundary**: Graceful fallback if WebGL fails

---

## 📄 License

MIT © Sreekar Reddy
