import { Item } from '../item/item';

export interface IItemRepository {
  getList(): Promise<Item[]>;
  getByUUID(uuid: string): Promise<Item | null>;
  add(entity: Omit<Item, 'id'>): Promise<string>;
  delete(uuid: string): Promise<number>;
  update(uuid: string, entity: Partial<Item>): Promise<number>;
}
