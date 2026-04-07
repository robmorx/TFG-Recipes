import { IsNumber, IsString, Min, IsEnum } from 'class-validator';
import { QuantityUnit } from '../item';

export class ItemUpdateRequestDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsEnum(QuantityUnit)
  quantity_unit: QuantityUnit;
}
