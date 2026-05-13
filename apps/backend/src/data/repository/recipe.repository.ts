import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Recipe } from '../../domain/recipe/recipe';
import { IRecipeRepository } from '../../domain/recipe/recipe.repository.interface';

@Injectable()
export class RecipeRepository implements IRecipeRepository {
  constructor(private prisma: PrismaService) {}

  async getByUUID(uuid: string): Promise<Recipe | null> {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: uuid } });
    if (!recipe) return null;
    return this.mapToEntity(recipe);
  }

  async countByUserSince(userId: string, since: Date): Promise<number> {
    return this.prisma.recipe.count({
      where: {
        userId,
        createdAt: { gte: since },
      },
    });
  }

  async getByUserUUID(user_uuid: string): Promise<Recipe[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { userId: user_uuid },
    });
    return recipes.map((r) => this.mapToEntity(r));
  }

  async add(entity: Omit<Recipe, 'id'>): Promise<Recipe> {
    try {
      const recipe = await this.prisma.recipe.create({
        data: {
          name: entity.name,
          ingredients: entity.ingredients,
          steps: entity.steps as any, // eslint-disable-line @typescript-eslint/no-unsafe-assignment -- Json type in Prisma
          type: entity.type,
          userId: entity.user_uuid,
        },
      });
      return this.mapToEntity(recipe);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid user UUID');
        }
      }
      throw new InternalServerErrorException('Failed to save recipe');
    }
  }

  async delete(uuid: string): Promise<number> {
    const recipe = await this.prisma.recipe.findUnique({ where: { id: uuid } });
    if (!recipe) return 0;
    await this.prisma.recipe.delete({ where: { id: uuid } });
    return 1;
  }

  private mapToEntity(r: {
    id: string;
    name: string;
    ingredients: string[];
    steps: unknown;
    type: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Recipe {
    return {
      recipe_uuid: r.id,
      name: r.name,
      ingredients: r.ingredients,
      steps:
        typeof r.steps === 'string'
          ? (JSON.parse(r.steps) as Array<{
              instruction: string;
              timerMinutes: number;
            }>)
          : (r.steps as Array<{ instruction: string; timerMinutes: number }>) ||
            [],
      type: r.type as Recipe['type'],
      user_uuid: r.userId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
