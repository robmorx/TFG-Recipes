import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

// Mock @google/genai at the top level
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

describe('AiService', () => {
  let service: AiService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    configService = module.get(ConfigService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('should return valid recipe structure', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        if (key === 'GEMINI_MODEL') return 'gemini-3-flash';
        return null;
      });

      // Get the mocked generateContent function
      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          name: 'Test Recipe',
          ingredients: ['ingredient1', 'ingredient2'],
          steps: [
            { instruction: 'Step 1', timerMinutes: 10 },
            { instruction: 'Step 2', timerMinutes: 0 },
          ],
        }),
      });

      const result = await service.generate('Generate a test recipe');

      expect(result.name).toBe('Test Recipe');
      expect(result.ingredients).toHaveLength(2);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].instruction).toBe('Step 1');
      expect(result.steps[0].timerMinutes).toBe(10);
    });

    it('should throw BadRequestException for invalid JSON', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        return null;
      });

      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockResolvedValue({
        text: 'invalid json',
      });

      await expect(service.generate('test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for missing name', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        return null;
      });

      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          ingredients: ['ingredient1'],
          steps: [{ instruction: 'Step 1', timerMinutes: 5 }],
        }),
      });

      await expect(service.generate('test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for empty ingredients', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        return null;
      });

      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          name: 'Test Recipe',
          ingredients: [],
          steps: [{ instruction: 'Step 1', timerMinutes: 5 }],
        }),
      });

      await expect(service.generate('test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for empty steps', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        return null;
      });

      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          name: 'Test Recipe',
          ingredients: ['ingredient1'],
          steps: [],
        }),
      });

      await expect(service.generate('test')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException for API failure', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        return null;
      });

      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockRejectedValue(new Error('API Error'));

      await expect(service.generate('test')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should handle steps with invalid instruction', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'GEMINI_API_KEY') return 'test-api-key';
        return null;
      });

      const mockGenerateContent = (service as any).ai.models.generateContent;
      mockGenerateContent.mockResolvedValue({
        text: JSON.stringify({
          name: 'Test Recipe',
          ingredients: ['ingredient1'],
          steps: [{ instruction: 123, timerMinutes: 5 }], // invalid instruction type
        }),
      });

      await expect(service.generate('test')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
