import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * GruposService: Lógica para la organización de estudiantes.
 * Gestiona el agrupamiento de alumnos y su relación con los cuestionarios.
 */
@Injectable()
export class GruposService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los grupos creados por un usuario específico (profesor/creador).
   */
  async findAll(creadorId: string) {
    return this.prisma.grupo.findMany({
      where: { creadorId },
      include: {
        _count: { select: { quizzes: true } },
        quizzes: {
          include: {
            etiquetas: { include: { etiqueta: true } },
            _count: { select: { intentos: true, preguntas: true } },
          },
          orderBy: { actualizadoEn: 'desc' },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  /**
   * Busca un grupo específico por su ID detallando sus quizzes asociados.
   */
  async findOne(id: string) {
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
      include: { quizzes: { include: { _count: { select: { intentos: true } } } } },
    });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    return grupo;
  }

  /**
   * Crea un nuevo grupo de estudiantes vinculado a un creador.
   */
  async create(creadorId: string, data: { nombre: string; descripcion?: string; colorHex?: string; icono?: string }) {
    return this.prisma.grupo.create({
      data: { ...data, creadorId },
    });
  }

  /**
   * Actualiza la información de un grupo validando la autoría del mismo.
   */
  async update(id: string, creadorId: string, data: { nombre?: string; descripcion?: string; colorHex?: string; icono?: string }) {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    if (grupo.creadorId !== creadorId) throw new ForbiddenException('No tienes permiso para editar este grupo');
    return this.prisma.grupo.update({ where: { id }, data });
  }

  /**
   * Elimina un grupo permanentemente.
   */
  async remove(id: string, creadorId: string) {
    const grupo = await this.prisma.grupo.findUnique({ where: { id } });
    if (!grupo) throw new NotFoundException('Grupo no encontrado');
    if (grupo.creadorId !== creadorId) throw new ForbiddenException('No tienes permiso para eliminar este grupo');
    return this.prisma.grupo.delete({ where: { id } });
  }
}
