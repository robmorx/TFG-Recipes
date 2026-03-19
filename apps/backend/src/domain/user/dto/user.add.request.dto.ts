import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class UserAddRequestDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}