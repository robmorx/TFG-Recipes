import { IsString } from 'class-validator';

export class ItemDeleteRequestDTO {
  @IsString()
  id: string;
}
