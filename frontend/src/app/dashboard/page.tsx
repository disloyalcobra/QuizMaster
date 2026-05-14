"use client";

import { QuizCard } from "@/components/ui/QuizCard";
import { StatsCard } from "@/components/ui/StatsCard";
import {
  LayoutGrid, List, RotateCcw, Plus,
  BookOpen, Users, Trophy, TrendingUp,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { quizzesApi, type Quiz, type GlobalStats } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

const TABS = ["Todos", "Publicados", "Borradores", "Archivados"];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("Todos");
  const [quizzes, setQuizzes]     = useState<Quiz[]>([]);
  const [stats, setStats]         = useState<GlobalStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [qData, sData] = await Promise.all([
        quizzesApi.getAll(),
        quizzesApi.getGlobalStats(),
      ]);
      setQuizzes(qData);
      setStats(sData);
    } catch {
      setError("No se pudo conectar con el servidor. Verifica que el backend esté activo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = quizzes.filter((q) => {
    if (activeTab === "Todos")      return true;
    if (activeTab === "Publicados") return q.estado === "publicado";
    if (activeTab === "Borradores") return q.estado === "borrador";
    if (activeTab === "Archivados") return q.estado === "archivado";
    return true;
  });

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Saludo */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
          Hola, {user?.nombre?.split(" ")[0] ?? "Creador"} 👋
        </h1>
        <p className="text-gray-500 font-medium">Aquí tienes un resumen de tu actividad.</p>
      </div>

      {/* Quick Stats Overview */}
      {stats && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 mb-10 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Resumen General</h2>
              <p className="text-white/70 text-sm">Visita las estadísticas de cada quiz o grupo para más detalles</p>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={18} className="text-white/80" />
                <span className="text-sm text-white/70">Quizzes</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={18} className="text-white/80" />
                <span className="text-sm text-white/70">Intentos</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalIntentos}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users size={18} className="text-white/80" />
                <span className="text-sm text-white/70">Estudiantes</span>
              </div>
              <p className="text-2xl font-bold">{stats.uniqueStudents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={18} className="text-white/80" />
                <span className="text-sm text-white/70">Promedio</span>
              </div>
              <p className="text-2xl font-bold">{stats.avgScore}%</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Mis Quizzes</h2>
          <p className="text-gray-500 text-sm font-medium">
            {quizzes.length} cuestionario{quizzes.length !== 1 ? "s" : ""} creado{quizzes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/quizzes/new")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> Nuevo Quiz
          </button>
          <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1 gap-1 shadow-sm">
            <button onClick={() => setView("grid")} className={cn("p-2 rounded-xl transition-all", view === "grid" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-gray-400 hover:text-gray-600")}>
              <LayoutGrid size={20} />
            </button>
            <button onClick={() => setView("list")} className={cn("p-2 rounded-xl transition-all", view === "list" ? "bg-purple-600 text-white shadow-md shadow-purple-200" : "text-gray-400 hover:text-gray-600")}>
              <List size={20} />
            </button>
          </div>
          <button onClick={load} className="p-2.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm" title="Recargar">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100 mb-8 px-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn("pb-4 text-sm font-bold transition-all relative", activeTab === tab ? "text-purple-700" : "text-gray-400 hover:text-gray-600")}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Grid / Lista */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 rounded-3xl h-64 animate-pulse" />)}
        </div>
      ) : (
        <div className={cn(view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4")}>
          {/* Tarjeta "Nuevo Quiz" */}
          <button
            onClick={() => router.push("/dashboard/quizzes/new")}
            className="bg-white border border-dashed border-purple-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:bg-purple-50/30 transition-all group cursor-pointer border-b-[6px] border-b-purple-50 min-h-[220px]"
          >
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <Plus size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Nuevo Quiz</h3>
              <p className="text-xs text-gray-400 font-medium">Crea preguntas manualmente</p>
            </div>
          </button>

          {filtered.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay quizzes en esta categoría todavía.</p>
            </div>
          ) : (
            filtered.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} view={view} onRefresh={load} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
