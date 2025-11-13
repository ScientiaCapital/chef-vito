export type AnalysisMode = 'dish' | 'fridge' | 'recipe';

export interface DishAnalysis {
  status: 'success';
  data: {
    dish: {
      name: string;
      cuisine: string;
      category: 'appetizer' | 'main' | 'dessert' | 'beverage';
    };
    ingredients: Array<{
      name: string;
      amount?: string;
      unit?: string;
      confidence: number;
    }>;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    recipe: {
      difficulty: 'easy' | 'medium' | 'hard';
      prepTime: number;
      cookTime: number;
      servings: number;
      steps: string[];
    };
  };
}

export interface FridgeAnalysis {
  status: 'success';
  data: {
    ingredients: Array<{
      name: string;
      category: 'protein' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'other';
      freshness: 'fresh' | 'good' | 'use-soon' | 'expired';
      confidence: number;
    }>;
    suggestedRecipes: Array<{
      id: string;
      name: string;
      matchScore: number;
      missingIngredients: string[];
      totalTime: number;
      difficulty: string;
    }>;
  };
}

export interface RecipeOCR {
  status: 'success';
  data: {
    recipeName: string;
    ingredients: string[];
    instructions: string[];
    metadata: {
      source?: string;
      author?: string;
      prepTime?: number;
      cookTime?: number;
    };
  };
}

export type AnalysisResult = DishAnalysis | FridgeAnalysis | RecipeOCR;
