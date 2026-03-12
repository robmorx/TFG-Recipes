import { IsString, IsNotEmpty } from 'class-validator';

export class ItemAddRequestDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}
