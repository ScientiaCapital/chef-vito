# Chef Vito 🍳

AI-powered culinary assistant for families. Scan dishes, fridges, and cookbook recipes to discover and organize meals.

## Features

- **Dish Analysis** - Photograph any meal and get the recipe with ingredients and instructions
- **Fridge Scanner** - Scan your refrigerator and get recipe suggestions from what you have
- **Recipe Catalog** - Photograph recipes from books or screens and build your personal cookbook

## Tech Stack

- Next.js 14 + TypeScript
- Supabase (PostgreSQL + Storage)
- AI-powered vision analysis
- PWA with offline support
- Tailwind CSS + shadcn/ui

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your AI_API_KEY and Supabase credentials

# Run development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
AI_API_KEY=your-ai-api-key
```

## License

MIT
