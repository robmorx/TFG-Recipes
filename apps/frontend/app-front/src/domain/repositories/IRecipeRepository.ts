import { Recipe } from '../entities/recipe';
import { RecipeCreateRequestDTO } from '../dto/recipe.create.request.dto';

export interface IRecipeRepository {
  get(): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | null>;
  post(request: RecipeCreateRequestDTO): Promise<Recipe>;
  delete(id: string): Promise<boolean>;
  getByUserId(userId: string): Promise<Recipe[]>;
}
