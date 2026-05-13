import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecipeRepository } from '../../../data/repository/recipe.repository';
import { UserRepository } from '../../../data/repository/user.repository';
import { AiService } from '../../../ai/ai.service';
import { RecipeAddRequestDTO } from '../dto/recipe.add.request.dto';
import { RecipeResponseDTO } from '../dto/recipe.response.dto';
import { IRecipeUseCase } from '../interfaces/irecipe.usecase';
import { Recipe } from '../recipe';

@Injectable()
export class RecipeUseCase implements IRecipeUseCase {
  private readonly dailyRecipeLimit: number;

  constructor(
    private recipeRepository: RecipeRepository,
    private userRepository: UserRepository,
    private aiService: AiService,
    configService: ConfigService,
  ) {
    this.dailyRecipeLimit = configService.get<number>('DAILY_RECIPE_LIMIT', 2);
  }

  async getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]> {
    const recipes = await this.recipeRepository.getByUserUUID(user_uuid);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRecipeCount = await this.recipeRepository.countByUserSince(user_uuid, today);
    return recipes.map((r) => this.toResponseDTO(r, dailyRecipeCount));
  }

  async getByUUID(uuid: string): Promise<RecipeResponseDTO | null> {
    const recipe = await this.recipeRepository.getByUUID(uuid);
    if (!recipe) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRecipeCount = await this.recipeRepository.countByUserSince(recipe.user_uuid, today);
    return this.toResponseDTO(recipe, dailyRecipeCount);
  }

  async add(entity: RecipeAddRequestDTO): Promise<RecipeResponseDTO> {
    const user = await this.userRepository.getByUUID(entity.user_uuid);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyRecipeCount = await this.recipeRepository.countByUserSince(entity.user_uuid, today);

    if (dailyRecipeCount >= this.dailyRecipeLimit && user.role !== 'SUPERUSER') {
      throw new ForbiddenException(
        `Has alcanzado el límite diario de ${this.dailyRecipeLimit} recetas. Vuelve mañana o contacta con el administrador para obtener acceso ilimitado.`,
      );
    }

    try {
      const generatedRecipe = await this.aiService.generate(entity.prompt);

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
      const newCount = dailyRecipeCount + 1;
      return this.toResponseDTO(recipe, newCount);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException ||
        error instanceof ForbiddenException
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

  private toResponseDTO(recipe: Recipe, dailyRecipeCount?: number): RecipeResponseDTO {
    return {
      recipe_uuid: recipe.recipe_uuid,
      name: recipe.name,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      type: recipe.type,
      createdAt: recipe.createdAt,
      dailyRecipeCount: dailyRecipeCount ?? 0,
      dailyRecipeLimit: this.dailyRecipeLimit,
    };
  }
}
