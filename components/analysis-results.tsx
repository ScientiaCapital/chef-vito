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
        <Card className="p-8 bg-gradient-to-br from-white to-gray-50 border-2 border-purple-100 shadow-2xl">
          <div className="text-center">
            {/* Gradient Glow Spinner */}
            <div className="relative inline-block mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-purple-600 mx-auto"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            </div>

            {/* Loading Text */}
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Analyzing with AI...
            </h3>
            <p className="text-gray-600 text-sm">Chef Vito is analyzing your image</p>

            {/* Progress Bar */}
            <div className="mt-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-full w-2/3 rounded-full animate-pulse"></div>
            </div>
          </div>
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
