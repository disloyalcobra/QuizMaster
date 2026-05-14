import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

/**
 * AuthService: Implementa la lógica core de seguridad.
 * Se encarga de hashear contraseñas, validar credenciales y generar tokens.
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registro: Crea un nuevo usuario tras validar que el email sea único.
   * Utiliza bcrypt para encriptar la contraseña antes de guardarla.
   */
  async register(dto: RegisterDto) {
    const existing = await this.usersService.findOne(dto.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hasheo de seguridad (10 saltos)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      nombre: dto.nombre,
      email: dto.email,
      passwordHash,
      rol: 'creador', // Asignamos rol por defecto requerido por el nuevo esquema
    });

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Login: Verifica las credenciales y genera un token JWT firmado.
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findOne(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparación segura del hash de la contraseña
    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Validación: Helper para el Guard que recupera al usuario desde el ID del token.
   */
  async validateUser(userId: string) {
    return this.usersService.findById(userId);
  }
}
