import { IsString, Min, IsEnum } from 'class-validator';
import { QuantityUnit } from '../item';

export class ItemUpdateRequestDTO {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @Min(0)
  quantity: number;

  @IsEnum(QuantityUnit)
  quantity_unit: QuantityUnit;
}
