import { IsString, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class ItemAddRequestDTO {
  @IsUUID()
  inventory_uuid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}
