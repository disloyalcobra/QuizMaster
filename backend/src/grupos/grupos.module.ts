import { Module } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * GruposModule: Encargado de la lógica de agrupación.
 */
@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [GruposController],
  providers: [GruposService],
})
export class GruposModule {}
