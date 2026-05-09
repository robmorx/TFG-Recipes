import { Test, TestingModule } from '@nestjs/testing';
import { RecipeUseCase } from './recipe.usecases';
import { RecipeRepository } from '../../../data/repository/recipe.repository';
import { AiService } from '../../../ai/ai.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Recipe } from '../../recipe';

describe('RecipeUseCase', () => {
  let useCase: RecipeUseCase;
  let recipeRepository: jest.Mocked<RecipeRepository>;
  let aiService: jest.Mocked<AiService>;

  const mockRecipeResponse: Recipe = {
    recipe_uuid: 'test-uuid-123',
    name: 'Test Recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    steps: [
      { instruction: 'Step 1', timerMinutes: 5 },
      { instruction: 'Step 2', timerMinutes: 0 },
    ],
    type: 'DINNER' as any,
    user_uuid: 'user-uuid',
    updatedAt: new Date(),
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeUseCase,
        {
          provide: RecipeRepository,
          useValue: {
            getByUUID: jest.fn(),
            getByUserUUID: jest.fn(),
            add: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: AiService,
          useValue: {
            generate: jest.fn().mockResolvedValue({
              name: 'AI Generated Recipe',
              ingredients: ['ingredient1', 'ingredient2'],
              steps: [{ instruction: 'Step 1', timerMinutes: 10 }],
            }),
          },
        },
      ],
    }).compile();

    useCase = module.get<RecipeUseCase>(RecipeUseCase);
    recipeRepository = module.get(RecipeRepository);
    aiService = module.get(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUserUUID', () => {
    it('should return user recipes', async () => {
      const recipes = [mockRecipeResponse];
      recipeRepository.getByUserUUID.mockResolvedValue(recipes);

      const result = await useCase.getByUserUUID('user-uuid');

      expect(result).toHaveLength(1);
      expect(recipeRepository.getByUserUUID).toHaveBeenCalledWith('user-uuid');
    });

    it('should return empty array when no recipes', async () => {
      recipeRepository.getByUserUUID.mockResolvedValue([]);

      const result = await useCase.getByUserUUID('user-uuid');

      expect(result).toEqual([]);
    });
  });

  describe('getByUUID', () => {
    it('should return recipe for valid uuid', async () => {
      recipeRepository.getByUUID.mockResolvedValue(mockRecipeResponse);

      const result = await useCase.getByUUID('test-uuid-123');

      expect(result?.name).toBe('Test Recipe');
      expect(recipeRepository.getByUUID).toHaveBeenCalledWith('test-uuid-123');
    });

    it('should return null when recipe not found', async () => {
      recipeRepository.getByUUID.mockResolvedValue(null);

      const result = await useCase.getByUUID('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('add', () => {
    const mockAiResponse = {
      name: 'AI Generated Recipe',
      ingredients: ['ingredient1', 'ingredient2'],
      steps: [{ instruction: 'Do this', timerMinutes: 10 }],
    };

    const mockDto: RecipeAddRequestDTO = {
      prompt: 'Generate a recipe',
      type: 'DINNER' as any,
      user_uuid: 'user-uuid',
    };

    it('should create recipe successfully', async () => {
      aiService.generate.mockResolvedValue(mockAiResponse);
      recipeRepository.add.mockResolvedValue(mockRecipeResponse);

      const result = await useCase.add(mockDto);

      expect(result.name).toBe('Test Recipe');
      expect(aiService.generate).toHaveBeenCalledWith('Generate a recipe');
      expect(recipeRepository.add).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException for invalid AI response (no name)', async () => {
      aiService.generate.mockResolvedValue({
        name: '',
        ingredients: ['ingredient1'],
        steps: [{ instruction: 'step', timerMinutes: 0 }],
      });

      await expect(useCase.add(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid AI response (no ingredients)', async () => {
      aiService.generate.mockResolvedValue({
        name: 'Recipe',
        ingredients: [],
        steps: [{ instruction: 'step', timerMinutes: 0 }],
      });

      await expect(useCase.add(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid AI response (no steps)', async () => {
      aiService.generate.mockResolvedValue({
        name: 'Recipe',
        ingredients: ['ingredient1'],
        steps: [],
      });

      await expect(useCase.add(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should propagate BadRequestException from AI service', async () => {
      aiService.generate.mockRejectedValue(
        new BadRequestException('AI generated invalid response format'),
      );

      await expect(useCase.add(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      aiService.generate.mockRejectedValue(new Error('Unexpected error'));

      await expect(useCase.add(mockDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('delete', () => {
    it('should return true when recipe deleted', async () => {
      recipeRepository.delete.mockResolvedValue(1);

      const result = await useCase.delete('recipe-uuid');

      expect(result).toBe(true);
      expect(recipeRepository.delete).toHaveBeenCalledWith('recipe-uuid');
    });

    it('should return false when recipe not found', async () => {
      recipeRepository.delete.mockResolvedValue(0);

      const result = await useCase.delete('non-existent-uuid');

      expect(result).toBe(false);
    });
  });
});
