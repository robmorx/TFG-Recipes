import { Inventory } from '../entities/inventory';
import { Item } from '../entities/item';

export interface IInventoryUseCase {
  getByUserUUID(user_uuid: string): Promise<Inventory | null>;
  getByUserId(userId: number): Promise<Inventory | null>;
  delete(user_uuid: string): Promise<boolean>;
}
