import { WebContainer } from '@webcontainer/api';

// Singleton instance & Promise lock
let webcontainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export const getWebContainerInstance = async () => {
  if (webcontainerInstance) return webcontainerInstance;

  if (!bootPromise) {
    bootPromise = WebContainer.boot();
  }

  webcontainerInstance = await bootPromise;
  return webcontainerInstance;
};

// Initial file system snapshot (optional, can start empty)
export const files = {
  'index.js': {
    file: {
      contents: `console.log("Welcome to SR Terminal!");
console.log("OS Kernel: WebContainer (Node 18)");
console.log("Architecture: WebAssembly");
`
    }
  },
  'package.json': {
    file: {
      contents: `
{
  "name": "sr-terminal-workspace",
  "type": "module",
  "dependencies": {
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon index.js"
  }
}
      `.trim()
    }
  }
};
