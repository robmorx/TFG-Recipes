import { injectable } from 'inversify';
import { Item } from '../../domain/entities/item';
import { IItemRepository } from '../../domain/repositories/IItemRepository';

@injectable()
export class ItemRepository implements IItemRepository {
  private items: Item[] = [];

  get(): Item[] {
    return this.items;
  }

  getById(id: string): Item | undefined {
    return this.items.find(item => item.id === id);
  }

  post(item: Item): void {
    this.items.push(item);
  }

  update(item: Item): void {
    const index = this.items.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.items[index] = item;
    }
  }

  delete(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }
}
