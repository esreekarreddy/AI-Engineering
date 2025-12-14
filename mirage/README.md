# Mirage

> **Live Demo:** [sr-mirage.vercel.app](https://sr-mirage.vercel.app) | **Portfolio:** [sreekarreddy.com](https://sreekarreddy.com)

A **vision-powered** sketch-to-code engine that transforms hand-drawn wireframes into React components using Ollama Cloud's Qwen3-VL 235B model.

## ✨ How It Works

1. **Draw** — Sketch your UI on the canvas with shapes, colors, and text
2. **Generate** — Click "Make It Real" → Vision AI sees your sketch and writes matching code
3. **Refine** — Chat to tweak: "Make the button blue", "Add a header"

## 🤖 AI Integration

**Model:** Qwen3-VL 235B (Ollama Cloud) — Vision-language model that "sees" your sketch

**Pipeline:**

- Canvas exported as PNG image
- Image sent to vision model with comprehensive prompt
- Model analyzes colors, shapes, text, and positions
- Returns React + Tailwind code matching your sketch

**Prompt Engineering:**

- Chain-of-thought analysis protocol
- Color extraction with exact Tailwind mappings
- Spatial layout analysis
- Quality checklist verification

## 🔐 Access Protection

The live demo requires an access code to limit API usage:

- **First Use:** Code entered and validated server-side
- **Storage:** Code stored with timestamp in localStorage
- **Expiry:** Automatically clears after 1 hour
- **Re-entry:** User prompted again after expiry

**For Local Development:**

```bash
# .env.local
OLLAMA_API_KEY=your_ollama_api_key
MIRAGE_ACCESS_CODE=  # Leave empty for open access
```

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/esreekarreddy/AI-Engineering.git
cd AI-Engineering/mirage
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Ollama API key

# Run
npm run dev
```

## 🏗️ Architecture

```
mirage/
├── src/
│   ├── app/
│   │   ├── api/ollama/     # Ollama Cloud proxy with auth
│   │   └── page.tsx        # Main workspace
│   ├── components/ui/
│   │   ├── AccessCodeModal # Access protection modal
│   │   ├── ChatPanel       # Refinement chat
│   │   └── HelpModal       # Setup guide
│   └── lib/
│       └── ai/engine.ts    # Vision model integration
```

## ⚙️ Tech Stack

| Layer     | Technology                     |
| --------- | ------------------------------ |
| AI        | Qwen3-VL 235B (Ollama Cloud)   |
| Canvas    | tldraw vector graphics         |
| Preview   | WebContainer (in-browser Vite) |
| Framework | Next.js 16                     |
| Styling   | Tailwind CSS v4                |

## 🔒 Security

- **API Key Server-Side** — Never exposed to client
- **Access Code Validated Server-Side** — Only stored after confirmation
- **1-Hour Expiry** — Automatic re-authentication required
- **No Code Storage** — Your sketches are not persisted

## 📋 Requirements

- Modern browser (Chrome/Edge)
- [Ollama API Key](https://ollama.com/settings/keys)

---

_Built by [Sreekar Reddy](https://sreekarreddy.com) • [GitHub](https://github.com/esreekarreddy)_
