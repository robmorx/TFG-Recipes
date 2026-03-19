import { Injectable } from '@nestjs/common';
import { RecipeRepository } from '../../../data/repository/recipe.repository';
import { AiService } from '../../../ai/ai.service';
import { RecipeAddRequestDTO } from '../dto/recipe.add.request.dto';
import { RecipeResponseDTO } from '../dto/recipe.response.dto';
import { IRecipeUseCase } from '../interfaces/irecipe.usecase';
import { Recipe } from '../recipe';

@Injectable()
export class RecipeUseCase implements IRecipeUseCase {
  constructor(
    private recipeRepository: RecipeRepository,
    private aiService: AiService,
  ) {}

  async getList(): Promise<RecipeResponseDTO[]> {
    const recipes = await this.recipeRepository.getList();
    return recipes.map((r) => this.toResponseDTO(r));
  }

  async getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]> {
    const recipes = await this.recipeRepository.getByUserUUID(user_uuid);
    return recipes.map((r) => this.toResponseDTO(r));
  }

  async add(entity: RecipeAddRequestDTO): Promise<number> {
    const generatedRecipe = await this.aiService.generate(entity.prompt);
    const recipeEntity: Omit<Recipe, 'id'> = {
      recipe_uuid: crypto.randomUUID(),
      name: generatedRecipe.name,
      ingredients: generatedRecipe.ingredients,
      steps: generatedRecipe.steps,
      user_uuid: entity.user_uuid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.recipeRepository.add(recipeEntity);
  }

  async delete(uuid: string): Promise<number> {
    const recipe = await this.recipeRepository.getByUUID(uuid);
    if (!recipe) return 0;
    return this.recipeRepository.delete(recipe.id);
  }

  private toResponseDTO(recipe: Recipe): RecipeResponseDTO {
    return {
      recipe_uuid: recipe.recipe_uuid,
      name: recipe.name,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      atcreated: recipe.createdAt,
    };
  }
}