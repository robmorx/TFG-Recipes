import { Item } from '../item/item';

export interface IItemRepository {
  getById(id: number): Promise<Item | null>;
  add(entity: Omit<Item, 'id'>): Promise<Item>;
  delete(id: number): Promise<number>;
  update(id: number, entity: Partial<Item>): Promise<number>;
}
