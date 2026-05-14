import { Module } from '@nestjs/common';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * QuizzesModule: Centraliza la gestión de cuestionarios.
 * Importa AuthModule para proteger rutas con JWT y PrismaModule para la base de datos.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
