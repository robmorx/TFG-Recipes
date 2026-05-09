import { injectable } from 'inversify';
import { Item } from '../../domain/entities/item';
import { IItemRepository } from '../../domain/repositories/IItemRepository';
import { apiClient } from '../network/api-client';

@injectable()
export class ItemRepository implements IItemRepository {
  async post(item: { inventory_uuid: string; name: string; quantity: number; quantity_unit: string }): Promise<Item> {
    return apiClient.post<Item>('/items/add', item);
  }

  async update(item: { id: string; name: string; quantity: number; quantity_unit: string }): Promise<Item> {
    return apiClient.put<Item>('/items/update', item);
  }

  async delete(id: string): Promise<boolean> {
    await apiClient.delete('/items/delete', { id });
    return true;
  }
}