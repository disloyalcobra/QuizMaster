"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { gruposApi, etiquetasApi, quizzesApi, type Grupo, type Quiz } from "@/lib/api";
import {
  Plus, Edit, Trash2, X, ChevronRight, Palette,
  Tag, Hash, ArrowLeft, Play, Users, FileText,
  Link2, Globe, Loader2, BarChart3, Trophy, TrendingUp,
  Target, Medal, Calendar, CheckCircle, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const ICONOS  = ["📚","🔬","🧮","🌍","🎨","🏃","💻","🎵","⚽","🍎","🏛️","🚀"];
const COLORES = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444",
  "#f97316","#eab308","#22c55e","#14b8a6",
  "#3b82f6","#06b6d4","#64748b","#1e293b",
];

/**
 * GrupoModal: Diálogo interactivo para crear o editar grupos de estudiantes.
 * Sigue un proceso de 2 pasos:
 * 1. Define nombre, descripción, color e ícono del grupo.
 * 2. Ofrece la opción de crear una etiqueta temática vinculada al flujo.
 */
function GrupoModal({ open, onClose, onSuccess, grupoEdit }: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  grupoEdit?: Grupo | null;
}) {
  const [paso, setPaso]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [grupoCreado, setGrupoCreado] = useState<Grupo | null>(null);

  const [nombre, setNombre]       = useState(grupoEdit?.nombre ?? "");
  const [descripcion, setDesc]    = useState(grupoEdit?.descripcion ?? "");
  const [colorHex, setColor]      = useState(grupoEdit?.colorHex ?? "#6366f1");
  const [icono, setIcono]         = useState(grupoEdit?.icono ?? "📚");

  const [etNombre, setEtNombre]   = useState("");
  const [etColor, setEtColor]     = useState("#6366f1");
  const [skipEtiqueta, setSkip]   = useState(false);

  useEffect(() => {
    if (grupoEdit) { setNombre(grupoEdit.nombre); setDesc(grupoEdit.descripcion ?? ""); setColor(grupoEdit.colorHex ?? "#6366f1"); setIcono(grupoEdit.icono ?? "📚"); }
  }, [grupoEdit]);

  if (!open) return null;

  const reset = () => { setPaso(1); setNombre(""); setDesc(""); setColor("#6366f1"); setIcono("📚"); setEtNombre(""); setSkip(false); setGrupoCreado(null); onClose(); };

  const handleGuardarGrupo = async () => {
    if (!nombre.trim()) return;
    setLoading(true);
    try {
      if (grupoEdit) {
        await gruposApi.update(grupoEdit.id, { nombre, descripcion, colorHex, icono });
        onSuccess(); reset();
      } else {
        const g = await gruposApi.create({ nombre, descripcion, colorHex, icono });
        setGrupoCreado(g); setPaso(2);
      }
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };

  const handleGuardarEtiqueta = async () => {
    if (!skipEtiqueta && etNombre.trim()) {
      setLoading(true);
      try { await etiquetasApi.create({ nombre: etNombre, colorHex: etColor }); }
      catch(e){ console.error(e); } finally { setLoading(false); }
    }
    onSuccess(); reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: paso===1 ? colorHex : '#22c55e' }} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Paso {paso} de 2</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">{paso===1 ? (grupoEdit ? 'Editar Grupo' : 'Crear Grupo') : 'Añadir Etiqueta'}</h2>
          </div>
          <button onClick={reset} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X size={18}/></button>
        </div>

        <div className="p-6 space-y-4">
          {paso===1 ? (
            <>
              <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: colorHex+'22', border:`2px solid ${colorHex}44` }}>{icono}</div>
                <div><p className="font-bold text-gray-900">{nombre||'Nombre del grupo'}</p><p className="text-sm text-gray-400">{descripcion||'Descripción opcional'}</p></div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Nombre *</label>
                <input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Ej: Matemáticas 2do Semestre" className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1.5 block">Descripción</label>
                <textarea value={descripcion} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="Describe brevemente..." className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"/>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Palette size={14}/> Color</label>
                <div className="flex flex-wrap gap-2">{COLORES.map(c=><button key={c} onClick={()=>setColor(c)} className={cn("w-8 h-8 rounded-full transition-all",colorHex===c?"ring-2 ring-offset-2 ring-gray-400 scale-110":"hover:scale-110")} style={{background:c}}/>)}</div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Hash size={14}/> Ícono</label>
                <div className="flex flex-wrap gap-2">{ICONOS.map(i=><button key={i} onClick={()=>setIcono(i)} className={cn("w-10 h-10 text-xl rounded-xl transition-all hover:scale-110",icono===i?"bg-purple-100 ring-2 ring-purple-400":"bg-gray-50 hover:bg-gray-100")}>{i}</button>)}</div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-2xl">
                <span className="text-2xl">{grupoCreado?.icono??"📚"}</span>
                <div><p className="text-sm font-bold text-green-800">¡Grupo "{grupoCreado?.nombre}" creado!</p><p className="text-xs text-green-600">¿Quieres añadir una etiqueta temática ahora?</p></div>
              </div>
              {!skipEtiqueta ? (
                <>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1.5 block"><Tag size={14}/> Nombre de la etiqueta</label>
                    <input value={etNombre} onChange={e=>setEtNombre(e.target.value)} placeholder="Ej: Matemáticas, Biología..." className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"/>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5 block"><Palette size={14}/> Color</label>
                    <div className="flex flex-wrap gap-2">{COLORES.map(c=><button key={c} onClick={()=>setEtColor(c)} className={cn("w-8 h-8 rounded-full transition-all",etColor===c?"ring-2 ring-offset-2 ring-gray-400 scale-110":"hover:scale-110")} style={{background:c}}/>)}</div>
                  </div>
                  <button onClick={()=>setSkip(true)} className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors">Saltar, añadir etiqueta después</button>
                </>
              ) : (
                <p className="text-sm text-gray-500 py-4 text-center">Sin problema, puedes asignar etiquetas a tus quizzes más tarde.</p>
              )}
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button onClick={reset} className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-2xl border border-gray-200 transition-colors">Cancelar</button>
          <button
            onClick={paso===1 ? handleGuardarGrupo : handleGuardarEtiqueta}
            disabled={loading||(paso===1&&!nombre.trim())}
            className="flex-1 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-2xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={15} className="animate-spin"/> : paso===1 ? <><span>{grupoEdit?'Guardar':'Crear grupo'}</span><ChevronRight size={16}/></> : <span>{skipEtiqueta?'Finalizar':'Crear etiqueta y finalizar'}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions for statistics
function calculateQuizAverage(quiz: Quiz): number {
  if (!quiz._count?.intentos) return 0;
  // This would ideally come from actual score data
  return 0;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * GrupoDetalle: Vista profunda de un grupo específico.
 * Muestra la lista de quizzes asociados, permite asignar quizzes que no tienen grupo
 * y ofrece acciones rápidas como compartir (copiar link), probar, editar y eliminar.
 * INCLUYE: Dashboard de estadísticas del grupo con promedios y participación.
 */
function GrupoDetalle({ grupo, onBack, onRefresh }: { grupo: Grupo; onBack: () => void; onRefresh: () => void }) {
  const router       = useRouter();
  const [quizzesSinGrupo, setQuizzesSinGrupo] = useState<Quiz[]>([]);
  const [loading, setLoading]   = useState(false);
  const [asignando, setAsignando] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"quizzes" | "stats">("quizzes");
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const quizzes = grupo.quizzes ?? [];

  useEffect(() => {
    // Cargar todos los quizzes para poder asignar los que no tienen grupo
    quizzesApi.getAll().then(all => {
      setQuizzesSinGrupo(all.filter(q => !q.grupo));
    }).catch(console.error);
  }, []);

  const handleAsignar = async () => {
    if (!selectedQuiz) return;
    setLoading(true);
    try {
      await quizzesApi.update(selectedQuiz, { grupoId: grupo.id });
      setAsignando(false);
      setSelectedQuiz("");
      onRefresh();
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };

  const handleShare = (quiz: Quiz) => {
    const url = `${window.location.origin}/quiz/${quiz.publicUrl}`;
    navigator.clipboard.writeText(url).catch(() => {});
    alert(`¡Enlace copiado!\n${url}`);
  };

  const handleDelete = async (quiz: Quiz) => {
    if (!confirm(`¿Eliminar "${quiz.titulo}"? Esta acción no se puede deshacer.`)) return;
    try { await quizzesApi.remove(quiz.id); onRefresh(); }
    catch(e){ console.error(e); }
  };

  const statusStyle: Record<string, string> = {
    publicado: "bg-green-100 text-green-700",
    borrador : "bg-amber-100 text-amber-700",
    archivado: "bg-gray-100 text-gray-500",
  };

  // Calculate group statistics
  const groupStats = React.useMemo(() => {
    const totalQuizzes = quizzes.length;
    const totalIntentos = quizzes.reduce((acc, q) => acc + (q._count?.intentos || 0), 0);
    const totalPreguntas = quizzes.reduce((acc, q) => acc + (q._count?.preguntas || 0), 0);

    // Calculate participation rate (assuming unique students per quiz)
    const quizzesWithAttempts = quizzes.filter(q => (q._count?.intentos || 0) > 0).length;
    const participationRate = totalQuizzes > 0 ? Math.round((quizzesWithAttempts / totalQuizzes) * 100) : 0;

    // Average attempts per quiz
    const avgAttemptsPerQuiz = totalQuizzes > 0 ? Math.round(totalIntentos / totalQuizzes) : 0;

    return {
      totalQuizzes,
      totalIntentos,
      totalPreguntas,
      participationRate,
      avgAttemptsPerQuiz,
    };
  }, [quizzes]);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header de vuelta */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors mb-8 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> Volver a Grupos
      </button>

      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background:(grupo.colorHex??'#6366f1')+'20', border:`2px solid ${(grupo.colorHex??'#6366f1')}40` }}>
            {grupo.icono??"📚"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{grupo.nombre}</h1>
            {grupo.descripcion && <p className="text-gray-500 text-sm">{grupo.descripcion}</p>}
            <p className="text-xs text-gray-400 font-medium mt-0.5">{quizzes.length} quiz{quizzes.length!==1?'zes':''}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab(activeTab === "quizzes" ? "stats" : "quizzes")}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all",
              activeTab === "stats"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                : "bg-white border border-gray-200 text-gray-700 hover:border-purple-200 hover:text-purple-700"
            )}
          >
            <BarChart3 size={16}/>
            {activeTab === "stats" ? "Ver Quizzes" : "Ver Estadísticas"}
          </button>
          <button
            onClick={() => router.push('/dashboard/quizzes/new')}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
          >
            <Plus size={16}/> Nuevo Quiz
          </button>
        </div>
      </div>

      {/* Stats View */}
      {activeTab === "stats" && (
        <div className="animate-in fade-in duration-300 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <FileText size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{groupStats.totalQuizzes}</p>
              <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <Users size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(groupStats.totalIntentos)}</p>
              <p className="text-sm font-medium text-gray-500">Total Intentos</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Trophy size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{groupStats.avgAttemptsPerQuiz}</p>
              <p className="text-sm font-medium text-gray-500">Promedio Intentos/Quiz</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{groupStats.participationRate}%</p>
              <p className="text-sm font-medium text-gray-500">Tasa de Participación</p>
            </div>
          </div>

          {/* Quiz Performance Table */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Desempeño por Quiz</h3>
                  <p className="text-sm text-gray-500">Estadísticas de participación y engagement</p>
                </div>
              </div>
            </div>

            {quizzes.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay quizzes en este grupo</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {quizzes
                  .sort((a, b) => (b._count?.intentos || 0) - (a._count?.intentos || 0))
                  .map((quiz, idx) => {
                    const intentos = quiz._count?.intentos || 0;
                    const preguntas = quiz._count?.preguntas || 0;
                    const maxIntentos = quizzes[0]?._count?.intentos || 1;
                    const participationPct = maxIntentos > 0 ? Math.round((intentos / maxIntentos) * 100) : 0;
                    const isExpanded = expandedQuiz === quiz.id;

                    return (
                      <div key={quiz.id} className="divide-y divide-gray-50">
                        <div
                          className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedQuiz(isExpanded ? null : quiz.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                              {idx + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{quiz.titulo}</p>
                              <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full font-medium",
                                  statusStyle[quiz.estado]
                                )}>
                                  {quiz.estado}
                                </span>
                                <span>{preguntas} preguntas</span>
                              </div>
                            </div>

                            <div className="text-right flex items-center gap-6">
                              <div className="hidden sm:block">
                                <p className="text-xl font-bold text-gray-900">{intentos}</p>
                                <p className="text-xs text-gray-400">intentos</p>
                              </div>

                              <div className="w-24">
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                                    style={{ width: `${participationPct}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-right">{participationPct}% popular</p>
                              </div>

                              <ChevronRight
                                size={18}
                                className={cn(
                                  "text-gray-400 transition-transform",
                                  isExpanded && "rotate-90"
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 bg-gray-50/50">
                            <div className="ml-12 grid grid-cols-3 gap-4 mt-4">
                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">Intentos Totales</p>
                                <p className="text-lg font-bold text-gray-900">{intentos}</p>
                              </div>
                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">Preguntas</p>
                                <p className="text-lg font-bold text-gray-900">{preguntas}</p>
                              </div>
                              <div className="bg-white rounded-xl p-3 border border-gray-100">
                                <p className="text-xs text-gray-400 mb-1">Estado</p>
                                <p className={cn(
                                  "text-sm font-bold",
                                  quiz.estado === "publicado" ? "text-green-600" :
                                  quiz.estado === "borrador" ? "text-amber-600" : "text-gray-600"
                                )}>
                                  {quiz.estado === "publicado" ? "✅ Publicado" :
                                   quiz.estado === "borrador" ? "📝 Borrador" : "📦 Archivado"}
                                </p>
                              </div>
                            </div>

                            <div className="ml-12 flex gap-2 mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/quizzes/${quiz.id}/stats`);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                              >
                                <BarChart3 size={12} /> Ver Estadísticas
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/dashboard/quizzes/${quiz.id}/edit`);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
                              >
                                <Edit size={12} /> Editar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Top Performing Quizzes */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white text-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <Medal size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quizzes más Populares</h3>
            </div>

            {quizzes.filter(q => (q._count?.intentos || 0) > 0).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Aún no hay intentos registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes
                  .filter(q => (q._count?.intentos || 0) > 0)
                  .sort((a, b) => (b._count?.intentos || 0) - (a._count?.intentos || 0))
                  .slice(0, 5)
                  .map((quiz, idx) => {
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div
                        key={quiz.id}
                        className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-purple-100/50"
                      >
                        <div className="text-xl w-8 text-center">{medals[idx] || `#${idx + 1}`}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{quiz.titulo}</p>
                          <p className="text-xs text-gray-400">{quiz._count?.intentos || 0} intentos</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quizzes View */}
      {activeTab === "quizzes" && (
      <>
      <div className="bg-white border border-purple-100 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <select
          value={selectedQuiz}
          onChange={e => setSelectedQuiz(e.target.value)}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-purple-300"
        >
          <option value="">Selecciona un quiz sin grupo...</option>
          {quizzesSinGrupo.length === 0 ? (
            <option disabled>No hay quizzes sin grupo</option>
          ) : (
            quizzesSinGrupo.map(q => <option key={q.id} value={q.id}>{q.titulo}</option>)
          )}
        </select>
        <button
          onClick={handleAsignar}
          disabled={!selectedQuiz || loading}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-purple-700"
        >
          {loading ? <Loader2 size={14} className="animate-spin"/> : <Plus size={14} />}
          Añadir al grupo
        </button>
      </div>

      {/* Lista de quizzes */}
      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText size={40} className="mb-3 opacity-20"/>
          <p className="font-medium text-gray-500">Este grupo no tiene quizzes todavía.</p>
          <p className="text-sm mt-1">Crea un nuevo quiz o asigna uno existente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(quiz => {
            const intentos  = quiz._count?.intentos ?? 0;
            const preguntas = quiz._count?.preguntas ?? 0;
            const etiquetas = quiz.etiquetas ?? [];

            return (
              <div
                key={quiz.id}
                className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-lg hover:shadow-purple-50 transition-all group border-l-4 border-l-transparent hover:border-l-purple-500"
              >
                {/* Miniatura */}
                <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-xl flex items-center justify-center text-purple-400 overflow-hidden">
                  {quiz.imagenPortada
                    ? <img src={quiz.imagenPortada} alt="" className="w-full h-full object-cover"/>
                    : <Play size={20} fill="currentColor"/>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors text-sm">
                      {quiz.titulo}
                    </h3>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", statusStyle[quiz.estado])}>
                      {quiz.estado}
                    </span>
                    {etiquetas.map(et => (
                      <span
                        key={et.etiqueta?.id}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: et.etiqueta?.colorHex ?? '#6366f1' }}
                      >
                        {et.etiqueta?.nombre}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1"><Users size={11}/>{intentos} intentos</span>
                    <span className="flex items-center gap-1"><FileText size={11}/>{preguntas} preguntas</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {/* Compartir */}
                  <button
                    onClick={() => handleShare(quiz)}
                    title="Copiar enlace"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Link2 size={15}/>
                  </button>
                  {/* Probar */}
                  <button
                    onClick={() => window.open(`/quiz/${quiz.publicUrl}`, '_blank')}
                    title="Probar quiz"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                  >
                    <Globe size={15}/>
                  </button>
                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(quiz)}
                    title="Eliminar"
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={15}/>
                  </button>
                  {/* Editar */}
                  <button
                    onClick={() => router.push(`/dashboard/quizzes/${quiz.id}/edit`)}
                    title="Editar"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <Edit size={12}/> Editar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}
    </div>
  );
}

/**
 * GruposPage: Componente de página principal para la gestión de grupos y etiquetas.
 * Renderiza el listado de tarjetas de grupos y gestiona la navegación entre la lista y el detalle.
 */
export default function GruposPage() {
  const [grupos, setGrupos]       = useState<Grupo[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [grupoEdit, setGrupoEdit] = useState<Grupo | null>(null);
  const [grupoActivo, setGrupoActivo] = useState<Grupo | null>(null);

  const loadGrupos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gruposApi.getAll();
      setGrupos(data);
      // Si hay un grupo activo, actualizar sus datos
      if (grupoActivo) {
        const updated = data.find(g => g.id === grupoActivo.id);
        if (updated) setGrupoActivo(updated);
      }
    } catch(e){ console.error(e); } finally { setLoading(false); }
  }, [grupoActivo?.id]);

  useEffect(() => { loadGrupos(); }, []);

  const handleDelete = async (id: string, nombre: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el grupo "${nombre}"?`)) return;
    try { await gruposApi.remove(id); loadGrupos(); } catch(e){ console.error(e); }
  };

  // Si hay un grupo activo mostrar el detalle
  if (grupoActivo) {
    return (
      <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
        <GrupoDetalle grupo={grupoActivo} onBack={() => setGrupoActivo(null)} onRefresh={loadGrupos}/>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Grupos</h1>
          <p className="text-gray-500 font-medium">Organiza tus quizzes en colecciones temáticas.</p>
        </div>
        <button
          onClick={() => { setGrupoEdit(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18}/> Nuevo Grupo
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse"/>)}
        </div>
      ) : grupos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Users size={48} className="mb-4 opacity-20"/>
          <p className="font-bold text-lg text-gray-500 mb-1">Sin grupos todavía</p>
          <p className="text-sm">Crea tu primer grupo para organizar tus quizzes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grupos.map(grupo => {
            // Recopilar etiquetas únicas de todos los quizzes del grupo
            const etiquetasMap = new Map<string, { nombre: string; colorHex?: string | null }>();
            (grupo.quizzes ?? []).forEach(q => {
              (q.etiquetas ?? []).forEach(et => {
                if (et.etiqueta) etiquetasMap.set(et.etiqueta.id, et.etiqueta);
              });
            });
            const etiquetas = Array.from(etiquetasMap.values());

            return (
              <div
                key={grupo.id}
                onClick={() => setGrupoActivo(grupo)}
                className="bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-gray-100 transition-all group cursor-pointer border-b-[6px]"
                style={{ borderBottomColor: grupo.colorHex ?? '#e5e7eb' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background:(grupo.colorHex??'#6366f1')+'20', border:`2px solid ${(grupo.colorHex??'#6366f1')}40` }}>
                    {grupo.icono??"📚"}
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); setGrupoEdit(grupo); setModalOpen(true); }}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                    >
                      <Edit size={15}/>
                    </button>
                    <button
                      onClick={e => handleDelete(grupo.id, grupo.nombre, e)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={15}/>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-0.5">{grupo.nombre}</h3>
                {grupo.descripcion && <p className="text-sm text-gray-400 mb-3 line-clamp-2">{grupo.descripcion}</p>}

                {/* Etiquetas del grupo */}
                {etiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {etiquetas.slice(0,4).map(et => (
                      <span
                        key={et.nombre}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: et.colorHex ?? '#6366f1' }}
                      >
                        {et.nombre}
                      </span>
                    ))}
                    {etiquetas.length > 4 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        +{etiquetas.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: grupo.colorHex??'#6366f1' }}>
                      <span className="text-white text-[8px]">Q</span>
                    </div>
                    {grupo._count?.quizzes ?? 0} quizzes
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver quizzes <ChevronRight size={14}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <GrupoModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setGrupoEdit(null); }}
        onSuccess={() => { setModalOpen(false); setGrupoEdit(null); loadGrupos(); }}
        grupoEdit={grupoEdit}
      />
    </div>
  );
}
