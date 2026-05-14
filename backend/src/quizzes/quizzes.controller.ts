import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, CreatePreguntaDto, SyncPreguntaDto } from './quizzes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * QuizzesController: Puntos de entrada para la gestión de cuestionarios.
 * Divide las rutas en Protegidas (Creadores), Preguntas (Edición) y Públicas (Estudiantes).
 */
@Controller('quizzes')
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  // ── RUTAS PROTEGIDAS (CREADORES) ────────────────────────────────────

  /**
   * GET /quizzes: Lista todos los quizzes creados por el usuario logueado.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    return this.quizzesService.findAll(req.user.id);
  }

  /**
   * GET /quizzes/stats/global: Obtiene estadísticas agregadas de todos los quizzes del autor.
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats/global')
  getGlobalStats(@Request() req) {
    return this.quizzesService.getGlobalStats(req.user.id);
  }

  /**
   * GET /quizzes/:id: Obtiene el detalle completo de un quiz específico (incluye preguntas).
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizzesService.findOne(id);
  }

  /**
   * GET /quizzes/:id/stats: Obtiene analíticas detalladas de los intentos para un quiz puntual.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id/stats')
  getStats(@Param('id') id: string, @Request() req) {
    return this.quizzesService.getStats(id, req.user.id);
  }

  /**
   * POST /quizzes: Crea un nuevo borrador de cuestionario.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateQuizDto, @Request() req) {
    return this.quizzesService.create(req.user.id, dto);
  }

  /**
   * PUT /quizzes/:id: Actualiza la metadata o etiquetas de un cuestionario.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto, @Request() req) {
    return this.quizzesService.update(id, req.user.id, dto);
  }

  /**
   * DELETE /quizzes/:id: Elimina un cuestionario permanentemente.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.quizzesService.remove(id, req.user.id);
  }

  /**
   * POST /quizzes/:id/duplicate: Crea una copia exacta de un quiz existente.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Request() req) {
    return this.quizzesService.duplicate(id, req.user.id);
  }

  // ── PREGUNTAS (EDICIÓN) ──────────────────────────────────────────

  /**
   * POST /quizzes/:quizId/preguntas: Añade una nueva pregunta a un quiz.
   */
  @UseGuards(JwtAuthGuard)
  @Post(':quizId/preguntas')
  addPregunta(
    @Param('quizId') quizId: string,
    @Body() dto: CreatePreguntaDto,
    @Request() req,
  ) {
    return this.quizzesService.addPregunta(quizId, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':quizId/preguntas/sync')
  syncPreguntas(
    @Param('quizId') quizId: string,
    @Body() dtos: SyncPreguntaDto[],
    @Request() req,
  ) {
    return this.quizzesService.syncPreguntas(quizId, req.user.id, dtos);
  }

  /**
   * PUT /quizzes/preguntas/:preguntaId: Modifica el texto o respuestas de una pregunta.
   */
  @UseGuards(JwtAuthGuard)
  @Put('preguntas/:preguntaId')
  updatePregunta(
    @Param('preguntaId') preguntaId: string,
    @Body() dto: CreatePreguntaDto,
    @Request() req,
  ) {
    return this.quizzesService.updatePregunta(preguntaId, req.user.id, dto);
  }

  /**
   * DELETE /quizzes/preguntas/:preguntaId: Elimina una pregunta de un quiz.
   */
  @UseGuards(JwtAuthGuard)
  @Delete('preguntas/:preguntaId')
  removePregunta(@Param('preguntaId') preguntaId: string, @Request() req) {
    return this.quizzesService.removePregunta(preguntaId, req.user.id);
  }

  // ── RUTAS PÚBLICAS (ESTUDIANTES) ────────────────────────────────────

  /**
   * GET /quizzes/public/:slug: Busca un quiz por su URL amigable (para responder).
   */
  @Get('public/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.quizzesService.findBySlug(slug);
  }

  /**
   * POST /quizzes/public/:slug/intento: Inicia una sesión de examen para un estudiante.
   */
  @Post('public/:slug/intento')
  createIntento(
    @Param('slug') slug: string,
    @Body() body: { nombreCompleto: string; modo: string; quizId: string },
  ) {
    return this.quizzesService.createIntento(body.quizId, body.nombreCompleto, body.modo);
  }

  /**
   * PATCH /quizzes/intentos/:intentoId/respuesta: Registra la respuesta a una pregunta individual.
   */
  @Patch('intentos/:intentoId/respuesta')
  submitRespuesta(
    @Param('intentoId') intentoId: string,
    @Body()
    body: {
      preguntaId: string;
      respuestaId?: string;
      textoAbierta?: string;
      tiempoRespuestaMs: number;
    },
  ) {
    return this.quizzesService.submitRespuesta(
      intentoId,
      body.preguntaId,
      body.respuestaId ?? null,
      body.textoAbierta ?? null,
      body.tiempoRespuestaMs,
    );
  }

  /**
   * PATCH /quizzes/intentos/:intentoId/finalizar: Cierra el intento y calcula el puntaje final.
   */
  @Patch('intentos/:intentoId/finalizar')
  finalizarIntento(
    @Param('intentoId') intentoId: string,
    @Body() body: { tiempoTotalSeg: number },
  ) {
    return this.quizzesService.finalizarIntento(intentoId, body.tiempoTotalSeg);
  }

  /**
   * GET /quizzes/intentos/:intentoId: Obtiene los detalles de un intento completado.
   */
  @Get('intentos/:intentoId')
  getIntento(@Param('intentoId') intentoId: string) {
    return this.quizzesService.getIntento(intentoId);
  }
}
