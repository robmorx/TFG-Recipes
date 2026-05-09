import { inject, injectable } from 'inversify';
import { Recipe } from '../entities/recipe';
import { IRecipeRepository } from '../repositories/IRecipeRepository';
import { IRecipeUseCase } from '../interfaces/IRecipeUseCase';
import { RecipeCreateRequestDTO } from '../dto/recipe.create.request.dto';
import { TYPES } from '../../core/TYPES';

@injectable()
export class RecipeUseCase implements IRecipeUseCase {
  private recipeRepository: IRecipeRepository;
  constructor(
      @inject(TYPES.IRecipeRepository)
      recipeRepository: IRecipeRepository
    ) {
      this.recipeRepository = recipeRepository;
    }

  async getById(id: string): Promise<Recipe | null> {
    return this.recipeRepository.getById(id);
  }

  async post(request: RecipeCreateRequestDTO): Promise<Recipe> {
    return this.recipeRepository.post(request);
  }

  async delete(id: string): Promise<boolean> {
    return this.recipeRepository.delete(id);
  }

  async getByUserId(userId: string): Promise<Recipe[]> {
    return this.recipeRepository.getByUserId(userId);
  }
}