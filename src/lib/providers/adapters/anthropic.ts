import { createAnthropic } from '@ai-sdk/anthropic';
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

export class AnthropicAdapter implements ProviderAdapter {
  readonly id = 'anthropic';
  readonly name = 'Anthropic';

  async getCapabilities(modelKey: string): Promise<ProviderCapabilities> {
    const isSonnet = modelKey.includes('sonnet');
    const isOpus = modelKey.includes('opus');
    
    return {
      chat: true,
      streaming: true,
      vision: isSonnet,
      fileInput: false,
      toolCalling: isSonnet,
      embeddings: false,
      maxContextTokens: 200000,
      maxOutputTokens: isSonnet ? 8192 : 4096,
      modalities: isSonnet ? ['text', 'image'] : ['text'],
      executionContext: 'server'
    };
  }

  async *chatStream(req: NormalizedChatRequest, apiKey: string): AsyncIterable<NormalizedStreamEvent> {
    const anthropic = createAnthropic({ apiKey });
    
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
        model: anthropic(req.model),
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
      const req = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hello' }]
        })
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
    let inputPrice = 0;
    let outputPrice = 0;
    if (modelKey.includes('sonnet')) {
      inputPrice = 3.00 / 1000000;
      outputPrice = 15.00 / 1000000;
    } else if (modelKey.includes('opus')) {
      inputPrice = 15.00 / 1000000;
      outputPrice = 75.00 / 1000000;
    } else if (modelKey.includes('haiku')) {
      inputPrice = 0.25 / 1000000;
      outputPrice = 1.25 / 1000000;
    }
    
    const inputCost = usage.inputTokens * inputPrice;
    const outputCost = usage.outputTokens * outputPrice;
    
    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD'
    };
  }
}
