import { ConfigService } from '@nestjs/config';

export const AI_CONFIG = {
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'gpt-4',
};

export const aiConfig = (configService: ConfigService) => ({
  apiKey: configService.get<string>('AI_API_KEY') || '',
  model: configService.get<string>('AI_MODEL') || 'gpt-4',
});