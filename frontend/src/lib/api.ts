/**
 * API Client: Centraliza todas las llamadas al backend de QuizMaster Pro.
 * Configura automáticamente la URL base y gestiona la autenticación vía tokens JWT.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Recupera el token de acceso del almacenamiento local del navegador.
 * Incluye un pequeño script de migración para compatibilidad con versiones anteriores del proyecto.
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Lógica de migración: mueve tokens antiguos a la nueva estructura de llaves
  const oldToken = localStorage.getItem('quizmaster_token');
  if (oldToken) {
    localStorage.setItem('qm_token', oldToken);
    localStorage.removeItem('quizmaster_token');
    const oldUser = localStorage.getItem('quizmaster_user');
    if (oldUser) {
      localStorage.setItem('qm_user', oldUser);
      localStorage.removeItem('quizmaster_user');
    }
  }
  return localStorage.getItem('qm_token');
}

/**
 * Genera las cabeceras HTTP estándar para todas las peticiones.
 * Añade el Bearer Token si el usuario ha iniciado sesión.
 */
function authHeaders(): HeadersInit {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

/**
 * Función genérica de petición HTTP.
 * Encapsula el manejo de errores y la serialización JSON.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── MÓDULO DE AUTENTICACIÓN ──────────────────────────────────────────────
export const authApi = {
  // Crea una cuenta de creador
  register: (data: { nombre: string; email: string; password: string }) =>
    request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // Valida credenciales y otorga token
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // Obtiene datos del usuario actual
  me: () => request<User>('/auth/me'),
};

// ── MÓDULO DE CUESTIONARIOS (QUIZZES) ────────────────────────────────────
export const quizzesApi = {
  // Administrador/Creador
  getAll: () => request<Quiz[]>('/quizzes'),
  getOne: (id: string) => request<Quiz>(`/quizzes/${id}`),
  getStats: (id: string) => request<QuizStats>(`/quizzes/${id}/stats`),
  getGlobalStats: () => request<GlobalStats>('/quizzes/stats/global'),
  create: (data: Partial<Quiz>) =>
    request<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Quiz>) =>
    request<Quiz>(`/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/quizzes/${id}`, { method: 'DELETE' }),
  duplicate: (id: string) =>
    request<Quiz>(`/quizzes/${id}/duplicate`, { method: 'POST' }),

  // Estudiante / Público
  getBySlug: (slug: string) => request<Quiz>(`/quizzes/public/${slug}`),
  getIntento: (intentoId: string) => request<Intento>(`/quizzes/intentos/${intentoId}`),
  createIntento: (slug: string, data: { nombreCompleto: string; modo: string; quizId: string }) =>
    request<Intento>(`/quizzes/public/${slug}/intento`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  submitRespuesta: (intentoId: string, data: object) =>
    request<void>(`/quizzes/intentos/${intentoId}/respuesta`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  finalizar: (intentoId: string, data: { tiempoTotalSeg: number }) =>
    request<Intento>(`/quizzes/intentos/${intentoId}/finalizar`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Gestión de Preguntas
  addPregunta: (quizId: string, data: object) =>
    request<Pregunta>(`/quizzes/${quizId}/preguntas`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePregunta: (preguntaId: string, data: object) =>
    request<Pregunta>(`/quizzes/preguntas/${preguntaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  removePregunta: (preguntaId: string) =>
    request<void>(`/quizzes/preguntas/${preguntaId}`, { method: 'DELETE' }),
  syncPreguntas: (quizId: string, data: object[]) =>
    request<Pregunta[]>(`/quizzes/${quizId}/preguntas/sync`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── MÓDULO DE GRUPOS ───────────────────────────────────────────────────
export const gruposApi = {
  getAll: () => request<Grupo[]>('/grupos'),
  create: (data: { nombre: string; descripcion?: string; colorHex?: string; icono?: string }) =>
    request<Grupo>('/grupos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) =>
    request<Grupo>(`/grupos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/grupos/${id}`, { method: 'DELETE' }),
};

// ── MÓDULO DE ETIQUETAS ────────────────────────────────────────────────
export const etiquetasApi = {
  getAll: () => request<Etiqueta[]>('/etiquetas'),
  create: (data: { nombre: string; colorHex?: string }) =>
    request<Etiqueta>('/etiquetas', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: object) =>
    request<Etiqueta>(`/etiquetas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) => request<void>(`/etiquetas/${id}`, { method: 'DELETE' }),
};

// ── MÓDULO DE MULTIMEDIA ───────────────────────────────────────────────
export const mediaApi = {
  /**
   * Sube un archivo binario mediante FormData.
   * Admite imágenes de perfil, portadas y audios MP3.
   */
  upload: async (file: File, folder?: string): Promise<{ url: string; success: boolean }> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json();
  },
};

