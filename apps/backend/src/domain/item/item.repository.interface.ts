import { Item } from '../item/item';

export interface IItemRepository {
  getList(): Promise<Item[]>;
  getByUUID(uuid: string): Promise<Item | null>;
  add(entity: Omit<Item, 'id'>): Promise<number>;
  delete(id: number): Promise<number>;
  update(id: number, entity: Partial<Item>): Promise<number>;
}
