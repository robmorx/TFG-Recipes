import { Recipe } from '../recipe/recipe';

export interface IRecipeRepository {
  getList(): Promise<Recipe[]>;
  getByUUID(uuid: string): Promise<Recipe | null>;
  getByUserUUID(user_uuid: string): Promise<Recipe[]>;
  add(entity: Omit<Recipe, 'id'>): Promise<string>;
  delete(uuid: string): Promise<number>;
}
