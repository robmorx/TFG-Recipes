import { Recipe } from '../recipe/recipe';

export interface IRecipeRepository {
  getByUUID(uuid: string): Promise<Recipe | null>;
  getByUserUUID(user_uuid: string): Promise<Recipe[]>;
  countByUserSince(userId: string, since: Date): Promise<number>;
  add(entity: Omit<Recipe, 'id'>): Promise<Recipe>;
  delete(uuid: string): Promise<number>;
}
