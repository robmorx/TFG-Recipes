import { Inventory } from './inventory';

export interface IInventoryRepository {
  getByUserUUID(user_uuid: string): Promise<Inventory | null>;
  add(entity: { user_uuid: string }): Promise<Inventory>;
  delete(user_uuid: string): Promise<number>;
}
