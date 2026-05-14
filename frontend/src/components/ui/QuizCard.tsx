"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Play, Trophy, FileText,
  Edit, Copy, Trash2, Archive, Globe, Link2, MoreHorizontal, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Quiz } from '@/lib/api';
import { quizzesApi } from '@/lib/api';

interface QuizCardProps {
  quiz: Quiz;
  view: 'grid' | 'list';
  onRefresh?: () => void;
}

const statusLabel: Record<Quiz['estado'], string> = {
  publicado: 'Publicado',
  borrador : 'Borrador',
  archivado: 'Archivado',
};

const statusStyle: Record<Quiz['estado'], string> = {
  publicado: 'bg-green-500/90 text-white',
  borrador : 'bg-amber-500/90 text-white',
  archivado: 'bg-gray-500/90 text-white',
};

/**
 * QuizCard: Representación visual de un cuestionario en el dashboard.
 * Soporta dos modos de visualización: 'grid' (mosaico) y 'list' (fila).
 * Proporciona acceso rápido a edición, duplicación, publicación y estadísticas básicas.
 */
export const QuizCard = ({ quiz, view, onRefresh }: QuizCardProps) => {
  const router   = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);

  const attempts  = quiz._count?.intentos  ?? 0;
  const questions = quiz._count?.preguntas ?? 0;
  const category  = quiz.grupo?.nombre ?? 'Sin categoría';
  const status    = quiz.estado;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleEdit = () => router.push(`/dashboard/quizzes/${quiz.id}/edit`);
  const handleStats = () => router.push(`/dashboard/quizzes/${quiz.id}/stats`);

  const handleShare = () => {
    const url = `${window.location.origin}/quiz/${quiz.publicUrl}`;
    navigator.clipboard.writeText(url).catch(() => {});
    alert(`¡Enlace copiado!\n${url}`);
  };

  const handlePlay = () => window.open(`/quiz/${quiz.publicUrl}`, '_blank');

  const handleDuplicate = async () => {
    setMenuOpen(false);
    try { await quizzesApi.duplicate(quiz.id); onRefresh?.(); }
    catch(e) { console.error(e); }
  };

  const handleTogglePublish = async () => {
    setMenuOpen(false);
    const newEstado = status === 'publicado' ? 'borrador' : 'publicado';
    try { await quizzesApi.update(quiz.id, { estado: newEstado }); onRefresh?.(); }
    catch(e) { console.error(e); }
  };

  const handleDelete = async () => {
    setMenuOpen(false);
    if (!confirm(`¿Eliminar "${quiz.titulo}"? Esta acción no se puede deshacer.`)) return;
    try { await quizzesApi.remove(quiz.id); onRefresh?.(); }
    catch(e) { console.error(e); }
  };

  // ── Vista Lista ──────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-5 hover:shadow-lg hover:shadow-purple-50 transition-all group border-l-4 border-l-transparent hover:border-l-purple-500">
        <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-xl flex items-center justify-center text-purple-400 overflow-hidden">
          {quiz.imagenPortada
            ? <img src={quiz.imagenPortada} alt={quiz.titulo} className="w-full h-full object-cover"/>
            : <Play size={20} fill="currentColor"/>
          }
        </div>

        <div className="flex-grow min-w-0">
          <h3 onClick={handleEdit} className="font-bold text-gray-900 truncate group-hover:text-purple-600 transition-colors cursor-pointer text-sm">
            {quiz.titulo}
          </h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{category}</p>
        </div>

        <span className={cn('px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex-shrink-0', statusStyle[status])}>
          {statusLabel[status]}
        </span>

        <div className="flex items-center gap-4 text-gray-400 text-xs font-bold flex-shrink-0">
          <span className="flex items-center gap-1.5"><Users size={13}/>{attempts}</span>
          <span className="flex items-center gap-1.5"><FileText size={13}/>{questions} preg.</span>
        </div>

        {/* Acciones directas */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={handleShare} title="Copiar enlace" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Link2 size={15}/></button>
          <button onClick={handlePlay}  title="Probar quiz"  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors"><Globe size={15}/></button>
          <button onClick={handleStats} title="Estadísticas" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><BarChart3 size={15}/></button>
          <button onClick={handleDelete} title="Eliminar"   className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={15}/></button>
          <button onClick={handleEdit}  title="Editar"      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"><Edit size={12}/> Editar</button>
        </div>

        {/* Menú más opciones */}
        <div className="relative flex-shrink-0 ml-1" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <MoreHorizontal size={18}/>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 w-40">
              <button onClick={handleDuplicate} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-colors"><Copy size={14}/> Duplicar</button>
              <button onClick={handleTogglePublish} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors">
                {status==='publicado' ? <><Archive size={14}/> Archivar</> : <><Globe size={14}/> Publicar</>}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Vista Grid ───────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-purple-50 transition-all group flex flex-col h-full border-b-[6px] border-b-gray-100 hover:border-b-purple-100">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-gradient-to-tr from-purple-100 to-indigo-50 rounded-2xl mb-4 overflow-hidden">
        {quiz.imagenPortada
          ? <img src={quiz.imagenPortada} alt={quiz.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
          : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-full flex items-center justify-center text-purple-600">
                <Play size={24} fill="currentColor"/>
              </div>
            </div>
          )
        }

        {/* Badge estado */}
        <div className={cn('absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20', statusStyle[status])}>
          {statusLabel[status]}
        </div>

        {/* Acciones rápidas sobre la imagen (aparecen al hover) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleShare}
            title="Copiar enlace"
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-white transition-colors shadow-sm"
          >
            <Link2 size={14}/>
          </button>
          <button
            onClick={handlePlay}
            title="Probar quiz"
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-white transition-colors shadow-sm"
          >
            <Globe size={14}/>
          </button>
          <button
            onClick={handleDelete}
            title="Eliminar"
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
          >
            <Trash2 size={14}/>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            {category}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">{questions} preg.</span>
        </div>

        {/* Título — click para editar */}
        <h3
          onClick={handleEdit}
          className="text-base font-bold text-gray-900 mb-4 line-clamp-2 leading-snug group-hover:text-purple-600 transition-colors cursor-pointer"
        >
          {quiz.titulo}
        </h3>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-gray-500"><Users size={14}/><span className="text-xs font-bold">{attempts}</span></div>
            <div className="flex items-center gap-1.5 text-gray-500"><Trophy size={14} className="text-amber-500"/><span className="text-xs font-bold text-gray-400">intentos</span></div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStats}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              <BarChart3 size={12}/> Stats
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-600 hover:text-white rounded-xl text-xs font-bold transition-all"
            >
              <Edit size={12}/> Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
