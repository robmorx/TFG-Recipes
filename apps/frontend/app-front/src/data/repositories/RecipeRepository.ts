import { injectable } from 'inversify';
import { Recipe, RecipeType } from '../../domain/entities/recipe';
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
      type: RecipeType.LUNCH,
    },
    {
      id: '2',
      name: 'Ensalada César',
      ingredients: ['lechuga', 'pollo', 'queso', 'crutones'],
      steps: ['Lavar lechuga', 'Añadir pollo', 'Echar queso'],
      type: RecipeType.LUNCH,
    },
    {
      id: '3',
      name: 'Desayuno Integral',
      ingredients: ['pan integral', 'aguacate', 'huevo', 'café'],
      steps: ['Tostar pan', 'Cocinar huevo', 'Servir café'],
      type: RecipeType.BREAKFAST,
    },
    {
      id: '4',
      name: 'Sopa de Navidad',
      ingredients: ['caldo', 'verduras', 'fideos', 'hierbas'],
      steps: ['Hervir caldo', 'Añadir verduras', 'Cocinar fideos'],
      type: RecipeType.DINNER,
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
      name: `Receta ${this.recipes.length + 1}`,
      ingredients: request.ingredients,
      steps: [`Preparar ingredientes para ${request.quantity} personas`, 'Mezclar', 'Cocinar'],
      type: request.type,
    };
    this.recipes.push(recipe);
    return recipe;
  }

  delete(id: string): void {
    this.recipes = this.recipes.filter(recipe => recipe.id !== id);
  }
}
