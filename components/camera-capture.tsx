'use client';

import { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { AnalysisMode } from '@/lib/types';

const MODE_LABELS: Record<AnalysisMode, string> = {
  dish: '🍽️ Analyze Dish',
  fridge: '🧊 Scan Fridge',
  recipe: '📖 Extract Recipe'
};

export function CameraCapture() {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const { mode, setMode, setIsAnalyzing, setError } = useAppStore();

  const compressImage = async (file: File): Promise<{ blob: Blob; base64: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max width 1920px
          const MAX_WIDTH = 1920;
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }
              resolve({ blob, base64 });
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('Image file is too large. Please use an image under 50MB.');
      return;
    }

    try {
      const { base64 } = await compressImage(file);
      setPhotos(prev => [...prev, base64]);

      // Reset input so same file can be selected again
      e.target.value = '';
      setError(null);
    } catch (err) {
      setError('Failed to process image. Please try another photo.');
      console.error('Image compression error:', err);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setPhotos([]);
    useAppStore.getState().reset();
  };

  const handleAnalyze = useCallback(async () => {
    if (photos.length === 0) {
      setError('Please add at least one photo');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // Upload all photos and collect URLs
      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        // Convert base64 to blob
        const compressedBlob = await compressImage(
          await fetch(photo).then(r => r.blob()) as any
        ).then(result => result.blob);

        // Upload image
        const formData = new FormData();
        formData.append('image', compressedBlob, 'capture.jpg');
        formData.append('mode', mode);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });

        if (!uploadRes.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await uploadRes.json();
        uploadedUrls.push(url);
      }

      // For now, analyze the first image
      // TODO: Update API to handle multiple images
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrls[0],
          mode,
          // Pass all URLs for future multi-image support
          allImages: uploadedUrls
        })
      });

      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result = await analyzeRes.json();
      useAppStore.getState().setAnalysisResult(result);
      setPhotos([]); // Clear photos after successful analysis
    } catch (error: any) {
      console.error('Analysis error:', error);
      const errorMessage = error.message?.includes('network')
        ? 'Network error. Please check your connection and try again.'
        : error.message?.includes('timeout')
        ? 'Analysis timed out. Please try with a smaller image.'
        : error.message || 'Failed to analyze image. Please try again or use a different photo.';
      setError(errorMessage);
      setIsAnalyzing(false);
    }
  }, [photos, mode, setIsAnalyzing, setError]);

  return (
    <Card className="p-6 shadow-xl hover:shadow-2xl transition-all duration-200">
      <div className="space-y-4">
        {/* Mode Selection */}
        <div className="flex gap-2 justify-center flex-wrap">
          {(Object.keys(MODE_LABELS) as AnalysisMode[]).map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'default' : 'outline'}
              onClick={() => {
                setMode(m);
                handleReset();
              }}
              size="sm"
              className={mode === m ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200' : 'hover:scale-105 transition-all duration-200'}
            >
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>

        {/* Take Photo Button */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
            size="lg"
          >
            <Camera className="mr-2 h-5 w-5" />
            {mode === 'fridge' && photos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
          </Button>

          {/* Hidden native camera input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoAdd}
            className="hidden"
          />

          {mode === 'fridge' && photos.length === 0 && (
            <p className="text-sm text-gray-600 text-center">
              💡 Tip: Take multiple photos of different shelves and door sections
            </p>
          )}
        </div>

        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {photos.length === 1 ? '1 Photo' : `${photos.length} Photos`}
              </h3>
              <Button
                onClick={handleReset}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
              size="lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              Analyze {photos.length === 1 ? 'Photo' : `All ${photos.length} Photos`}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
