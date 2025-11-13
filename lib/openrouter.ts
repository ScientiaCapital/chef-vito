import OpenAI from 'openai';

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error(
    'Missing OpenRouter API key. Please ensure OPENROUTER_API_KEY is set in your .env file.'
  );
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
