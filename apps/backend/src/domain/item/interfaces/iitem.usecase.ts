import { ItemAddRequestDTO } from '../dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../dto/item.update.request.dto';

export interface IItemUseCase {
  add(entity: ItemAddRequestDTO): Promise<number>;
  delete(id: number): Promise<number>;
  update(entity: ItemUpdateRequestDTO): Promise<number>;
}
