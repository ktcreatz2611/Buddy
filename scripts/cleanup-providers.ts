import 'dotenv/config';
import { db } from '../src/lib/db';
import { providers, credentials } from '../src/lib/db/schema/providers';
import { notInArray } from 'drizzle-orm';

async function cleanup() {
  const allCreds = await db.select().from(credentials);
  const providerIdsWithCreds = allCreds.map(c => c.providerId);
  
  if (providerIdsWithCreds.length > 0) {
    const res = await db.delete(providers).where(notInArray(providers.id, providerIdsWithCreds)).returning();
    console.log(`Deleted ${res.length} unused duplicate providers.`);
  } else {
    console.log('No credentials found at all. Deleting ALL duplicate providers except the most recent ones.');
    // Just delete everything and re-seed to be safe.
    await db.delete(providers);
  }
  process.exit(0);
}
cleanup().catch(console.error);
