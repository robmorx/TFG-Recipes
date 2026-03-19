import { inject, injectable } from 'inversify';
import { Item } from '../entities/item';
import { IItemRepository } from '../repositories/IItemRepository';
import { IItemUseCase } from '../interfaces/IItemUseCase';
import { TYPES } from '../../core/TYPES';

@injectable()
export class ItemUseCase implements IItemUseCase {
  private itemRepository: IItemRepository
  constructor(
      @inject(TYPES.IItemRepository)
      itemRepository: IItemRepository
    ) {
      this.itemRepository = itemRepository
    }

  get(): Item[] {
    return this.itemRepository.get();
  }

  post(item: Item): void {
    this.itemRepository.post(item);
  }

  update(item: Item): void {
    this.itemRepository.update(item);
  }

  delete(id: string): void {
    this.itemRepository.delete(id);
  }
}
