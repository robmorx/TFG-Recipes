import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { InventoryResponseDTO } from '../dto/inventory.response.dto';
import { IInventoryUseCase } from '../interfaces/iinventory.usecase';
import { ItemResponseDTO } from '../../item/dto/item.response.dto';

@Injectable()
export class InventoryUseCase implements IInventoryUseCase {
  constructor(private inventoryRepository: InventoryRepository) {}

  async getByUserUUID(user_uuid: string): Promise<InventoryResponseDTO | null> {
    const inventory = await this.inventoryRepository.getByUserUUID(user_uuid);
    if (!inventory) return null;
    return this.toResponseDTO(inventory);
  }

  async add(user_uuid: string): Promise<number> {
    return this.inventoryRepository.add({ user_uuid });
  }

  async delete(user_uuid: string): Promise<number> {
    const inventory = await this.inventoryRepository.getByUserUUID(user_uuid);
    if (!inventory) return 0;
    return this.inventoryRepository.delete(inventory.id);
  }

  private toResponseDTO(inventory: any): InventoryResponseDTO {
    return {
      inventory_uuid: inventory.inventory_uuid,
      user_uuid: inventory.user_uuid,
      items:
        inventory.items?.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
        })) || [],
      atcreated: inventory.createdAt,
    };
  }
}
