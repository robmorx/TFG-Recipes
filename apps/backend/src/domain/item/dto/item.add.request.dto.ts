import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuantityUnit } from '../item';

export class ItemAddRequestDTO {
  @ApiProperty({ example: 'uuid-string' })
  @IsUUID()
  inventory_uuid: string;

  @ApiProperty({ example: 'Tomatoes' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ enum: QuantityUnit, example: QuantityUnit.UNITS })
  @IsEnum(QuantityUnit)
  quantity_unit: QuantityUnit;
}
