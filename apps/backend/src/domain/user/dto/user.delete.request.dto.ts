import { IsUUID } from 'class-validator';

export class UserDeleteRequestDTO {
  @IsUUID()
  user_uuid: string;
}