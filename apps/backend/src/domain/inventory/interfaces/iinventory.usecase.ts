import { InventoryResponseDTO } from '../dto/inventory.response.dto';

export interface IInventoryUseCase {
  getByUserUUID(user_uuid: string): Promise<InventoryResponseDTO | null>;
  add(user_uuid: string): Promise<number>;
  delete(user_uuid: string): Promise<number>;
}
