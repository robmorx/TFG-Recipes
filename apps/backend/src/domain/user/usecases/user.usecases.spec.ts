import { Test, TestingModule } from '@nestjs/testing';
import { UserUseCase } from './user.usecases';
import { UserRepository } from '../../../data/repository/user.repository';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../user';

describe('UserUseCase', () => {
  let useCase: UserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  const mockUser: User = {
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
        UserUseCase,
        {
          provide: UserRepository,
          useValue: {
            getList: jest.fn(),
            getByUUID: jest.fn(),
            getByEmail: jest.fn(),
            validatePassword: jest.fn().mockResolvedValue(true),
            add: jest.fn().mockResolvedValue('new-user-uuid'),
            update: jest.fn().mockResolvedValue(1),
            delete: jest.fn(),
          },
        },
        {
          provide: InventoryRepository,
          useValue: {
            getByUserUUID: jest.fn(),
            add: jest.fn().mockResolvedValue({}),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UserUseCase>(UserUseCase);
    userRepository = module.get(UserRepository);
    inventoryRepository = module.get(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('getList', () => {
    it('should return list of users', async () => {
      userRepository.getList.mockResolvedValue([mockUser]);

      const result = await useCase.getList();

      expect(result).toHaveLength(1);
      expect(userRepository.getList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByUUID', () => {
    it('should return user when found', async () => {
      userRepository.getByUUID.mockResolvedValue(mockUser);

      const result = await useCase.getByUUID('user-uuid-123');

      expect(result?.user_uuid).toBe('user-uuid-123');
      expect(userRepository.getByUUID).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return null when user not found', async () => {
      userRepository.getByUUID.mockResolvedValue(null);

      const result = await useCase.getByUUID('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('add', () => {
    const mockDto: UserAddRequestDTO = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    it('should create user successfully', async () => {
      userRepository.getByEmail.mockResolvedValue(null);
      userRepository.add.mockResolvedValue('new-user-uuid');
      inventoryRepository.add.mockResolvedValue({});
      userRepository.getByUUID.mockResolvedValue(mockUser);

      const result = await useCase.add(mockDto);

      expect(result.user_uuid).toBeDefined();
      expect(userRepository.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const mockDto: UserUpdateRequestDTO = {
      user_uuid: 'user-uuid-123',
      name: 'Updated Name',
    };

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      userRepository.getByUUID.mockResolvedValue(updatedUser);
      userRepository.update.mockResolvedValue(undefined);

      const result = await useCase.update(mockDto);

      expect(result.name).toBe('Updated Name');
      expect(userRepository.update).toHaveBeenCalledWith(
        'user-uuid-123',
        expect.any(Object),
      );
    });
  });

  describe('delete', () => {
    it('should return true when user deleted', async () => {
      userRepository.getByUUID.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(1);
      inventoryRepository.delete.mockResolvedValue(1);

      const result = await useCase.delete('user-uuid-123');

      expect(result).toBe(true);
      expect(userRepository.delete).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return false when user not found', async () => {
      userRepository.getByUUID.mockResolvedValue(null);

      const result = await useCase.delete('non-existent');

      expect(result).toBe(false);
    });
  });
});
