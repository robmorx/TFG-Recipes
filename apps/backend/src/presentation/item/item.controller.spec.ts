import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemUseCase } from '../../domain/item/usecases/item.usecases';
import { ItemAddRequestDTO } from '../../domain/item/dto/item.add.request.dto';
import { ItemUpdateRequestDTO } from '../../domain/item/dto/item.update.request.dto';
import { ItemDeleteRequestDTO } from '../../domain/item/dto/item.delete.request.dto';

describe('ItemController', () => {
  let controller: ItemController;
  let useCase: jest.Mocked<ItemUseCase>;

  const mockItem = {
    id: 'item-uuid-123',
    name: 'Test Item',
    quantity: 5,
    quantityUnit: 'UNITS',
    inventoryId: 'inventory-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemUseCase,
          useValue: {
            add: jest.fn(),
            getByInventoryUUID: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    useCase = module.get(ItemUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('add', () => {
    const mockDto: ItemAddRequestDTO = {
      name: 'New Item',
      quantity: 10,
      quantityUnit: 'UNITS',
      inventoryId: 'inventory-uuid',
    };

    it('should create item successfully', async () => {
      useCase.add.mockResolvedValue(mockItem);

      const result = await controller.add(mockDto);

      expect(result.name).toBe('Test Item');
      expect(useCase.add).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('delete', () => {
    it('should delete item and return result', async () => {
      useCase.delete.mockResolvedValue(true);

      const result = await controller.delete({ id: 'item-uuid-123' });

      expect(result).toBe(true);
      expect(useCase.delete).toHaveBeenCalledWith('item-uuid-123');
    });
  });

  describe('update', () => {
    const mockDto: ItemUpdateRequestDTO = {
      id: 'item-uuid-123',
      name: 'Updated Item',
      quantity: 20,
    };

    it('should update item successfully', async () => {
      useCase.update.mockResolvedValue({
        ...mockItem,
        name: 'Updated Item',
        quantity: 20,
      });

      const result = await controller.update(mockDto);

      expect(result.name).toBe('Updated Item');
      expect(useCase.update).toHaveBeenCalledWith(mockDto);
    });
  });
});
