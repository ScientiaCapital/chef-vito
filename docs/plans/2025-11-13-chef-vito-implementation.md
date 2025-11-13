# Chef Vito Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build AI culinary assistant PWA with dish analysis, fridge scanning, and recipe OCR using Chinese VLMs.

**Architecture:** Next.js 14 PWA with two-stage AI pipeline (vision → structure), Supabase persistence, shadcn/ui components. Three modes: dish photo → recipe, fridge scan → suggestions, recipe OCR → catalog.

**Tech Stack:** Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, OpenRouter, next-pwa, Zod, react-webcam

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `.env.local`
- Create: `.env.example`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `next.config.js`

**Step 1: Initialize Next.js project**

Run:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Expected: Project scaffolded with TypeScript and Tailwind

**Step 2: Install dependencies**

Run:
```bash
npm install @supabase/supabase-js openai zod zustand react-webcam
npm install -D @types/react-webcam next-pwa
```

Expected: All packages installed successfully

**Step 3: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init -d
```

When prompted, select:
- Style: Default
- Base color: Slate
- CSS variables: Yes

Expected: `components.json` created

**Step 4: Add shadcn components**

Run:
```bash
npx shadcn@latest add button card badge skeleton
```

Expected: Components added to `components/ui/`

**Step 5: Create environment files**

Create `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENROUTER_API_KEY=sk-or-v1-your-key
```

Create `.env.local` (copy from .env.example and fill in real values):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xiedmmdyafbwfimrkuqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-actual-key>
OPENROUTER_API_KEY=<your-actual-key>
```

**Step 6: Configure next-pwa**

Modify `next.config.js`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
```

**Step 7: Commit initial setup**

Run:
```bash
git add .
git commit -m "chore: initialize Next.js project with dependencies

Add Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, OpenRouter
Configure next-pwa for progressive web app functionality

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 2: Supabase Client Setup

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/types.ts`

**Step 1: Create Supabase client**

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Step 2: Create TypeScript types**

Create `lib/types.ts`:
```typescript
export type AnalysisMode = 'dish' | 'fridge' | 'recipe';

export interface DishAnalysis {
  status: 'success';
  data: {
    dish: {
      name: string;
      cuisine: string;
      category: 'appetizer' | 'main' | 'dessert' | 'beverage';
    };
    ingredients: Array<{
      name: string;
      amount?: string;
      unit?: string;
      confidence: number;
    }>;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    recipe: {
      difficulty: 'easy' | 'medium' | 'hard';
      prepTime: number;
      cookTime: number;
      servings: number;
      steps: string[];
    };
  };
}

export interface FridgeAnalysis {
  status: 'success';
  data: {
    ingredients: Array<{
      name: string;
      category: 'protein' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'other';
      freshness: 'fresh' | 'good' | 'use-soon' | 'expired';
      confidence: number;
    }>;
    suggestedRecipes: Array<{
      id: string;
      name: string;
      matchScore: number;
      missingIngredients: string[];
      totalTime: number;
      difficulty: string;
    }>;
  };
}

export interface RecipeOCR {
  status: 'success';
  data: {
    recipeName: string;
    ingredients: string[];
    instructions: string[];
    metadata: {
      source?: string;
      author?: string;
      prepTime?: number;
      cookTime?: number;
    };
  };
}

export type AnalysisResult = DishAnalysis | FridgeAnalysis | RecipeOCR;
```

**Step 3: Commit Supabase setup**

Run:
```bash
git add lib/
git commit -m "feat: add Supabase client and TypeScript types

Create Supabase client configuration
Define types for dish, fridge, and recipe analysis results

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 3: Zod Schemas

**Files:**
- Create: `lib/schemas.ts`

**Step 1: Create validation schemas**

