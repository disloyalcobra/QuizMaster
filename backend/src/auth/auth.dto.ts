import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

/**
 * RegisterDto: Estructura de datos requerida para dar de alta un usuario.
 */
export class RegisterDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * LoginDto: Estructura de datos para el inicio de sesión.
 */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
