import { Item } from '../entities/item';

export interface IItemRepository {
  get(): Promise<Item[]>;
  getById(id: string): Promise<Item | null>;
  post(item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }): Promise<Item>;
  update(item: Item): Promise<Item>;
  delete(id: string): Promise<boolean>;
}
