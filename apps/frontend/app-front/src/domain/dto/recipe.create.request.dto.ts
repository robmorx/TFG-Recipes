import { RecipeType } from '../entities/recipe';

export interface RecipeCreateRequestDTO {
  prompt: string;
  type: RecipeType;
  user_uuid: string;
  servings?: number;
  dietaryPreferences?: string[];  // Array of selected preferences
  selectedIngredients?: string[];
}
