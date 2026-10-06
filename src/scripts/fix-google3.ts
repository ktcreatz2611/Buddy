import 'dotenv/config';
import { db } from '../lib/db';
import { models } from '../lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

async function fix() {
  const allModels = await db.query.models.findMany();
  for (const m of allModels) {
    if (m.modelId === 'gemini-1.5-pro-latest' || m.modelId === 'gemini-1.5-pro') {
      await db.update(models).set({ modelId: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' }).where(eq(models.id, m.id));
    }
    if (m.modelId === 'gemini-1.5-flash-latest' || m.modelId === 'gemini-1.5-flash') {
      await db.update(models).set({ modelId: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' }).where(eq(models.id, m.id));
    }
  }
  console.log('Fixed google models!');
  process.exit(0);
}
fix().catch(console.error);
