import { injectable } from 'inversify';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';

@injectable()
export class RecipeRepository implements IRecipeRepository {
  private recipes: Recipe[] = [];

  get(): Recipe[] {
    return this.recipes;
  }

  getById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  post(request: RecipeCreateRequestDTO): Recipe {
    const recipe: Recipe = {
      id: Date.now().toString(),
      name: `Receta de ${request.type}`,
      ingredients: request.ingredients,
      steps: ['Paso 1', 'Paso 2', 'Paso 3'],
    };
    this.recipes.push(recipe);
    return recipe;
  }

  delete(id: string): void {
    this.recipes = this.recipes.filter(recipe => recipe.id !== id);
  }
}
