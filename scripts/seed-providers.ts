import 'dotenv/config';
import { db } from '../src/lib/db';
import { providers, models } from '../src/lib/db/schema';

const PROVIDERS = [
  {
    type: 'openai', name: 'OpenAI',
    models: [
      { modelId: 'gpt-4o', name: 'GPT-4o', maxContext: 128000, maxOutput: 16384, inputPrice: '5.00', outputPrice: '15.00', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
      { modelId: 'gpt-4o-mini', name: 'GPT-4o Mini', maxContext: 128000, maxOutput: 16384, inputPrice: '0.150', outputPrice: '0.600', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
      { modelId: 'o1', name: 'o1', maxContext: 200000, maxOutput: 100000, inputPrice: '15.00', outputPrice: '60.00', capabilities: { chat: true, streaming: false, vision: false, toolCalling: false } },
      { modelId: 'o3-mini', name: 'o3-mini', maxContext: 200000, maxOutput: 100000, inputPrice: '1.10', outputPrice: '4.40', capabilities: { chat: true, streaming: false, vision: false, toolCalling: false } },
    ],
  },
  {
    type: 'anthropic', name: 'Anthropic',
    models: [
      { modelId: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', maxContext: 200000, maxOutput: 8192, inputPrice: '3.00', outputPrice: '15.00', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
      { modelId: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', maxContext: 200000, maxOutput: 8192, inputPrice: '0.80', outputPrice: '4.00', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
      { modelId: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxContext: 200000, maxOutput: 4096, inputPrice: '15.00', outputPrice: '75.00', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
    ],
  },
  {
    type: 'google', name: 'Google Gemini',
    models: [
      { modelId: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', maxContext: 1000000, maxOutput: 8192, inputPrice: '0.10', outputPrice: '0.40', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
      { modelId: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxContext: 2000000, maxOutput: 8192, inputPrice: '1.25', outputPrice: '5.00', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
      { modelId: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', maxContext: 1000000, maxOutput: 8192, inputPrice: '0.075', outputPrice: '0.300', capabilities: { chat: true, streaming: true, vision: true, toolCalling: true } },
    ],
  },
  {
    type: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1',
    models: [
      { modelId: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', maxContext: 131072, maxOutput: 8192, inputPrice: '0.59', outputPrice: '0.79', capabilities: { chat: true, streaming: true, vision: false, toolCalling: true } },
      { modelId: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', maxContext: 32768, maxOutput: 8192, inputPrice: '0.24', outputPrice: '0.24', capabilities: { chat: true, streaming: true, vision: false, toolCalling: true } },
    ],
  },
  {
    type: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com',
    models: [
      { modelId: 'deepseek-chat', name: 'DeepSeek V3', maxContext: 128000, maxOutput: 8192, inputPrice: '0.27', outputPrice: '1.10', capabilities: { chat: true, streaming: true, vision: false, toolCalling: true } },
      { modelId: 'deepseek-reasoner', name: 'DeepSeek R1', maxContext: 128000, maxOutput: 8192, inputPrice: '0.55', outputPrice: '2.19', capabilities: { chat: true, streaming: true, vision: false, toolCalling: false } },
    ],
  },
  {
    type: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1',
    models: [], // User adds their own
  },
];

async function seed() {
  console.log('Seeding providers and models...');
  for (const p of PROVIDERS) {
    const [provider] = await db.insert(providers).values({
      type: p.type,
      name: p.name,
      baseUrl: p.baseUrl || null,
    }).onConflictDoNothing().returning();

    if (provider && p.models.length > 0) {
      for (const m of p.models) {
        await db.insert(models).values({
          providerId: provider.id,
          modelId: m.modelId,
          name: m.name,
          maxContextTokens: m.maxContext,
          maxOutputTokens: m.maxOutput,
          inputPricePerMToken: m.inputPrice,
          outputPricePerMToken: m.outputPrice,
          capabilities: m.capabilities,
        }).onConflictDoNothing();
      }
    }
    console.log(`  Seeded: ${p.name} (${p.models.length} models)`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);
