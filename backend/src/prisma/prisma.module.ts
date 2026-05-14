import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule: Módulo global que exporta PrismaService.
 * Al ser @Global(), no es necesario importarlo en cada módulo que use la base de datos.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
