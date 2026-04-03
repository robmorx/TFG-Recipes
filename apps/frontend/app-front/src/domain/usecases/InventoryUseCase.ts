import { inject, injectable } from 'inversify';
import { Inventory } from '../entities/inventory';
import { IInventoryRepository } from '../repositories/IInventoryRepository';
import { IInventoryUseCase } from '../interfaces/IInventoryUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class InventoryUseCase implements IInventoryUseCase {
  @inject(TYPES.IInventoryRepository)
  private inventoryRepository!: IInventoryRepository;

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
}
