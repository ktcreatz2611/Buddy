import 'dotenv/config';
import { db } from '../lib/db';
import { models } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function fix() {
  const allModels = await db.query.models.findMany();
  for (const m of allModels) {
    if (m.modelId === 'gemini-2.5-pro') {
      await db.update(models).set({ modelId: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)' }).where(eq(models.id, m.id));
    }
    if (m.modelId === 'gemini-2.5-flash') {
      await db.update(models).set({ modelId: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash' }).where(eq(models.id, m.id));
    }
  }
  console.log('Fixed google models again!');
  process.exit(0);
}
fix().catch(console.error);
