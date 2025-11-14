'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DishAnalysis } from '@/lib/types';
import { Clock, ChefHat, Users, AlertTriangle, Heart, Star } from 'lucide-react';

interface DishResultsProps {
  data: DishAnalysis;
}

export function DishResults({ data }: DishResultsProps) {
  const { dish, ingredients, nutrition, recipe, allergens, health } = data.data;

  // Get list of present allergens
  const presentAllergens = Object.entries(allergens || {})
    .filter(([key, value]) => key !== 'details' && value === true)
    .map(([key]) => {
      const labels: Record<string, string> = {
        dairy: 'Dairy',
        eggs: 'Eggs',
        fish: 'Fish',
        shellfish: 'Shellfish',
        treeNuts: 'Tree Nuts',
        peanuts: 'Peanuts',
        wheat: 'Wheat/Gluten',
        soy: 'Soy'
      };
      return labels[key] || key;
    });

  return (
    <div className="space-y-4">
      {/* Allergen Warning - PROMINENT */}
      {presentAllergens.length > 0 && (
        <Card className="p-4 border-2 border-orange-500 bg-orange-50 shadow-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">⚠️ Allergen Warning</h3>
              <p className="text-sm text-orange-800 mb-2">
                This dish contains: <strong>{presentAllergens.join(', ')}</strong>
              </p>
              {allergens?.details && (
                <p className="text-xs text-orange-700">{allergens.details}</p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Header with Health & Kid Ratings */}
      <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {dish.name}
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500">{dish.cuisine}</Badge>
          <Badge variant="outline">{dish.category}</Badge>
          <Badge variant="outline">{recipe.difficulty}</Badge>
          {dish.cookingMethod && <Badge variant="outline">🔥 {dish.cookingMethod}</Badge>}
          {health?.dietaryLabels?.map((label) => (
            <Badge key={label} className="bg-green-100 text-green-800 border-green-300">
              {label}
            </Badge>
          ))}
        </div>

        {/* Health & Kid-Friendly Scores */}
        {health && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-green-700 font-medium">Health Score</p>
                <p className="text-lg font-bold text-green-900">{health.healthScore}/10</p>
                <p className="text-xs text-green-600">{health.healthReason}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <Star className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-700 font-medium">Kid-Friendly</p>
                <p className="text-lg font-bold text-purple-900">{health.kidFriendly}/10</p>
                {health.kidReason && <p className="text-xs text-purple-600">{health.kidReason}</p>}
              </div>
            </div>
          </div>
        )}
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

      {/* Nutrition - Enhanced */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3">Nutrition (per serving)</h3>

        {/* Main macros */}
        <div className="grid grid-cols-4 gap-4 text-center mb-4">
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {nutrition.calories}
            </p>
            <p className="text-sm text-muted-foreground">Calories</p>
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {nutrition.protein}g
            </p>
            <p className="text-sm text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {nutrition.carbs}g
            </p>
            <p className="text-sm text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {nutrition.fat}g
            </p>
            <p className="text-sm text-muted-foreground">Fat</p>
          </div>
        </div>

        {/* Additional nutrition */}
        {(nutrition.fiber || nutrition.sugar || nutrition.sodium) && (
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
            {nutrition.fiber && (
              <div>
                <p className="text-xl font-bold text-green-600">{nutrition.fiber}g</p>
                <p className="text-xs text-muted-foreground">Fiber</p>
              </div>
            )}
            {nutrition.sugar && (
              <div>
                <p className="text-xl font-bold text-orange-600">{nutrition.sugar}g</p>
                <p className="text-xs text-muted-foreground">Sugar</p>
              </div>
            )}
            {nutrition.sodium && (
              <div>
                <p className="text-xl font-bold text-red-600">{nutrition.sodium}mg</p>
                <p className="text-xs text-muted-foreground">Sodium</p>
              </div>
            )}
          </div>
        )}

        {/* Vitamins & Minerals */}
        {nutrition.vitamins && Object.values(nutrition.vitamins).some(v => v) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2 text-green-700">Key Nutrients:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nutrition.vitamins)
                .filter(([_, value]) => value)
                .map(([key, value]) => (
                  <Badge key={key} variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    {key.replace('vitamin', 'Vit. ')}: {value}
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </Card>

      {/* Ingredients */}
      <Card className="p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200">
        <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
        <ul className="space-y-2">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex justify-between hover:bg-muted/50 p-2 rounded-lg transition-all duration-200">
              <span>
                {ing.name}
                {ing.category && (
                  <span className="ml-2 text-xs text-muted-foreground">({ing.category})</span>
                )}
              </span>
              <span className="text-muted-foreground">
                {ing.amount} {ing.unit}
              </span>
            </li>
          ))}
        </ul>
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

        {/* Pro Tips */}
        {recipe.tips && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-1">👨‍🍳 Chef Vito's Tips:</p>
            <p className="text-sm text-blue-800">{recipe.tips}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
