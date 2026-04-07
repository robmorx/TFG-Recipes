import { inject, injectable } from 'inversify';
import { Inventory } from '../entities/inventory';
import { Item } from '../entities/item';
import { IInventoryRepository } from '../repositories/IInventoryRepository';
import { IInventoryUseCase } from '../interfaces/IInventoryUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class InventoryUseCase implements IInventoryUseCase {
  
  private inventoryRepository!: IInventoryRepository;

  constructor(
      @inject(TYPES.IInventoryRepository)      
        inventoryRepository: IInventoryRepository
      ) {
        this.inventoryRepository = inventoryRepository
      }

  getByUserUUID(user_uuid: string): Inventory | undefined {
    return this.inventoryRepository.getByUserUUID(user_uuid);
  }

  add(user_uuid: string): Inventory {
    const inventory: Inventory = {
      id: Date.now().toString(),
      inventory_uuid: crypto.randomUUID(),
      user_uuid,
      items: [],
    };
    this.inventoryRepository.post(inventory);
    return inventory;
  }

  delete(id: string): void {
    this.inventoryRepository.delete(id);
  }

  addItem(inventoryId: string, item: Item): void {
    const inventory = this.inventoryRepository.getByUserUUID(inventoryId);
    if (inventory) {
      inventory.items.push(item);
      this.inventoryRepository.update(inventory);
    }
  }

  updateItem(inventoryId: string, item: Item): void {
    const inventory = this.inventoryRepository.getByUserUUID(inventoryId);
    if (inventory) {
      const index = inventory.items.findIndex((i: Item) => i.id === item.id);
      if (index !== -1) {
        inventory.items[index] = item;
        this.inventoryRepository.update(inventory);
      }
    }
  }

  deleteItem(inventoryId: string, itemId: string): void {
    const inventory = this.inventoryRepository.getByUserUUID(inventoryId);
    if (inventory) {
      inventory.items = inventory.items.filter((i: Item) => i.id !== itemId);
      this.inventoryRepository.update(inventory);
    }
  }
}
