import { injectable } from 'inversify';
import { Inventory } from '../../domain/entities/inventory';
import { Item } from '../../domain/entities/item';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';

@injectable()
export class InventoryRepository implements IInventoryRepository {
  private inventories: Inventory[] = [
    {
      id: '1',
      inventory_uuid: 'inv-001',
      user_uuid: '1',
      items: [
        { id: '1', name: 'Tomates', quantity: 5 },
        { id: '2', name: 'Cebollas', quantity: 3 },
        { id: '3', name: 'Ajo', quantity: 10 },
        { id: '4', name: 'Aceite de oliva', quantity: 1 },
      ],
    },
  ];

  getByUserUUID(user_uuid: string): Inventory | undefined {
    return this.inventories.find(inv => inv.user_uuid === user_uuid);
  }

  post(inventory: Inventory): void {
    this.inventories.push(inventory);
  }

  update(inventory: Inventory): void {
    const index = this.inventories.findIndex(i => i.id === inventory.id);
    if (index !== -1) {
      this.inventories[index] = inventory;
    }
  }

  delete(id: string): void {
    this.inventories = this.inventories.filter(inv => inv.id !== id);
  }
}
