"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { quizzesApi, type Quiz, type Pregunta, type Respuesta } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Volume2,
  VolumeX,
  Trophy,
} from "lucide-react";

// Colores para los botones de respuesta (estilo Kahoot)
const COLORES_RESPUESTA = [
  { bg: "bg-red-500", hover: "hover:bg-red-400", border: "border-red-600", shadow: "shadow-red-900/50" },
  { bg: "bg-blue-500", hover: "hover:bg-blue-400", border: "border-blue-600", shadow: "shadow-blue-900/50" },
  { bg: "bg-green-500", hover: "hover:bg-green-400", border: "border-green-600", shadow: "shadow-green-900/50" },
  { bg: "bg-yellow-500", hover: "hover:bg-yellow-400", border: "border-yellow-600", shadow: "shadow-yellow-900/50" },
];

export default function QuizPlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const intentoId = searchParams.get("intento");
  const modo = (searchParams.get("modo") as "normal" | "estudio") || "normal";

  // Estados del quiz
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados del juego
  const [tiempoRestante, setTiempoRestante] = useState(20);
  const [respondiendo, setRespondiendo] = useState(false);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [mostrandoFeedback, setMostrandoFeedback] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState<boolean | null>(null);
  const [puntaje, setPuntaje] = useState(0);
  const [musicaActivada, setMusicaActivada] = useState(true);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inicioPreguntaRef = useRef<number>(0);

  // Cargar el quiz
  useEffect(() => {
    if (!slug) return;
    quizzesApi
      .getBySlug(slug)
      .then((data) => {
        setQuiz(data);
        const preguntasOrdenadas = (data.preguntas || []).sort((a, b) => a.orden - b.orden);
        setPreguntas(preguntasOrdenadas);
        if (preguntasOrdenadas.length > 0) {
          setTiempoRestante(preguntasOrdenadas[0].tiempoLimite);
        }
        setLoading(false);
        inicioPreguntaRef.current = Date.now();
      })
      .catch(() => {
        setError("No se pudo cargar el quiz.");
        setLoading(false);
      });
  }, [slug]);

  // Musica de fondo
  useEffect(() => {
    if (quiz?.musicaUrl && musicaActivada) {
      audioRef.current = new Audio(quiz.musicaUrl);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => { });
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [quiz?.musicaUrl, musicaActivada]);

  // Cronometro
  useEffect(() => {
    if (loading || mostrandoFeedback || respondiendo) return;

    // Guard clause: ensure we have valid question data
    if (!preguntas[preguntaActual]) return;

    timerRef.current = setInterval(() => {
      setTiempoRestante((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, mostrandoFeedback, respondiendo, preguntaActual, preguntas.length]);

  const handleTimeout = useCallback(() => {
    // Guard: already responding
    if (respondiendo || mostrandoFeedback) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentQuestion = preguntas[preguntaActual];
    if (!currentQuestion) return;

    setRespondiendo(true);

    if (intentoId) {
      const tiempoRespuesta = currentQuestion.tiempoLimite * 1000;
      quizzesApi.submitRespuesta(intentoId, {
        preguntaId: currentQuestion.id,
        tiempoRespuestaMs: tiempoRespuesta,
        // Al faltar respuestaId, se entenderá en BD como no contestada (incorrecta y sin id aportado)
      }).catch(console.error);
    }

    // Avanza de inmediato, sin mostrar la gran pantalla de feedback.
    avanzarSiguiente();
  }, [intentoId, preguntas, preguntaActual, respondiendo, mostrandoFeedback]);

  // Disparar timeout reaccionando al contador en estado puro
  useEffect(() => {
    if (tiempoRestante === 0 && !respondiendo && !mostrandoFeedback) {
      handleTimeout();
    }
  }, [tiempoRestante, respondiendo, mostrandoFeedback, handleTimeout]);

  const handleRespuesta = async (respuesta: Respuesta) => {
    if (respondiendo || mostrandoFeedback) return;

    setRespondiendo(true);
    setRespuestaSeleccionada(respuesta.id);
    if (timerRef.current) clearInterval(timerRef.current);

    const tiempoRespuesta = Date.now() - inicioPreguntaRef.current;
    const correcta = respuesta.esCorrecta || false;
    setEsCorrecta(correcta);
    setMostrandoFeedback(true);

    const pregunta = preguntas[preguntaActual];
    const tiempoLimite = pregunta.tiempoLimite * 1000;
    const factorTiempo = Math.max(0, 1 - tiempoRespuesta / tiempoLimite);
    const puntosObtenidos = correcta ? Math.round(pregunta.puntosValor * (0.5 + 0.5 * factorTiempo)) : 0;

    if (correcta) {
      setPuntaje((prev) => prev + puntosObtenidos);
    }

    if (intentoId) {
      try {
        await quizzesApi.submitRespuesta(intentoId, {
          preguntaId: pregunta.id,
          respuestaId: respuesta.id,
          tiempoRespuestaMs: tiempoRespuesta,
        });
      } catch (e) {
        console.error("Error guardando respuesta:", e);
      }
    }

    setTimeout(() => avanzarSiguiente(), correcta ? 1500 : 2500);
  };

  const avanzarSiguiente = async () => {
    if (preguntaActual < preguntas.length - 1) {
      setPreguntaActual((prev) => prev + 1);
      setTiempoRestante(preguntas[preguntaActual + 1].tiempoLimite);
      setRespondiendo(false);
      setRespuestaSeleccionada(null);
      setMostrandoFeedback(false);
      setEsCorrecta(null);
      inicioPreguntaRef.current = Date.now();
    } else {
      await finalizarQuiz();
    }
  };

  const finalizarQuiz = async () => {
    if (intentoId) {
      const tiempoTotal = Math.floor((Date.now() - inicioPreguntaRef.current) / 1000) +
        preguntas.reduce((acc, p, idx) => idx <= preguntaActual ? acc + p.tiempoLimite : acc, 0);
      try {
        await quizzesApi.finalizar(intentoId, { tiempoTotalSeg: tiempoTotal });
      } catch (e) {
        console.error("Error finalizando quiz:", e);
      }
    }
    // Ensure we navigate even if intentoId is null/undefined
    const targetIntentoId = intentoId || '';
    window.location.href = `/quiz/${slug}/results?intento=${targetIntentoId}`;
  };

  const toggleMusica = () => {
    setMusicaActivada((prev) => !prev);
    if (audioRef.current) {
      musicaActivada ? audioRef.current.pause() : audioRef.current.play().catch(() => { });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4" />
          <p className="text-white/70 text-lg font-medium">Cargando quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-purple-900 rounded-2xl font-bold hover:bg-white/90 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || preguntas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-2">Cargando...</h1>
          <p className="text-white/60">Preparando tu quiz</p>
        </div>
      </div>
    );
  }

  if (!intentoId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-white mb-2">Iniciar Quiz</h1>
          <p className="text-white/60 mb-6">Necesitas iniciar el quiz desde la página principal.</p>
          <a
            href={`/quiz/${slug}`}
            className="inline-block px-6 py-3 bg-white text-purple-900 rounded-2xl font-bold hover:bg-white/90 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const pregunta = preguntas[preguntaActual];
  
  if (!pregunta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Finalizando...</h1>
          <p className="text-white/60">Guardando resultados</p>
        </div>
      </div>
    );
  }

  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col">
      {/* Barra superior */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-white/70 text-xs mb-1">
              <span>Pregunta {preguntaActual + 1} de {preguntas.length}</span>
              <span className="font-bold text-white">{Math.round(progreso)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <Trophy size={18} className="text-yellow-400 mx-auto mb-0.5" />
              <span className="text-white font-bold text-lg">{puntaje}</span>
            </div>
            {quiz.musicaUrl && (
              <button onClick={toggleMusica} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                {musicaActivada ? <Volume2 size={20} className="text-white" /> : <VolumeX size={20} className="text-white/50" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Cronometro */}
      <div className="flex-shrink-0 py-4">
        <div className="flex justify-center">
          <div className="relative">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="none" className="text-white/10" />
              <motion.circle
                cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="none"
                className={tiempoRestante <= 5 ? "text-red-500" : "text-white"}
                strokeLinecap="round"
                strokeDasharray={`${(tiempoRestante / pregunta.tiempoLimite) * 226} 226`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-black ${tiempoRestante <= 5 ? "text-red-400" : "text-white"}`}>
                {tiempoRestante}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={preguntaActual}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
          >
            {/* Pregunta */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-tight">
                {pregunta.texto}
              </h2>
              {pregunta.imagenUrl && (
                <img src={pregunta.imagenUrl} alt="Imagen de la pregunta" className="mt-4 rounded-2xl max-h-48 mx-auto object-cover" />
              )}
            </div>

            {/* Opciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              {pregunta.respuestas.map((respuesta, index) => {
                const colores = COLORES_RESPUESTA[index % COLORES_RESPUESTA.length];
                const seleccionada = respuestaSeleccionada === respuesta.id;
                const mostrarResultado = mostrandoFeedback && seleccionada;
                const esLaCorrecta = mostrandoFeedback && respuesta.esCorrecta;

                return (
                  <motion.button
                    key={respuesta.id}
                    onClick={() => handleRespuesta(respuesta)}
                    disabled={respondiendo}
                    whileHover={!respondiendo ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!respondiendo ? { scale: 0.98 } : {}}
                    className={`
                      relative overflow-hidden rounded-2xl p-6 text-left transition-all
                      ${colores.bg} ${colores.hover} ${colores.shadow} shadow-lg border-2 ${colores.border}
                      ${respondiendo ? "cursor-not-allowed opacity-80" : "cursor-pointer"}
                      ${mostrarResultado && esCorrecta ? "ring-4 ring-green-300" : ""}
                      ${mostrarResultado && !esCorrecta ? "ring-4 ring-red-300" : ""}
                      ${esLaCorrecta && !seleccionada ? "ring-4 ring-green-300 brightness-110" : ""}
                    `}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative flex items-center gap-4">
                      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl font-black text-white">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-lg md:text-xl font-bold text-white leading-tight">{respuesta.texto}</span>
                      {mostrarResultado && esCorrecta && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-white" size={32} />}
                      {mostrarResultado && !esCorrecta && <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-white" size={32} />}
                      {esLaCorrecta && !seleccionada && <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 text-white" size={32} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Overlay de feedback */}
      <AnimatePresence>
        {mostrandoFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50 ${esCorrecta ? "bg-green-500/20" : "bg-red-500/20"}`}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`rounded-3xl p-8 text-center backdrop-blur-xl border-4 ${esCorrecta ? "bg-green-500 border-green-300" : "bg-red-500 border-red-300"}`}
            >
              {esCorrecta ? (
                <>
                  <CheckCircle size={80} className="text-white mx-auto mb-4" />
                  <p className="text-3xl font-black text-white">¡Correcto!</p>
                </>
              ) : (
                <>
                  <XCircle size={80} className="text-white mx-auto mb-4" />
                  <p className="text-3xl font-black text-white">¡Incorrecto!</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
