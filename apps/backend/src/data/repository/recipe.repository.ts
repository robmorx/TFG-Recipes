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

  async getUserByInternalId(id: number): Promise<{ user_uuid: string } | null> {
    const users = await this.prisma.user.findMany();
    const user = users[id - 1];
    if (!user) return null;
    return { user_uuid: user.id };
  }

  async add(entity: Omit<Recipe, 'id'>): Promise<Recipe> {
    const recipe = await this.prisma.recipe.create({
      data: {
        name: entity.name,
        ingredients: entity.ingredients,
        steps: entity.steps,
        type: entity.type,
        userId: entity.user_uuid,
      },
    });
    return this.mapToEntity(recipe);
  }

  async delete(uuid: string): Promise<number> {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: uuid } });
    if (!recipe) return 0;
    await this.prisma.recipe.delete({ where: { id: uuid } });
    return 1;
  }

  private mapToEntity(r: any): Recipe {
    return {
      recipe_uuid: r.id,
      name: r.name,
      ingredients: r.ingredients,
      steps: r.steps,
      type: r.type,
      user_uuid: r.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
