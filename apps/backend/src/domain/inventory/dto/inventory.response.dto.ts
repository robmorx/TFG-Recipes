import { ItemResponseDTO } from '../../item/dto/item.response.dto';

export class InventoryResponseDTO {
  inventory_uuid: string;
  user_uuid: string;
  items: ItemResponseDTO[];
  atcreated: Date;
}
