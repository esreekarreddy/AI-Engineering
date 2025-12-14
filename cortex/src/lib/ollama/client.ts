// Ollama Cloud Client for CORTEX

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
      
      this.isConnected = true;
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  async verifyAccessCode(code: string): Promise<boolean> {
    try {
      const res = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-access', code })
      });
      
      if (!res.ok) return false;
      
      const data = await res.json();
      return data.valid === true;
    } catch {
      return false;
    }
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
      if (res.status === 429) {
        throw new Error('Rate limit exceeded. Try again later.');
      }
      throw new Error(`Ollama Cloud error: ${res.status}`);
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
