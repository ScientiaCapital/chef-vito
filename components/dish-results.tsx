'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DishAnalysis } from '@/lib/types';
import { Clock, ChefHat, Users } from 'lucide-react';

interface DishResultsProps {
  data: DishAnalysis;
}

export function DishResults({ data }: DishResultsProps) {
  const { dish, ingredients, nutrition, recipe } = data.data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">{dish.name}</h2>
        <div className="flex gap-2">
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500">{dish.cuisine}</Badge>
          <Badge variant="outline">{dish.category}</Badge>
          <Badge variant="outline">{recipe.difficulty}</Badge>
        </div>
      </Card>

      {/* Time & Servings */}
      <Card className="p-4 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <div className="flex justify-around text-center">
          <div>
            <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Prep</p>
            <p className="font-semibold">{recipe.prepTime}m</p>
          </div>
          <div>
            <ChefHat className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cook</p>
            <p className="font-semibold">{recipe.cookTime}m</p>
          </div>
          <div>
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Serves</p>
            <p className="font-semibold">{recipe.servings}</p>
          </div>
        </div>
      </Card>

      {/* Ingredients */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        <ul className="space-y-2">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex justify-between hover:bg-muted/50 p-2 rounded-lg transition-all duration-200">
              <span>{ing.name}</span>
              <span className="text-muted-foreground">
                {ing.amount} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Nutrition */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3">Nutrition (per serving)</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{nutrition.calories}</p>
            <p className="text-sm text-muted-foreground">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{nutrition.protein}g</p>
            <p className="text-sm text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{nutrition.carbs}g</p>
            <p className="text-sm text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{nutrition.fat}g</p>
            <p className="text-sm text-muted-foreground">Fat</p>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3">Instructions</h3>
        <ol className="space-y-3">
          {recipe.steps.map((step, idx) => (
            <li key={idx} className="flex gap-3 hover:bg-muted/50 p-2 rounded-lg transition-all duration-200">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