// ── MÓDULO DE USUARIOS ────────────────────────────────────────────────
export const usersApi = {
  // Actualiza datos del perfil actual (ej: avatar)
  updateMe: (data: { avatarUrl?: string }) =>
    request<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  // Admin: Obtener todos los usuarios
  getAll: () => request<User[]>('/users'),
  // Admin: Crear nuevo usuario
  create: (data: { nombre: string; email: string; password: string; rol?: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  // Admin: Actualizar usuario
  update: (id: string, data: Partial<User>) =>
    request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  // Admin: Eliminar usuario
  remove: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
};

// ── MÓDULO DE IA ──────────────────────────────────────────────────────
export const aiApi = {
  /**
   * Genera un cuestionario mediante Ollama (IA local).
   * Acepta un prompt de texto y el número de preguntas deseado.
   */
  generateQuiz: async (
    opts: {
      prompt: string;
      numPreguntas?: number;
    },
    signal?: AbortSignal
  ): Promise<{ preguntas: any[] }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qm_token') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/ai/generate-quiz`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prompt: opts.prompt,
        numPreguntas: opts.numPreguntas ?? 5,
      }),
      signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as any).message || `HTTP ${res.status}`);
    }

    return res.json();
  },
};

// ── INTERFACES DE DATOS (MODELOS) ──────────────────────────────────────
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  avatarUrl?: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  descripcion?: string;
  colorHex?: string;
  icono?: string;
  _count?: { quizzes: number };
  quizzes?: Quiz[];
}

export interface Etiqueta {
  id: string;
  nombre: string;
  colorHex?: string;
  _count?: { quizzes: number };
}

export interface Respuesta {
  id: string;
  texto: string;
  esCorrecta?: boolean;
  orden: number;
  color?: string;
}

export interface Pregunta {
  id: string;
  texto: string;
  tipoPregunta: string;
  orden: number;
  tiempoLimite: number;
  puntosValor: number;
  imagenUrl?: string;
  explicacion?: string;
  respuestas: Respuesta[];
}

export interface Quiz {
  [key: string]: any; // Permite acceder a llaves dinámicas para compatibilidad con DTOs
  id: string;
  titulo: string;
  descripcion?: string;
  publicUrl: string;
  isPublic: boolean;
  estado: 'borrador' | 'publicado' | 'archivado';
  musicaUrl?: string;
  imagenPortada?: string;
  creadoEn: string;
  actualizadoEn: string;
  grupo?: Grupo;
  etiquetas?: { etiqueta: Etiqueta }[];
  preguntas?: Pregunta[];
  _count?: { intentos: number; preguntas: number };
}

export interface Intento {
  id: string;
  quizId: string;
  nombreCompleto: string;
  puntajeTotal: number;
  modo: string;
  completado: boolean;
  fecha: string;
  respuestas?: IntentRespuesta[];
}

interface IntentRespuesta {
  id: string;
  preguntaId: string;
  respuestaId?: string;
  esCorrecta: boolean;
  puntosObtenidos: number;
  tiempoRespuestaMs?: number;
  pregunta?: Pregunta;
  respuesta?: Respuesta;
}

export interface QuizStats {
  totalIntentos: number;
  avgScore: number;
  uniqueStudents: number;
  intentos: Intento[];
}

export interface GlobalStats {
  totalQuizzes: number;
  totalIntentos: number;
  avgScore: number;
  uniqueStudents: number;
}
