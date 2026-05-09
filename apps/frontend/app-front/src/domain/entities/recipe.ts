export enum RecipeType {
  BREAKFAST = 'BREAKFAST',
  LUNCH = 'LUNCH',
  DINNER = 'DINNER',
}

export interface RecipeStep {
  instruction: string;
  timerMinutes: number;
}

export interface Recipe {
  recipe_uuid: string;
  user_uuid?: string;
  name: string;
  ingredients: string[];
  steps: RecipeStep[]; // Changed from string[]
  type?: RecipeType;
  createdAt?: Date;
  updatedAt?: Date;
}
