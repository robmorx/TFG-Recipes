import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UserUseCase } from '../../domain/user/usecases/user.usecases';
import { UserAddRequestDTO } from '../../domain/user/dto/user.add.request.dto';
import { UserUpdateRequestDTO } from '../../domain/user/dto/user.update.request.dto';
import { UserDeleteRequestDTO } from '../../domain/user/dto/user.delete.request.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let useCase: jest.Mocked<UserUseCase>;

  const mockUser = {
    user_uuid: 'user-uuid-123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UserUseCase,
          useValue: {
            getList: jest.fn(),
            getByUUID: jest.fn(),
            add: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    useCase = module.get(UserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getList', () => {
    it('should return list of users', async () => {
      useCase.getList.mockResolvedValue([mockUser]);

      const result = await controller.getList();

      expect(result).toHaveLength(1);
      expect(useCase.getList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUser', () => {
    it('should return user for valid uuid', async () => {
      useCase.getByUUID.mockResolvedValue(mockUser);

      const result = await controller.getUser('user-uuid-123');

      expect(result.user_uuid).toBe('user-uuid-123');
      expect(useCase.getByUUID).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return null when user not found', async () => {
      useCase.getByUUID.mockResolvedValue(null);

      const result = await controller.getUser('non-existent');

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
      useCase.add.mockResolvedValue(mockUser);

      const result = await controller.add(mockDto);

      expect(result.user_uuid).toBe('user-uuid-123');
      expect(useCase.add).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('update', () => {
    const mockDto: UserUpdateRequestDTO = {
      user_uuid: 'user-uuid-123',
      name: 'Updated Name',
    };

    it('should update user successfully', async () => {
      useCase.update.mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const result = await controller.update(mockDto);

      expect(result.name).toBe('Updated Name');
      expect(useCase.update).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('delete', () => {
    it('should delete user and return result', async () => {
      useCase.delete.mockResolvedValue(true);

      const result = await controller.delete({ user_uuid: 'user-uuid-123' });

      expect(result).toBe(true);
      expect(useCase.delete).toHaveBeenCalledWith('user-uuid-123');
    });
  });
});
