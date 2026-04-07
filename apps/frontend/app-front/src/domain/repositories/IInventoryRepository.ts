import { Inventory } from '../entities/inventory';

export interface IInventoryRepository {
  getByUserUUID(user_uuid: string): Inventory | undefined;
  post(inventory: Inventory): void;
  update(inventory: Inventory): void;
  delete(id: string): void;
}
