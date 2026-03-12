export interface Recipe {
  id: number;
  recipe_uuid: string;
  name: string;
  ingredients: string[];
  steps: string[];
  user_uuid: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
}
