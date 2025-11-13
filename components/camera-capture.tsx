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
  dish: '🍽️ Analyze Dish',
  fridge: '🧊 Scan Fridge',
  recipe: '📖 Extract Recipe'
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

  const compressImage = async (base64Image: string): Promise<Blob> => {
    return new Promise((resolve) => {
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

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(blob!);
        }, 'image/jpeg', 0.8); // 80% quality
      };
      img.src = base64Image;
    });
  };

  const handleUpload = useCallback(async () => {
    if (!preview) return;

    try {
      setIsAnalyzing(true);
      setError(null);

      // Compress image before upload
      const compressedBlob = await compressImage(preview);

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
    } catch (error: any) {
      console.error('Analysis error:', error);
      const errorMessage = error.message?.includes('network')
        ? 'Network error. Please check your connection and try again.'
        : error.message?.includes('timeout')
        ? 'Analysis timed out. Please try with a smaller image.'
        : 'Failed to analyze image. Please try again or use a different photo.';
      setError(errorMessage);
      setIsAnalyzing(false);
    }
  }, [preview, mode, setIsAnalyzing, setError]);

  const retake = useCallback(() => {
    setPreview(null);
    setCurrentImage(null);
    useAppStore.getState().reset();
  }, [setCurrentImage]);

  return (
    <Card className="p-6 shadow-xl hover:shadow-2xl transition-all duration-200">
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
              className={mode === m ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200' : 'hover:scale-105 transition-all duration-200'}
            >
              {MODE_LABELS[m]}
            </Button>
          ))}
        </div>

        {/* Camera or Preview */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
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
              <Button onClick={retake} variant="outline" className="flex-1 hover:scale-105 active:scale-95 transition-all duration-200">
                Retake
              </Button>
              <Button onClick={handleUpload} className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200">
                <Upload className="mr-2 h-4 w-4" />
                Analyze
              </Button>
            </>
          ) : (
            <Button onClick={capture} className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200" size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Capture
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
