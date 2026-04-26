import { Inventory } from '../entities/inventory';

export interface IInventoryRepository {
  getByUserUUID(user_uuid: string): Promise<Inventory | null>;
  getByUserId(userId: number): Promise<Inventory | null>;
  delete(user_uuid: string): Promise<boolean>;
}
