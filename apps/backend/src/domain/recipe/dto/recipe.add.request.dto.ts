import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeType } from '../recipe';

export class RecipeAddRequestDTO {
  @ApiProperty({
    example: 'Classic Italian pasta with eggs, cheese, and bacon',
  })
  @IsString()
  prompt: string;

  @ApiProperty({ enum: RecipeType, example: RecipeType.DINNER })
  @IsEnum(RecipeType)
  type: RecipeType;

  @ApiProperty({ example: 'uuid-string' })
  @IsUUID()
  user_uuid: string;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsNumber()
  servings?: number;

  @ApiProperty({
    example: ['vegetarian', 'gluten-free'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dietaryPreferences?: string[];

  @ApiProperty({
    example: ['2 cups of flour', '3 eggs'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedIngredients?: string[];
}
