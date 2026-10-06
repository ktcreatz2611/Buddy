import 'dotenv/config';
import { db } from '../lib/db';
import { models } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function fix() {
  await db.update(models).set({ modelId: 'gemini-1.5-pro-latest' }).where(eq(models.modelId, 'gemini-1.5-pro'));
  await db.update(models).set({ modelId: 'gemini-1.5-flash-latest' }).where(eq(models.modelId, 'gemini-1.5-flash'));
  console.log('Fixed google model names');
  process.exit(0);
}
fix().catch(console.error);
