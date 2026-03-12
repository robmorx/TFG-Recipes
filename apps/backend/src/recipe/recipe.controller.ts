import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeAddRequestDTO } from '../domain/recipe/dto/recipe.add.request.dto';
import { RecipeDeleteRequestDTO } from '../domain/recipe/dto/recipe.delete.request.dto';
import { RecipeGetByUserRequestDTO } from '../domain/recipe/dto/recipe.getbyuser.request.dto';

@Controller('api/recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  async getList() {
    return this.recipeService.getList();
  }

  @Get(':user_uuid')
  async getByUser(@Param('user_uuid') user_uuid: string) {
    return this.recipeService.getByUserUUID(user_uuid);
  }

  @Post('add')
  async add(@Body() dto: RecipeAddRequestDTO) {
    return this.recipeService.add(dto);
  }

  @Delete('delete')
  async delete(@Body() dto: RecipeDeleteRequestDTO) {
    return this.recipeService.delete(dto.recipe_uuid);
  }
}
