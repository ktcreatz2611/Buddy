import { db } from './src/lib/db';
import { eq } from 'drizzle-orm';
import { comparisonResponses } from './src/lib/db/schema';

async function test() {
  const all = await db.query.comparisonResponses.findMany({
    where: eq(comparisonResponses.comparisonId, '4a776fc7-d87d-4879-bf21-ae05348784d9')
  });
  console.log('Total for that comparison:', all.length);
  process.exit(0);
}
test().catch(console.error);
