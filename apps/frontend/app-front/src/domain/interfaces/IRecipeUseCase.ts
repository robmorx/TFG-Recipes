import { Recipe } from '../entities/recipe';
import { RecipeCreateRequestDTO } from '../dto/recipe.create.request.dto';

export interface IRecipeUseCase {
  get(): Recipe[];
  getById(id: string): Recipe | undefined;
  post(request: RecipeCreateRequestDTO): Recipe;
  delete(id: string): void;
}
