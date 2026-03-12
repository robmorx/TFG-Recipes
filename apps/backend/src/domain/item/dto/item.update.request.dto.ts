import { IsUUID, IsString } from 'class-validator';

export class ItemUpdateRequestDTO {
  @IsUUID()
  item_uuid: string;

  @IsString()
  name: string;
}
