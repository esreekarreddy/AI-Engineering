import { NextResponse } from 'next/server';

const OLLAMA_HOST = 'http://127.0.0.1:11434';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ...args } = body;

    // 1. List available models
    if (action === 'list') {
      try {
        const res = await fetch(`${OLLAMA_HOST}/api/tags`);
        if (!res.ok) throw new Error('Ollama not reachable');
        const data = await res.json();
        return NextResponse.json(data);
      } catch {
        return NextResponse.json({ models: [] }, { status: 503 });
      }
    }

    // 2. Chat completion (streaming)
    if (action === 'chat') {
      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: args.model,
          messages: args.messages,
          stream: args.stream ?? true,
          keep_alive: 0, // CRITICAL: Unload model immediately to save RAM
          options: {
            temperature: args.temperature ?? 0.2,
            num_ctx: args.num_ctx ?? 4096, // Reduced from 8192 for memory efficiency
          }
        }),
      });

      if (!response.ok) {
        return NextResponse.json({ error: 'Ollama Error' }, { status: response.status });
      }

      // Stream response back to client
      if (args.stream !== false) {
        const stream = new ReadableStream({
          async start(controller) {
            if (!response.body) return;
            const reader = response.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } else {
        // Non-streaming response
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Ollama Bridge Error:', error);
    return NextResponse.json({ error: 'Bridge Internal Error' }, { status: 500 });
  }
}
