import { ItemAddRequestDTO } from '../dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../dto/item.update.request.dto';
import { ItemResponseDTO } from '../dto/item.response.dto';

export interface IItemUseCase {
  getList(): Promise<ItemResponseDTO[]>;
  getByUUID(uuid: string): Promise<ItemResponseDTO | null>;
  add(entity: ItemAddRequestDTO): Promise<string>;
  delete(uuid: string): Promise<number>;
  update(entity: ItemUpdateRequestDTO): Promise<number>;
}
