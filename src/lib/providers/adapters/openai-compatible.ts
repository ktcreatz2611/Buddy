import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { 
  ProviderAdapter, 
  ProviderCapabilities, 
  NormalizedChatRequest, 
  NormalizedStreamEvent, 
  ProviderHealth, 
  CostEstimate, 
  TokenUsage,
  ProviderError
} from '../types';

export class OpenAICompatibleAdapter implements ProviderAdapter {
  readonly id: string;
  readonly name: string;
  private readonly baseUrl: string;
  private readonly defaultHeaders?: Record<string, string>;

  constructor(config: { id: string, name: string, baseUrl: string, defaultHeaders?: Record<string, string> }) {
    this.id = config.id;
    this.name = config.name;
    this.baseUrl = config.baseUrl;
    this.defaultHeaders = config.defaultHeaders;
  }

  async getCapabilities(modelKey: string): Promise<ProviderCapabilities> {
    return {
      chat: true,
      streaming: true,
      vision: false, // Conservative default
      fileInput: false,
      toolCalling: false, // Conservative default
      embeddings: false, // Conservative default
      maxContextTokens: 128000, // Conservative default
      maxOutputTokens: 4096, // Conservative default
      modalities: ['text'],
      executionContext: 'server'
    };
  }

  async *chatStream(req: NormalizedChatRequest, apiKey: string): AsyncIterable<NormalizedStreamEvent> {
    const openai = createOpenAI({ 
      apiKey, 
      baseURL: this.baseUrl,
      headers: this.defaultHeaders
    });
    
    // Map messages
    const aiMessages: any[] = req.messages.map(msg => {
      const textContent = msg.content
        .filter(c => c.type === 'text')
        .map(c => (c as any).text)
        .join('\n');
        
      return {
        role: msg.role,
        content: textContent,
      };
    });

    try {
      const result = streamText({
        model: openai(req.model),
        messages: aiMessages,
        temperature: req.temperature,
        maxTokens: req.maxTokens,
        topP: req.topP,
        frequencyPenalty: req.frequencyPenalty,
        presencePenalty: req.presencePenalty,
      });

      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          yield { type: 'text-delta', textDelta: part.textDelta };
        } else if (part.type === 'tool-call') {
          yield { type: 'tool-call-start', toolCallId: part.toolCallId, toolName: part.toolName };
          yield { type: 'tool-call-complete', toolCallId: part.toolCallId, toolName: part.toolName, args: part.args };
        } else if (part.type === 'finish') {
          yield { 
            type: 'finish', 
            usage: {
              inputTokens: part.usage.promptTokens,
              outputTokens: part.usage.completionTokens,
              totalTokens: part.usage.totalTokens
            },
            finishReason: (part.finishReason as any) || 'stop' 
          };
        } else if (part.type === 'error') {
          yield { type: 'error', error: this.mapError(part.error) };
        }
      }
    } catch (err: any) {
      yield { type: 'error', error: this.mapError(err) };
    }
  }

  private mapError(err: any): ProviderError {
    const status = err?.statusCode || err?.status;
    let type: ProviderError['type'] = 'unknown';
    
    if (status === 429) type = 'rate_limit';
    else if (status === 401 || status === 403) type = 'auth_error';
    else if (status === 408 || status === 504) type = 'timeout';
    else if (status === 400 && err.message?.includes('content policy')) type = 'content_policy';
    else if (status === 400 && err.message?.includes('maximum context')) type = 'context_exceeded';
    else if (status >= 500) type = 'provider_outage';

    return {
      type,
      message: err?.message || 'Unknown error occurred',
      statusCode: status,
      retryable: type === 'rate_limit' || type === 'timeout' || type === 'provider_outage',
    };
  }

  async healthCheck(apiKey: string): Promise<ProviderHealth> {
    try {
      const startTime = Date.now();
      const req = await fetch(`${this.baseUrl}/models`, {
        headers: { 
          Authorization: `Bearer ${apiKey}`,
          ...this.defaultHeaders
        }
      });
      const latencyMs = Date.now() - startTime;
      
      if (!req.ok) {
        return { status: 'unhealthy', message: `HTTP ${req.status}`, checkedAt: new Date(), latencyMs };
      }
      return { status: 'healthy', checkedAt: new Date(), latencyMs };
    } catch (e: any) {
      return { status: 'unhealthy', message: e.message, checkedAt: new Date() };
    }
  }

  estimateCost(usage: TokenUsage, modelKey: string): CostEstimate | null {
    // Pricing varies too much by provider and model
    return null;
  }
}
