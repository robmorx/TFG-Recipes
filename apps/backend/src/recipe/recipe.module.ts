import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { RecipeRepository } from '../data/repository/recipe.repository';

@Module({
  controllers: [RecipeController],
  providers: [RecipeService, RecipeRepository],
  exports: [RecipeService],
})
export class RecipeModule {}
