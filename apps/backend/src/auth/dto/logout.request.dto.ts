import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutRequestDTO {
  @ApiProperty({ example: 'abc123-refresh-token-xyz', required: false })
  @IsString()
  @IsNotEmpty()
  refresh_token?: string;
}
