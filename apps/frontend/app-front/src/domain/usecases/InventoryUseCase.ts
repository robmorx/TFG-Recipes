import { inject, injectable } from 'inversify';
import { Inventory } from '../entities/inventory';
import { IInventoryRepository } from '../repositories/IInventoryRepository';
import { IInventoryUseCase } from '../interfaces/IInventoryUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class InventoryUseCase implements IInventoryUseCase {
  private inventoryRepository: IInventoryRepository;
  constructor(
      @inject(TYPES.IInventoryRepository)      
      inventoryRepository: IInventoryRepository
    ) {
      this.inventoryRepository = inventoryRepository;
    }

  async getByUserUUID(user_uuid: string): Promise<Inventory | null> {
    return this.inventoryRepository.getByUserUUID(user_uuid);
  }

  async getByUserId(userId: number): Promise<Inventory | null> {
    return this.inventoryRepository.getByUserId(userId);
  }

  async delete(user_uuid: string): Promise<boolean> {
    return this.inventoryRepository.delete(user_uuid);
  }
}