export enum RecipeType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
}

export interface Recipe {
  id: string;
  recipe_uuid?: string;
  user_uuid?: string;
  name: string;
  ingredients: string[];
  steps: string[];
  type?: RecipeType;
  atcreated?: Date;
  atmodified?: Date;
}
