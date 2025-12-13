import { NextResponse } from 'next/server';

const OLLAMA_HOST = 'http://127.0.0.1:11434';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { path, ...args } = body;

    // 1. Health/Tags check
    if (path === '/api/tags') {
        try {
            const res = await fetch(`${OLLAMA_HOST}/api/tags`);
            if (!res.ok) throw new Error('Ollama not reachable');
            const data = await res.json();
            return NextResponse.json(data);
        } catch {
            return NextResponse.json({ models: [] }, { status: 503 });
        }
    }

    // 2. Chat Completion (Streaming)
    if (path === '/api/chat') {
        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Ollama Error' }, { status: response.status });
        }

        // Create a streaming response
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
    }

    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });

  } catch (error) {
    console.error('Bridge Error:', error);
    return NextResponse.json({ error: 'Bridge Internal Error' }, { status: 500 });
  }
}
