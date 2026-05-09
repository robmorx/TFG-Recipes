import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryUseCase } from '../../domain/inventory/usecases/inventory.usecases';
import { InventoryGetByUserRequestDTO } from '../../domain/inventory/dto/inventory.getbyuser.request.dto';

describe('InventoryController', () => {
  let controller: InventoryController;
  let useCase: jest.Mocked<InventoryUseCase>;

  const mockInventory = {
    inventory_uuid: 'inventory-uuid-123',
    userId: 'user-uuid-123',
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
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryUseCase,
          useValue: {
            getByUserUUID: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    useCase = module.get(InventoryUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByUserUUID', () => {
    it('should return inventory for valid user uuid', async () => {
      useCase.getByUserUUID.mockResolvedValue(mockInventory);

      const result = await controller.getByUserUUID('user-uuid-123');

      expect(result.inventory_uuid).toBe('inventory-uuid-123');
      expect(useCase.getByUserUUID).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return null when inventory not found', async () => {
      useCase.getByUserUUID.mockResolvedValue(null);

      const result = await controller.getByUserUUID('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete inventory and return result', async () => {
      useCase.delete.mockResolvedValue(true);

      const result = await controller.delete({
        user_uuid: 'user-uuid-123',
      } as any);

      expect(result).toBe(true);
      expect(useCase.delete).toHaveBeenCalledWith('user-uuid-123');
    });
  });
});
