import { Item } from '../item/item';

export interface IItemRepository {
  getById(id: string): Promise<Item | null>;
  findByNameAndInventoryId(
    name: string,
    inventoryId: string,
  ): Promise<Item | null>;
  add(entity: Omit<Item, 'id'>): Promise<Item>;
  delete(id: string): Promise<number>;
  update(id: string, entity: Partial<Item>): Promise<number>;
}
