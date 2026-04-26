import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../data/repository/user.repository';
import { LoginRequestDTO, LoginResponseDTO } from './dto/login.request.dto';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.getByEmail(dto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.userRepository.validatePassword(user, dto.password);
    
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
}