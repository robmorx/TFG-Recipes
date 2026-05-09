import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
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

  async getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]> {
    const recipes = await this.recipeRepository.getByUserUUID(user_uuid);
    return recipes.map((r) => this.toResponseDTO(r));
  }

  async getByUUID(uuid: string): Promise<RecipeResponseDTO | null> {
    const recipe = await this.recipeRepository.getByUUID(uuid);
    if (!recipe) return null;
    return this.toResponseDTO(recipe);
  }

  async add(entity: RecipeAddRequestDTO): Promise<RecipeResponseDTO> {
    try {
      const generatedRecipe = await this.aiService.generate(entity.prompt);

      // Validate required fields
      if (
        !generatedRecipe.name ||
        !generatedRecipe.ingredients?.length ||
        !generatedRecipe.steps?.length
      ) {
        throw new BadRequestException('Invalid recipe data from AI');
      }

      const recipeEntity: Omit<Recipe, 'id'> = {
        recipe_uuid: crypto.randomUUID(),
        name: generatedRecipe.name,
        ingredients: generatedRecipe.ingredients,
        steps: generatedRecipe.steps,
        type: entity.type,
        user_uuid: entity.user_uuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const recipe = await this.recipeRepository.add(recipeEntity);
      return this.toResponseDTO(recipe);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create recipe');
    }
  }

  async delete(uuid: string): Promise<boolean> {
    const result = await this.recipeRepository.delete(uuid);
    return result > 0;
  }

  private toResponseDTO(recipe: Recipe): RecipeResponseDTO {
    return {
      recipe_uuid: recipe.recipe_uuid,
      name: recipe.name,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      type: recipe.type,
      createdAt: recipe.createdAt,
    };
  }
}
