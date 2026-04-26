import { IsString, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeType } from '../recipe';

export class RecipeAddRequestDTO {
  @ApiProperty({ example: 'Pasta Carbonara' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Classic Italian pasta with eggs, cheese, and bacon' })
  @IsString()
  prompt: string;

  @ApiProperty({ enum: RecipeType, example: RecipeType.DINNER })
  @IsEnum(RecipeType)
  type: RecipeType;

  @ApiProperty({ example: 'uuid-string' })
  @IsUUID()
  user_uuid: string;
}
