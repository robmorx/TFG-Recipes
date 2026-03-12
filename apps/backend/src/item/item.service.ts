import { Injectable } from '@nestjs/common';
import { ItemRepository } from '../data/repository/item.repository';
import { ItemAddRequestDTO } from '../domain/item/dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../domain/item/dto/item.update.request.dto';
import { ItemResponseDTO } from '../domain/item/dto/item.response.dto';

@Injectable()
export class ItemService {
  constructor(private itemRepository: ItemRepository) {}

  async getList(): Promise<ItemResponseDTO[]> {
    const items = await this.itemRepository.getList();
    return items.map((i) => ({
      item_uuid: i.item_uuid,
      name: i.name,
    }));
  }

  async add(dto: ItemAddRequestDTO): Promise<number> {
    return this.itemRepository.add({
      item_uuid: '',
      name: dto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async delete(item_uuid: string): Promise<number> {
    const item = await this.itemRepository.getByUUID(item_uuid);
    if (!item) return 0;
    return this.itemRepository.delete(item.id);
  }

  async update(dto: ItemUpdateRequestDTO): Promise<number> {
    const item = await this.itemRepository.getByUUID(dto.item_uuid);
    if (!item) return 0;
    return this.itemRepository.update(item.id, { name: dto.name });
  }
}
