import { Item } from '../entities/item';

export interface IItemUseCase {
  get(): Promise<Item[]>;
  post(item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: string): Promise<boolean>;
}
