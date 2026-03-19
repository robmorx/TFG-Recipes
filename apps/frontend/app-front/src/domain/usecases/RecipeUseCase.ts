import { inject, injectable } from 'inversify';
import { Recipe } from '../entities/recipe';
import { IRecipeRepository } from '../repositories/IRecipeRepository';
import { IRecipeUseCase } from '../interfaces/IRecipeUseCase';
import { RecipeCreateRequestDTO } from '../dto/recipe.create.request.dto';
import { TYPES } from '../../core/TYPES';

@injectable()
export class RecipeUseCase implements IRecipeUseCase {
  private recipeRepository: IRecipeRepository
    constructor(
        @inject(TYPES.IRecipeRepository)
        recipeRepository: IRecipeRepository
      ) {
        this.recipeRepository = recipeRepository
      }

  get(): Recipe[] {
    return this.recipeRepository.get();
  }

  getById(id: string): Recipe | undefined {
    return this.recipeRepository.getById(id);
  }

  post(request: RecipeCreateRequestDTO): Recipe {
    return this.recipeRepository.post(request);
  }

  delete(id: string): void {
    this.recipeRepository.delete(id);
  }
}
