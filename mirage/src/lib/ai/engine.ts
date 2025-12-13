// The Synapse Engine: Client-side brain management for Ollama
export type ModelStatus = "idle" | "connecting" | "connected" | "disconnected" | "generating" | "error";

export interface AIState {
  status: ModelStatus;
  model: string;
  availableModels: string[];
}

export interface StreamPayload {
    model: string;
    messages: { role: string; content: string }[];
    stream: boolean;
    options?: {
        temperature?: number;
        num_predict?: number;
    }
}

class OllamaEngine {
  private static instance: OllamaEngine;
  private state: AIState = { 
      status: "disconnected", 
      model: "llama3", // Default preference
      availableModels: [] 
  };
  private listeners: ((state: AIState) => void)[] = [];

  private constructor() {}

  public static getInstance(): OllamaEngine {
    if (!OllamaEngine.instance) {
      OllamaEngine.instance = new OllamaEngine();
    }
    return OllamaEngine.instance;
  }

  public subscribe(listener: (state: AIState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setState(newState: Partial<AIState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(l => l(this.state));
  }
  
  public getState() {
      return this.state;
  }

  public setModel(model: string) {
      this.setState({ model });
  }

  // Phase 1: The Handshake
  public async init() {
    this.setState({ status: "connecting" });
    try {
        const res = await fetch('/api/ollama', {
            method: 'POST',
            body: JSON.stringify({ method: 'GET', path: '/api/tags' })
        });
        
        if (!res.ok) throw new Error("Bridge unresponsive");
        
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const models = (data.models || []).map((m: any) => m.name);
        
        if (models.length === 0) {
            this.setState({ status: "disconnected", availableModels: [] });
            return;
        }

        // Auto-select best model if current generic one isn't found
        let selected = this.state.model;
        if (!models.includes(selected)) {
            // Priority Heuristic
            selected = models.find((m: string) => m.includes('deepseek-coder')) || 
                       models.find((m: string) => m.includes('llama3')) || 
                       models[0];
        }

        this.setState({ 
            status: "connected", 
            availableModels: models,
            model: selected
        });

    } catch (e) {
        console.error("Ollama Handshake Failed", e);
        this.setState({ status: "disconnected" });
    }
  }

  // Phase 2: The Transmission
  private async streamChat(messages: { role: string; content: string }[]): Promise<string> {
      const { model } = this.state;
      this.setState({ status: "generating" });
      
      let fullResponse = "";
      
      try {
          const res = await fetch('/api/ollama', {
              method: 'POST',
              body: JSON.stringify({
                  path: '/api/chat',
                  model: model,
                  messages: messages,
                  stream: true,
                  options: {
                      temperature: 0.2, // Precise for code
                      num_ctx: 4096     // Context window
                  }
              })
          });

          if (!res.body) throw new Error("No stream");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = decoder.decode(value, { stream: true });
              // Ollama sends multiple JSON objects in one chunk sometimes
              const lines = chunk.split('\n').filter(Boolean);
              
              for (const line of lines) {
                  try {
                      const json = JSON.parse(line);
                      if (json.message?.content) {
                          fullResponse += json.message.content;
                      }
                      if (json.done) break;
                  } catch {
                      // Partial JSON parse error, ignore specific char
                  }
              }
          }
          
          this.setState({ status: "connected" });
          return fullResponse;

      } catch (e) {
          this.setState({ status: "error" });
          throw e;
      }
  }

  public async generateCode(prompt: string) {
      // System Prompt optimized for Llama 3 / Deepseek
      const systemPrompt = `You are an expert Frontend Architect (React + Tailwind + Shadcn).
GOAL: Transform the description into a production-ready React component.

DESIGN SYSTEM:
- Colors: Zinc-950 (bg), Zinc-900 (surface), Violet-600 (accent).
- Style: "Cyberpunk/Void" aesthetic. Glassmorphism, glows, thin borders.
- Icons: Use lucide-react.

RULES:
1. OUTPUT CODE ONLY. No markdown wrapper (if possible, else purely code).
2. 'export default function App()' is required.
3. No 'components/ui' imports. Use INLINE Tailwind classes.
4. MAKE IT LOOK PREMIUM.`;

      return this.streamChat([
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
      ]);
  }

  public async refineCode(currentCode: string, instruction: string) {
      const systemPrompt = `You are a Senior React Developer.
Modify the code based on the instruction.
RULES:
1. Return FULL updated code only.
2. Keep the same style/theme.`;

      return this.streamChat([
          { role: "system", content: systemPrompt },
          { role: "user", content: `CODE:\n${currentCode}\n\nINSTRUCTION: ${instruction}` }
      ]);
  }
}

export const aiEngine = OllamaEngine.getInstance();
