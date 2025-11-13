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

    return NextResponse.json(
      {
        error: 'Failed to analyze image',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
