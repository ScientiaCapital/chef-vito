import OpenAI from 'openai';

export const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
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
