import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository } from '../data/repository/user.repository';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDTO } from './dto/login.request.dto';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 123,
    user_uuid: 'user-uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            getByEmail: jest.fn(),
            getByUUID: jest.fn(),
            validatePassword: jest.fn().mockResolvedValue(true),
            add: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const mockDto: LoginRequestDTO = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return JWT token for valid credentials', async () => {
      userRepository.getByEmail.mockResolvedValue(mockUser);

      // Mock bcrypt compare
      const bcrypt = require('bcrypt');
      bcrypt.compare.mockResolvedValue(true);

      const result = await service.login(mockDto);

      expect(result.access_token).toBeDefined();
      expect(result.user_uuid).toBe('user-uuid-123');
      expect(userRepository.getByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      userRepository.getByEmail.mockResolvedValue(null);

      await expect(service.login(mockDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      userRepository.getByEmail.mockResolvedValue(mockUser);
      userRepository.validatePassword.mockResolvedValue(false);

      await expect(service.login(mockDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user for valid uuid', async () => {
      userRepository.getByUUID.mockResolvedValue(mockUser);

      const result = await service.validateUser('user-uuid-123');

      expect(result).toBeDefined();
      expect(userRepository.getByUUID).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should throw UnauthorizedException for invalid uuid', async () => {
      userRepository.getByUUID.mockResolvedValue(null);

      await expect(service.validateUser('invalid-uuid')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
