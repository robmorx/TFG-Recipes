import { Inventory } from './inventory';

export interface IInventoryRepository {
  getByUserUUID(user_uuid: string): Promise<Inventory | null>;
  add(entity: Omit<Inventory, 'id' | 'items'>): Promise<number>;
  delete(id: number): Promise<number>;
}
