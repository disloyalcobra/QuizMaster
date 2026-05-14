import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * EtiquetasService: Gestión de categorías temáticas para los quizzes.
 * Permite clasificar el contenido de forma transversal.
 */
@Injectable()
export class EtiquetasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todas las etiquetas registradas junto con el conteo de quizzes que las usan.
   */
  async findAll() {
    return this.prisma.etiqueta.findMany({
      include: { _count: { select: { quizzes: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Crea una nueva etiqueta (Ej: "Matemáticas", "Ciencia").
   */
  async create(data: { nombre: string; colorHex?: string }) {
    return this.prisma.etiqueta.create({ data });
  }

  /**
   * Modifica una etiqueta existente.
   */
  async update(id: string, data: { nombre?: string; colorHex?: string }) {
    const etiqueta = await this.prisma.etiqueta.findUnique({ where: { id } });
    if (!etiqueta) throw new NotFoundException('Etiqueta no encontrada');
    return this.prisma.etiqueta.update({ where: { id }, data });
  }

  /**
   * Elimina una etiqueta del sistema.
   */
  async remove(id: string) {
    const etiqueta = await this.prisma.etiqueta.findUnique({ where: { id } });
    if (!etiqueta) throw new NotFoundException('Etiqueta no encontrada');
    return this.prisma.etiqueta.delete({ where: { id } });
  }
}
