import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenRequestDTO {
  @ApiProperty({ example: 'abc123-refresh-token-xyz' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class RefreshTokenResponseDTO {
  @ApiProperty()
  access_token: string;

  @ApiProperty()
  refresh_token: string;
}
