import { AnalysisMode } from './types';

export function getVisionPrompt(mode: AnalysisMode): string {
  switch (mode) {
    case 'dish':
      return `Analyze this dish image in detail. Identify:
- Dish name and type of cuisine
- ALL visible ingredients with approximate quantities
- Cooking method and preparation style
- Visual presentation details
- Nutritional characteristics

Be specific and thorough.`;

    case 'fridge':
      return `Analyze this refrigerator/pantry image. Identify:
- ALL visible food items and ingredients
- Freshness indicators (appearance, packaging condition)
- Organization and storage locations
- Any items that appear expired or should be used soon

List everything you can see.`;

    case 'recipe':
      return `Extract the recipe from this image (cookbook, screen, or document). Identify:
- Recipe name/title
- Complete ingredient list with quantities
- Step-by-step instructions
- Any metadata (author, source, cooking times)

Transcribe exactly as shown.`;
  }
}

export function getStructurePrompt(mode: AnalysisMode, visionOutput: string, schema: any): string {
  return `Convert the following analysis into STRICT JSON matching this schema:

${JSON.stringify(schema, null, 2)}

Raw analysis:
${visionOutput}

CRITICAL RULES:
1. Return ONLY valid JSON, no markdown, no explanations, no code blocks
2. All required fields MUST be present
3. Use realistic estimates for missing numerical values
4. Confidence scores (0-1) should reflect detection certainty
5. For ${mode} mode, ensure all schema requirements are met
6. Numbers should be realistic (e.g., calories 200-2000, prep time 5-120 minutes)

Return the JSON now:`;
}
