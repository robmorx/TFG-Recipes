import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeRepository } from '../../data/repository/recipe.repository';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';
import { AiModule } from '../../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [RecipeController],
  providers: [RecipeRepository, RecipeUseCase],
})
export class RecipeModule {}
