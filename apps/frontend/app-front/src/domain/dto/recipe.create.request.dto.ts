import { RecipeType } from '../entities/recipe';

export interface RecipeCreateRequestDTO {
  quantity: number;
  type: RecipeType;
  ingredients: string[];
}
