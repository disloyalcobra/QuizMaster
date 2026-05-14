import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GruposService } from './grupos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * GruposController: Gestiona las peticiones relacionadas con la organización de alumnos.
 * Todas las rutas están protegidas por JWT.
 */
@UseGuards(JwtAuthGuard)
@Controller('grupos')
export class GruposController {
  constructor(private gruposService: GruposService) {}

  /**
   * GET /grupos: Lista los grupos del creador logueado.
   */
  @Get()
  findAll(@Request() req) {
    return this.gruposService.findAll(req.user.id);
  }

  /**
   * GET /grupos/:id: Detalle de un grupo y sus quizzes.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gruposService.findOne(id);
  }

  /**
   * POST /grupos: Crea un nuevo grupo.
   */
  @Post()
  create(@Body() body: { nombre: string; descripcion?: string; colorHex?: string; icono?: string }, @Request() req) {
    return this.gruposService.create(req.user.id, body);
  }

  /**
   * PUT /grupos/:id: Actualiza la información de un grupo.
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() body: { nombre?: string; descripcion?: string; colorHex?: string; icono?: string }, @Request() req) {
    return this.gruposService.update(id, req.user.id, body);
  }

  /**
   * DELETE /grupos/:id: Elimina un grupo.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.gruposService.remove(id, req.user.id);
  }
}
