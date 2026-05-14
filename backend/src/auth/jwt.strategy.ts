import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';

/**
 * JwtStrategy: Define cómo se extrae y valida el token JWT de las peticiones.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // Extrae el token del Header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'quizmaster-secret-key-dev',
    });
  }

  /**
   * Validate: Tras decodificar el token, verifica si el usuario existe en la DB.
   */
  async validate(payload: { sub: string; email: string; rol: string }) {
    const user = await this.authService.validateUser(payload.sub);
    return user;
  }
}
