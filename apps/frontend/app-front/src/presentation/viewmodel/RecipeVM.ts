import { useState, useEffect } from 'react';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';
import { useAuth } from '../context/AuthContext';

export const useRecipeVM = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);
  const { user } = useAuth();

  const loadRecipes = async () => {
    if (!user?.user_uuid) return;
    setIsLoading(true);
    const data = await recipeUseCase.getByUserId(user.user_uuid);
    setRecipes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, [user?.user_uuid]);

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