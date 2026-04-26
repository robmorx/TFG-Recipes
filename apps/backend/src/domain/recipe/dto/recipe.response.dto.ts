import type { RecipeType } from '../recipe';

export class RecipeResponseDTO {
  recipe_uuid: string;
  name: string;
  ingredients: string[];
  steps: string[];
  type: RecipeType;
  createdAt: Date;
}
