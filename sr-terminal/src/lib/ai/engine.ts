export type ModelStatus = "idle" | "loading" | "ready" | "generating" | "error";

export interface AIState {
  status: ModelStatus;
  progress: number;
  text: string; // "Downloading... 50%"
}

class AIEngine {
  private static instance: AIEngine;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private engine: any | null = null;
  private currentModel = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
  
  private listeners: ((state: AIState) => void)[] = [];
  private state: AIState = { status: "idle", progress: 0, text: "" };

  private constructor() {}

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    }
    return AIEngine.instance;
  }

  private setState(newState: Partial<AIState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  public subscribe(listener: (state: AIState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.state));
  }

  public async init() {
    if (this.engine) return;

    this.setState({ status: "loading", text: "Initializing AI Engine..." });

    try {
        const { CreateWebWorkerMLCEngine } = await import('@mlc-ai/web-llm');
        
        this.engine = await CreateWebWorkerMLCEngine(
            new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }),
            'Phi-3-mini-4k-instruct-q4f16_1-MLC',
            {
                initProgressCallback: (report) => {
                    this.setState({ 
                        status: "loading", 
                        progress: report.progress * 100, 
                        text: report.text 
                    });
                }
            }
        );
        
        this.setState({ status: "ready", progress: 100, text: "Ready" });
    } catch (error) {
        console.error("AI Init Error:", error);
        this.setState({ status: "idle", progress: 0, text: "Failed to load model" });
    }
  }

  async deleteCache() {
      if (this.engine) {
          await this.engine.unload();
      }
      
      // Clear browser cache for MLC
      if ('caches' in window) {
          const keys = await caches.keys();
          for (const key of keys) {
              if (key.includes('webllm')) {
                  await caches.delete(key);
              }
          }
      }
      
      this.engine = null;
      this.setState({ status: "idle", progress: 0, text: "" });
  }

  public async completion(messages: { role: "system" | "user" | "assistant", content: string }[]) {
    if (!this.engine) throw new Error("Engine not initialized");
    
    this.setState({ status: "generating" });
    try {
      const reply = await this.engine.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });
      
      this.setState({ status: "ready" });
      return reply.choices[0].message.content || "";
    } catch (e) {
      this.setState({ status: "error", text: "Generation failed" });
      throw e;
    }
  }
}

export const aiEngine = AIEngine.getInstance();
