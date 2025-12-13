// Ollama Client for CORTEX

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  onToken?: (token: string) => void;
}

class OllamaClient {
  private static instance: OllamaClient;
  private availableModels: string[] = [];
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): OllamaClient {
    if (!OllamaClient.instance) {
      OllamaClient.instance = new OllamaClient();
    }
    return OllamaClient.instance;
  }

  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' })
      });
      
      if (!res.ok) {
        this.isConnected = false;
        return false;
      }
      
      const data = await res.json();
      this.availableModels = (data.models || []).map((m: OllamaModel) => m.name);
      this.isConnected = this.availableModels.length > 0;
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  getAvailableModels(): string[] {
    return this.availableModels;
  }

  isModelAvailable(model: string): boolean {
    return this.availableModels.some(m => m.includes(model));
  }

  findBestModel(preferred: string, fallbacks: string[]): string | null {
    // Check preferred first
    if (this.isModelAvailable(preferred)) {
      return this.availableModels.find(m => m.includes(preferred)) || null;
    }
    // Try fallbacks
    for (const fallback of fallbacks) {
      if (this.isModelAvailable(fallback)) {
        return this.availableModels.find(m => m.includes(fallback)) || null;
      }
    }
    // Return first available as last resort
    return this.availableModels[0] || null;
  }

  async chat(options: ChatOptions): Promise<string> {
    const { model, messages, stream = true, temperature = 0.2, onToken } = options;

    const res = await fetch('/api/ollama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        model,
        messages,
        stream,
        temperature
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama chat failed: ${res.status}`);
    }

    if (stream && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              fullResponse += json.message.content;
              onToken?.(json.message.content);
            }
          } catch {
            // Partial JSON, skip
          }
        }
      }

      return fullResponse;
    } else {
      const data = await res.json();
      return data.message?.content || '';
    }
  }
}

export const ollamaClient = OllamaClient.getInstance();
