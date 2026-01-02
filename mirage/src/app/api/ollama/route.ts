import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { timingSafeCompare, isValidAction, isValidModelName } from '@/lib/security';

// Ollama Cloud API
const OLLAMA_HOST = 'https://ollama.com';

// Simple in-memory rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  
  // Cleanup old entries
  if (rateLimit.size > 1000) {
    for (const [key, val] of rateLimit.entries()) {
      if (val.resetTime < now) rateLimit.delete(key);
    }
  }
  
  if (!entry || entry.resetTime < now) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60 * 1000 }); // 1 minute window
    return true;
  }
  
  if (entry.count >= 30) return false; // 30 requests per minute
  entry.count++;
  return true;
}

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip')?.trim() ||
         'unknown';
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Verify API key exists
    const apiKey = process.env.OLLAMA_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Service not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, ...args } = body;

    // Validate action
    if (!isValidAction(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Headers for cloud API
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // 1. Verify access code (called before generation)
    if (action === 'verify-access') {
      const accessCode = process.env.MIRAGE_ACCESS_CODE;
      if (!accessCode) {
        // No code configured = open access
        return NextResponse.json({ valid: true });
      }
      // Use timing-safe comparison to prevent timing attacks
      const isValid = typeof args.code === 'string' && timingSafeCompare(args.code, accessCode);
      return NextResponse.json({ valid: isValid });
    }

    // 2. List available models
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

    // 3. Chat completion (streaming) - supports vision
    if (action === 'chat') {
      // Validate model name
      if (!isValidModelName(args.model)) {
        return NextResponse.json({ error: 'Invalid model name' }, { status: 400 });
      }

      // Check access code using timing-safe comparison
      const accessCode = process.env.MIRAGE_ACCESS_CODE;
      
      // Try body first, then cookie
      const clientCode = typeof args.accessCode === 'string' ? args.accessCode : (await cookies()).get('mirage_code')?.value;

      if (accessCode && (!clientCode || !timingSafeCompare(clientCode, accessCode))) {
        return NextResponse.json(
          { error: 'Invalid access code' },
          { status: 401 }
        );
      }

      const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: args.model,
          messages: args.messages,
          stream: args.stream ?? true,
          options: {
            temperature: args.temperature ?? 0.1,
            num_ctx: args.num_ctx ?? 4096,
          }
        }),
      });

      if (!response.ok) {
        // Log server-side, return generic message
        console.error('[Mirage] Ollama Error:', response.status);
        
        if (response.status === 429) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Try again later.' },
            { status: 429 }
          );
        }
        
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: response.status }
        );
      }

      // Stream response back to client
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[Mirage] Bridge Error:', error);
    return NextResponse.json({ error: 'Service error' }, { status: 500 });
  }
}

