import { ConfigService } from '@nestjs/config';

export const aiConfig = (configService: ConfigService) => ({
  apiKey: configService.get<string>('AI_API_KEY') || '',
  model: configService.get<string>('AI_MODEL') || 'gemini-pro',
});