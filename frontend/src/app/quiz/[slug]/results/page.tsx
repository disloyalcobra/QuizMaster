"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { quizzesApi, type Intento } from "@/lib/api";
import { motion } from "framer-motion";
import {
  Trophy,
  Target,
  Clock,
  RotateCcw,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function QuizResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const intentoId = searchParams.get("intento");

  const [intento, setIntento] = useState<Intento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!intentoId) {
      setError("No se encontró el intento.");
      setLoading(false);
      return;
    }

    // Obtener detalles del intento
    quizzesApi
      .getIntento(intentoId)
      .then((data) => {
        setIntento(data);
        setLoading(false);
      })
      .catch(() => {
        setError("No se pudieron cargar los resultados.");
        setLoading(false);
      });
  }, [intentoId]);

  const handleRepetir = () => {
    window.location.href = `/quiz/${slug}`;
  };

  const handleVolver = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4" />
          <p className="text-white/70 text-lg font-medium">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (error || !intento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
          <p className="text-white/60">{error || "No se encontraron los resultados."}</p>
          <button
            onClick={handleVolver}
            className="mt-6 bg-white text-purple-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas
  const respuestas = intento.respuestas || [];
  const totalPreguntas = respuestas.length;
  const correctas = respuestas.filter((r) => r.esCorrecta).length;
  const incorrectas = totalPreguntas - correctas;
  const porcentaje = totalPreguntas > 0 ? Math.round((correctas / totalPreguntas) * 100) : 0;

  // Determinar mensaje y color según el puntaje
  let mensaje = "";
  let colorTheme = "";
  if (porcentaje >= 80) {
    mensaje = "¡Excelente trabajo! 🎉";
    colorTheme = "from-green-500 to-emerald-600";
  } else if (porcentaje >= 60) {
    mensaje = "¡Buen trabajo! 👍";
    colorTheme = "from-blue-500 to-indigo-600";
  } else if (porcentaje >= 40) {
    mensaje = "Sigue practicando 💪";
    colorTheme = "from-yellow-500 to-orange-600";
  } else {
    mensaje = "No te rindas, sigue intentando 🌟";
    colorTheme = "from-red-500 to-pink-600";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Tarjeta principal de resultados */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 mb-6 text-center"
        >
          {/* Icono de trofeo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${colorTheme} flex items-center justify-center shadow-2xl`}
          >
            <Trophy size={48} className="text-white" />
          </motion.div>

          {/* Título y mensaje */}
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            ¡Quiz completado!
          </h1>
          <p className="text-xl text-white/80 font-medium mb-6">{mensaje}</p>

          {/* Puntaje grande */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="text-6xl md:text-7xl font-black text-white mb-2">
              {intento.puntajeTotal}
            </div>
            <p className="text-white/60 font-medium">puntos totales</p>
          </motion.div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target size={20} className="text-blue-400" />
                <span className="text-white/60 text-sm">Precisión</span>
              </div>
              <p className="text-2xl font-bold text-white">{porcentaje}%</p>
            </div>

            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-white/60 text-sm">Correctas</span>
              </div>
              <p className="text-2xl font-bold text-white">{correctas}</p>
            </div>

            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle size={20} className="text-red-400" />
                <span className="text-white/60 text-sm">Incorrectas</span>
              </div>
              <p className="text-2xl font-bold text-white">{incorrectas}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleRepetir}
              className="flex-1 bg-white hover:bg-gray-100 text-purple-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-xl"
            >
              <RotateCcw size={20} />
              Intentar de nuevo
            </button>
            <button
              onClick={handleVolver}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/20"
            >
              <Home size={20} />
              Volver al inicio
            </button>
          </div>
        </motion.div>

        {/* Detalle de respuestas */}
        {respuestas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={24} className="text-blue-400" />
              Revisión de respuestas
            </h2>

            <div className="space-y-3">
              {respuestas.map((respuesta, index) => (
                <div
                  key={respuesta.id}
                  className={`p-4 rounded-xl border ${
                    respuesta.esCorrecta
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        respuesta.esCorrecta ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {respuesta.esCorrecta ? (
                        <CheckCircle size={16} className="text-white" />
                      ) : (
                        <XCircle size={16} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm mb-1">
                        Pregunta {index + 1}: {respuesta.pregunta?.texto}
                      </p>
                      <p className="text-white/60 text-xs">
                        Tu respuesta: {respuesta.respuesta?.texto || respuesta.textoAbierta || "Sin respuesta"}
                      </p>
                      {!respuesta.esCorrecta && respuesta.pregunta?.respuestas && (
                        <p className="text-green-400 text-xs mt-1">
                          Correcta: {respuesta.pregunta.respuestas.find((r) => r.esCorrecta)?.texto}
                        </p>
                      )}
                      {respuesta.pregunta?.explicacion && (
                        <p className="text-blue-300 text-xs mt-2 bg-blue-500/10 p-2 rounded-lg">
                          💡 {respuesta.pregunta.explicacion}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-lg font-bold ${
                          respuesta.esCorrecta ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {respuesta.esCorrecta ? `+${respuesta.puntosObtenidos}` : "0"}
                      </span>
                      <p className="text-white/40 text-xs">pts</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
