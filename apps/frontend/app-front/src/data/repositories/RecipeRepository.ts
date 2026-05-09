import { injectable } from 'inversify';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { apiClient } from '../network/api-client';

@injectable()
export class RecipeRepository implements IRecipeRepository {
  async getById(id: string): Promise<Recipe | null> {
    return apiClient.get<Recipe>(`/recipes/${id}`);
  }

  async post(request: RecipeCreateRequestDTO): Promise<Recipe> {
    return apiClient.post<Recipe>('/recipes/add', request);
  }

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/recipes/delete`, { recipe_uuid: id });
    return true;
  }

  async getByUserId(userId: string): Promise<Recipe[]> {
    return apiClient.get<Recipe[]>(`/recipes/user/${userId}`);
  }
}