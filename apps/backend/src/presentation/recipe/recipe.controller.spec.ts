import { Test, TestingModule } from '@nestjs/testing';
import { RecipeController } from './recipe.controller';
import { RecipeUseCase } from '../../domain/recipe/usecases/recipe.usecases';
import { RecipeResponseDTO } from '../../domain/recipe/dto/recipe.response.dto';
import { Recipe } from '../../domain/recipe/recipe';

describe('RecipeController', () => {
  let controller: RecipeController;
  let useCase: jest.Mocked<RecipeUseCase>;

  const mockRecipeResponse: RecipeResponseDTO = {
    recipe_uuid: 'test-uuid-123',
    name: 'Test Recipe',
    ingredients: ['ingredient1'],
    steps: [{ instruction: 'Step 1', timerMinutes: 5 }],
    type: 'DINNER' as any,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeUseCase,
          useValue: {
            getByUserUUID: jest.fn(),
            getByUUID: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecipeController>(RecipeController);
    useCase = module.get(RecipeUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getByUser', () => {
    it('should return recipes for valid user uuid', async () => {
      useCase.getByUserUUID.mockResolvedValue([mockRecipeResponse]);

      const result = await controller.getByUser('user-uuid-123');

      expect(result).toHaveLength(1);
      expect(useCase.getByUserUUID).toHaveBeenCalledWith('user-uuid-123');
    });

    it('should return empty array when no recipes', async () => {
      useCase.getByUserUUID.mockResolvedValue([]);

      const result = await controller.getByUser('user-uuid-123');

      expect(result).toEqual([]);
    });
  });

  describe('getByUUID', () => {
    it('should return recipe for valid uuid', async () => {
      useCase.getByUUID.mockResolvedValue(mockRecipeResponse);

      const result = await controller.getByUUID('test-uuid-123');

      expect(result?.name).toBe('Test Recipe');
      expect(useCase.getByUUID).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should return null when recipe not found', async () => {
      useCase.getByUUID.mockResolvedValue(null);

      const result = await controller.getByUUID('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('add', () => {
    const mockDto: RecipeAddRequestDTO = {
      prompt: 'Generate a recipe',
      type: 'DINNER' as any,
      user_uuid: 'user-uuid',
      servings: 4,
      dietaryPreferences: ['vegetarian'],
      selectedIngredients: ['2 cups flour'],
    };

    it('should create recipe successfully', async () => {
      useCase.add.mockResolvedValue(mockRecipeResponse);

      const result = await controller.add(mockDto);

      expect(result.name).toBe('Test Recipe');
      expect(useCase.add).toHaveBeenCalledWith(mockDto);
    });
  });

  describe('delete', () => {
    it('should delete recipe and return result', async () => {
      useCase.delete.mockResolvedValue(true);

      const result = await controller.delete({ recipe_uuid: 'recipe-uuid' });

      expect(result).toBe(true);
      expect(useCase.delete).toHaveBeenCalledWith('recipe-uuid');
    });
  });
});
