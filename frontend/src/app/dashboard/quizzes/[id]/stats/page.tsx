"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizzesApi, type Quiz, type QuizStats, type Intento } from "@/lib/api";
import {
  ArrowLeft,
  Users,
  Trophy,
  TrendingUp,
  Clock,
  BarChart3,
  Medal,
  Target,
  Calendar,
  Download,
  RotateCcw,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Types
interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: "purple" | "blue" | "green" | "amber" | "red" | "indigo";
  subtitle?: string;
}

const COLORS = {
  purple: "from-purple-500 to-purple-600",
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  amber: "from-amber-500 to-amber-600",
  red: "from-red-500 to-red-600",
  indigo: "from-indigo-500 to-indigo-600",
};

const BG_COLORS = {
  purple: "bg-purple-50 text-purple-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

function StatCard({ label, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", BG_COLORS[color])}>
          <Icon size={20} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// Helper function to calculate score percentage
function calculateScore(intento: Intento, quiz?: Quiz): number {
  if (!intento.respuestas || intento.respuestas.length === 0) return 0;
  const correctas = intento.respuestas.filter(r => r.esCorrecta).length;
  const total = quiz?.preguntas?.length || intento.respuestas.length;
  return total > 0 ? Math.round((correctas / total) * 100) : 0;
}

// Helper function to format time
function formatTime(ms?: number): string {
  if (!ms) return "N/A";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Helper function to calculate average time
function calculateAverageTime(intentos: Intento[]): string {
  const validIntentos = intentos.filter(i => i.respuestas && i.respuestas.length > 0);
  if (validIntentos.length === 0) return "N/A";
  const totalTime = validIntentos.reduce((acc, i) => {
    return acc + (i.respuestas?.reduce((sum, r) => sum + (r.tiempoRespuestaMs || 0), 0) || 0);
  }, 0);
  const avgTime = totalTime / validIntentos.length;
  return formatTime(avgTime);
}

export default function QuizStatsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "questions">("overview");

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [quizData, statsData] = await Promise.all([
        quizzesApi.getOne(id),
        quizzesApi.getStats(id),
      ]);
      setQuiz(quizData);
      setStats(statsData);
    } catch (err) {
      setError("No se pudieron cargar las estadísticas del quiz.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleExport = () => {
    if (!stats?.intentos) return;

    const csvContent = [
      ["Nombre", "Puntaje", "Correctas", "Incorrectas", "Tiempo Total", "Fecha"].join(","),
      ...stats.intentos.map(i => {
        const correctas = i.respuestas?.filter(r => r.esCorrecta).length || 0;
        const total = i.respuestas?.length || 0;
        const tiempoTotal = i.respuestas?.reduce((acc, r) => acc + (r.tiempoRespuestaMs || 0), 0) || 0;
        return [
          `"${i.nombreCompleto}"`,
          i.puntajeTotal,
          correctas,
          total - correctas,
          formatTime(tiempoTotal),
          new Date(i.fecha).toLocaleDateString(),
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${quiz?.titulo || "quiz"}-estadisticas.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-96 mb-8" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || "No se encontró el quiz"}</p>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-bold mx-auto"
          >
            <ArrowLeft size={18} /> Volver
          </button>
        </div>
      </div>
    );
  }

  const intentos = stats?.intentos || [];
  const totalIntentos = intentos.length;
  const completados = intentos.filter(i => i.completado).length;
  const promedioScore = stats?.avgScore || 0;
  const uniqueStudents = stats?.uniqueStudents || 0;

  // Sort intentos by score for leaderboard
  const leaderboard = [...intentos]
    .sort((a, b) => b.puntajeTotal - a.puntajeTotal)
    .slice(0, 10);

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-4 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver al Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
              {quiz.titulo}
            </h1>
            <p className="text-gray-500">
              Estadísticas y desempeño de los estudiantes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={intentos.length === 0}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl font-bold shadow-sm transition-all hover:bg-gray-50 hover:border-purple-200 hover:text-purple-700 disabled:opacity-50"
            >
              <Download size={18} /> Exportar CSV
            </button>
            <button
              onClick={loadData}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl font-bold shadow-sm transition-all hover:bg-gray-50 hover:border-purple-200 hover:text-purple-700"
            >
              <RotateCcw size={18} /> Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Intentos"
          value={totalIntentos}
          icon={Users}
          color="blue"
          subtitle={`${completados} completados`}
        />
        <StatCard
          label="Estudiantes Únicos"
          value={uniqueStudents}
          icon={User}
          color="green"
        />
        <StatCard
          label="Puntaje Promedio"
          value={`${promedioScore}%`}
          icon={Target}
          color="purple"
        />
        <StatCard
          label="Tiempo Promedio"
          value={calculateAverageTime(intentos)}
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 mb-8 px-2">
        {[
          { id: "overview", label: "Resumen", icon: BarChart3 },
          { id: "students", label: "Estudiantes", icon: Users },
          { id: "questions", label: "Preguntas", icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 pb-4 text-sm font-bold transition-all relative",
              activeTab === tab.id ? "text-purple-700" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Top Performers */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Medal size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Mejores Puntuaciones</h3>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Sin intentos todavía</p>
                  <p className="text-sm">Los estudiantes aún no han respondido este quiz.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((intento, idx) => {
                    const score = calculateScore(intento, quiz);
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={intento.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                          {medals[idx] || `#${idx + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {intento.nombreCompleto}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(intento.fecha).toLocaleDateString()} · {intento.modo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">{intento.puntajeTotal}</p>
                          <p className={cn(
                            "text-xs font-bold",
                            score >= 70 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600"
                          )}>
                            {score}% correctas
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Participation Trend (placeholder for chart) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Resumen de Participación</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-2xl">
                  <p className="text-2xl font-bold text-green-700">
                    {intentos.filter(i => {
                      const score = calculateScore(i, quiz);
                      return score >= 70;
                    }).length}
                  </p>
                  <p className="text-sm text-green-600 font-medium">Excelente (≥70%)</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-2xl">
                  <p className="text-2xl font-bold text-amber-700">
                    {intentos.filter(i => {
                      const score = calculateScore(i, quiz);
                      return score >= 50 && score < 70;
                    }).length}
                  </p>
                  <p className="text-sm text-amber-600 font-medium">Regular (50-69%)</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-2xl">
                  <p className="text-2xl font-bold text-red-700">
                    {intentos.filter(i => {
                      const score = calculateScore(i, quiz);
                      return score < 50;
                    }).length}
                  </p>
                  <p className="text-sm text-red-600 font-medium">Necesita Mejorar (&lt;50%)</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "students" && (
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Todos los Intentos</h3>
            </div>
            {intentos.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Sin intentos registrados</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {intentos
                  .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                  .map((intento) => {
                    const score = calculateScore(intento, quiz);
                    const correctas = intento.respuestas?.filter(r => r.esCorrecta).length || 0;
                    const total = intento.respuestas?.length || 0;
                    const tiempoTotal = intento.respuestas?.reduce(
                      (acc, r) => acc + (r.tiempoRespuestaMs || 0), 0
                    ) || 0;

                    return (
                      <div
                        key={intento.id}
                        className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">
                            {intento.nombreCompleto}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(intento.fecha).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {formatTime(tiempoTotal)}
                            </span>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full font-medium",
                              intento.completado
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            )}>
                              {intento.completado ? "Completado" : "En progreso"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="hidden sm:block text-center">
                            <p className="text-xs text-gray-400">Correctas</p>
                            <p className="font-bold text-gray-700">
                              {correctas}/{total}
                            </p>
                          </div>
                          <div className="text-center min-w-[60px]">
                            <p className={cn(
                              "text-xl font-bold",
                              score >= 70 ? "text-green-600" : score >= 50 ? "text-amber-600" : "text-red-600"
                            )}>
                              {score}%
                            </p>
                            <p className="text-xs text-gray-400">{intento.puntajeTotal} pts</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === "questions" && (
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Análisis por Pregunta</h3>
            </div>
            {quiz.preguntas?.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">El quiz no tiene preguntas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {quiz.preguntas?.map((pregunta, idx) => {
                  // Calculate stats for this question
                  const respuestasParaPregunta = intentos.flatMap(
                    i => i.respuestas?.filter(r => r.preguntaId === pregunta.id) || []
                  );
                  const totalRespuestas = respuestasParaPregunta.length;
                  const correctas = respuestasParaPregunta.filter(r => r.esCorrecta).length;
                  const tasaCorrectas = totalRespuestas > 0 ? Math.round((correctas / totalRespuestas) * 100) : 0;

                  return (
                    <div key={pregunta.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 mb-2 line-clamp-2">
                            {pregunta.texto}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">
                              {totalRespuestas} respuestas
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500">
                              {pregunta.tiempoLimite}s límite
                            </span>
                            <span className="text-gray-400">·</span>
                            <span className="text-gray-500">
                              {pregunta.puntosValor} pts
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className={cn(
                            "flex items-center gap-1 font-bold",
                            tasaCorrectas >= 70 ? "text-green-600" : tasaCorrectas >= 50 ? "text-amber-600" : "text-red-600"
                          )}>
                            {tasaCorrectas >= 70 ? (
                              <CheckCircle size={16} />
                            ) : tasaCorrectas >= 50 ? (
                              <AlertCircle size={16} />
                            ) : (
                              <XCircle size={16} />
                            )}
                            {tasaCorrectas}%
                          </div>
                          <p className="text-xs text-gray-400">aciertos</p>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3 ml-12">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              tasaCorrectas >= 70 ? "bg-green-500" : tasaCorrectas >= 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${tasaCorrectas}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
