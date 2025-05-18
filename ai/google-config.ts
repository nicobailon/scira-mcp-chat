import { type modelID } from "@/ai/providers";

// Configuration types for Google models
export interface GoogleThinkingConfig {
  thinkingBudget?: number;
}

export interface GoogleModelConfig {
  thinkingConfig?: GoogleThinkingConfig;
  responseModalities?: string[];
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

// Helper to determine if a model supports thinking
export function supportsThinking(modelId: modelID): boolean {
  return modelId.includes('thinking') || modelId.includes('2.5');
}

// Helper to determine if a model supports image generation
export function supportsImageGeneration(modelId: modelID): boolean {
  return modelId.includes('2.0-flash') && !modelId.includes('thinking');
}

// Get optimal thinking budget based on model and task complexity
export function getOptimalThinkingBudget(
  modelId: modelID, 
  taskComplexity: 'simple' | 'medium' | 'complex' = 'medium'
): number | undefined {
  if (!supportsThinking(modelId)) return undefined;
  
  const budgets = {
    simple: { '2.5': 1024, '2.0-thinking': 2048 },
    medium: { '2.5': 2048, '2.0-thinking': 4096 },
    complex: { '2.5': 4096, '2.0-thinking': 8192 }
  };
  
  if (modelId.includes('2.5')) return budgets[taskComplexity]['2.5'];
  if (modelId.includes('2.0-thinking')) return budgets[taskComplexity]['2.0-thinking'];
  
  return budgets[taskComplexity]['2.5'];
}

// Get Google provider options based on model and context
export function getGoogleProviderOptions(
  modelId: modelID,
  options: {
    taskComplexity?: 'simple' | 'medium' | 'complex';
    enableImageGeneration?: boolean;
    customThinkingBudget?: number;
  } = {}
): GoogleModelConfig {
  const config: GoogleModelConfig = {};
  
  // Configure thinking if supported
  if (supportsThinking(modelId)) {
    config.thinkingConfig = {
      thinkingBudget: options.customThinkingBudget ?? 
                      getOptimalThinkingBudget(modelId, options.taskComplexity)
    };
  }
  
  // Configure response modalities
  const modalities = ['TEXT'];
  if (options.enableImageGeneration && supportsImageGeneration(modelId)) {
    modalities.push('IMAGE');
  }
  config.responseModalities = modalities;
  
  // Default safety settings
  config.safetySettings = [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ];
  
  return config;
}

// Model feature matrix for UI display
export const GOOGLE_MODEL_FEATURES = {
  'gemini-2.5-flash': {
    thinking: true,
    vision: true,
    imageGeneration: false,
    longContext: true,
    maxContextTokens: 1000000,
    costTier: 'low',
    speedTier: 'fast'
  },
  'gemini-2.5-pro': {
    thinking: true,
    vision: true,
    imageGeneration: false,
    longContext: true,
    maxContextTokens: 2000000,
    costTier: 'high',
    speedTier: 'medium'
  },
  'gemini-2.0-flash': {
    thinking: false,
    vision: true,
    imageGeneration: true,
    longContext: true,
    maxContextTokens: 1000000,
    costTier: 'low',
    speedTier: 'fast'
  },
  'gemini-2.0-flash-thinking': {
    thinking: true,
    vision: true,
    imageGeneration: false,
    longContext: true,
    maxContextTokens: 1000000,
    costTier: 'medium',
    speedTier: 'medium'
  },
  'gemini-2.0-pro': {
    thinking: false,
    vision: true,
    imageGeneration: false,
    longContext: true,
    maxContextTokens: 2000000,
    costTier: 'high',
    speedTier: 'medium'
  },
  'gemini-1.5-flash': {
    thinking: false,
    vision: true,
    imageGeneration: false,
    longContext: true,
    maxContextTokens: 1000000,
    costTier: 'low',
    speedTier: 'fast'
  },
  'gemini-1.5-pro': {
    thinking: false,
    vision: true,
    imageGeneration: false,
    longContext: true,
    maxContextTokens: 1000000,
    costTier: 'medium',
    speedTier: 'medium'
  }
} as const;