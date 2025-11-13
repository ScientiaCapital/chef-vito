import { z } from 'zod';

export const DishAnalysisSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    dish: z.object({
      name: z.string(),
      cuisine: z.string(),
      category: z.enum(['appetizer', 'main', 'dessert', 'beverage'])
    }),
    ingredients: z.array(z.object({
      name: z.string(),
      amount: z.string().optional(),
      unit: z.string().optional(),
      confidence: z.number().min(0).max(1)
    })),
    nutrition: z.object({
      calories: z.number(),
      protein: z.number(),
      carbs: z.number(),
      fat: z.number()
    }),
    recipe: z.object({
      difficulty: z.enum(['easy', 'medium', 'hard']),
      prepTime: z.number(),
      cookTime: z.number(),
      servings: z.number(),
      steps: z.array(z.string())
    })
  })
});

export const FridgeAnalysisSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    ingredients: z.array(z.object({
      name: z.string(),
      category: z.enum(['protein', 'vegetable', 'fruit', 'dairy', 'grain', 'other']),
      freshness: z.enum(['fresh', 'good', 'use-soon', 'expired']),
      confidence: z.number().min(0).max(1)
    })),
    suggestedRecipes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      matchScore: z.number().min(0).max(100),
      missingIngredients: z.array(z.string()),
      totalTime: z.number(),
      difficulty: z.string()
    }))
  })
});

export const RecipeOCRSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    recipeName: z.string(),
    ingredients: z.array(z.string()),
    instructions: z.array(z.string()),
    metadata: z.object({
      source: z.string().optional(),
      author: z.string().optional(),
      prepTime: z.number().optional(),
      cookTime: z.number().optional()
    })
  })
});
