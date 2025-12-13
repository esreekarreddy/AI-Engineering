export const BASE_FILES = {
  'package.json': {
    file: {
      contents: JSON.stringify({
        name: 'mirage-preview',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'react': '^18.2.0',
          'react-dom': '^18.2.0',
          'lucide-react': '^0.358.0',
          'clsx': '^2.1.0',
          'tailwind-merge': '^2.2.1'
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.2.1',
          'autoprefixer': '^10.4.18',
          'postcss': '^8.4.35',
          'tailwindcss': '^3.4.1',
          'vite': '^5.1.6'
        }
      }, null, 2)
    }
  },
  'index.html': {
    file: {
      contents: `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mirage Preview</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
      `
    }
  },
  'vite.config.js': {
    file: {
      contents: `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})
      `
    }
  },
  'postcss.config.js': {
    file: {
      contents: `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
      `
    }
  },
  'tailwind.config.js': {
    file: {
      contents: `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
      `
    }
  },
  'src': {
    directory: {
      'index.css': {
        file: {
          contents: `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
    background-color: #ffffff;
    color: #000000;
}
          `
        }
      },
      'main.jsx': {
        file: {
          contents: `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
          `
        }
      },
      'App.jsx': {
        file: {
          contents: `
import { Info } from 'lucide-react';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center">
            <Info size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Ready to Dream</h1>
        <p className="text-gray-500 max-w-md">
            Draw something on the canvas and click "Make It Real". 
            Mirage will utilize AI to generate the interface here.
        </p>
    </div>
  )
}
          `
        }
      }
    }
  }
};
