import { IsUUID } from 'class-validator';

export class InventoryGetByUserRequestDTO {
  @IsUUID()
  user_uuid: string;
}
