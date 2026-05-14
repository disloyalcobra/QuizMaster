import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Usuario, Prisma } from '@prisma/client';

/**
 * UsersService: Gestiona la lógica de persistencia y consulta de usuarios.
 * Interactúa directamente con la tabla 'usuarios' a través de Prisma.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca un usuario por su dirección de correo electrónico (única).
   */
  async findOne(email: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  /**
   * Busca un usuario por su ID único (UUID).
   */
  async findById(id: string): Promise<Usuario | null> {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  /**
   * Crea un nuevo registro de usuario en la base de datos.
   */
  async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return this.prisma.usuario.create({
      data,
    });
  }

  /**
   * Obtiene la lista completa de usuarios registrados.
   */
  async findAll(): Promise<Usuario[]> {
    return this.prisma.usuario.findMany();
  }

  /**
   * Actualiza el perfil de un usuario existente.
   */
  async update(id: string, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return this.prisma.usuario.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina un usuario.
   */
  async remove(id: string): Promise<Usuario> {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}
