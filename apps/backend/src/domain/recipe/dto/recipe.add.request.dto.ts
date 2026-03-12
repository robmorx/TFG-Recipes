import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class RecipeAddRequestDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  prompt: string;

  @IsUUID()
  user_uuid: string;
}
