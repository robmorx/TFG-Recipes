import { IsUUID } from 'class-validator';

export class UserGetByUUIDRequestDTO {
  @IsUUID()
  user_uuid: string;
}
