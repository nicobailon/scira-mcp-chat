import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { 
  customProvider, 
  wrapLanguageModel, 
  extractReasoningMiddleware 
} from "ai";

export interface ModelInfo {
  provider: string;
  name: string;
  description: string;
  apiVersion: string;
  capabilities: string[];
}

const middleware = extractReasoningMiddleware({
  tagName: 'think',
});

// Helper to get API keys from environment variables first, then localStorage
const getApiKey = (key: string): string | undefined => {
  // Check for environment variables first
  if (process.env[key]) {
    return process.env[key] || undefined;
  }
  
  // Fall back to localStorage if available
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key) || undefined;
  }
  
  return undefined;
};

// Create provider instances with API keys from localStorage
const openaiClient = createOpenAI({
  apiKey: getApiKey('OPENAI_API_KEY'),
});

const anthropicClient = createAnthropic({
  apiKey: getApiKey('ANTHROPIC_API_KEY'),
});

const groqClient = createGroq({
  apiKey: getApiKey('GROQ_API_KEY'),
});

const xaiClient = createXai({
  apiKey: getApiKey('XAI_API_KEY'),
});

const googleClient = createGoogleGenerativeAI({
  apiKey: getApiKey('GOOGLE_GENERATIVE_AI_API_KEY') || getApiKey('GOOGLE_API_KEY'),
});

const languageModels = {
  "gpt-4.1-mini": openaiClient("gpt-4.1-mini"),
  "claude-3-7-sonnet": anthropicClient('claude-3-7-sonnet-20250219'),
  "qwen-qwq": wrapLanguageModel(
    {
      model: groqClient("qwen-qwq-32b"),
      middleware
    }
  ),
  "grok-3-mini": xaiClient("grok-3-mini-latest"),
  // Google Gemini Models
  "gemini-2.5-flash": googleClient("gemini-2.5-flash-preview-04-17"),
  "gemini-2.5-pro": googleClient("gemini-2.5-pro"),
  "gemini-2.0-flash": googleClient("gemini-2.0-flash-exp"),
  "gemini-2.0-flash-thinking": googleClient("gemini-2.0-flash-thinking-exp-01-21"),
  "gemini-2.0-pro": googleClient("gemini-2.0-pro-exp"),
  "gemini-1.5-flash": googleClient("gemini-1.5-flash-latest"),
  "gemini-1.5-pro": googleClient("gemini-1.5-pro-latest"),
};

export const modelDetails: Record<keyof typeof languageModels, ModelInfo> = {
  "gpt-4.1-mini": {
    provider: "OpenAI",
    name: "GPT-4.1 Mini",
    description: "Compact version of OpenAI's GPT-4.1 with good balance of capabilities, including vision.",
    apiVersion: "gpt-4.1-mini",
    capabilities: ["Balance", "Creative", "Vision"]
  },
  "claude-3-7-sonnet": {
    provider: "Anthropic",
    name: "Claude 3.7 Sonnet",
    description: "Latest version of Anthropic's Claude 3.7 Sonnet with strong reasoning and coding capabilities.",
    apiVersion: "claude-3-7-sonnet-20250219",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "qwen-qwq": {
    provider: "Groq",
    name: "Qwen QWQ",
    description: "Latest version of Alibaba's Qwen QWQ with strong reasoning and coding capabilities.",
    apiVersion: "qwen-qwq",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  "grok-3-mini": {
    provider: "XAI",
    name: "Grok 3 Mini",
    description: "Latest version of XAI's Grok 3 Mini with strong reasoning and coding capabilities.",
    apiVersion: "grok-3-mini-latest",
    capabilities: ["Reasoning", "Efficient", "Agentic"]
  },
  // Google Gemini Models
  "gemini-2.5-flash": {
    provider: "Google",
    name: "Gemini 2.5 Flash",
    description: "Latest hybrid reasoning model with controllable thinking budget. Fast, cost-efficient with enhanced reasoning capabilities.",
    apiVersion: "gemini-2.5-flash-preview-04-17",
    capabilities: ["Reasoning", "Fast", "Efficient", "Thinking"]
  },
  "gemini-2.5-pro": {
    provider: "Google",
    name: "Gemini 2.5 Pro",
    description: "Most advanced reasoning model with state-of-the-art performance on complex tasks, coding, and multimodal reasoning.",
    apiVersion: "gemini-2.5-pro",
    capabilities: ["Reasoning", "Code", "Vision", "Thinking"]
  },
  "gemini-2.0-flash": {
    provider: "Google",
    name: "Gemini 2.0 Flash",
    description: "Enhanced performance workhorse model with multimodal input/output capabilities including native image generation.",
    apiVersion: "gemini-2.0-flash-exp",
    capabilities: ["Balance", "Fast", "Vision", "Creative"]
  },
  "gemini-2.0-flash-thinking": {
    provider: "Google",
    name: "Gemini 2.0 Flash Thinking",
    description: "First reasoning model that explicitly shows its thoughts, built on Flash's speed with enhanced reasoning capabilities.",
    apiVersion: "gemini-2.0-flash-thinking-exp-01-21",
    capabilities: ["Reasoning", "Fast", "Thinking", "Code"]
  },
  "gemini-2.0-pro": {
    provider: "Google",
    name: "Gemini 2.0 Pro",
    description: "Best model for coding performance and complex prompts with 2M token context window and enhanced reasoning.",
    apiVersion: "gemini-2.0-pro-exp",
    capabilities: ["Code", "Reasoning", "Vision", "Research"]
  },
  "gemini-1.5-flash": {
    provider: "Google",
    name: "Gemini 1.5 Flash",
    description: "High-performance model optimized for speed and efficiency with 1M token context window.",
    apiVersion: "gemini-1.5-flash-latest",
    capabilities: ["Fast", "Efficient", "Vision", "Code"]
  },
  "gemini-1.5-pro": {
    provider: "Google",
    name: "Gemini 1.5 Pro",
    description: "Advanced model with strong performance across reasoning, coding, and multimodal tasks with 1M token context.",
    apiVersion: "gemini-1.5-pro-latest",
    capabilities: ["Reasoning", "Code", "Vision", "Research"]
  },
};

// Update API keys when localStorage changes (for runtime updates)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // Reload the page if any API key changed to refresh the providers
    if (event.key?.includes('API_KEY')) {
      window.location.reload();
    }
  });
}

export const model = customProvider({
  languageModels,
});

export type modelID = keyof typeof languageModels;

export const MODELS = Object.keys(languageModels);

export const defaultModel: modelID = "gemini-2.0-flash";
