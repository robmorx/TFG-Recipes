import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { UserRepository } from '../data/repository/user.repository';
import { RefreshTokenRepository } from '../data/repository/refresh-token.repository';
import { MailService } from '../mail/mail.service';
import { LoginRequestDTO, LoginResponseDTO } from './dto/login.request.dto';
import { RefreshTokenRequestDTO, RefreshTokenResponseDTO } from './dto/refresh-token.request.dto';
import { VerifyAccountDTO } from './dto/verify-account.request.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.request.dto';
import { VerifyResetCodeDTO } from './dto/verify-reset-code.request.dto';
import { ResetPasswordDTO } from './dto/reset-password.request.dto';
import * as bcrypt from 'bcrypt';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('No se encontró ninguna cuenta con este correo');
    }

    const isPasswordValid = await this.userRepository.validatePassword(
      user,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const accessToken = this.generateAccessToken(user.user_uuid, user.email, user.role);
    const refreshToken = await this.generateAndStoreRefreshToken(user.user_uuid);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user_uuid: user.user_uuid,
      name: user.name,
      email: user.email,
    };
  }

  async refreshToken(dto: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    const tokenHash = this.hashToken(dto.refresh_token);
    const storedToken = await this.refreshTokenRepository.getByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expires_at) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    const user = await this.userRepository.getByUUID(storedToken.user_uuid);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.refreshTokenRepository.revoke(storedToken.id);

    const newAccessToken = this.generateAccessToken(user.user_uuid, user.email, user.role);
    const newRefreshToken = await this.generateAndStoreRefreshToken(user.user_uuid);

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(refreshToken?: string, userUuid?: string): Promise<{ message: string }> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      const storedToken = await this.refreshTokenRepository.getByTokenHash(tokenHash);
      if (storedToken) {
        await this.refreshTokenRepository.revoke(storedToken.id);
      }
    }

    if (userUuid) {
      await this.refreshTokenRepository.revokeAllByUser(userUuid);
    }

    return { message: 'Logged out successfully' };
  }

  async validateUser(userUuid: string): Promise<any> {
    const user = await this.userRepository.getByUUID(userUuid);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async verifyAccount(dto: VerifyAccountDTO): Promise<{ message: string }> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('Account already verified');
    }

    if (!user.verificationCode || user.verificationCode !== dto.code) {
      throw new BadRequestException('Invalid verification code');
    }

    if (
      !user.verificationCodeExpires ||
      new Date() > user.verificationCodeExpires
    ) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.userRepository.verifyUser(user.user_uuid);

    return { message: 'Account verified successfully' };
  }

  async requestPasswordReset(
    dto: ForgotPasswordDTO,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('No account found with this email');
    }

    const code = this.generateCode();
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.userRepository.updateResetPasswordCode(
      user.user_uuid,
      code,
      expires,
    );

    await this.mailService.sendPasswordResetCode(dto.email, code);

    return { message: 'Reset code sent to email' };
  }

  async verifyResetCode(dto: VerifyResetCodeDTO): Promise<{ message: string }> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== dto.code) {
      throw new BadRequestException('Invalid reset code');
    }

    if (
      !user.resetPasswordCodeExpires ||
      new Date() > user.resetPasswordCodeExpires
    ) {
      throw new BadRequestException('Reset code has expired');
    }

    return { message: 'Code verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDTO): Promise<{ message: string }> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== dto.code) {
      throw new BadRequestException('Invalid reset code');
    }

    if (
      !user.resetPasswordCodeExpires ||
      new Date() > user.resetPasswordCodeExpires
    ) {
      throw new BadRequestException('Reset code has expired');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.updatePassword(user.user_uuid, hashedPassword);
    await this.userRepository.clearResetPasswordCode(user.user_uuid);

    await this.refreshTokenRepository.revokeAllByUser(user.user_uuid);

    return { message: 'Password reset successfully' };
  }

  private generateAccessToken(userUuid: string, email: string, role: string): string {
    const payload = { sub: userUuid, email, role };
    return this.jwtService.sign(payload);
  }

  private async generateAndStoreRefreshToken(userUuid: string): Promise<string> {
    const refreshToken = this.generateOpaqueToken();
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.refreshTokenRepository.create({
      token_hash: tokenHash,
      user_uuid: userUuid,
      expires_at: expiresAt,
      revoked: false,
    });

    return refreshToken;
  }

  private generateOpaqueToken(): string {
    return randomBytes(64).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
