import { injectable } from 'inversify';
import { Item, QuantityUnit } from '../../domain/entities/item';
import { IItemRepository } from '../../domain/repositories/IItemRepository';
import { apiClient } from '../network/api-client';

const USE_API = true;

@injectable()
export class ItemRepository implements IItemRepository {
  private mockItems: Item[] = [
    { id: '1', name: 'Tomates', quantity: 5, quantityUnit: 'UNITS', quantity_unit: QuantityUnit.UNITS },
    { id: '2', name: 'Cebollas', quantity: 3, quantityUnit: 'UNITS', quantity_unit: QuantityUnit.UNITS },
    { id: '3', name: 'Ajo', quantity: 10, quantityUnit: 'GRAMS', quantity_unit: QuantityUnit.GRAMS },
    { id: '4', name: 'Aceite de oliva', quantity: 1, quantityUnit: 'LITRES', quantity_unit: QuantityUnit.LITRES },
    { id: '5', name: 'Pollo', quantity: 2, quantityUnit: 'KILOGRAMS', quantity_unit: QuantityUnit.KILOGRAMS },
    { id: '6', name: 'Leche', quantity: 2, quantityUnit: 'LITRES', quantity_unit: QuantityUnit.LITRES },
  ];

  async get(): Promise<Item[]> {
    return this.mockItems;
  }

  async getById(id: string): Promise<Item | null> {
    return this.mockItems.find(item => item.id === id) || null;
  }

  async post(item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }): Promise<Item> {
    if (USE_API) {
      const created = await apiClient.post<Item>('/items/add', item);
      this.mockItems.push(created);
      return created;
    }
    const newItem: Item = {
      id: Date.now().toString(),
      name: item.name,
      quantity: item.quantity,
      quantityUnit: item.quantity_unit,
      quantity_unit: item.quantity_unit as QuantityUnit,
    };
    this.mockItems.push(newItem);
    return newItem;
  }

  async update(item: Item): Promise<Item> {
    if (USE_API) {
      const updated = await apiClient.put<Item>('/items/update', item);
      const index = this.mockItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.mockItems[index] = updated;
      }
      return updated;
    }
    const index = this.mockItems.findIndex(i => i.id === item.id);
    if (index !== -1) {
      this.mockItems[index] = item;
    }
    return item;
  }

  async delete(id: string): Promise<boolean> {
    if (USE_API) {
      await apiClient.delete('/items/delete', { id: parseInt(id) });
    }
    const initialLength = this.mockItems.length;
    this.mockItems = this.mockItems.filter(item => item.id !== id);
    return this.mockItems.length < initialLength;
  }
}