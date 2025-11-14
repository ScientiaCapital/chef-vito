# Quick Fix Examples for Tasks 8-11 Review

This document provides copy-paste code examples for the Important issues identified in the code review.

---

## Fix #1: Consistent Store Access Pattern

**File:** `components/camera-capture.tsx`

### Current Code (Lines 21, 70, 81):
```typescript
const { mode, setMode, setCurrentImage, setIsAnalyzing, setError } = useAppStore();

// Later...
useAppStore.getState().setAnalysisResult(result);

// And...
useAppStore.getState().reset();
```

### Fixed Code:
```typescript
// Line 21 - Add missing destructured methods
const { 
  mode, 
  setMode, 
  setCurrentImage, 
  setIsAnalyzing, 
  setError,
  setAnalysisResult,  // ADD THIS
  reset               // ADD THIS
} = useAppStore();

// Line 70 - Use destructured method
setAnalysisResult(result);

// Line 81 - Use destructured method
reset();
```

---

## Fix #2: Handle Missing Optional Fields

**File:** `components/dish-results.tsx`

### Current Code (Lines 55-57):
```typescript
<span className="text-muted-foreground">
  {ing.amount} {ing.unit}
</span>
```

### Fixed Code:
```typescript
<span className="text-muted-foreground">
  {ing.amount && ing.unit 
    ? `${ing.amount} ${ing.unit}` 
    : ing.amount 
    ? ing.amount 
    : 'to taste'}
</span>
```

---

## Fix #3: Add Type Guards

**File:** `components/analysis-results.tsx`

### Current Code (Lines 44-54):
```typescript
if (mode === 'dish') {
  return <DishResults data={analysisResult as DishAnalysis} />;
}
if (mode === 'fridge') {
  return <FridgeResults data={analysisResult as FridgeAnalysis} />;
}
if (mode === 'recipe') {
  return <RecipeResults data={analysisResult as RecipeOCR} />;
}
```

### Fixed Code:
```typescript
// Add type guards at top of file
function isDishAnalysis(result: AnalysisResult): result is DishAnalysis {
  return 'dish' in result.data;
}

function isFridgeAnalysis(result: AnalysisResult): result is FridgeAnalysis {
  return 'ingredients' in result.data && 'suggestedRecipes' in result.data;
}

function isRecipeOCR(result: AnalysisResult): result is RecipeOCR {
  return 'recipeName' in result.data;
}

// Then use in component
export function AnalysisResults() {
  const { mode, analysisResult, isAnalyzing, error } = useAppStore();

  // ... loading and error states ...

  if (!analysisResult) {
    return null;
  }

  // Use type guards instead of assertions
  if (mode === 'dish' && isDishAnalysis(analysisResult)) {
    return <DishResults data={analysisResult} />;
  }

  if (mode === 'fridge' && isFridgeAnalysis(analysisResult)) {
    return <FridgeResults data={analysisResult} />;
  }

  if (mode === 'recipe' && isRecipeOCR(analysisResult)) {
    return <RecipeResults data={analysisResult} />;
  }

  // Fallback for unexpected cases
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 text-yellow-600">
        <AlertCircle className="h-5 w-5" />
        <p>Unexpected analysis result format</p>
      </div>
    </Card>
  );
}
```

---

## Fix #4: Webcam Cleanup

**File:** `components/camera-capture.tsx`

### Add after imports:
```typescript
import { useRef, useState, useCallback, useEffect } from 'react';
```

### Add before return statement (around line 83):
```typescript
// Cleanup webcam stream on unmount
useEffect(() => {
  return () => {
    if (webcamRef.current?.stream) {
      const tracks = webcamRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };
}, []);
```

---

## Fix #5: Remove Non-functional Save Button

**File:** `components/recipe-results.tsx`

### Option A: Remove button entirely (Lines 56-60):
```typescript
{/* Save Button - TODO: Implement save functionality */}
{/* <Button className="w-full">
  <Save className="mr-2 h-4 w-4" />
  Save to Recipe Catalog
</Button> */}
```

### Option B: Add handler (if you want to implement now):
```typescript
const handleSave = useCallback(() => {
  // TODO: Implement save to Supabase
  console.log('Saving recipe:', data);
}, [data]);

// ...

<Button className="w-full" onClick={handleSave}>
  <Save className="mr-2 h-4 w-4" />
  Save to Recipe Catalog
</Button>
```

---

## Bonus Fix #6: Add Accessibility

**File:** `components/camera-capture.tsx`

### Camera Button (Line 138):
```typescript
<Button onClick={capture} className="w-full" size="lg" aria-label="Capture photo from camera">
  <Camera className="mr-2 h-5 w-5" aria-hidden="true" />
  Capture
</Button>
```

### Preview Image (Line 107):
```typescript
<img 
  src={preview} 
  alt="Captured photo preview" 
  className="w-full h-full object-cover" 
/>
```

**File:** `components/analysis-results.tsx`

### Error Message (Line 31):
```typescript
<Card className="p-6">
  <div className="flex items-center gap-3 text-red-600" role="alert">
    <AlertCircle className="h-5 w-5" aria-hidden="true" />
    <p>{error}</p>
  </div>
</Card>
```

---

## Bonus Fix #7: Handle Empty Arrays

**File:** `components/dish-results.tsx`

### Add after destructuring (Line 13):
```typescript
export function DishResults({ data }: DishResultsProps) {
  const { dish, ingredients, nutrition, recipe } = data.data;

  // Handle empty arrays
  if (!ingredients.length && !recipe.steps.length) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-yellow-600">
          <AlertCircle className="h-5 w-5" />
          <p>Analysis complete but no recipe details available</p>
        </div>
      </Card>
    );
  }

  return (
    // ... rest of component
```

### For Ingredients Section (Line 51):
```typescript
{/* Ingredients */}
<Card className="p-6">
  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
  {ingredients.length > 0 ? (
    <ul className="space-y-2">
      {ingredients.map((ing, idx) => (
        <li key={idx} className="flex justify-between">
          <span>{ing.name}</span>
          <span className="text-muted-foreground">
            {ing.amount && ing.unit 
              ? `${ing.amount} ${ing.unit}` 
              : ing.amount || 'to taste'}
          </span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-muted-foreground">No ingredients detected</p>
  )}
</Card>
```

---

## Testing Checklist After Fixes

After applying these fixes, test:

- [ ] Mode switching works and clears previous results
- [ ] Retake button works and resets state properly
- [ ] Ingredients without amounts display correctly
- [ ] Empty ingredient/step lists show gracefully
- [ ] Webcam stream stops when component unmounts
- [ ] Error messages display with proper accessibility
- [ ] Screen reader announces errors and loading states
- [ ] Save button either works or is removed
- [ ] Type mismatches show fallback error

---

## Quick Verification Commands

```bash
# Check TypeScript errors
npx tsc --noEmit

# Check for accessibility issues (requires eslint-plugin-jsx-a11y)
npm run lint

# Run development server
npm run dev
```

---

**Created:** 2025-11-13
**For Review:** /Users/tmkipper/Desktop/tk_projects/chef-vito/docs/reviews/2025-11-13-tasks-8-11-review.md