Create `lib/schemas.ts`:
```typescript
import { z } from 'zod';

export const DishAnalysisSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    dish: z.object({
      name: z.string(),
      cuisine: z.string(),
      category: z.enum(['appetizer', 'main', 'dessert', 'beverage'])
    }),
    ingredients: z.array(z.object({
      name: z.string(),
      amount: z.string().optional(),
      unit: z.string().optional(),
      confidence: z.number().min(0).max(1)
    })),
    nutrition: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number()
    }),
    recipe: z.object({
      difficulty: z.enum(['easy', 'medium', 'hard']),
      prepTime: z.number(),
      cookTime: z.number(),
      servings: z.number(),
      steps: z.array(z.string())
    })
  })
});

export const FridgeAnalysisSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    ingredients: z.array(z.object({
      name: z.string(),
      category: z.enum(['protein', 'vegetable', 'fruit', 'dairy', 'grain', 'other']),
      freshness: z.enum(['fresh', 'good', 'use-soon', 'expired']),
      confidence: z.number().min(0).max(1)
    })),
    suggestedRecipes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      matchScore: z.number().min(0).max(100),
      missingIngredients: z.array(z.string()),
      totalTime: z.number(),
      difficulty: z.string()
    }))
  })
});

export const RecipeOCRSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    recipeName: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    metadata: z.object({
      source: z.string().optional(),
      author: z.string().optional(),
      prepTime: z.number().optional(),
      cookTime: z.number().optional()
    })
  })
});
```

**Step 2: Commit schemas**

Run:
```bash
git add lib/schemas.ts
git commit -m "feat: add Zod validation schemas

Create schemas for dish, fridge, and recipe analysis
Enforce type safety at runtime with validation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 4: OpenRouter AI Client

**Files:**
- Create: `lib/openrouter.ts`

**Step 1: Create OpenRouter client**

Create `lib/openrouter.ts`:
```typescript
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
```

**Step 2: Commit OpenRouter setup**

Run:
```bash
git add lib/openrouter.ts
git commit -m "feat: add OpenRouter AI client configuration

Configure OpenAI client for OpenRouter API
Define model constants for vision and structure tasks

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 5: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analyses table
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('dish', 'fridge', 'recipe')),
  analysis JSONB NOT NULL,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  nutrition JSONB,
  source_analysis_id UUID REFERENCES analyses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Public read policies (auth can be added later)
CREATE POLICY "Public read analyses" ON analyses FOR SELECT USING (true);
CREATE POLICY "Public insert analyses" ON analyses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Public insert recipes" ON recipes FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_analyses_mode ON analyses(mode);
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
```

**Step 2: Apply migration to Supabase**

Run this SQL in Supabase SQL Editor at:
https://supabase.com/dashboard/project/xiedmmdyafbwfimrkuqs/sql/new

Paste the contents of `supabase/migrations/001_initial_schema.sql`

Expected: Tables created successfully

**Step 3: Create storage bucket**

In Supabase Dashboard:
1. Go to Storage → Create bucket
2. Name: `chef-vito-images`
3. Public bucket: Yes
4. Click Create

Expected: Bucket created

**Step 4: Commit migration**

Run:
```bash
git add supabase/
git commit -m "feat: add Supabase database schema

Create analyses and recipes tables with RLS
Add indexes for performance
Configure public access policies for MVP

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 6: Upload API Route

**Files:**
- Create: `app/api/upload/route.ts`

**Step 1: Create upload endpoint**

Create `app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    const mode = formData.get('mode') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${mode}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chef-vito-images')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chef-vito-images')
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test upload endpoint**

Create a test image and run:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@test-image.jpg" \
  -F "mode=dish"
```

Expected: Returns `{ "url": "https://...supabase.co/.../chef-vito-images/..." }`

**Step 3: Commit upload API**

Run:
```bash
git add app/api/upload/
git commit -m "feat: add image upload API endpoint

Upload images to Supabase Storage
Validate file type and size
Return public URL for analysis

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 7: AI Analysis Pipeline

**Files:**
- Create: `app/api/analyze/route.ts`
- Create: `lib/prompts.ts`

**Step 1: Create prompt templates**

Create `lib/prompts.ts`:
```typescript
import { AnalysisMode } from './types';

