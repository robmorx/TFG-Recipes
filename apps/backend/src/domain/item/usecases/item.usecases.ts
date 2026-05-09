import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from '../../../data/repository/item.repository';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { ItemAddRequestDTO } from '../dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../dto/item.update.request.dto';
import { ItemResponseDTO } from '../dto/item.response.dto';
import { IItemUseCase } from '../interfaces/iitem.usecase';
import { Item } from '../item';

@Injectable()
export class ItemUseCase implements IItemUseCase {
  constructor(
    private itemRepository: ItemRepository,
    private inventoryRepository: InventoryRepository,
  ) {}

  async add(entity: ItemAddRequestDTO): Promise<ItemResponseDTO> {
    const inventory = await this.inventoryRepository.getByUserUUID(
      entity.inventory_uuid,
    );
    if (!inventory) throw new NotFoundException('Inventory not found');

    const existingItem = await this.itemRepository.findByNameAndInventoryId(
      entity.name,
      inventory.inventory_uuid,
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + entity.quantity;
      await this.itemRepository.update(existingItem.id, {
        quantity: updatedQuantity,
        quantity_unit: entity.quantity_unit,
        updatedAt: new Date(),
      });
      const updatedItem = await this.itemRepository.getById(existingItem.id);
      return this.toResponseDTO(updatedItem!);
    }

    const itemEntity: Omit<Item, 'id'> = {
      inventory_id: inventory.inventory_uuid,
      name: entity.name,
      quantity: entity.quantity,
      quantity_unit: entity.quantity_unit,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const item = await this.itemRepository.add(itemEntity);
    return this.toResponseDTO(item);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.itemRepository.delete(id);
    return result > 0;
  }

  async update(entity: ItemUpdateRequestDTO): Promise<ItemResponseDTO> {
    const updatedEntity: Partial<Item> = {
      name: entity.name,
      quantity: entity.quantity,
      quantity_unit: entity.quantity_unit,
      updatedAt: new Date(),
    };
    await this.itemRepository.update(entity.id, updatedEntity);
    const item = await this.itemRepository.getById(entity.id);
    return this.toResponseDTO(item!);
  }

  private toResponseDTO(item: Item): ItemResponseDTO {
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      quantityUnit: item.quantity_unit,
    };
  }
}
