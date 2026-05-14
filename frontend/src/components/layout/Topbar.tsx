import React from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Upload, 
  MoreHorizontal, 
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Topbar: Barra superior del dashboard.
 * Contiene el buscador global, notificaciones y botones de acción rápida.
 * Se posiciona de forma fija en la parte superior derecha de la pantalla.
 */
export const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      {/* Breadcrumbs / Context */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
        <div className="h-4 w-px bg-gray-200 mx-2" />
        <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium tracking-tight">
          Mis Quizzes
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="relative group w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar quizzes o grupos..."
            className="w-full bg-gray-50 border border-transparent focus:border-purple-200 focus:bg-white rounded-xl py-2 pl-10 pr-4 text-sm outline-none transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="h-4 w-px bg-gray-200 mx-1" />

        {/* Action Buttons */}
        <button className="flex items-center gap-2 bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-xl text-sm hover:bg-gray-200 transition-all">
          <Upload size={18} />
          <span>Importar</span>
        </button>

        <button className="flex items-center gap-2 bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-purple-700 shadow-md shadow-purple-100 transition-all">
          <Plus size={18} />
          <span>Nuevo Quiz</span>
        </button>

        <div className="flex items-center gap-3 pl-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-sm">
            RF
          </div>
        </div>
      </div>
    </header>
  );
};
