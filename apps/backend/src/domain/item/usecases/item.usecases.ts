import { Injectable } from '@nestjs/common';
import { ItemRepository } from '../../../data/repository/item.repository';
import { ItemAddRequestDTO } from '../dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../dto/item.update.request.dto';
import { ItemResponseDTO } from '../dto/item.response.dto';
import { IItemUseCase } from '../interfaces/iitem.usecase';
import { Item } from '../item';

@Injectable()
export class ItemUseCase implements IItemUseCase {
  constructor(private itemRepository: ItemRepository) {}

  async getList(): Promise<ItemResponseDTO[]> {
    const items = await this.itemRepository.getList();
    return items.map((i) => this.toResponseDTO(i));
  }

  async getByUUID(uuid: string): Promise<ItemResponseDTO | null> {
    const item = await this.itemRepository.getByUUID(uuid);
    if (!item) return null;
    return this.toResponseDTO(item);
  }

  async add(entity: ItemAddRequestDTO): Promise<number> {
    const itemEntity: Omit<Item, 'id'> = {
      item_uuid: crypto.randomUUID(),
      name: entity.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.itemRepository.add(itemEntity);
  }

  async delete(uuid: string): Promise<number> {
    const item = await this.itemRepository.getByUUID(uuid);
    if (!item) return 0;
    return this.itemRepository.delete(item.id);
  }

  async update(entity: ItemUpdateRequestDTO): Promise<number> {
    const item = await this.itemRepository.getByUUID(entity.item_uuid);
    if (!item) return 0;
    const updatedEntity: Partial<Item> = {
      name: entity.name,
      updatedAt: new Date(),
    };
    return this.itemRepository.update(item.id, updatedEntity);
  }

  private toResponseDTO(item: Item): ItemResponseDTO {
    return {
      item_uuid: item.item_uuid,
      name: item.name,
    };
  }
}