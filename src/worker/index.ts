import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { KVNamespace } from '@cloudflare/workers-types';

// Define the Card schema from src/types/User.ts
const CardSchema = z.object({
  id: z.string(),
  userId: z.string(),
  company: z.string(),
  role: z.string(), // This corresponds to job title or Application.content
  url: z.string().url(),
  status: z.enum(['TO_APPLY', 'IN_PROGRESS', 'COMPLETED'])
});

type Card = z.infer<typeof CardSchema>;

interface Env {
  CARDS: KVNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use('*', cors());

// Helper to generate KV key
const getCardKey = (userId: string, cardId: string) => `${userId}:${cardId}`;

// Create a new card
app.post('/cards', zValidator('json', CardSchema), async (c) => {
  const card = c.req.valid('json');
  const key = getCardKey(card.userId, card.id);
  await c.env.CARDS.put(key, JSON.stringify(card));
  return c.json(card, 201);
});

// Get all cards for a user
app.get('/cards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    if (!userId) {
      console.error('Missing userId in request');
      return c.json({ error: 'userId path parameter is required' }, 400);
    }

    console.log(`Fetching cards for user: ${userId}`);
    const prefix = `${userId}:`;
    const list = await c.env.CARDS.list({ prefix });
    const cards: Card[] = [];

    for (const key of list.keys) {
      try {
        const value = await c.env.CARDS.get(key.name);
        if (value) {
          const parsedCard = JSON.parse(value) as Card;
          // Validate the card has all required fields
          if (!parsedCard.id || !parsedCard.userId || !parsedCard.status) {
            console.error(`Invalid card data for key ${key.name}:`, parsedCard);
            continue;
          }
          cards.push(parsedCard);
        }
      } catch (e) {
        console.error(`Failed to process card with key ${key.name}:`, e);
      }
    }

    console.log(`Found ${cards.length} cards for user ${userId}`);
    return c.json(cards);
  } catch (error) {
    console.error('Error in GET /cards/:userId:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get a specific card (though not explicitly requested, good for completeness if needed for updates)
app.get('/cards/:userId/:cardId', async (c) => {
  const { userId, cardId } = c.req.param();
  const key = getCardKey(userId, cardId);
  const value = await c.env.CARDS.get(key);
  if (!value) {
    return c.json({ error: 'Card not found' }, 404);
  }
  return c.json(JSON.parse(value));
});


// Update a card
app.put('/cards/:userId/:cardId', zValidator('json', CardSchema), async (c) => {
  const cardData = c.req.valid('json');
  const { userId, cardId } = c.req.param();

  if (cardData.userId !== userId || cardData.id !== cardId) {
    return c.json({ error: 'Card ID or User ID mismatch in payload vs. path' }, 400);
  }

  const key = getCardKey(userId, cardId);
  
  // Get existing card to ensure it exists
  const existing = await c.env.CARDS.get(key);
  if (!existing) {
    return c.json({ error: 'Card not found' }, 404);
  }

  // Validate the status is a valid enum value
  if (!['TO_APPLY', 'IN_PROGRESS', 'COMPLETED'].includes(cardData.status)) {
    return c.json({ error: 'Invalid status value' }, 400);
  }

  // Store the updated card
  await c.env.CARDS.put(key, JSON.stringify(cardData));
  return c.json(cardData);
});

// Delete a card
app.delete('/cards/:userId/:cardId', async (c) => {
  const { userId, cardId } = c.req.param();
  const key = getCardKey(userId, cardId);
  await c.env.CARDS.delete(key);
  return c.json({ success: true, id: cardId });
});

export default app;
