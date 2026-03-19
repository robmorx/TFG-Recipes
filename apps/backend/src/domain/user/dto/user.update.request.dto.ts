import { IsString, IsUUID, IsEmail } from 'class-validator';

export class UserUpdateRequestDTO {
  @IsUUID()
  user_uuid: string;

  @IsString()
  @IsEmail()
  email: string;
}