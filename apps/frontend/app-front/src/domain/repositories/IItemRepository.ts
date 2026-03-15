import { Item } from '../entities/item';

export interface IItemRepository {
  get(): Item[];
  getById(id: string): Item | undefined;
  post(item: Item): void;
  update(item: Item): void;
  delete(id: string): void;
}
