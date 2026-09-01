import { providerRegistry } from '../registry';
import { OpenAIAdapter } from './openai';
import { AnthropicAdapter } from './anthropic';
import { GoogleAdapter } from './google';
import { OpenAICompatibleAdapter } from './openai-compatible';

providerRegistry.register(new OpenAIAdapter());
providerRegistry.register(new AnthropicAdapter());
providerRegistry.register(new GoogleAdapter());

// Pre-register common OpenAI-compatible providers
providerRegistry.register(new OpenAICompatibleAdapter({
  id: 'groq',
  name: 'Groq',
  baseUrl: 'https://api.groq.com/openai/v1',
}));
providerRegistry.register(new OpenAICompatibleAdapter({
  id: 'deepseek',
  name: 'DeepSeek',
  baseUrl: 'https://api.deepseek.com',
}));
providerRegistry.register(new OpenAICompatibleAdapter({
  id: 'openrouter',
  name: 'OpenRouter',
  baseUrl: 'https://openrouter.ai/api/v1',
}));

export { OpenAIAdapter, AnthropicAdapter, GoogleAdapter, OpenAICompatibleAdapter };
