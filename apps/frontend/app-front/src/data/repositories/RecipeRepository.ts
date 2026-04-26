import { injectable } from 'inversify';
import { Recipe, RecipeType } from '../../domain/entities/recipe';
import { IRecipeRepository } from '../../domain/repositories/IRecipeRepository';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { apiClient } from '../network/api-client';

const USE_API = true;

@injectable()
export class RecipeRepository implements IRecipeRepository {
  private mockRecipes: Recipe[] = [
    {
      id: '1',
      recipe_uuid: 'recipe-001',
      name: 'Paella Valenciana',
      ingredients: ['arroz', 'marisco', 'azafrán', 'pimiento'],
      steps: ['Cocinar arroz', 'Añadir marisco', 'Reposar'],
      type: RecipeType.LUNCH,
    },
    {
      id: '2',
      recipe_uuid: 'recipe-002',
      name: 'Ensalada César',
      ingredients: ['lechuga', 'pollo', 'queso', 'crutones'],
      steps: ['Lavar lechuga', 'Añadir pollo', 'Echar queso'],
      type: RecipeType.LUNCH,
    },
    {
      id: '3',
      recipe_uuid: 'recipe-003',
      name: 'Desayuno Integral',
      ingredients: ['pan integral', 'aguacate', 'huevo', 'café'],
      steps: ['Tostar pan', 'Cocinar huevo', 'Servir café'],
      type: RecipeType.BREAKFAST,
    },
    {
      id: '4',
      recipe_uuid: 'recipe-004',
      name: 'Sopa de Navidad',
      ingredients: ['caldo', 'verduras', 'fideos', 'hierbas'],
      steps: ['Hervir caldo', 'Añadir verduras', 'Cocinar fideos'],
      type: RecipeType.DINNER,
    },
  ];

  async get(): Promise<Recipe[]> {
    if (USE_API) {
      return apiClient.get<Recipe[]>('/recipes');
    }
    return this.mockRecipes;
  }

  async getById(id: string): Promise<Recipe | null> {
    if (USE_API) {
      return apiClient.get<Recipe>(`/recipes/${id}`);
    }
    return this.mockRecipes.find(recipe => recipe.id === id) || null;
  }

  async post(request: RecipeCreateRequestDTO): Promise<Recipe> {
    if (USE_API) {
      const created = await apiClient.post<Recipe>('/recipes/add', request);
      this.mockRecipes.push(created);
      return created;
    }
    const recipe: Recipe = {
      id: Date.now().toString(),
      recipe_uuid: `recipe-${Date.now()}`,
      name: `Receta ${this.mockRecipes.length + 1}`,
      ingredients: [],
      steps: [],
      type: request.type,
    };
    this.mockRecipes.push(recipe);
    return recipe;
  }

  async delete(id: string): Promise<boolean> {
    if (USE_API) {
      await apiClient.delete(`/recipes/delete`, { recipe_uuid: id });
      this.mockRecipes = this.mockRecipes.filter(recipe => recipe.id !== id);
      return true;
    }
    const initialLength = this.mockRecipes.length;
    this.mockRecipes = this.mockRecipes.filter(recipe => recipe.id !== id);
    return this.mockRecipes.length < initialLength;
  }

  async getByUserId(userId: string): Promise<Recipe[]> {
    if (USE_API) {
      return apiClient.get<Recipe[]>(`/recipes/${userId}`);
    }
    return this.mockRecipes;
  }
}