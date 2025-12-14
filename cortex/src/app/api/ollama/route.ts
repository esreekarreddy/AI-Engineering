import { NextResponse } from 'next/server';

// Ollama Cloud API
const OLLAMA_HOST = 'https://ollama.com';

export async function POST(req: Request) {
  try {
    // Verify API key exists
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OLLAMA_API_KEY not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, ...args } = body;

    // Headers for cloud API
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // 1. List available models
    if (action === 'list') {
      try {
        const res = await fetch(`${OLLAMA_HOST}/api/tags`, { headers });
        if (!res.ok) throw new Error('Ollama Cloud not reachable');
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
        headers,
        body: JSON.stringify({
          model: args.model,
          messages: args.messages,
          stream: args.stream ?? true,
          options: {
            temperature: args.temperature ?? 0.2,
            num_ctx: args.num_ctx ?? 4096,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama Cloud Error:', response.status, errorText);
        
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Try again later.' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: 'Ollama Cloud Error' },
          { status: response.status }
        );
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

    // 3. Verify access code
    if (action === 'verify-access') {
      const accessCode = process.env.CORTEX_ACCESS_CODE;
      if (!accessCode) {
        // No code configured = open access
        return NextResponse.json({ valid: true });
      }
      const isValid = args.code === accessCode;
      return NextResponse.json({ valid: isValid });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Ollama Bridge Error:', error);
    return NextResponse.json({ error: 'Bridge Internal Error' }, { status: 500 });
  }
}
