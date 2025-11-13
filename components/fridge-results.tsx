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