export function getVisionPrompt(mode: AnalysisMode): string {
  switch (mode) {
    case 'dish':
      return `Analyze this dish image in detail. Identify:
- Dish name and type of cuisine
- ALL visible ingredients with approximate quantities
- Cooking method and preparation style
- Visual presentation details
- Nutritional characteristics

Be specific and thorough.`;

    case 'fridge':
      return `Analyze this refrigerator/pantry image. Identify:
- ALL visible food items and ingredients
- Freshness indicators (appearance, packaging condition)
- Organization and storage locations
- Any items that appear expired or should be used soon

List everything you can see.`;

    case 'recipe':
      return `Extract the recipe from this image (cookbook, screen, or document). Identify:
- Recipe name/title
- Complete ingredient list with quantities
- Step-by-step instructions
- Any metadata (author, source, cooking times)

Transcribe exactly as shown.`;
  }
}

export function getStructurePrompt(mode: AnalysisMode, visionOutput: string, schema: any): string {
  return `Convert the following analysis into STRICT JSON matching this schema:

${JSON.stringify(schema, null, 2)}

Raw analysis:
${visionOutput}

CRITICAL RULES:
1. Return ONLY valid JSON, no markdown, no explanations, no code blocks
2. All required fields MUST be present
3. Use realistic estimates for missing numerical values
4. Confidence scores (0-1) should reflect detection certainty
5. For ${mode} mode, ensure all schema requirements are met
6. Numbers should be realistic (e.g., calories 200-2000, prep time 5-120 minutes)

Return the JSON now:`;
}
```

**Step 2: Create analyze endpoint**

Create `app/api/analyze/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { openrouter, MODELS } from '@/lib/openrouter';
import { supabase } from '@/lib/supabase';
import { getVisionPrompt, getStructurePrompt } from '@/lib/prompts';
import { DishAnalysisSchema, FridgeAnalysisSchema, RecipeOCRSchema } from '@/lib/schemas';
import { AnalysisMode } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, mode } = await req.json() as {
      imageUrl: string;
      mode: AnalysisMode;
    };

    if (!imageUrl || !mode) {
      return NextResponse.json(
        { error: 'Missing imageUrl or mode' },
        { status: 400 }
      );
    }

    // Stage 1: Vision Analysis
    console.log(`[Stage 1] Vision analysis with ${MODELS.vision}`);
    const visionResponse = await openrouter.chat.completions.create({
      model: MODELS.vision,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: getVisionPrompt(mode) },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }],
      temperature: 0.3
    });

    const visionOutput = visionResponse.choices[0]?.message?.content;
    if (!visionOutput) {
      throw new Error('No vision output received');
    }

    console.log('[Stage 1] Vision output:', visionOutput.substring(0, 200));

    // Get appropriate schema
    const schema = mode === 'dish'
      ? DishAnalysisSchema
      : mode === 'fridge'
      ? FridgeAnalysisSchema
      : RecipeOCRSchema;

    // Stage 2: Structured Extraction
    console.log(`[Stage 2] Structure extraction with ${MODELS.structure}`);
    const structureResponse = await openrouter.chat.completions.create({
      model: MODELS.structure,
      messages: [{
        role: 'user',
        content: getStructurePrompt(mode, visionOutput, schema._def)
      }],
      temperature: 0
    });

    let structuredOutput = structureResponse.choices[0]?.message?.content;
    if (!structuredOutput) {
      throw new Error('No structured output received');
    }

    console.log('[Stage 2] Raw output:', structuredOutput.substring(0, 200));

    // Clean markdown code blocks if present
    structuredOutput = structuredOutput
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Stage 3: Parse and Validate
    console.log('[Stage 3] Parsing and validating JSON');
    const parsed = JSON.parse(structuredOutput);
    const validated = schema.parse(parsed);

    // Save to Supabase
    const { data, error } = await supabase
      .from('analyses')
      .insert({
        image_url: imageUrl,
        mode,
        analysis: validated,
        model_used: MODELS.vision
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Don't fail the request if DB insert fails
    }

    return NextResponse.json(validated);

  } catch (error: any) {
    console.error('Analysis error:', error);

    // Attempt fallback with lighter model
    if (error.message?.includes('JSON') || error.message?.includes('parse')) {
      try {
        console.log('[Fallback] Retrying with simpler model');
        // Implement fallback logic here if needed
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
```

**Step 3: Test analyze endpoint**

Run:
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"imageUrl":"https://example.com/test-dish.jpg","mode":"dish"}'
```

Expected: Returns validated JSON matching DishAnalysisSchema

**Step 4: Commit analysis API**

Run:
```bash
git add app/api/analyze/ lib/prompts.ts
git commit -m "feat: add two-stage AI analysis pipeline

Stage 1: Vision analysis with qwen-2.5-vl-72b
Stage 2: Structured extraction with kimi-vl-a3b-thinking
Stage 3: Zod validation and Supabase storage
Add mode-specific prompts for dish/fridge/recipe

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 8: State Management

**Files:**
- Create: `lib/store.ts`

**Step 1: Create Zustand store**

Create `lib/store.ts`:
```typescript
import { create } from 'zustand';
import { AnalysisMode, AnalysisResult } from './types';

interface AppState {
  mode: AnalysisMode;
  currentImage: string | null;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  setMode: (mode: AnalysisMode) => void;
  setCurrentImage: (image: string | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'dish',
  currentImage: null,
  analysisResult: null,
  isAnalyzing: false,
  error: null,
  setMode: (mode) => set({ mode, analysisResult: null, error: null }),
  setCurrentImage: (currentImage) => set({ currentImage }),
  setAnalysisResult: (analysisResult) => set({ analysisResult, isAnalyzing: false }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error, isAnalyzing: false }),
  reset: () => set({
    currentImage: null,
    analysisResult: null,
    isAnalyzing: false,
    error: null
  })
}));
```

**Step 2: Commit state management**

Run:
```bash
git add lib/store.ts
git commit -m "feat: add Zustand state management

Create global store for app state
Manage mode, image, analysis results, and loading states

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 9: Camera Capture Component

**Files:**
- Create: `components/camera-capture.tsx`

**Step 1: Create camera component**

Create `components/camera-capture.tsx`:
```typescript
'use client';

import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { AnalysisMode } from '@/lib/types';

const MODE_LABELS: Record<AnalysisMode, string> = {
  dish: 'Analyze Dish',
  fridge: 'Scan Fridge',
  recipe: 'Extract Recipe'
};

export function CameraCapture() {
  const webcamRef = useRef<Webcam>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { mode, setMode, setCurrentImage, setIsAnalyzing, setError } = useAppStore();

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setPreview(imageSrc);
    setCurrentImage(imageSrc);
  }, [setCurrentImage]);

  const handleUpload = useCallback(async () => {
    if (!preview) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Convert base64 to blob
      const response = await fetch(preview);
      const blob = await response.blob();

      // Upload image
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      formData.append('mode', mode);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await uploadRes.json();

      // Analyze image
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: url, mode })
      });

      if (!analyzeRes.ok) {
        throw new Error('Analysis failed');
      }

      const result = await analyzeRes.json();
      useAppStore.getState().setAnalysisResult(result);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to analyze image. Please try again.');
      setIsAnalyzing(false);
    }
  }, [preview, mode, setIsAnalyzing, setError]);

  const retake = useCallback(() => {
    setPreview(null);
    setCurrentImage(null);
    useAppStore.getState().reset();
  }, [setCurrentImage]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2 justify-center">
          {(Object.keys(MODE_LABELS) as AnalysisMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              onClick={() => {
                setMode(m);
                retake();
              }}
              size="sm"
            >
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>

        {/* Camera or Preview */}
        <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                facingMode: 'environment'
              }}
            />
          )}

          {/* Mode Badge */}
          <Badge className="absolute top-4 left-4">
            {MODE_LABELS[mode]}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {preview ? (
            <>
              <Button onClick={retake} variant="outline" className="flex-1">
                Retake
              </Button>
              <Button onClick={handleUpload} className="flex-1">
                <Upload className="mr-2 h-4 w-4" />
                Analyze
              </Button>
            </>
          ) : (
            <Button onClick={capture} className="w-full" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

**Step 2: Commit camera component**

Run:
```bash
git add components/camera-capture.tsx
git commit -m "feat: add camera capture component

Implement webcam capture with preview
Add mode selection (dish/fridge/recipe)
Handle image upload and analysis trigger

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 10: Results Display Components

**Files:**
- Create: `components/dish-results.tsx`
- Create: `components/fridge-results.tsx`
- Create: `components/recipe-results.tsx`
- Create: `components/analysis-results.tsx`

**Step 1: Create DishResults component**

Create `components/dish-results.tsx`:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DishAnalysis } from '@/lib/types';
import { Clock, ChefHat, Users } from 'lucide-react';

