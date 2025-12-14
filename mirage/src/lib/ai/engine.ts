// Mirage AI Engine - Ollama Cloud Integration
export type ModelStatus = "idle" | "connecting" | "connected" | "disconnected" | "generating" | "error";

export interface AIState {
  status: ModelStatus;
  model: string;
}

// The cloud vision model for sketch-to-code
const VISION_MODEL = "qwen3-vl:235b-cloud";

class OllamaEngine {
  private static instance: OllamaEngine;
  private state: AIState = { 
      status: "disconnected", 
      model: VISION_MODEL
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

  // Verify access code with server
  public async verifyAccessCode(code: string): Promise<boolean> {
      try {
          const res = await fetch('/api/ollama', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'verify-access', code })
          });
          const data = await res.json();
          return data.valid === true;
      } catch {
          return false;
      }
  }

  // Check if Ollama Cloud is reachable
  public async init() {
    this.setState({ status: "connecting" });
    try {
        const res = await fetch('/api/ollama', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'list' })
        });
        
        if (!res.ok) throw new Error("Ollama Cloud not reachable");
        
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const models = (data.models || []).map((m: any) => m.name);
        
        // Check if vision model is available
        const hasVisionModel = models.length > 0;
        
        this.setState({ 
            status: hasVisionModel ? "connected" : "disconnected",
            model: VISION_MODEL
        });

    } catch (e) {
        console.error("Ollama Cloud connection failed", e);
        this.setState({ status: "disconnected" });
    }
  }

  // Vision-based generation: Send image to model
  public async generateFromImage(imageBase64: string, accessCode: string): Promise<string> {
      this.setState({ status: "generating" });
      
      const systemPrompt = `You are an elite UI engineer specialized in converting wireframe sketches to pixel-perfect React code. You have 10+ years of experience and your code is known for being production-ready.

## YOUR TASK
Analyze the provided wireframe sketch image and generate a complete React component that visually matches it with 95%+ accuracy.

## ANALYSIS PROTOCOL (Think through each step)
Before writing code, mentally analyze:

### 1. ELEMENT INVENTORY
Count and identify every visual element:
- Rectangles (filled or outlined)
- Circles/ovals
- Lines (solid, dashed, arrows)
- Text (exact content, approximate size)
- Colors (be specific: light green, dark pink, etc.)

### 2. SPATIAL LAYOUT
Determine the layout structure:
- Is it a single column, row, or grid?
- What is the approximate aspect ratio?
- How are elements positioned relative to each other?
- Are any elements overlapping?

### 3. COLOR EXTRACTION
Map exact colors you observe:
- Light/mint green borders → border-green-400
- Dark green → border-green-600 or bg-green-600
- Pink/coral fill → bg-pink-400 or bg-rose-400
- Red → bg-red-500
- Blue → bg-blue-500
- Yellow/orange → bg-yellow-400 or bg-orange-400
- White/light background → bg-white
- Black text → text-black
- Gray → bg-gray-400 or text-gray-600

### 4. TEXT CONTENT
Read ALL text exactly as written - spelling, case, everything.

## OUTPUT FORMAT
Return ONLY valid JSX code. No explanations. No markdown code blocks.

\`\`\`
export default function App() {
  return (
    <div className="min-h-screen bg-white p-8">
      {/* Your generated UI here */}
    </div>
  );
}
\`\`\`

## STYLING REFERENCE
- Solid border: \`border-2 border-{color}-500\`
- Dashed border: \`border-2 border-dashed border-{color}-500\`
- Filled shape: \`bg-{color}-400\` or \`bg-{color}-500\`
- Rounded corners: \`rounded-lg\` or \`rounded-xl\`
- Text sizes: \`text-sm\`, \`text-base\`, \`text-lg\`, \`text-xl\`
- Positioning: Use \`flex\`, \`grid\`, \`absolute\`, \`relative\` as needed
- Sizing: \`w-32\`, \`w-48\`, \`w-64\`, \`h-24\`, \`h-32\`, etc.

## IMPORTS ALLOWED
ONLY: \`import { IconName } from 'lucide-react'\`
NO other libraries. NO shadcn. NO external components.

## QUALITY CHECKLIST
Before outputting, verify:
✓ Every element from sketch is represented
✓ Colors match what you see (not assumed)
✓ Text content is exact
✓ Layout matches spatial arrangement
✓ Code is syntactically valid React/JSX

Now analyze the image and generate the React component.`;

      let fullResponse = "";
      
      try {
          const res = await fetch('/api/ollama', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: 'chat',
                  model: VISION_MODEL,
                  accessCode,
                  messages: [
                      { role: "system", content: systemPrompt },
                      { 
                          role: "user", 
                          content: "Analyze this wireframe sketch carefully and generate the matching React component. Output only code, no explanation.",
                          images: [imageBase64]
                      }
                  ],
                  temperature: 0.05, // Very low for consistency
                  num_ctx: 8192 // More context for detailed output
              })
          });

          if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || "Generation failed");
          }

          if (!res.body) throw new Error("No stream");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();

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
                      }
                      if (json.done) break;
                  } catch {
                      // Partial JSON
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

  // Refine existing code
  public async refineCode(currentCode: string, instruction: string, accessCode: string): Promise<string> {
      this.setState({ status: "generating" });
      
      let fullResponse = "";
      
      try {
          const res = await fetch('/api/ollama', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  action: 'chat',
                  model: VISION_MODEL,
                  accessCode,
                  messages: [
                      { role: "system", content: "You are a Senior React Developer. Modify the code based on the instruction. Return FULL updated code only, no explanation." },
                      { role: "user", content: `CODE:\n${currentCode}\n\nINSTRUCTION: ${instruction}` }
                  ],
                  temperature: 0.2,
                  num_ctx: 4096
              })
          });

          if (!res.ok) {
              const error = await res.json();
              throw new Error(error.error || "Refinement failed");
          }

          if (!res.body) throw new Error("No stream");
          const reader = res.body.getReader();
          const decoder = new TextDecoder();

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
                      }
                      if (json.done) break;
                  } catch {
                      // Partial JSON
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
}

export const aiEngine = OllamaEngine.getInstance();
