import { Test, TestingModule } from '@nestjs/testing';
import { InventoryUseCase } from './inventory.usecases';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { UserRepository } from '../../../data/repository/user.repository';
import { Inventory } from '../../inventory';
import { User } from '../../user';

describe('InventoryUseCase', () => {
  let useCase: InventoryUseCase;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let userRepository: jest.Mocked<UserRepository>;

  const mockInventory: any = {
    inventory_uuid: 'inventory-uuid-123',
    user_uuid: 'user-uuid-123',
    items: [
      {
        id: 'item-uuid-1',
        name: 'Item 1',
        quantity: 5,
        quantityUnit: 'UNITS',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryUseCase,
        {
          provide: InventoryRepository,
          useValue: {
            getByUserUUID: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            getByEmail: jest.fn(),
            getByUUID: jest.fn(),
            getById: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<InventoryUseCase>(InventoryUseCase);
    inventoryRepository = module.get(InventoryRepository);
    userRepository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('getByUserUUID', () => {
    it('should return inventory with items', async () => {
      inventoryRepository.getByUserUUID.mockResolvedValue(mockInventory);

      const result = await useCase.getByUserUUID('user-uuid-123');

      expect(result?.inventory_uuid).toBe('inventory-uuid-123');
      expect(result?.items).toHaveLength(1);
      expect(inventoryRepository.getByUserUUID).toHaveBeenCalledWith(
        'user-uuid-123',
      );
    });

    it('should return null when inventory not found', async () => {
      inventoryRepository.getByUserUUID.mockResolvedValue(null);

      const result = await useCase.getByUserUUID('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('add', () => {
    it('should create inventory successfully', async () => {
      inventoryRepository.add.mockResolvedValue(mockInventory);

      const result = await useCase.add('user-uuid-123');

      expect(result?.inventory_uuid).toBe('inventory-uuid-123');
      expect(inventoryRepository.add).toHaveBeenCalledWith({
        user_uuid: 'user-uuid-123',
      });
    });
  });

  describe('delete', () => {
    it('should return true when inventory deleted', async () => {
      inventoryRepository.delete.mockResolvedValue(1);

      const result = await useCase.delete('user-uuid-123');

      expect(result).toBe(true);
      expect(inventoryRepository.delete).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return false when inventory not found', async () => {
      inventoryRepository.delete.mockResolvedValue(0);

      const result = await useCase.delete('non-existent');

      expect(result).toBe(false);
    });
  });
});
