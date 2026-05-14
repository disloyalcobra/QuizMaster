import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

/**
 * AuthModule: Encargado de la seguridad y emisión de tokens.
 * Configura JWT y Passport para proteger las rutas de la API.
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      // Se utiliza una clave secreta para firmar los tokens.
      secret: process.env.JWT_SECRET || 'quizmaster-secret-key-dev',
      signOptions: { expiresIn: '7d' }, // Los tokens expiran en 7 días
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
