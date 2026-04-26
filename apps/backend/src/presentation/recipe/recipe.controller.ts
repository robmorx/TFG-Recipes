import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';
import { RecipeAddRequestDTO } from '../../domain/recipe/dto/recipe.add.request.dto';
import { RecipeDeleteRequestDTO } from '../../domain/recipe/dto/recipe.delete.request.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Recipes')
@ApiBearerAuth()
@Controller('recipes')
@UseGuards(JwtAuthGuard)
export class RecipeController {
  constructor(private readonly recipeUseCase: RecipeUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all recipes' })
  @ApiResponse({ status: 200, description: 'List of recipes' })
  async getList() {
    return this.recipeUseCase.getList();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get recipes by user internal ID' })
  @ApiParam({ name: 'id', description: 'Internal user ID' })
  @ApiResponse({ status: 200, description: 'List of user recipes' })
  async getByUser(@Param('id') id: string) {
    return this.recipeUseCase.getByInternalUserId(parseInt(id));
  }

  @Post('add')
  @ApiOperation({ summary: 'Generate and save new recipe using AI' })
  @ApiResponse({ status: 201, description: 'Recipe created' })
  async add(@Body() dto: RecipeAddRequestDTO) {
    return this.recipeUseCase.add(dto);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete recipe by UUID' })
  @ApiResponse({ status: 200, description: 'Recipe deleted' })
  async delete(@Body() dto: RecipeDeleteRequestDTO) {
    return this.recipeUseCase.delete(dto.recipe_uuid);
  }
}