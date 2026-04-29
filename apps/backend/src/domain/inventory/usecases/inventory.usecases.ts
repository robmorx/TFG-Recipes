import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { UserRepository } from '../../../data/repository/user.repository';
import { InventoryResponseDTO } from '../dto/inventory.response.dto';
import { IInventoryUseCase } from '../interfaces/iinventory.usecase';

@Injectable()
export class InventoryUseCase implements IInventoryUseCase {
  constructor(
    private inventoryRepository: InventoryRepository,
    private userRepository: UserRepository,
  ) {}

  async getByUserUUID(user_uuid: string): Promise<InventoryResponseDTO | null> {
    console.log('[DEBUG] InventoryUseCase.getByUserUUID called with:', user_uuid);
    const inventory = await this.inventoryRepository.getByUserUUID(user_uuid);
    console.log('[DEBUG] InventoryUseCase.getByUserUUID - inventory from repo:', inventory);
    if (!inventory) return null;
    return this.toResponseDTO(inventory);
  }

  async getByInternalUserId(id: number): Promise<InventoryResponseDTO | null> {
    const user = await this.userRepository.getById(id);
    if (!user) return null;
    const inventory = await this.inventoryRepository.getByUserUUID(
      user.user_uuid,
    );
    if (!inventory) return null;
    return this.toResponseDTO(inventory);
  }

  async add(user_uuid: string): Promise<InventoryResponseDTO> {
    const inventory = await this.inventoryRepository.add({ user_uuid });
    return this.toResponseDTO(inventory);
  }

  async delete(user_uuid: string): Promise<boolean> {
    const result = await this.inventoryRepository.delete(user_uuid);
    return result > 0;
  }

  private toResponseDTO(inventory: any): InventoryResponseDTO {
    console.log('[DEBUG] toResponseDTO - inventory:', inventory);
    console.log('[DEBUG] toResponseDTO - inventory.items:', inventory.items);
    
    const response: InventoryResponseDTO = {
      inventory_uuid: inventory.inventory_uuid,
      user_uuid: inventory.user_uuid,
      items:
        inventory.items?.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          quantityUnit: i.quantityUnit,
        })) || [],
      createdAt: inventory.createdAt,
    };
    
    console.log('[DEBUG] toResponseDTO - response:', response);
    return response;
  }
}
