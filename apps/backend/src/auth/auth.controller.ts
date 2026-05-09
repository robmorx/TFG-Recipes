import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginRequestDTO, LoginResponseDTO } from './dto/login.request.dto';
import { VerifyAccountDTO } from './dto/verify-account.request.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.request.dto';
import { VerifyResetCodeDTO } from './dto/verify-reset-code.request.dto';
import { ResetPasswordDTO } from './dto/reset-password.request.dto';
import { Public } from './public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login user with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDTO,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginRequestDTO) {
    return this.authService.login(dto);
  }

  @Post('verify-account')
  @Public()
  @ApiOperation({ summary: 'Verify account with code sent by email' })
  @ApiResponse({ status: 200, description: 'Account verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @HttpCode(HttpStatus.OK)
  async verifyAccount(@Body() dto: VerifyAccountDTO) {
    return this.authService.verifyAccount(dto);
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Send password reset code to email' })
  @ApiResponse({ status: 200, description: 'Reset code sent' })
  @ApiResponse({ status: 400, description: 'Email not found' })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDTO) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('verify-reset-code')
  @Public()
  @ApiOperation({ summary: 'Verify password reset code' })
  @ApiResponse({ status: 200, description: 'Code verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(@Body() dto: VerifyResetCodeDTO) {
    return this.authService.verifyResetCode(dto);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'Invalid code or expired' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDTO) {
    return this.authService.resetPassword(dto);
  }
}
