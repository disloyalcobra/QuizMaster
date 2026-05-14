"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { quizzesApi, type Quiz } from "@/lib/api";
import { Play, Clock, Users, ChevronRight, BookOpen } from "lucide-react";

type Modo = "normal" | "estudio";

export default function QuizLobbyPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [modo, setModo] = useState<Modo>("normal");
  const [starting, setStarting] = useState(false);
  const [intentoId, setIntentoId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    quizzesApi.getBySlug(slug)
      .then(setQuiz)
      .catch(() => setError("Quiz no encontrado o no disponible."))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleStart = async () => {
    if (!nombre.trim() || !quiz) return;
    setStarting(true);
    try {
      const intento = await quizzesApi.createIntento(slug, {
        nombreCompleto: nombre.trim(),
        modo,
        quizId: quiz.id,
      });
      setIntentoId(intento.id);
      // Redirigir al modo de juego
      window.location.href = `/quiz/${slug}/play?intento=${intento.id}&modo=${modo}`;
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-white" />
    </div>
  );

  if (error || !quiz) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-white mb-2">Quiz no disponible</h1>
        <p className="text-white/60">{error ?? "Este quiz no existe o no está publicado."}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Header del quiz */}
        <div className="text-center mb-8">
          {quiz.imagenPortada ? (
            <img src={quiz.imagenPortada} alt={quiz.titulo} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          ) : (
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen size={36} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{quiz.titulo}</h1>
          {quiz.descripcion && <p className="text-white/60 text-sm">{quiz.descripcion}</p>}

          <div className="flex items-center justify-center gap-4 mt-4 text-white/70 text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />{quiz.preguntas?.length ?? quiz._count?.preguntas ?? "?"} preguntas
            </span>
            {quiz.grupo && (
              <span className="flex items-center gap-1.5"><Users size={14} />{quiz.grupo.nombre}</span>
            )}
          </div>
        </div>

        {/* Formulario de inicio */}
        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-sm font-bold text-white/80 mb-2 block">Tu nombre completo</label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Escribe tu nombre..."
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-2xl px-4 py-3 font-medium focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
            />
          </div>

          <input type="hidden" value={modo} />
          {/* Botón de inicio */}
          <button
            onClick={handleStart}
            disabled={!nombre.trim() || starting}
            className="w-full bg-white hover:bg-gray-100 text-purple-700 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
          >
            {starting ? (
              <div className="w-5 h-5 border-2 border-purple-600/40 border-t-purple-700 rounded-full animate-spin" />
            ) : (
              <><Play size={20} fill="currentColor" /> ¡Comenzar!</>
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6 font-medium">
          Sin registro necesario · Solo tu nombre
        </p>
      </div>
    </div>
  );
}
