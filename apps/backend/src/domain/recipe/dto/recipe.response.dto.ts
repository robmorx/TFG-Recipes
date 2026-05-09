import { ApiProperty } from '@nestjs/swagger';
import { RecipeType } from '../recipe';

export class RecipeResponseDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  recipe_uuid: string;

  @ApiProperty({ example: 'Classic Italian Pasta Carbonara' })
  name: string;

  @ApiProperty({ example: ['eggs', 'cheese', 'bacon', 'pasta'] })
  ingredients: string[];

  @ApiProperty({
    example: [{ instruction: 'Boil pasta in salted water', timerMinutes: 10 }],
  })
  steps: { instruction: string; timerMinutes: number }[];

  @ApiProperty({ enum: RecipeType, example: RecipeType.DINNER })
  type: RecipeType;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
