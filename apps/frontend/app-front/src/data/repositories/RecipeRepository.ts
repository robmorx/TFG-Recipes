import { injectable } from 'inversify';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';

@injectable()
export class RecipeRepository implements IRecipeRepository {
  private recipes: Recipe[] = [
    {
      id: '1',
      name: 'Paella Valenciana',
      ingredients: ['arroz', 'marisco', 'azafrán', 'pimiento'],
      steps: ['Cocinar arroz', 'Añadir marisco', 'Reposar'],
    },
    {
      id: '2',
      name: 'Ensalada César',
      ingredients: ['lechuga', 'pollo', 'queso', 'crutones'],
      steps: ['Lavar lechuga', 'Añadir pollo', 'Echar queso'],
    },
  ];

  get(): Recipe[] {
    return this.recipes;
  }

  getById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  post(request: RecipeCreateRequestDTO): Recipe {
    const recipe: Recipe = {
      id: Date.now().toString(),
      name: request.type,
      ingredients: request.ingredients,
      steps: [`Preparar ingredientes para ${request.quantity} personas`, 'Mezclar', 'Cocinar'],
    };
    this.recipes.push(recipe);
    return recipe;
  }

  delete(id: string): void {
    this.recipes = this.recipes.filter(recipe => recipe.id !== id);
  }
}
