import { NextRequest, NextResponse } from 'next/server';
import { openrouter, MODELS } from '@/lib/openrouter';
import { supabase } from '@/lib/supabase';
import { getVisionPrompt, getStructurePrompt } from '@/lib/prompts';
import { DishAnalysisSchema, FridgeAnalysisSchema, RecipeOCRSchema } from '@/lib/schemas';
import { AnalysisMode } from '@/lib/types';
import * as Sentry from '@sentry/nextjs';

export async function POST(req: NextRequest) {
  return Sentry.startSpan(
    {
      op: 'http.server',
      name: 'POST /api/analyze',
    },
    async () => {
  let mode: AnalysisMode | undefined;
  let imageUrl: string | undefined;
  let allImages: string[] = [];
  try {
    const body = await req.json() as {
      imageUrl: string;
      mode: AnalysisMode;
      allImages?: string[];
    };

    if (!body.imageUrl || !body.mode) {
      return NextResponse.json(
        { error: 'Missing imageUrl or mode' },
        { status: 400 }
      );
    }

    // Assign after validation so TypeScript knows they're defined
    imageUrl = body.imageUrl;
    mode = body.mode;
    allImages = body.allImages || [body.imageUrl];

    // Validate imageUrl format
    let url: URL;
    try {
      url = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid imageUrl format' },
        { status: 400 }
      );
    }

    // Whitelist check - must be from Supabase
    if (!url.hostname.endsWith('supabase.co')) {
      return NextResponse.json(
        { error: 'imageUrl must be from supabase.co domain' },
        { status: 400 }
      );
    }

    // Stage 1: Vision Analysis
    console.log(`[Stage 1] Vision analysis with ${MODELS.vision}`);
    console.log(`Analyzing ${allImages.length} image(s) for ${mode} mode`);
    const visionOutput = await Sentry.startSpan(
      {
        op: 'ai.vision',
        name: 'Vision Analysis',
      },
      async (span) => {
        span?.setAttribute('mode', mode!);
        span?.setAttribute('model', MODELS.vision);
        span?.setAttribute('imageCount', allImages.length);

        // For fridge mode, send ALL images
        // For other modes, just send the first image
        const imagesToAnalyze = mode === 'fridge' ? allImages : [imageUrl!];

        const content: Array<{type: 'text', text: string} | {type: 'image_url', image_url: {url: string}}> = [
          { type: 'text', text: getVisionPrompt(mode!) }
        ];

        // Add all images to the content array
        imagesToAnalyze.forEach((url, index) => {
          content.push({
            type: 'image_url',
            image_url: { url }
          });
          console.log(`Added image ${index + 1}/${imagesToAnalyze.length} to vision request`);
        });

        const visionResponse = await openrouter.chat.completions.create({
          model: MODELS.vision,
          messages: [{
            role: 'user',
            content
          }],
          temperature: 0.3
        });

        const output = visionResponse.choices[0]?.message?.content;
        if (!output) {
          throw new Error('No vision output received');
        }

        console.log('[Stage 1] Vision output:', output.substring(0, 200));
        return output;
      }
    );

    // Get appropriate schema
    const schema = mode === 'dish'
      ? DishAnalysisSchema
      : mode === 'fridge'
      ? FridgeAnalysisSchema
      : RecipeOCRSchema;

    // Stage 2: Structured Extraction
    console.log(`[Stage 2] Structure extraction with ${MODELS.structure}`);
    let structuredOutput = await Sentry.startSpan(
      {
        op: 'ai.structure',
        name: 'Structure Extraction',
      },
      async (span) => {
        span?.setAttribute('mode', mode!);
        span?.setAttribute('model', MODELS.structure);

        const structureResponse = await openrouter.chat.completions.create({
          model: MODELS.structure,
          messages: [{
            role: 'user',
            content: getStructurePrompt(mode!, visionOutput, schema._def)
          }],
          temperature: 0
        });

        const output = structureResponse.choices[0]?.message?.content;
        if (!output) {
          throw new Error('No structured output received');
        }

        console.log('[Stage 2] Raw output:', output.substring(0, 200));
        return output;
      }
    );

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
        image_url: imageUrl!,
        mode: mode!,
        analysis: validated,
        model_used: MODELS.vision
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      Sentry.captureException(error, {
        tags: { route: 'analyze', stage: 'database-insert', mode: mode! },
        extra: { imageUrl: imageUrl! }
      });
      // Don't fail the request if DB insert fails
    }

    return NextResponse.json(validated);

  } catch (error: any) {
    console.error('Analysis error:', error);
    Sentry.captureException(error, {
      tags: { route: 'analyze', ...(mode && { mode }) },
      extra: { ...(imageUrl && { imageUrl }), errorMessage: error.message }
    });

    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
  }
  );
}
