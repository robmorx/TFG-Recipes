export interface IInventoryRepository {
  getByUserUUID(user_uuid: string): Inventory | undefined;
  post(inventory: Inventory): void;
  delete(id: string): void;
}
