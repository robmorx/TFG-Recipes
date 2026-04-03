import { Inventory } from '../entities/inventory';

export interface IInventoryUseCase {
  getByUserUUID(user_uuid: string): Inventory | undefined;
  add(user_uuid: string): Inventory;
  delete(id: string): void;
}
