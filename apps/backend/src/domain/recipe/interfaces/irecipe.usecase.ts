import { RecipeAddRequestDTO } from '../dto/recipe.add.request.dto';
import { RecipeResponseDTO } from '../dto/recipe.response.dto';

export interface IRecipeUseCase {
  getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]>;
  getByUUID(uuid: string): Promise<RecipeResponseDTO | null>;
  add(entity: RecipeAddRequestDTO): Promise<RecipeResponseDTO>;
  delete(uuid: string): Promise<boolean>;
}
