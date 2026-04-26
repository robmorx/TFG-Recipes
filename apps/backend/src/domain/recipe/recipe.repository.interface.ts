import { Recipe } from '../recipe/recipe';

export interface IRecipeRepository {
  getList(): Promise<Recipe[]>;
  getByUUID(uuid: string): Promise<Recipe | null>;
  getByUserUUID(user_uuid: string): Promise<Recipe[]>;
  getUserByInternalId(id: number): Promise<{ user_uuid: string } | null>;
  add(entity: Omit<Recipe, 'id'>): Promise<Recipe>;
  delete(uuid: string): Promise<number>;
}
