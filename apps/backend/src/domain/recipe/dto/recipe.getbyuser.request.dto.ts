import { IsUUID } from 'class-validator';

export class RecipeGetByUserRequestDTO {
  @IsUUID()
  user_uuid: string;
}
