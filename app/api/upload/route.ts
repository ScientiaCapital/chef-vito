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

    // Validate mode
    const validModes = ['dish', 'fridge', 'recipe'];
    if (!mode || !validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be one of: dish, fridge, recipe' },
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
      console.error('Supabase upload error:', {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
        error: error
      });
      return NextResponse.json(
        {
          error: 'Failed to upload image',
          details: process.env.NODE_ENV === 'development' ? error.message : 'Storage error'
        },
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
