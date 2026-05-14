"use client";

import React, { useState, useEffect } from "react";
import { Plus, Tag, Search, MoreHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/**
 * Página de Gestión de Etiquetas.
 * Permite organizar los quizzes por categorías o temas mediante etiquetas de colores.
 */
export default function EtiquetasPage() {
  // Estado para la lista de etiquetas
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  
  // Estado para el indicador de carga
  const [loading, setLoading] = useState(true);

  /**
   * Carga las etiquetas y el conteo de quizzes asociados desde la tabla intermedia.
   */
  useEffect(() => {
    const fetchEtiquetas = async () => {
      try {
        // Consulta relacional para obtener etiquetas y el conteo de su relación con quizzes.
        const { data, error } = await supabase
          .from("etiquetas")
          .select("*, quiz_etiquetas(count)");

        if (error) throw error;
        
        // Mapeamos los datos para asegurar que tengan un color por defecto y el formato esperado.
        const formatted = data?.map(e => ({
          ...e,
          colorHex: e.color_hex || "#3b82f6",
          _count: {
            quizzes: e.quiz_etiquetas?.[0]?.count || 0
          }
        })) || [];
        
        setEtiquetas(formatted);
      } catch (err) {
        console.error("❌ Error al cargar las etiquetas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEtiquetas();
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Etiquetas</h1>
          <p className="text-gray-500 font-medium">Clasifica y encuentra tus quizzes rápidamente.</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5">
          <Plus size={20} />
          Nueva Etiqueta
        </button>
      </div>

      <div className="relative mb-8 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar etiqueta..." 
          className="w-full bg-white border border-gray-100 text-gray-900 text-sm rounded-2xl focus:ring-gray-900 focus:border-gray-900 block pl-11 p-3 shadow-sm placeholder-gray-400 font-medium transition-shadow hover:shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          etiquetas.map((etiqueta: any) => (
            <div key={etiqueta.id} className="glass-card rounded-2xl p-5 group cursor-pointer flex items-center justify-between border-l-4" style={{ borderLeftColor: etiqueta.colorHex }}>
              <div className="flex items-center gap-4 min-w-0">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110" 
                  style={{ backgroundColor: `${etiqueta.colorHex}20`, color: etiqueta.colorHex }}
                >
                  <Tag size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{etiqueta.nombre}</h3>
                  <p className="text-xs text-gray-400 font-medium">{etiqueta._count.quizzes} quizzes</p>
                </div>
              </div>
              <button className="text-gray-300 hover:text-gray-600 bg-transparent hover:bg-gray-100 p-2 rounded-xl transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                <MoreHorizontal size={18} />
              </button>
            </div>
          ))
        )}
        
        {/* Create Card */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-5 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all cursor-pointer text-gray-500 hover:text-gray-900 hover:border-gray-300">
          <Plus size={20} />
          <span className="font-bold">Crear Etiqueta</span>
        </div>
      </div>
    </div>
  );
}
