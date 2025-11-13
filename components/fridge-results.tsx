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
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          <Leaf className="h-5 w-5 text-green-500" />
          Detected Ingredients
        </h3>
        <div className="space-y-2">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-purple-50/50 hover:from-blue-100/50 hover:to-purple-100/50 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${FRESHNESS_COLORS[ing.freshness]} shadow-lg`} />
                <span className="font-medium">{ing.name}</span>
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
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Recipe Suggestions</h3>
        <div className="space-y-3">
          {suggestedRecipes.map((recipe, idx) => (
            <Card key={idx} className="p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{recipe.name}</h4>
                <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500">{recipe.matchScore}% match</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.totalTime}m
                </span>
                <span>{recipe.difficulty}</span>
              </div>

              {recipe.missingIngredients.length > 0 && (
                <div className="mt-2 flex items-start gap-2 bg-yellow-50/50 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground font-medium">Need to buy:</p>
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
