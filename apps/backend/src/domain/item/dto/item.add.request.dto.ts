import { IsString, IsNotEmpty, IsNumber, IsUUID, Min, IsEnum } from 'class-validator';
import { QuantityUnit } from '../item';

export class ItemAddRequestDTO {
  @IsUUID()
  inventory_uuid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsEnum(QuantityUnit)
  quantity_unit: QuantityUnit;
}
