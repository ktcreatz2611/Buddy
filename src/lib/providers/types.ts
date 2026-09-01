import { z } from 'zod';

/** Capabilities a provider/model supports */
export interface ProviderCapabilities {
  chat: boolean;
  streaming: boolean;
  vision: boolean;
  fileInput: boolean;
  toolCalling: boolean;
  embeddings: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
  modalities: ('text' | 'image' | 'audio' | 'video')[];
  executionContext: 'server' | 'client';
}

/** Normalized message content block types */
export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'image'; url: string; alt?: string }
  | { type: 'citation'; sourceId: string; excerpt: string; url?: string }
  | { type: 'tool_call'; toolCallId: string; name: string; args: Record<string, unknown> }
  | { type: 'tool_result'; toolCallId: string; result: unknown; isError?: boolean };

/** Normalized chat message */
export interface NormalizedMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: ContentBlock[];
  name?: string;
}

/** Normalized chat request to a provider */
export interface NormalizedChatRequest {
  model: string;
  messages: NormalizedMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  tools?: ToolDefinition[];
  signal?: AbortSignal;
}

/** Tool definition for function calling */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
}

/** Normalized stream events emitted by adapters */
export type NormalizedStreamEvent =
  | { type: 'text-delta'; textDelta: string }
  | { type: 'tool-call-start'; toolCallId: string; toolName: string }
  | { type: 'tool-call-delta'; toolCallId: string; argsDelta: string }
  | { type: 'tool-call-complete'; toolCallId: string; toolName: string; args: Record<string, unknown> }
  | { type: 'finish'; usage: TokenUsage; finishReason: FinishReason }
  | { type: 'error'; error: ProviderError };

/** Token usage from a completion */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export type FinishReason = 'stop' | 'length' | 'content-filter' | 'tool-calls' | 'error' | 'other';

/** Provider health status */
export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs?: number;
  message?: string;
  checkedAt: Date;
}

/** Cost estimate */
export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: 'USD';
}

/** Provider error classification */
export interface ProviderError {
  type: 'rate_limit' | 'auth_error' | 'context_exceeded' | 'timeout' | 'content_policy' | 'provider_outage' | 'unknown';
  message: string;
  statusCode?: number;
  retryable: boolean;
  retryAfterMs?: number;
}

/** The core provider adapter interface */
export interface ProviderAdapter {
  /** Unique adapter ID, e.g. 'openai', 'anthropic', 'openai_compatible:groq' */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;

  /** Get capabilities for a specific model */
  getCapabilities(modelKey: string): Promise<ProviderCapabilities>;

  /** Stream a chat completion */
  chatStream(req: NormalizedChatRequest, apiKey: string): AsyncIterable<NormalizedStreamEvent>;

  /** Generate embeddings (optional - not all providers support this) */
  embed?(input: string[], apiKey: string): Promise<number[][]>;

  /** Health check */
  healthCheck(apiKey: string): Promise<ProviderHealth>;

  /** Estimate cost for given usage */
  estimateCost(usage: TokenUsage, modelKey: string): CostEstimate | null;
}
