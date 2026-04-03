export interface Recipe {
  id: string;
  recipe_uuid?: string;
  user_uuid?: string;
  name: string;
  ingredients: string[];
  steps: string[];
  atcreated?: Date;
  atmodified?: Date;
}
