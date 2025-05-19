import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server'; // Correct import for server-side auth
import type { Card } from '@/types/User';

// Ensure WORKER_URL is defined in your environment variables
const WORKER_URL = process.env.WORKER_URL;

if (!WORKER_URL) {
  console.error("[API Route /cards] CRITICAL: WORKER_URL environment variable is not set or empty.");
}

async function makeWorkerRequest(path: string, method: string, body?: any) {
  if (!WORKER_URL) {
    console.error('[API Route /cards] CRITICAL: WORKER_URL is not available. Ensure .env.local is loaded.');
    return NextResponse.json({ error: 'Worker service misconfigured (URL missing)' }, { status: 503 });
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const url = `${WORKER_URL}${path}`;
  console.log(`[API Route /cards] Attempting to request worker:`, { url, method, bodyIsPresent: !!body });

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseContext = {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      responseHeaders: Object.fromEntries(response.headers.entries()),
    };
    console.log(`[API Route /cards] Received raw response from worker:`, responseContext);

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[API Route /cards] Worker request failed:`, {
        url,
        method,
        status: response.status,
        statusText: response.statusText,
        responseText,
      });
      let errorJson = { error: `Worker responded with ${response.status}: ${responseText.substring(0, 200)}` };
      try {
        const parsed = JSON.parse(responseText);
        if (parsed && parsed.error) {
            errorJson.error = parsed.error;
        }
      } catch (e) {
        console.warn('[API Route /cards] Worker error response was not JSON.');
      }
      return NextResponse.json(errorJson, { status: response.status });
    }

    try {
      const data = JSON.parse(responseText);
      console.log('[API Route /cards] Successfully parsed worker JSON response.');
      return NextResponse.json(data, { status: response.status });
    } catch (e: any) {
      console.error('[API Route /cards] Worker successful response (2xx) was not valid JSON:', {
        responseText,
        parseErrorMessage: e.message,
      });
      return NextResponse.json({ error: 'Worker returned a successful but non-JSON response.' }, { status: 502 });
    }

  } catch (error: any) {
    console.error('[API Route /cards] Network or fetch error while communicating with worker:', {
      url,
      method,
      errorMessage: error.message,
      errorCode: error.code,
      errorCause: error.cause,
      usedWorkerUrl: WORKER_URL,
    });
    return NextResponse.json(
      { error: 'Failed to communicate with worker service. Check Next.js server logs and worker status.' },
      { status: 502 }
    );
  }
}

// POST - Create a new card
export async function POST(req: NextRequest) {
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = authResult.userId;

  try {
    const cardData = await req.json();
    const cardToSave: Card = {
      ...cardData,
      userId: userId,
      id: cardData.id || crypto.randomUUID(),
    };
    console.log('[API Route /cards] Authorized. Creating card for user:', userId, { cardId: cardToSave.id });
    return makeWorkerRequest('/cards', 'POST', cardToSave);
  } catch (error) {
    console.error("[API Route /cards] Error processing POST request (body parse?):", { userId, error });
    return NextResponse.json({ error: 'Invalid request body for POST' }, { status: 400 });
  }
}

// GET - Get all cards for the authenticated user
export async function GET(req: NextRequest) {
  const authResult = await auth();
  if (!authResult.userId) {
    console.error('[API Route /cards] Unauthorized request to GET /api/cards');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = authResult.userId;
  console.log('[API Route /cards] Authorized. Fetching all cards for user:', userId);
  return makeWorkerRequest(`/cards/${userId}`, 'GET');
}

// PUT and DELETE functions have been moved to src/app/api/cards/[userId]/[cardId]/route.ts
