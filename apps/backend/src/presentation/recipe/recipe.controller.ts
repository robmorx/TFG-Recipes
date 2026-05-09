import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';
import { RecipeAddRequestDTO } from '../../domain/recipe/dto/recipe.add.request.dto';
import { RecipeDeleteRequestDTO } from '../../domain/recipe/dto/recipe.delete.request.dto';
import { RecipeResponseDTO } from '../../domain/recipe/dto/recipe.response.dto';

@ApiTags('Recipes')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeUseCase: RecipeUseCase) {}

  @Get('user/:user_uuid')
  @ApiOperation({ summary: 'Get recipes by user UUID' })
  @ApiParam({ name: 'user_uuid', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'List of user recipes' })
  async getByUser(@Param('user_uuid') user_uuid: string) {
    return this.recipeUseCase.getByUserUUID(user_uuid);
  }

  @Get(':recipe_uuid')
  @ApiOperation({ summary: 'Get recipe by UUID' })
  @ApiParam({ name: 'recipe_uuid', description: 'Recipe UUID' })
  @ApiResponse({ status: 200, description: 'Recipe details' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async getByUUID(@Param('recipe_uuid') recipe_uuid: string) {
    return this.recipeUseCase.getByUUID(recipe_uuid);
  }

  @Post('add')
  @ApiOperation({ summary: 'Generate and save new recipe using AI' })
  @ApiResponse({
    status: 201,
    description: 'Recipe successfully created',
    type: RecipeResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input or AI response',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 503, description: 'AI service unavailable' })
  async add(@Body() dto: RecipeAddRequestDTO): Promise<RecipeResponseDTO> {
    return this.recipeUseCase.add(dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete recipe by UUID' })
  @ApiResponse({ status: 200, description: 'Recipe deleted' })
  async delete(@Body() dto: RecipeDeleteRequestDTO) {
    return this.recipeUseCase.delete(dto.recipe_uuid);
  }
}
