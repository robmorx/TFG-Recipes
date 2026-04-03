import { IsNumber } from 'class-validator';

export class ItemDeleteRequestDTO {
  @IsNumber()
  id: number;
}
