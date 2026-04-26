import { inject, injectable } from 'inversify';
import { Item } from '../entities/item';
import { IItemRepository } from '../repositories/IItemRepository';
import { IItemUseCase } from '../interfaces/IItemUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class ItemUseCase implements IItemUseCase {
  private itemRepository: IItemRepository;
  constructor(
      @inject(TYPES.IItemRepository)
      itemRepository: IItemRepository
    ) {
      this.itemRepository = itemRepository;
    }

  async get(): Promise<Item[]> {
    return this.itemRepository.get();
  }

  async post(item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }): Promise<Item> {
    return this.itemRepository.post(item);
  }

  async update(item: Item): Promise<Item> {
    return this.itemRepository.update(item);
  }

  async delete(id: string): Promise<boolean> {
    return this.itemRepository.delete(id);
  }
}