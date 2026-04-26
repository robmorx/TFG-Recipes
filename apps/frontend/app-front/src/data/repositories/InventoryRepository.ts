import { injectable } from 'inversify';
import { Inventory } from '../../domain/entities/inventory';
import { Item } from '../../domain/entities/item';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { apiClient } from '../network/api-client';

const USE_API = true;

@injectable()
export class InventoryRepository implements IInventoryRepository {
  private mockInventories: Inventory[] = [
    {
      id: '1',
      inventory_uuid: 'inv-001',
      user_uuid: 'user-001',
      items: [
        { id: '1', name: 'Tomates', quantity: 5, quantityUnit: 'UNITS' },
        { id: '2', name: 'Cebollas', quantity: 3, quantityUnit: 'UNITS' },
        { id: '3', name: 'Ajo', quantity: 10, quantityUnit: 'GRAMS' },
        { id: '4', name: 'Aceite de oliva', quantity: 1, quantityUnit: 'LITRES' },
      ],
    },
  ];

  async getByUserUUID(user_uuid: string): Promise<Inventory | null> {
    if (USE_API) {
      return apiClient.get<Inventory>(`/inventory/${user_uuid}`);
    }
    return this.mockInventories.find(inv => inv.user_uuid === user_uuid) || null;
  }

  async getByUserId(userId: number): Promise<Inventory | null> {
    if (USE_API) {
      return apiClient.get<Inventory>(`/inventory/${userId}`);
    }
    const userUuid = this.mockInventories[0]?.user_uuid || 'user-001';
    return this.mockInventories.find(inv => inv.user_uuid === userUuid) || null;
  }

  async delete(user_uuid: string): Promise<boolean> {
    if (USE_API) {
      await apiClient.delete('/inventory/delete', { user_uuid });
    }
    const initialLength = this.mockInventories.length;
    this.mockInventories = this.mockInventories.filter(inv => inv.user_uuid !== user_uuid);
    return this.mockInventories.length < initialLength;
  }
}