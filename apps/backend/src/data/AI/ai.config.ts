import { ConfigService } from '@nestjs/config';

export const aiConfig = (configService: ConfigService) => ({
  apiKey: configService.get<string>('GEMINI_API_KEY') || '',
  model: configService.get<string>('GEMINI_MODEL') || 'gemini-3-flash',
});