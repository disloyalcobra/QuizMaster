import { IsString, IsOptional, IsBoolean, IsUUID, IsEnum } from 'class-validator';

export enum EstadoQuiz {
  BORRADOR = 'borrador',
  PUBLICADO = 'publicado',
  ARCHIVADO = 'archivado',
}

/**
 * CreateQuizDto: Requerimientos mínimos para crear un nuevo cuestionario.
 */
export class CreateQuizDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  grupoId?: string;

  @IsOptional()
  @IsString()
  publicUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(EstadoQuiz)
  estado?: EstadoQuiz;

  @IsOptional()
  @IsString()
  musicaUrl?: string;

  @IsOptional()
  @IsString()
  imagenPortada?: string;

  @IsOptional()
  etiquetas?: string[]; // IDs de las etiquetas asociadas
}

/**
 * UpdateQuizDto: Permite actualización parcial de un quiz.
 * TODOS los campos son opcionales para permitir PATCHs como cambiar solo el grupoId.
 */
export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  grupoId?: string;

  @IsOptional()
  @IsString()
  publicUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsEnum(EstadoQuiz)
  estado?: EstadoQuiz;

  @IsOptional()
  @IsString()
  musicaUrl?: string;

  @IsOptional()
  @IsString()
  imagenPortada?: string;

  @IsOptional()
  etiquetas?: string[];
}

/**
 * CreatePreguntaDto: Define la estructura de una pregunta y sus opciones.
 */
export class CreatePreguntaDto {
  @IsString()
  texto: string;

  @IsString()
  tipoPregunta: string; // Ej: multiple, multi_select, verdadero_falso, abierta

  @IsOptional()
  orden?: number;

  @IsOptional()
  tiempoLimite?: number;

  @IsOptional()
  puntosValor?: number;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  explicacion?: string;

  @IsOptional()
  respuestas?: CreateRespuestaDto[];
}

/**
 * SyncPreguntaDto: Usado para el guardado masivo. 
 * Incluye un ID opcional para decidir si actualizar o crear.
 */
export class SyncPreguntaDto extends CreatePreguntaDto {
  @IsOptional()
  @IsUUID()
  id?: string;
}

/**
 * CreateRespuestaDto: Describe una opción de respuesta.
 */
export class CreateRespuestaDto {
  @IsString()
  texto: string;

  @IsOptional()
  @IsBoolean()
  esCorrecta?: boolean;

  @IsOptional()
  orden?: number;

  @IsOptional()
  @IsString()
  color?: string;
}
