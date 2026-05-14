import { Module } from '@nestjs/common';
import { EtiquetasService } from './etiquetas.service';
import { EtiquetasController } from './etiquetas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * EtiquetasModule: Gestiona las categorías temáticas.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [EtiquetasController],
  providers: [EtiquetasService],
})
export class EtiquetasModule {}
