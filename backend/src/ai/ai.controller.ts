import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard) // Requerimos estar logueados para usar la IA
export class AiController {
  constructor(private readonly ollamaService: OllamaService) {}

  @Post('generate-quiz')
  async generateQuiz(
    @Body() body: { prompt: string; numPreguntas?: string }
  ) {
    const numQuestions = body.numPreguntas ? parseInt(body.numPreguntas, 10) : 5;

    // Generamos el quiz basado puramente en el prompt de texto
    const resultado = await this.ollamaService.generateQuiz(
      body.prompt || 'Genera un quiz de cultura general', 
      numQuestions
    );
    
    return resultado;
  }
}
