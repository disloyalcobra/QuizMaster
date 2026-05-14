import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, UpdateQuizDto, CreatePreguntaDto, SyncPreguntaDto } from './quizzes.dto';

/**
 * Función Auxiliar: Genera un "slug" único para las URLs públicas.
 * Transforma un título en un formato amigable para URL (ej: "Mi Quiz" -> "mi-quiz-ab12c")
 */
function generateSlug(titulo: string): string {
  return (
    titulo
      .toLowerCase()
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e')
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() +
    '-' +
    Math.random().toString(36).slice(2, 7)
  );
}

/**
 * QuizzesService: Lógica de negocio principal para la gestión de cuestionarios.
 * Maneja el CRUD de quizzes, preguntas y el procesamiento de intentos.
 */
@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los quizzes de un autor específico.
   */
  async findAll(autorId: string) {
    return this.prisma.quiz.findMany({
      where: { autorId },
      include: {
        grupo: true,
        etiquetas: { include: { etiqueta: true } },
        _count: { select: { intentos: true, preguntas: true } },
      },
      orderBy: { actualizadoEn: 'desc' },
    });
  }

  /**
   * Busca un Quiz por su ID único incluyendo sus preguntas y etiquetas.
   */
  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        grupo: true,
        etiquetas: { include: { etiqueta: true } },
        preguntas: {
          include: { respuestas: { orderBy: { orden: 'asc' } } },
          orderBy: { orden: 'asc' },
        },
        _count: { select: { intentos: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    return quiz;
  }

  /**
   * Versión pública: Busca un Quiz por su URL (slug).
   * Oculta las respuestas correctas para proteger la integridad del examen.
   */
  async findBySlug(slug: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { publicUrl: slug },
      include: {
        preguntas: {
          include: { respuestas: { orderBy: { orden: 'asc' } } },
          orderBy: { orden: 'asc' },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    if (!quiz.isPublic && quiz.estado !== 'publicado') {
      throw new ForbiddenException('Este quiz no está disponible públicamente');
    }
    
    // Filtramos los datos sensibles (respuestas correctas) antes de enviar al cliente público
    return {
      ...quiz,
      preguntas: quiz.preguntas.map((p) => ({
        ...p,
        respuestas: p.respuestas.map((r) => ({
          id: r.id,
          texto: r.texto,
          orden: r.orden,
          color: r.color,
        })),
      })),
    };
  }

  /**
   * Crea un nuevo Quiz en la base de datos. Genera un slug si no se provee uno.
   */
  async create(autorId: string, dto: CreateQuizDto) {
    const publicUrl = dto.publicUrl || generateSlug(dto.titulo);

    const quiz = await this.prisma.quiz.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        autorId,
        grupoId: dto.grupoId,
        publicUrl,
        isPublic: dto.isPublic ?? false,
        estado: dto.estado ?? 'borrador',
        musicaUrl: dto.musicaUrl,
        imagenPortada: dto.imagenPortada,
        ...(dto.etiquetas?.length
          ? {
              etiquetas: {
                create: dto.etiquetas.map((eid) => ({ etiquetaId: eid })),
              },
            }
          : {}),
      },
      include: {
        grupo: true,
        etiquetas: { include: { etiqueta: true } },
      },
    });
    return quiz;
  }

  /**
   * Actualiza la información básica y las etiquetas de un Quiz.
   */
  async update(id: string, autorId: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    if (quiz.autorId !== autorId) throw new ForbiddenException();

    // Sincronización de etiquetas: borramos las actuales y creamos las nuevas
    if (dto.etiquetas !== undefined) {
      await this.prisma.quizEtiqueta.deleteMany({ where: { quizId: id } });
      if (dto.etiquetas.length > 0) {
        await this.prisma.quizEtiqueta.createMany({
          data: dto.etiquetas.map((eid) => ({ quizId: id, etiquetaId: eid })),
        });
      }
    }

    const { etiquetas, ...updateData } = dto;
    return this.prisma.quiz.update({
      where: { id },
      data: updateData,
      include: {
        grupo: true,
        etiquetas: { include: { etiqueta: true } },
        preguntas: { include: { respuestas: true }, orderBy: { orden: 'asc' } },
      },
    });
  }

  async remove(id: string, autorId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    if (quiz.autorId !== autorId) throw new ForbiddenException();
    return this.prisma.quiz.delete({ where: { id } });
  }

  async duplicate(id: string, autorId: string) {
    const original = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        preguntas: { include: { respuestas: true } },
        etiquetas: true,
      },
    });
    if (!original) throw new NotFoundException('Quiz no encontrado');

    const newQuiz = await this.prisma.quiz.create({
      data: {
        titulo: `${original.titulo} (copia)`,
        descripcion: original.descripcion,
        autorId,
        grupoId: original.grupoId,
        publicUrl: generateSlug(`${original.titulo} copia`),
        isPublic: false,
        estado: 'borrador',
        musicaUrl: original.musicaUrl,
        imagenPortada: original.imagenPortada,
        preguntas: {
          create: original.preguntas.map((p) => ({
            texto: p.texto,
            tipoPregunta: p.tipoPregunta,
            orden: p.orden,
            tiempoLimite: p.tiempoLimite,
            puntosValor: p.puntosValor,
            imagenUrl: p.imagenUrl,
            explicacion: p.explicacion,
            respuestas: {
              create: p.respuestas.map((r) => ({
                texto: r.texto,
                esCorrecta: r.esCorrecta,
                orden: r.orden,
                color: r.color,
              })),
            },
          })),
        },
      },
    });
    return newQuiz;
  }

  // ── Preguntas ──────────────────────────────────────────────────────────

  async addPregunta(quizId: string, autorId: string, dto: CreatePreguntaDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    if (quiz.autorId !== autorId) throw new ForbiddenException();

    const count = await this.prisma.pregunta.count({ where: { quizId } });

    return this.prisma.pregunta.create({
      data: {
        quizId,
        texto: dto.texto,
        tipoPregunta: dto.tipoPregunta,
        orden: dto.orden ?? count + 1,
        tiempoLimite: dto.tiempoLimite ?? 20,
        puntosValor: dto.puntosValor ?? 100,
        imagenUrl: dto.imagenUrl,
        explicacion: dto.explicacion,
        ...(dto.respuestas?.length
          ? {
              respuestas: {
                create: dto.respuestas.map((r, i) => ({
                  texto: r.texto,
                  esCorrecta: r.esCorrecta ?? false,
                  orden: r.orden ?? i + 1,
                  color: r.color,
                })),
              },
            }
          : {}),
      },
      include: { respuestas: { orderBy: { orden: 'asc' } } },
    });
  }

  async updatePregunta(preguntaId: string, autorId: string, dto: CreatePreguntaDto) {
    const pregunta = await this.prisma.pregunta.findUnique({
      where: { id: preguntaId },
      include: { quiz: true },
    });
    if (!pregunta) throw new NotFoundException('Pregunta no encontrada');
    if (pregunta.quiz.autorId !== autorId) throw new ForbiddenException();

    const { respuestas, ...preguntaData } = dto;

    if (respuestas !== undefined) {
      await this.prisma.respuesta.deleteMany({ where: { preguntaId } });
      if (respuestas.length > 0) {
        await this.prisma.respuesta.createMany({
          data: respuestas.map((r, i) => ({
            preguntaId,
            texto: r.texto,
            esCorrecta: r.esCorrecta ?? false,
            orden: r.orden ?? i + 1,
            color: r.color,
          })),
        });
      }
    }

    return this.prisma.pregunta.update({
      where: { id: preguntaId },
      data: preguntaData,
      include: { respuestas: { orderBy: { orden: 'asc' } } },
    });
  }

  /**
   * Sincroniza múltiples preguntas a la vez (Guardado Masivo).
   * Crea preguntas nuevas y actualiza las existentes en una sola transacción.
   */
  async syncPreguntas(quizId: string, autorId: string, dtos: any[]) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    if (quiz.autorId !== autorId) throw new ForbiddenException();

    // Usamos una transacción para asegurar integridad total
    return this.prisma.$transaction(async (tx) => {
      const resultados: any[] = [];

      for (const dto of dtos) {
        const { id, respuestas, ...preguntaData } = dto;

        if (id) {
          // ACTUALIZAR PREGUNTA EXISTENTE
          // 1. Sincronizar respuestas (borrar y recrear es lo más seguro para bulk)
          if (respuestas !== undefined) {
            await tx.respuesta.deleteMany({ where: { preguntaId: id } });
            if (respuestas.length > 0) {
              await tx.respuesta.createMany({
                data: respuestas.map((r, i) => ({
                  preguntaId: id,
                  texto: r.texto,
                  esCorrecta: r.esCorrecta ?? false,
                  orden: r.orden ?? i + 1,
                  color: r.color,
                })),
              });
            }
          }

          // 2. Actualizar metadata de la pregunta
          const updated = await tx.pregunta.update({
            where: { id },
            data: preguntaData,
            include: { respuestas: { orderBy: { orden: 'asc' } } },
          });
          resultados.push(updated);
        } else {
          // CREAR NUEVA PREGUNTA
          const created = await tx.pregunta.create({
            data: {
              quizId,
              ...preguntaData,
              respuestas: {
                create: (respuestas || []).map((r, i) => ({
                  texto: r.texto,
                  esCorrecta: r.esCorrecta ?? false,
                  orden: r.orden ?? i + 1,
                  color: r.color,
                })),
              },
            },
            include: { respuestas: { orderBy: { orden: 'asc' } } },
          });
          resultados.push(created);
        }
      }

      return resultados;
    });
  }

  async removePregunta(preguntaId: string, autorId: string) {
    const pregunta = await this.prisma.pregunta.findUnique({
      where: { id: preguntaId },
      include: { quiz: true },
    });
    if (!pregunta) throw new NotFoundException('Pregunta no encontrada');
    if (pregunta.quiz.autorId !== autorId) throw new ForbiddenException();
    return this.prisma.pregunta.delete({ where: { id: preguntaId } });
  }

  // ── Analytics ──────────────────────────────────────────────────────────

  async getStats(quizId: string, autorId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');
    if (quiz.autorId !== autorId) throw new ForbiddenException();

    const intentos = await this.prisma.intento.findMany({
      where: { quizId, completado: true },
      include: {
        respuestas: { include: { pregunta: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const totalIntentos = intentos.length;
    const avgScore =
      totalIntentos > 0
        ? Math.round(intentos.reduce((a, i) => a + (i.puntajeTotal ?? 0), 0) / totalIntentos)
        : 0;

    const uniqueStudents = new Set(intentos.map((i) => i.nombreCompleto)).size;

    return {
      totalIntentos,
      avgScore,
      uniqueStudents,
      intentos: intentos.map((i) => ({
        id: i.id,
        nombreCompleto: i.nombreCompleto,
        puntajeTotal: i.puntajeTotal,
        fecha: i.fecha,
        tiempoTotalSeg: i.tiempoTotalSeg,
        modo: i.modo,
      })),
    };
  }

  // ── Intentos público ───────────────────────────────────────────────────

  async createIntento(quizId: string, nombreCompleto: string, modo: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz no encontrado');

    const ultimoIntento = await this.prisma.intento.findFirst({
      where: { quizId, nombreCompleto },
      orderBy: { numeroIntento: 'desc' },
    });

    return this.prisma.intento.create({
      data: {
        quizId,
        nombreCompleto,
        modo,
        numeroIntento: (ultimoIntento?.numeroIntento ?? 0) + 1,
      },
    });
  }

  async submitRespuesta(
    intentoId: string,
    preguntaId: string,
    respuestaId: string | null,
    textoAbierta: string | null,
    tiempoRespuestaMs: number,
  ) {
    // Check if answer is correct
    let esCorrecta = false;
    let puntosObtenidos = 0;

    if (respuestaId) {
      const respuesta = await this.prisma.respuesta.findUnique({ where: { id: respuestaId } });
      const pregunta = await this.prisma.pregunta.findUnique({ where: { id: preguntaId } });
      esCorrecta = respuesta?.esCorrecta ?? false;

      if (esCorrecta && pregunta) {
        // Speed bonus: max points at 1s, decreasing to 50% at time limit
        const tiempoLimitMs = (pregunta.tiempoLimite ?? 20) * 1000;
        const ratio = Math.max(0, 1 - tiempoRespuestaMs / tiempoLimitMs);
        puntosObtenidos = Math.round((pregunta.puntosValor ?? 100) * (0.5 + 0.5 * ratio));
      }
    }

    return this.prisma.respuestaIntento.create({
      data: {
        intentoId,
        preguntaId,
        respuestaId,
        textoAbierta,
        esCorrecta,
        tiempoRespuestaMs,
        puntosObtenidos,
      },
    });
  }

  async finalizarIntento(intentoId: string, tiempoTotalSeg: number) {
    const respuestas = await this.prisma.respuestaIntento.findMany({
      where: { intentoId },
    });
    const puntajeTotal = respuestas.reduce((a, r) => a + (r.puntosObtenidos ?? 0), 0);

    return this.prisma.intento.update({
      where: { id: intentoId },
      data: { completado: true, puntajeTotal, tiempoTotalSeg },
      include: {
        respuestas: {
          include: {
            pregunta: { include: { respuestas: true } },
            respuesta: true,
          },
        },
        quiz: { select: { titulo: true, preguntas: { include: { respuestas: true } } } },
      },
    });
  }

  async getIntento(intentoId: string) {
    const intento = await this.prisma.intento.findUnique({
      where: { id: intentoId },
      include: {
        respuestas: {
          include: {
            pregunta: { include: { respuestas: true } },
            respuesta: true,
          },
        },
        quiz: { select: { id: true, titulo: true, publicUrl: true } },
      },
    });
    if (!intento) throw new NotFoundException('Intento no encontrado');
    return intento;
  }

  async getGlobalStats(autorId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { autorId },
      select: { id: true },
    });
    const quizIds = quizzes.map((q) => q.id);

    const [totalQuizzes, totalIntentos, avgScoreAgg] = await Promise.all([
      this.prisma.quiz.count({ where: { autorId } }),
      this.prisma.intento.count({ where: { quizId: { in: quizIds }, completado: true } }),
      this.prisma.intento.aggregate({
        where: { quizId: { in: quizIds }, completado: true },
        _avg: { puntajeTotal: true },
      }),
    ]);

    const uniqueStudents = await this.prisma.intento.findMany({
      where: { quizId: { in: quizIds }, completado: true },
      select: { nombreCompleto: true },
      distinct: ['nombreCompleto'],
    });

    return {
      totalQuizzes,
      totalIntentos,
      avgScore: Math.round(avgScoreAgg._avg.puntajeTotal ?? 0),
      uniqueStudents: uniqueStudents.length,
    };
  }
}
