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
