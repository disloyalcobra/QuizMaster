import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * AuthController: Maneja los puntos de entrada para la gestión de usuarios y sesiones.
 * Incluye registro, inicio de sesión y obtención del perfil actual.
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint POST /auth/register: Registra un nuevo creador en la plataforma.
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Endpoint POST /auth/login: Autentica a un usuario y retorna un token JWT.
   */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * Endpoint GET /auth/me: Retorna la información del usuario autenticado actual.
   * Requiere un token válido en la cabecera Authorization.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
