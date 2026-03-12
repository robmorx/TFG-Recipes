import { IsUUID } from 'class-validator';

export class ItemDeleteRequestDTO {
  @IsUUID()
  item_uuid: string;
}
