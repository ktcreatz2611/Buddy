import { db } from '../src/lib/db';
import { comparisonResponses } from '../src/lib/db/schema';

async function test() {
  const responses = await db.query.comparisonResponses.findMany();
  console.log('Total responses:', responses.length);
  process.exit(0);
}
test().catch(console.error);
