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
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{recipeName}</h2>
        {metadata.author && (
          <p className="text-sm text-muted-foreground">by {metadata.author}</p>
        )}
        {metadata.source && (
          <p className="text-sm text-muted-foreground">from {metadata.source}</p>
        )}
      </Card>

      {/* Ingredients */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Ingredients</h3>
        <ul className="space-y-2">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-start gap-2 hover:bg-muted/50 p-2 rounded-lg transition-all duration-200">
              <span className="text-muted-foreground">•</span>
              <span>{ing}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Instructions */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Instructions</h3>
        <ol className="space-y-3">
          {instructions.map((step, idx) => (
            <li key={idx} className="flex gap-3 hover:bg-muted/50 p-2 rounded-lg transition-all duration-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Save Button */}
      <Button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200">
        <Save className="mr-2 h-4 w-4" />
        Save to Recipe Catalog
      </Button>
    </div>
  );
}
