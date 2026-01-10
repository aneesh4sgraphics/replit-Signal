import { db } from "./db";
import { apiCostLogs } from "@shared/schema";

const OPENAI_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
  'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
  'gpt-4-turbo': { input: 10.00 / 1_000_000, output: 30.00 / 1_000_000 },
  'gpt-3.5-turbo': { input: 0.50 / 1_000_000, output: 1.50 / 1_000_000 },
};

interface LogApiCostParams {
  userId?: string;
  apiProvider: string;
  model?: string;
  operation: string;
  functionName: string;
  inputTokens?: number;
  outputTokens?: number;
  requestDurationMs?: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = OPENAI_PRICING[model] || OPENAI_PRICING['gpt-4o-mini'];
  return (inputTokens * pricing.input) + (outputTokens * pricing.output);
}

export async function logApiCost(params: LogApiCostParams): Promise<void> {
  try {
    const inputTokens = params.inputTokens || 0;
    const outputTokens = params.outputTokens || 0;
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = params.model 
      ? calculateCost(params.model, inputTokens, outputTokens).toFixed(6)
      : '0';

    await db.insert(apiCostLogs).values({
      userId: params.userId || null,
      apiProvider: params.apiProvider,
      model: params.model || null,
      operation: params.operation,
      functionName: params.functionName,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      requestDurationMs: params.requestDurationMs || null,
      success: params.success !== false,
      errorMessage: params.errorMessage || null,
      metadata: params.metadata || {},
    });
  } catch (error) {
    console.error('Failed to log API cost:', error);
  }
}

export async function trackOpenAICall<T>(
  params: {
    userId?: string;
    operation: string;
    functionName: string;
    model?: string;
  },
  apiCall: () => Promise<T & { usage?: { prompt_tokens?: number; completion_tokens?: number } }>
): Promise<T> {
  const startTime = Date.now();
  let success = true;
  let errorMessage: string | undefined;
  let result: T & { usage?: { prompt_tokens?: number; completion_tokens?: number } };

  try {
    result = await apiCall();
    return result;
  } catch (error) {
    success = false;
    errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw error;
  } finally {
    const duration = Date.now() - startTime;
    
    await logApiCost({
      userId: params.userId,
      apiProvider: 'openai',
      model: params.model || 'gpt-4o-mini',
      operation: params.operation,
      functionName: params.functionName,
      inputTokens: result?.usage?.prompt_tokens || 0,
      outputTokens: result?.usage?.completion_tokens || 0,
      requestDurationMs: duration,
      success,
      errorMessage,
    });
  }
}
