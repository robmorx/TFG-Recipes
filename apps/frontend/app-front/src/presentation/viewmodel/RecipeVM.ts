import { useState, useEffect } from 'react';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useRecipeVM = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);

  const loadRecipes = async () => {
    setIsLoading(true);
    const data = await recipeUseCase.get();
    setRecipes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const addRecipe = async (request: RecipeCreateRequestDTO) => {
    await recipeUseCase.post(request);
    await loadRecipes();
  };

  const deleteRecipe = async (id: string) => {
    await recipeUseCase.delete(id);
    await loadRecipes();
  };

  return { recipes, isLoading, loadRecipes, addRecipe, deleteRecipe };
};