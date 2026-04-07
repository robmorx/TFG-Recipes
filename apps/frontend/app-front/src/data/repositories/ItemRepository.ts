import { injectable } from 'inversify';
import { Item, QuantityUnit } from '../../domain/entities/item';
import { IItemRepository } from '../../domain/repositories/IItemRepository';

@injectable()
export class ItemRepository implements IItemRepository {
  private items: Item[] = [
    { id: '1', name: 'Tomates', quantity: 5, quantity_unit: QuantityUnit.UNITS },
    { id: '2', name: 'Cebollas', quantity: 3, quantity_unit: QuantityUnit.UNITS },
    { id: '3', name: 'Ajo', quantity: 10, quantity_unit: QuantityUnit.GRAMS },
    { id: '4', name: 'Aceite de oliva', quantity: 1, quantity_unit: QuantityUnit.LITRES },
    { id: '5', name: 'Pollo', quantity: 2, quantity_unit: QuantityUnit.KILOGRAMS },
    { id: '6', name: 'Leche', quantity: 2, quantity_unit: QuantityUnit.LITRES },
  ];

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
