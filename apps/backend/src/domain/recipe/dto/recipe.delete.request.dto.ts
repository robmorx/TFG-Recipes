import { IsUUID } from 'class-validator';

export class RecipeDeleteRequestDTO {
  @IsUUID()
  recipe_uuid: string;
}
