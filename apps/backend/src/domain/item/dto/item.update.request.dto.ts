import { IsNumber, IsString, Min } from 'class-validator';

export class ItemUpdateRequestDTO {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}
