import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { ConfigService } from '@nestjs/config';
import { aiConfig } from 'src/data/AI/ai.config';

// ai.module.ts
@Module({
  providers: [
    {
      provide: 'AI_CONFIG',
      inject: [ConfigService],
      useFactory: aiConfig,
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}