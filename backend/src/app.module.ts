import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { GruposModule } from './grupos/grupos.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { MediaModule } from './media/media.module';
import { AiModule } from './ai/ai.module';

/**
 * AppModule: El módulo principal de la aplicación.
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    QuizzesModule,
    GruposModule,
    EtiquetasModule,
    MediaModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
