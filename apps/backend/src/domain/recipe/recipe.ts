export enum RecipeType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
}

export interface Recipe {
  recipe_uuid: string;
  name: string;
  ingredients: string[];
  steps: string[];
  type: RecipeType;
  user_uuid: string;
  createdAt: Date;
  updatedAt: Date;
}
