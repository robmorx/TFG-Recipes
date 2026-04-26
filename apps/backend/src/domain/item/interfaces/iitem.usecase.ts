import { ItemAddRequestDTO } from '../dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../dto/item.update.request.dto';
import { ItemResponseDTO } from '../dto/item.response.dto';

export interface IItemUseCase {
  add(entity: ItemAddRequestDTO): Promise<ItemResponseDTO>;
  delete(id: number): Promise<boolean>;
  update(entity: ItemUpdateRequestDTO): Promise<ItemResponseDTO>;
}
