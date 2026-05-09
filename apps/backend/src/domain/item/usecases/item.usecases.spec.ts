import { Test, TestingModule } from '@nestjs/testing';
import { ItemUseCase } from './item.usecases';
import { ItemRepository } from '../../../data/repository/item.repository';
import { InventoryRepository } from '../../../data/repository/inventory.repository';
import { Item } from '../../item';
import { QuantityUnit } from '@prisma/client';

describe('ItemUseCase', () => {
  let useCase: ItemUseCase;
  let itemRepository: jest.Mocked<ItemRepository>;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  const mockItem: Item = {
    id: 'item-uuid-123',
    name: 'Test Item',
    quantity: 5,
    quantity_unit: 'UNITS' as QuantityUnit,
    inventory_id: 'inventory-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemUseCase,
        {
          provide: ItemRepository,
          useValue: {
            add: jest.fn(),
            getById: jest.fn(),
            findByNameAndInventoryId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: InventoryRepository,
          useValue: {
            getByUserUUID: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ItemUseCase>(ItemUseCase);
    itemRepository = module.get(ItemRepository);
    inventoryRepository = module.get(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('add', () => {
    const mockDto: ItemAddRequestDTO = {
      name: 'New Item',
      quantity: 10,
      quantity_unit: 'UNITS',
      inventory_id: 'inventory-uuid',
    };

    it('should add item successfully', async () => {
      inventoryRepository.getByUserUUID.mockResolvedValue({
        inventory_uuid: 'inventory-uuid',
        userId: 'user-uuid',
        items: [],
      });
      itemRepository.findByNameAndInventoryId.mockResolvedValue(null);
      itemRepository.add.mockResolvedValue(mockItem);

      const result = await useCase.add(mockDto);

      expect(result.id).toBe('item-uuid-123');
      expect(itemRepository.add).toHaveBeenCalledTimes(1);
    });

    it('should update quantity if item already exists', async () => {
      inventoryRepository.getByUserUUID.mockResolvedValue({
        inventory_uuid: 'inventory-uuid',
        userId: 'user-uuid',
        items: [],
      });
      itemRepository.findByNameAndInventoryId.mockResolvedValue(mockItem);
      itemRepository.update.mockResolvedValue(undefined);
      itemRepository.getById.mockResolvedValue({ ...mockItem, quantity: 15 });

      const result = await useCase.add(mockDto);

      expect(result.quantity).toBe(15);
    });
  });

  describe('update', () => {
    const mockDto: ItemUpdateRequestDTO = {
      id: 'item-uuid-123',
      name: 'Updated Item',
      quantity: 20,
    };

    it('should update item successfully', async () => {
      itemRepository.update.mockResolvedValue(undefined);
      itemRepository.getById.mockResolvedValue({
        ...mockItem,
        name: 'Updated Item',
        quantity: 20,
      });

      const result = await useCase.update(mockDto);

      expect(result.name).toBe('Updated Item');
      expect(itemRepository.update).toHaveBeenCalledWith(
        'item-uuid-123',
        expect.any(Object),
      );
    });
  });

  describe('delete', () => {
    it('should return true when item deleted', async () => {
      itemRepository.delete.mockResolvedValue(1);

      const result = await useCase.delete('item-uuid-123');

      expect(result).toBe(true);
      expect(itemRepository.delete).toHaveBeenCalledWith('item-uuid-123');
    });

    it('should return false when item not found', async () => {
      itemRepository.delete.mockResolvedValue(0);

      const result = await useCase.delete('non-existent');

      expect(result).toBe(false);
    });
  });
});
