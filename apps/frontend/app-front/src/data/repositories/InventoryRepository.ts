import { injectable } from 'inversify';
import { Inventory } from '../../domain/entities/inventory';
import { IInventoryRepository } from '../../domain/repositories/IInventoryRepository';
import { apiClient } from '../network/api-client';

@injectable()
export class InventoryRepository implements IInventoryRepository {
  async getByUserUUID(user_uuid: string): Promise<Inventory | null> {
    console.log('[DEBUG] InventoryRepository.getByUserUUID called with:', user_uuid);
    try {
      const result = await apiClient.get<Inventory>(`/inventory/${user_uuid}`);
      console.log('[DEBUG] InventoryRepository.getByUserUUID - API response:', result);
      return result;
    } catch (error) {
      console.error('[DEBUG] InventoryRepository.getByUserUUID - Error:', error);
      throw error;
    }
  }

  async getByUserId(userId: number): Promise<Inventory | null> {
    return apiClient.get<Inventory>(`/inventory/${userId}`);
  }

  async delete(user_uuid: string): Promise<boolean> {
    await apiClient.delete('/inventory/delete', { user_uuid });
    return true;
  }
}