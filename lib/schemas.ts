import { z } from 'zod';

// Detailed nutrition schema for health tracking
const DetailedNutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(), // grams
  carbs: z.number(), // grams
  fat: z.number(), // grams
  fiber: z.number().optional(), // grams
  sugar: z.number().optional(), // grams
  sodium: z.number().optional(), // mg
  // Key vitamins and minerals (optional - if identifiable)
  vitamins: z.object({
    vitaminA: z.string().optional(), // e.g., "High from carrots"
    vitaminC: z.string().optional(), // e.g., "Medium from tomatoes"
    vitaminD: z.string().optional(),
    iron: z.string().optional(),
    calcium: z.string().optional(),
  }).optional(),
});

// Allergen tracking
const AllergenSchema = z.object({
  dairy: z.boolean(),
  eggs: z.boolean(),
  fish: z.boolean(),
  shellfish: z.boolean(),
  treeNuts: z.boolean(),
  peanuts: z.boolean(),
  wheat: z.boolean(),
  soy: z.boolean(),
  details: z.string().optional(), // e.g., "Contains milk in cheese, possible egg in pasta"
});

// Health and kid-friendly ratings
const HealthRatingSchema = z.object({
  healthScore: z.number().min(1).max(10), // 1=very unhealthy, 10=very healthy
  healthReason: z.string(), // Why this score?
  kidFriendly: z.number().min(1).max(10), // 1=not kid-friendly, 10=very kid-friendly
  kidReason: z.string().optional(), // Why this score?
  dietaryLabels: z.array(z.enum(['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'high-protein', 'paleo', 'keto'])).optional(),
});

export const DishAnalysisSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    dish: z.object({
      name: z.string(),
      cuisine: z.string(),
      category: z.enum(['appetizer', 'main', 'dessert', 'beverage', 'snack', 'side']),
      cookingMethod: z.string().optional(), // e.g., "grilled", "baked"
    }),
    ingredients: z.array(z.object({
      name: z.string(),
      amount: z.string().optional(),
      unit: z.string().optional(),
      confidence: z.number().min(0).max(1),
      category: z.enum(['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'fat', 'seasoning', 'other']).optional(),
    })),
    nutrition: DetailedNutritionSchema,
    allergens: AllergenSchema,
    health: HealthRatingSchema,
    recipe: z.object({
      difficulty: z.enum(['easy', 'medium', 'hard']),
      prepTime: z.number(), // minutes
      cookTime: z.number(), // minutes
      servings: z.number(),
      steps: z.array(z.string()),
      tips: z.string().optional(), // Pro tips for making it better/healthier/kid-friendly
    }),
  })
});

export const FridgeAnalysisSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    ingredients: z.array(z.object({
      name: z.string(),
      category: z.enum(['protein', 'vegetable', 'fruit', 'dairy', 'grain', 'condiment', 'beverage', 'other']),
      freshness: z.enum(['fresh', 'good', 'use-soon', 'expired']),
      confidence: z.number().min(0).max(1),
      quantity: z.string().optional(), // e.g., "half full", "3 eggs"
      location: z.string().optional(), // e.g., "top shelf", "door"
    })),
    allergens: AllergenSchema, // What allergens are present in the fridge
    nutritionAssessment: z.object({
      hasProteins: z.boolean(),
      hasVegetables: z.boolean(),
      hasFruits: z.boolean(),
      hasWholeGrains: z.boolean(),
      balanceScore: z.number().min(1).max(10), // How balanced is this fridge?
      notes: z.string(), // e.g., "Great variety of vegetables, low on protein sources"
    }),
    suggestedRecipes: z.array(z.object({
      name: z.string(),
      description: z.string(), // Brief description of the meal
      ingredients: z.array(z.object({
        name: z.string(),
        amount: z.string(),
        available: z.boolean(), // Is this in the fridge?
      })),
      instructions: z.array(z.string()), // Step-by-step cooking instructions
      prepTime: z.number(), // minutes
      cookTime: z.number(), // minutes
      servings: z.number(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      kidFriendly: z.number().min(1).max(10), // REQUIRED for kid meals
      kidAppeal: z.string(), // Why kids will love this
      healthScore: z.number().min(1).max(10),
      nutrition: DetailedNutritionSchema,
    })).length(3), // Exactly 3 kid-friendly meals
    shoppingList: z.array(z.string()).optional(), // What to buy to improve nutrition
  })
});

export const RecipeOCRSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    recipeName: z.string(),
    ingredients: z.array(z.string()), // Exact as written
    instructions: z.array(z.string()), // Step by step
    metadata: z.object({
      source: z.string().optional(),
      author: z.string().optional(),
      prepTime: z.number().optional(),
      cookTime: z.number().optional(),
      servings: z.number().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    }),
    nutrition: DetailedNutritionSchema.optional(), // If visible on recipe
    allergens: AllergenSchema.optional(), // If identifiable from ingredients
    health: HealthRatingSchema.optional(),
  })
});

// Health tracking types for future use
export type DailyNutrition = {
  date: string; // ISO date
  meals: Array<{
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    dishName: string;
    imageUrl: string;
    nutrition: z.infer<typeof DetailedNutritionSchema>;
    timestamp: string;
  }>;
  totals: z.infer<typeof DetailedNutritionSchema>;
  goals: {
    calorieGoal: number;
    proteinGoal: number;
    // etc.
  };
};

export type UserHealthProfile = {
  userId: string;
  allergens: string[]; // User's known allergies
  dietaryPreferences: string[]; // vegetarian, vegan, etc.
  calorieGoal?: number;
  restrictions: string[]; // Custom restrictions
};
