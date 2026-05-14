import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [OllamaService],
  exports: [OllamaService],
})
export class AiModule {}
