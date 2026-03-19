import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';
import { RecipeAddRequestDTO } from '../../domain/recipe/dto/recipe.add.request.dto';
import { RecipeDeleteRequestDTO } from '../../domain/recipe/dto/recipe.delete.request.dto';

@Controller('api/recipes')
export class RecipeController {
  constructor(private readonly recipeUseCase: RecipeUseCase) {}

  @Get()
  async getList() {
    return this.recipeUseCase.getList();
  }

  @Get(':user_uuid')
  async getByUser(@Param('user_uuid') user_uuid: string) {
    return this.recipeUseCase.getByUserUUID(user_uuid);
  }

  @Post('add')
  async add(@Body() dto: RecipeAddRequestDTO) {
    return this.recipeUseCase.add(dto);
  }

  @Delete('delete')
  async delete(@Body() dto: RecipeDeleteRequestDTO) {
    return this.recipeUseCase.delete(dto.recipe_uuid);
  }
}
