import 'dotenv/config';
import { db } from '../lib/db';
import { models } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function fix() {
  await db.update(models).set({ modelId: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash' }).where(eq(models.modelId, 'gemini-2.0-flash'));
  console.log('Fixed gemini 2.0 to 3.6');
  process.exit(0);
}
fix().catch(console.error);
