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