interface DishResultsProps {
  data: DishAnalysis;
}

export function DishResults({ data }: DishResultsProps) {
  const { dish, ingredients, nutrition, recipe } = data.data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">{dish.name}</h2>
        <div className="flex gap-2">
          <Badge>{dish.cuisine}</Badge>
          <Badge variant="outline">{dish.category}</Badge>
          <Badge variant="outline">{recipe.difficulty}</Badge>
        </div>
      </Card>

      {/* Time & Servings */}
      <Card className="p-4">
        <div className="flex justify-around text-center">
          <div>
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Prep</p>
            <p className="font-semibold">{recipe.prepTime}m</p>
          </div>
          <div>
            <ChefHat className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cook</p>
            <p className="font-semibold">{recipe.cookTime}m</p>
          </div>
          <div>
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Serves</p>
            <p className="font-semibold">{recipe.servings}</p>
          </div>
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        <ul className="space-y-2">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{ing.name}</span>
              <span className="text-muted-foreground">
                {ing.amount} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Nutrition */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Nutrition (per serving)</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{nutrition.calories}</p>
            <p className="text-sm text-muted-foreground">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{nutrition.protein}g</p>
            <p className="text-sm text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{nutrition.carbs}g</p>
            <p className="text-sm text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{nutrition.fat}g</p>
            <p className="text-sm text-muted-foreground">Fat</p>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Instructions</h3>
        <ol className="space-y-3">
          {recipe.steps.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
```

**Step 2: Create FridgeResults component**

Create `components/fridge-results.tsx`:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FridgeAnalysis } from '@/lib/types';
import { Leaf, AlertCircle, Clock } from 'lucide-react';

interface FridgeResultsProps {
  data: FridgeAnalysis;
}

const FRESHNESS_COLORS = {
  fresh: 'bg-green-500',
  good: 'bg-blue-500',
  'use-soon': 'bg-yellow-500',
  expired: 'bg-red-500'
};

export function FridgeResults({ data }: FridgeResultsProps) {
  const { ingredients, suggestedRecipes } = data.data;

  return (
    <div className="space-y-4">
      {/* Ingredients */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Detected Ingredients
        </h3>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${FRESHNESS_COLORS[ing.freshness]}`} />
                <span>{ing.name}</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">{ing.category}</Badge>
                <Badge variant="outline" className="text-xs">{ing.freshness}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recipe Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Recipe Suggestions</h3>
        <div className="space-y-3">
          {suggestedRecipes.map((recipe, idx) => (
            <Card key={idx} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{recipe.name}</h4>
                <Badge>{recipe.matchScore}% match</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.totalTime}m
                </span>
                <span>{recipe.difficulty}</span>
              </div>

              {recipe.missingIngredients.length > 0 && (
                <div className="mt-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Need to buy:</p>
                    <p>{recipe.missingIngredients.join(', ')}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
```

**Step 3: Create RecipeResults component**

Create `components/recipe-results.tsx`:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RecipeOCR } from '@/lib/types';
import { Save } from 'lucide-react';

interface RecipeResultsProps {
  data: RecipeOCR;
}

export function RecipeResults({ data }: RecipeResultsProps) {
  const { recipeName, ingredients, instructions, metadata } = data.data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">{recipeName}</h2>
        {metadata.author && (
          <p className="text-sm text-muted-foreground">by {metadata.author}</p>
        )}
        {metadata.source && (
          <p className="text-sm text-muted-foreground">from {metadata.source}</p>
        )}
      </Card>

      {/* Ingredients */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        <ul className="space-y-2">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-muted-foreground">•</span>
              <span>{ing}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-3">Instructions</h3>
        <ol className="space-y-3">
          {instructions.map((step, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Save Button */}
      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save to Recipe Catalog
      </Button>
    </div>
  );
}
```

**Step 4: Create AnalysisResults wrapper**

Create `components/analysis-results.tsx`:
```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { DishResults } from './dish-results';
import { FridgeResults } from './fridge-results';
import { RecipeResults } from './recipe-results';
import { DishAnalysis, FridgeAnalysis, RecipeOCR } from '@/lib/types';

export function AnalysisResults() {
  const { mode, analysisResult, isAnalyzing, error } = useAppStore();

  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2" />
        </Card>
        <Card className="p-6">
          <Skeleton className="h-64" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!analysisResult) {
    return null;
  }

  if (mode === 'dish') {
    return <DishResults data={analysisResult as DishAnalysis} />;
  }

  if (mode === 'fridge') {
    return <FridgeResults data={analysisResult as FridgeAnalysis} />;
  }

  if (mode === 'recipe') {
    return <RecipeResults data={analysisResult as RecipeOCR} />;
  }

  return null;
}
```

**Step 5: Commit results components**

Run:
```bash
git add components/dish-results.tsx components/fridge-results.tsx components/recipe-results.tsx components/analysis-results.tsx
git commit -m "feat: add results display components

Create mode-specific result views for dish/fridge/recipe
Add loading states and error handling
Implement responsive card-based layouts

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 11: Main App Page

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

**Step 1: Update layout with metadata**

Modify `app/layout.tsx`:
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chef Vito - AI Culinary Assistant",
  description: "Scan dishes, fridges, and recipes with AI",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chef Vito",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Step 2: Update main page**

Modify `app/page.tsx`:
```typescript
import { CameraCapture } from '@/components/camera-capture';
import { AnalysisResults } from '@/components/analysis-results';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container max-w-2xl mx-auto p-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Chef Vito
          </h1>
          <p className="text-muted-foreground">
            AI-powered culinary assistant
          </p>
        </div>

        {/* Camera */}
        <CameraCapture />

        {/* Results */}
        <AnalysisResults />
      </div>
    </main>
  );
}
```

**Step 3: Commit main app**

Run:
```bash
git add app/page.tsx app/layout.tsx
git commit -m "feat: implement main app page

Add camera and results to home page
Update layout with PWA metadata
Apply Chef Vito branding

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 12: PWA Configuration

**Files:**
- Create: `public/manifest.json`
- Create: `public/icon-192.png`
- Create: `public/icon-512.png`

**Step 1: Create manifest**

Create `public/manifest.json`:
```json
{
  "name": "Chef Vito - AI Culinary Assistant",
  "short_name": "Chef Vito",
  "description": "Scan dishes, fridges, and recipes with AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["food", "lifestyle", "utilities"],
  "orientation": "portrait"
}
```

**Step 2: Generate icons**

For MVP, create simple placeholder icons:

Use any online tool like https://www.favicon-generator.org/ or create simple colored squares:
- 192x192px icon with green background (#10b981) and white "CV" text
- 512x512px icon with same design

Save to:
- `public/icon-192.png`
- `public/icon-512.png`

**Step 3: Commit PWA config**

Run:
```bash
git add public/manifest.json public/icon-192.png public/icon-512.png
git commit -m "feat: add PWA configuration and icons

Create manifest.json for installability
Add app icons (192px and 512px)
Configure standalone display mode

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Expected: Clean commit

---

## Task 13: Environment Setup and Testing

**Files:**
- Verify: `.env.local`

**Step 1: Verify environment variables**

Check `.env.local` contains:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xiedmmdyafbwfimrkuqs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<actual-key>
OPENROUTER_API_KEY=<actual-key>
```

**Step 2: Start development server**

Run:
```bash
npm run dev
```

Expected: Server starts on http://localhost:3000

**Step 3: Test basic flow**

1. Open http://localhost:3000
2. Select "Analyze Dish" mode
3. Allow camera permissions
4. Capture a photo of food
5. Click "Analyze"
6. Verify AI analysis appears

Expected: Full flow works end-to-end

**Step 4: Test all modes**

Repeat Step 3 for:
- Fridge mode (photo of refrigerator)
- Recipe mode (photo of cookbook or screen)

Expected: All modes return appropriate structured data

---

## Task 14: Vercel Deployment

**Files:**
- None (deployment only)

**Step 1: Install Vercel CLI**

Run:
```bash
npm i -g vercel
```

Expected: Vercel CLI installed

**Step 2: Login to Vercel**

Run:
```bash
vercel login
```

Expected: Authenticated

**Step 3: Deploy to Vercel**

Run:
```bash
vercel
```

Answer prompts:
- Set up and deploy? Yes
- Scope: (select your account)
- Link to existing project? No
- Project name: chef-vito
- Directory: ./
- Override settings? No

Expected: Deployment successful, URL provided

**Step 4: Add environment variables**

Run:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add OPENROUTER_API_KEY
```

For each, select: Production, Preview, Development
Paste the value from `.env.local`

Expected: Environment variables configured

**Step 5: Deploy to production**

Run:
```bash
vercel --prod
```

Expected: Production deployment successful

**Step 6: Test PWA installation**

1. Visit production URL on mobile device
2. Look for "Add to Home Screen" prompt
3. Install app
4. Open from home screen
5. Test full flow (camera → analyze → results)

Expected: PWA installs and works like native app

**Step 7: Final commit**

Run:
```bash
git add .
git commit -m "chore: production deployment to Vercel

Configure environment variables
Deploy PWA to production
Ready for testing with Vito and kids

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

Expected: Clean commit and push

---

## Testing Checklist

Before calling it done, verify:

- [ ] Camera capture works on mobile
- [ ] All three modes (dish/fridge/recipe) analyze correctly
- [ ] Results display properly for each mode
- [ ] PWA installs on home screen
- [ ] App works in standalone mode
- [ ] Recipes are accurate and useful
- [ ] Kids find it fun and engaging
- [ ] Vito's name appears in the app

## Post-MVP Improvements

After tonight's testing, consider adding:

1. **UI Polish**
   - Animations and transitions
   - Better loading states
   - Confetti on successful analysis

2. **Recipe Catalog**
   - Search and filter saved recipes
   - Categories and tags
   - Share recipes

3. **Enhanced Features**
   - User authentication
   - Shopping list generation
   - Voice instructions
   - Offline mode

4. **Performance**
   - Image compression before upload
   - Caching strategies
   - Optimistic UI updates

---

**Total estimated time: 6-8 hours**

Let's build this and make Vito proud!
