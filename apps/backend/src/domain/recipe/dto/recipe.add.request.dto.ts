import { IsString, IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { RecipeType } from '../recipe';

export class RecipeAddRequestDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  prompt: string;

  @IsEnum(RecipeType)
  type: RecipeType;

  @IsUUID()
  user_uuid: string;
}
