import { RecipeAddRequestDTO } from '../dto/recipe.add.request.dto';
import { RecipeResponseDTO } from '../dto/recipe.response.dto';

export interface IRecipeUseCase {
  getList(): Promise<RecipeResponseDTO[]>;
  getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]>;
  getByInternalUserId(id: number): Promise<RecipeResponseDTO[]>;
  add(entity: RecipeAddRequestDTO): Promise<RecipeResponseDTO>;
  delete(uuid: string): Promise<boolean>;
}
