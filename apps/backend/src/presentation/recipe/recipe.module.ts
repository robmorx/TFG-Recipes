import { Module } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeRepository } from '../../data/repository/recipe.repository';
import { UserRepository } from '../../data/repository/user.repository';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';
import { AuthModule } from '../../auth/auth.module';
import { AiModule } from '../../ai/ai.module';

@Module({
  imports: [AiModule, AuthModule],
  controllers: [RecipeController],
  providers: [RecipeRepository, UserRepository, RecipeUseCase],
})
export class RecipeModule {}
