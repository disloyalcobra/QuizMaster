import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { EtiquetasService } from './etiquetas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * EtiquetasController: Maneja las categorías globales del sistema.
 */
@Controller('etiquetas')
export class EtiquetasController {
  constructor(private etiquetasService: EtiquetasService) {}

  /**
   * GET /etiquetas: Lista todas las etiquetas (acceso público).
   */
  @Get()
  findAll() {
    return this.etiquetasService.findAll();
  }

  /**
   * POST /etiquetas: Crea una nueva etiqueta (requiere login).
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: { nombre: string; colorHex?: string }) {
    return this.etiquetasService.create(body);
  }

  /**
   * PUT /etiquetas/:id: Actualiza una etiqueta.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { nombre?: string; colorHex?: string }) {
    return this.etiquetasService.update(id, body);
  }

  /**
   * DELETE /etiquetas/:id: Elimina una etiqueta.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.etiquetasService.remove(id);
  }
}
