import { useState, useEffect, useCallback } from 'react';
import { Recipe } from '../../domain/entities/recipe';
import { IRecipeUseCase } from '../../domain/interfaces/IRecipeUseCase';
import { RecipeCreateRequestDTO } from '../../domain/dto/recipe.create.request.dto';
import { container } from '../../core/container';
import { TYPES } from '../../core/TYPES';
import { useAuth } from '../context/AuthContext';

export const useRecipeVM = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user, setUser } = useAuth();

  const loadRecipes = useCallback(async () => {
    if (!user?.user_uuid) return;
    setIsLoading(true);
    const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);
    const data = await recipeUseCase.getByUserId(user.user_uuid);
    setRecipes(data);
    setIsLoading(false);
  }, [user?.user_uuid]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const addRecipe = async (request: RecipeCreateRequestDTO): Promise<Recipe> => {
    const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);
    const result = await recipeUseCase.post(request);
    
    // Update daily recipe count in the user context
    if (user && result && 'dailyRecipeCount' in result) {
      setUser({
        ...user,
        dailyRecipeCount: (result as any).dailyRecipeCount,
        dailyRecipeLimit: (result as any).dailyRecipeLimit ?? user.dailyRecipeLimit,
      });
    }
    
    await loadRecipes();
    return result;
  };

  const deleteRecipe = async (id: string) => {
    const recipeUseCase = container.get<IRecipeUseCase>(TYPES.IRecipeUseCase);
    await recipeUseCase.delete(id);
    
    // Optimistically update daily recipe count in the user context
    if (user && user.dailyRecipeCount !== undefined && user.dailyRecipeCount > 0) {
      setUser({
        ...user,
        dailyRecipeCount: user.dailyRecipeCount - 1,
      });
    }
    
    await loadRecipes();
  };

  return { recipes, isLoading, loadRecipes, addRecipe, deleteRecipe };
};