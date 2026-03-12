import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Recipe } from '../../domain/recipe/recipe';
import { IRecipeRepository } from '../../domain/recipe/recipe.repository.interface';

@Injectable()
export class RecipeRepository implements IRecipeRepository {
  constructor(private prisma: PrismaService) {}

  async getList(): Promise<Recipe[]> {
    const recipes = await this.prisma.recipe.findMany();
    return recipes.map((r) => this.mapToEntity(r));
  }

  async getByUUID(uuid: string): Promise<Recipe | null> {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: uuid } });
    if (!recipe) return null;
    return this.mapToEntity(recipe);
  }

  async getByUserUUID(user_uuid: string): Promise<Recipe[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { userId: user_uuid },
    });
    return recipes.map((r) => this.mapToEntity(r));
  }

  async add(entity: Omit<Recipe, 'id'>): Promise<number> {
    const recipe = await this.prisma.recipe.create({
      data: {
        name: entity.name,
        ingredients: entity.ingredients,
        steps: entity.steps,
        prompt: entity.prompt,
        userId: entity.user_uuid,
      },
    });
    return parseInt(recipe.id.replace(/-/g, '').slice(0, 8), 16);
  }

  async delete(id: number): Promise<number> {
    const recipes = await this.prisma.recipe.findMany();
    const recipe = recipes[id - 1];
    if (!recipe) return 0;
    await this.prisma.recipe.delete({ where: { id: recipe.id } });
    return 1;
  }

  private mapToEntity(r: any): Recipe {
    return {
      id: parseInt(r.id.replace(/-/g, '').slice(0, 8), 16),
      recipe_uuid: r.id,
      name: r.name,
      ingredients: r.ingredients,
      steps: r.steps,
      user_uuid: r.userId,
      prompt: r.prompt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
