import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../data/repository/user.repository';
import { MailService } from '../mail/mail.service';
import { LoginRequestDTO, LoginResponseDTO } from './dto/login.request.dto';
import { VerifyAccountDTO } from './dto/verify-account.request.dto';
import { ForgotPasswordDTO } from './dto/forgot-password.request.dto';
import { VerifyResetCodeDTO } from './dto/verify-reset-code.request.dto';
import { ResetPasswordDTO } from './dto/reset-password.request.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userRepository.validatePassword(
      user,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.user_uuid, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user_uuid: user.user_uuid,
      name: user.name,
      email: user.email,
    };
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

    if (
      !user.verificationCode ||
      user.verificationCode !== dto.code
    ) {
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

  async verifyResetCode(
    dto: VerifyResetCodeDTO,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== dto.code
    ) {
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

  async resetPassword(
    dto: ResetPasswordDTO,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (
      !user.resetPasswordCode ||
      user.resetPasswordCode !== dto.code
    ) {
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

    return { message: 'Password reset successfully' };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
