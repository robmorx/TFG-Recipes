import { Injectable } from '@nestjs/common';
import { RecipeRepository } from '../data/repository/recipe.repository';
import { RecipeAddRequestDTO } from '../domain/recipe/dto/recipe.add.request.dto';
import { RecipeResponseDTO } from '../domain/recipe/dto/recipe.response.dto';

@Injectable()
export class RecipeService {
  constructor(private recipeRepository: RecipeRepository) {}

  async getList(): Promise<RecipeResponseDTO[]> {
    const recipes = await this.recipeRepository.getList();
    return recipes.map((r) => ({
      recipe_uuid: r.recipe_uuid,
      name: r.name,
      ingredients: r.ingredients,
      steps: r.steps,
      createdAt: r.createdAt,
    }));
  }

  async getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]> {
    const recipes = await this.recipeRepository.getByUserUUID(user_uuid);
    return recipes.map((r) => ({
      recipe_uuid: r.recipe_uuid,
      name: r.name,
      ingredients: r.ingredients,
      steps: r.steps,
      createdAt: r.createdAt,
    }));
  }

  async add(dto: RecipeAddRequestDTO): Promise<number> {
    return this.recipeRepository.add({
      recipe_uuid: '',
      name: dto.name,
      ingredients: [],
      steps: [],
      prompt: dto.prompt,
      user_uuid: dto.user_uuid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async delete(recipe_uuid: string): Promise<number> {
    const recipe = await this.recipeRepository.getByUUID(recipe_uuid);
    if (!recipe) return 0;
    return this.recipeRepository.delete(recipe.id);
  }
}
