import { Item } from '../entities/item';

export interface IItemUseCase {
  get(): Item[];
  post(item: Item): void;
  update(item: Item): void;
  delete(id: string): void;
}
