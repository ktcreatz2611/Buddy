import { providerRegistry } from '../registry';
import { OpenAIAdapter } from './openai';

// Register all built-in adapters
providerRegistry.register(new OpenAIAdapter());

export { OpenAIAdapter };
