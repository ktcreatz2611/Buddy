import 'dotenv/config';
import { db } from '../lib/db';

async function test() {
  const gModels = await db.query.models.findMany({
    with: { provider: true }
  });
  console.log(gModels.filter(m => m.provider.type === 'google').map(m => m.modelId));
  process.exit(0);
}
test().catch(console.error);
