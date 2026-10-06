import 'dotenv/config';
import { db } from '../lib/db';
import { decryptApiKey } from '../lib/security/encryption';

async function test() {
  const creds = await db.query.credentials.findMany({
    with: { provider: true }
  });
  const googleCred = creds.find(c => c.provider.type === 'google');
  
  if (!googleCred) throw new Error('No google cred');
  
  const apiKey = await decryptApiKey(googleCred.encryptedApiKey);
  
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
  const data = await res.json();
  
  console.log(data.models?.map(m => m.name).join(', '));
  process.exit(0);
}
test().catch(console.error);
