export type AnalysisMode = 'dish' | 'fridge' | 'recipe';

export interface DishAnalysis {
  status: 'success';
  data: {
    dish: {
      name: string;
      cuisine: string;
      category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'snack' | 'side';
      cookingMethod?: string;
    };
    ingredients: Array<{
      name: string;
      amount?: string;
      unit?: string;
      confidence: number;
      category?: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'fat' | 'seasoning' | 'other';
    }>;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
      vitamins?: {
        vitaminA?: string;
        vitaminC?: string;
        vitaminD?: string;
        iron?: string;
        calcium?: string;
      };
    };
    allergens: {
      dairy: boolean;
      eggs: boolean;
      fish: boolean;
      shellfish: boolean;
      treeNuts: boolean;
      peanuts: boolean;
      wheat: boolean;
      soy: boolean;
      details?: string;
    };
    health: {
      healthScore: number;
      healthReason: string;
      kidFriendly: number;
      kidReason?: string;
      dietaryLabels?: Array<'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'high-protein' | 'paleo' | 'keto'>;
    };
    recipe: {
      difficulty: 'easy' | 'medium' | 'hard';
      prepTime: number;
      cookTime: number;
      servings: number;
      steps: string[];
      tips?: string;
    };
  };
}

export interface FridgeAnalysis {
  status: 'success';
  data: {
    ingredients: Array<{
      name: string;
      category: 'protein' | 'vegetable' | 'fruit' | 'dairy' | 'grain' | 'condiment' | 'beverage' | 'other';
      freshness: 'fresh' | 'good' | 'use-soon' | 'expired';
      confidence: number;
      quantity?: string;
      location?: string;
    }>;
    allergens: {
      dairy: boolean;
      eggs: boolean;
      fish: boolean;
      shellfish: boolean;
      treeNuts: boolean;
      peanuts: boolean;
      wheat: boolean;
      soy: boolean;
      details?: string;
    };
    nutritionAssessment: {
      hasProteins: boolean;
      hasVegetables: boolean;
      hasFruits: boolean;
      hasWholeGrains: boolean;
      balanceScore: number;
      notes: string;
    };
    suggestedRecipes: Array<{
      id: string;
      name: string;
      matchScore: number;
      missingIngredients: string[];
      totalTime: number;
      difficulty: string;
      healthScore?: number;
      kidFriendly?: number;
    }>;
    shoppingList?: string[];
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
      servings?: number;
      difficulty?: 'easy' | 'medium' | 'hard';
    };
    nutrition?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
      vitamins?: {
        vitaminA?: string;
        vitaminC?: string;
        vitaminD?: string;
        iron?: string;
        calcium?: string;
      };
    };
    allergens?: {
      dairy: boolean;
      eggs: boolean;
      fish: boolean;
      shellfish: boolean;
      treeNuts: boolean;
      peanuts: boolean;
      wheat: boolean;
      soy: boolean;
      details?: string;
    };
    health?: {
      healthScore: number;
      healthReason: string;
      kidFriendly: number;
      kidReason?: string;
      dietaryLabels?: Array<'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'low-carb' | 'high-protein' | 'paleo' | 'keto'>;
    };
  };
}

export type AnalysisResult = DishAnalysis | FridgeAnalysis | RecipeOCR;
