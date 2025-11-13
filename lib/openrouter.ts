import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY || 'placeholder-key';

// Only warn during build, will fail at runtime if not set
if (!process.env.OPENROUTER_API_KEY && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: Missing OPENROUTER_API_KEY environment variable');
}

export const openrouter = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://chef-vito.vercel.app',
    'X-Title': 'Chef Vito'
  }
});

export const MODELS = {
  vision: 'qwen/qwen-2.5-vl-72b',
  structure: 'moonshot/kimi-vl-a3b-thinking',
  fallback: 'qwen/qwen-2.5-vl-3b'
} as const;
