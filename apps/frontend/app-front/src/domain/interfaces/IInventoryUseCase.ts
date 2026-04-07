import { Inventory } from '../entities/inventory';
import { Item } from '../entities/item';

export interface IInventoryUseCase {
  getByUserUUID(user_uuid: string): Inventory | undefined;
  add(user_uuid: string): Inventory;
  delete(id: string): void;
  addItem(inventoryId: string, item: Item): void;
  updateItem(inventoryId: string, item: Item): void;
  deleteItem(inventoryId: string, itemId: string): void;
}
