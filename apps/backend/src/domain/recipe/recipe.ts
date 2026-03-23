export interface Recipe {
  recipe_uuid: string;
  name: string;
  ingredients: string[];
  steps: string[];
  user_uuid: string;
  createdAt: Date;
  updatedAt: Date;
}
