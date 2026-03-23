import { RecipeAddRequestDTO } from '../dto/recipe.add.request.dto';
import { RecipeResponseDTO } from '../dto/recipe.response.dto';

export interface IRecipeUseCase {
  getList(): Promise<RecipeResponseDTO[]>;
  getByUserUUID(user_uuid: string): Promise<RecipeResponseDTO[]>;
  add(entity: RecipeAddRequestDTO): Promise<string>;
  delete(uuid: string): Promise<number>;
}
