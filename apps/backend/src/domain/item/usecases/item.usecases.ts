import { Injectable } from '@nestjs/common';
import { ItemRepository } from '../../../data/repository/item.repository';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { ItemAddRequestDTO } from '../dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../dto/item.update.request.dto';
import { IItemUseCase } from '../interfaces/iitem.usecase';
import { Item } from '../item';

@Injectable()
export class ItemUseCase implements IItemUseCase {
  constructor(
    private itemRepository: ItemRepository,
    private inventoryRepository: InventoryRepository,
  ) {}

  async add(entity: ItemAddRequestDTO): Promise<number> {
    const inventory = await this.inventoryRepository.getByUserUUID(
      entity.inventory_uuid,
    );
    if (!inventory) return 0;

    const itemEntity: Omit<Item, 'id'> = {
      inventory_id: inventory.id,
      name: entity.name,
      quantity: entity.quantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.itemRepository.add(itemEntity);
  }

  async delete(id: number): Promise<number> {
    return this.itemRepository.delete(id);
  }

  async update(entity: ItemUpdateRequestDTO): Promise<number> {
    const updatedEntity: Partial<Item> = {
      name: entity.name,
      quantity: entity.quantity,
      updatedAt: new Date(),
    };
    return this.itemRepository.update(entity.id, updatedEntity);
  }
}
