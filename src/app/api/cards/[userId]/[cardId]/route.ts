import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { Card } from '@/types/User';

const WORKER_URL = process.env.WORKER_URL;

if (!WORKER_URL) {
  console.error("[API Route /cards/[userId]/[cardId]] CRITICAL: WORKER_URL environment variable is not set or empty.");
}

// Definition of makeWorkerRequest - Copied from the original route.ts for now.
// Consider refactoring to a shared utility if used in more places.
async function makeWorkerRequest(path: string, method: string, body?: any) {
  if (!WORKER_URL) {
    console.error('[API Route /cards/[userId]/[cardId]] CRITICAL: WORKER_URL is not available. Ensure .env.local is loaded.');
    return NextResponse.json({ error: 'Worker service misconfigured (URL missing)' }, { status: 503 });
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const url = `${WORKER_URL}${path}`;
  console.log(`[API Route /cards/[userId]/[cardId]] Attempting to request worker:`, { url, method, bodyIsPresent: !!body });

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
    console.log(`[API Route /cards/[userId]/[cardId]] Received raw response from worker:`, responseContext);

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`[API Route /cards/[userId]/[cardId]] Worker request failed:`, {
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
        console.warn('[API Route /cards/[userId]/[cardId]] Worker error response was not JSON.');
      }
      return NextResponse.json(errorJson, { status: response.status });
    }

    try {
      const data = JSON.parse(responseText);
      console.log('[API Route /cards/[userId]/[cardId]] Successfully parsed worker JSON response.');
      return NextResponse.json(data, { status: response.status });
    } catch (e: any) {
      console.error('[API Route /cards/[userId]/[cardId]] Worker successful response (2xx) was not valid JSON:', {
        responseText,
        parseErrorMessage: e.message,
      });
      return NextResponse.json({ error: 'Worker returned a successful but non-JSON response.' }, { status: 502 });
    }

  } catch (error: any) {
    console.error('[API Route /cards/[userId]/[cardId]] Network or fetch error while communicating with worker:', {
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

// PUT - Update a specific card
export async function PUT(req: NextRequest, { params }: { params: { userId: string; cardId: string } }) {
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const requestingUserId = authResult.userId;
  const { userId: pathUserId, cardId } = params;

  if (requestingUserId !== pathUserId) {
    console.warn(`[API Route /cards/[userId]/[cardId]] Forbidden: User ${requestingUserId} attempted to update card for ${pathUserId}.`);
    return NextResponse.json({ error: 'Forbidden: You can only update your own cards.' }, { status: 403 });
  }

  if (!cardId) { // Should be guaranteed by path structure, but good for defense.
    return NextResponse.json({ error: 'Card ID is missing in the path.' }, { status: 400 });
  }
   if (!pathUserId) { // Should be guaranteed by path structure.
    return NextResponse.json({ error: 'User ID is missing in the path.' }, { status: 400 });
  }


  try {
    const cardData = await req.json();
    const cardToUpdate: Card = {
      ...cardData,
      userId: pathUserId, // Ensure the userId from the path is used for consistency
      id: cardId,
    };

    console.log(`[API Route /cards/[userId]/[cardId]] Authorized. Updating card:`, { pathUserId, cardId, cardDataIsPresent: !!cardData });
    return makeWorkerRequest(`/cards/${pathUserId}/${cardId}`, 'PUT', cardToUpdate);
  } catch (error) {
    console.error(`[API Route /cards/[userId]/[cardId]] Error processing PUT request (body parse?):`, { pathUserId, cardId, error });
    return NextResponse.json({ error: 'Invalid request body for PUT operation.' }, { status: 400 });
  }
}

// DELETE - Delete a specific card
export async function DELETE(req: NextRequest, { params }: { params: { userId: string; cardId: string } }) {
  const authResult = await auth();
  if (!authResult.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const requestingUserId = authResult.userId;
  const { userId: pathUserId, cardId } = params;

  if (requestingUserId !== pathUserId) {
    console.warn(`[API Route /cards/[userId]/[cardId]] Forbidden: User ${requestingUserId} attempted to delete card for ${pathUserId}.`);
    return NextResponse.json({ error: 'Forbidden: You can only delete your own cards.' }, { status: 403 });
  }
  
  if (!cardId) {
    return NextResponse.json({ error: 'Card ID is missing in the path.' }, { status: 400 });
  }
  if (!pathUserId) {
    return NextResponse.json({ error: 'User ID is missing in the path.' }, { status: 400 });
  }

  console.log(`[API Route /cards/[userId]/[cardId]] Authorized. Deleting card:`, { pathUserId, cardId });
  return makeWorkerRequest(`/cards/${pathUserId}/${cardId}`, 'DELETE');
} 