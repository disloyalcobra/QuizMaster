import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard: Middleware de seguridad.
 * Protege las rutas asegurando que solo los usuarios con un token válido puedan acceder.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
