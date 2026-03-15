import { useState, useEffect } from 'react';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';

export const useRecipeVM = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);

  const loadRecipes = () => {
    const data = recipeUseCase.get();
    setRecipes(data);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  const addRecipe = (request: RecipeCreateRequestDTO) => {
    recipeUseCase.post(request);
    loadRecipes();
  };

  const deleteRecipe = (id: string) => {
    recipeUseCase.delete(id);
    loadRecipes();
  };

  return { recipes, loadRecipes, addRecipe, deleteRecipe };
};
