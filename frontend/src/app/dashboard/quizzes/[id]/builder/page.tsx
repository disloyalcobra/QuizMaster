"use client";

import React, { useState, use } from "react";
import { Plus, GripVertical, Settings, Save, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("editor");

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-80px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">Borrador</span>
            <span className="text-sm font-medium text-gray-400">ID: {id}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 focus:outline-none focus:border-b-2 focus:border-purple-500 hover:bg-gray-50 px-2 -ml-2 rounded-lg transition-colors cursor-text" contentEditable suppressContentEditableWarning>
            Nombre del Quiz Interactivo
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center mr-4">
            <button onClick={() => setActiveTab("editor")} className={cn("px-4 py-1.5 rounded-xl text-sm font-bold transition-all", activeTab === "editor" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Editor</button>
            <button onClick={() => setActiveTab("settings")} className={cn("px-4 py-1.5 rounded-xl text-sm font-bold transition-all", activeTab === "settings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>Configuración</button>
          </div>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-colors">
            <Play size={18} className="text-purple-600" />
            Vista Previa
          </button>
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgba(147,51,234,0.39)] transition-all hover:-translate-y-0.5">
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Sidebar Preguntas */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm shadow-purple-500/5">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Preguntas</h3>
            <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">3</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative bg-white border border-gray-100 rounded-2xl p-3 flex items-start gap-3 hover:border-purple-300 transition-colors cursor-pointer shadow-sm">
                <div className="cursor-grab text-gray-300 hover:text-gray-500 mt-0.5">
                  <GripVertical size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-500 mb-1">Pregunta {i}</p>
                  <p className="text-sm font-medium text-gray-900 truncate">¿Cuál es la capital de {i === 1 ? 'Francia' : 'España'}?</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button className="w-full flex items-center justify-center gap-2 bg-white border border-dashed border-gray-300 text-purple-600 px-4 py-3 rounded-2xl font-bold transition-all hover:bg-purple-50 hover:border-purple-300">
              <Plus size={20} />
              Añadir Pregunta
            </button>
          </div>
        </div>

        {/* Creador de Pregunta Actual */}
        <div className="flex-1 flex flex-col glass-card rounded-3xl overflow-hidden">
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Question Text */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Texto de la Pregunta</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block p-4 shadow-sm text-lg font-medium resize-none transition-shadow hover:shadow-md"
                  rows={3}
                  defaultValue="¿Cuál es la capital de Francia?"
                />
              </div>

              {/* Answers */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-gray-700">Opciones de Respuesta</label>
                  <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">Opción múltiple</span>
                </div>
                
                <div className="space-y-3">
                  {[
                    { text: "Madrid", correct: false, color: "bg-red-50" },
                    { text: "París", correct: true, color: "bg-green-50" },
                    { text: "Berlín", correct: false, color: "bg-blue-50" },
                    { text: "Roma", correct: false, color: "bg-amber-50" },
                  ].map((ans, idx) => (
                    <div key={idx} className={cn("flex items-center gap-3 p-2 rounded-2xl border transition-all", ans.correct ? "border-green-200 bg-green-50/30" : "border-gray-100 bg-white hover:border-gray-200")}>
                      <button className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors", ans.correct ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-gray-200")}>
                        <CheckCircle2 size={16} />
                      </button>
                      <input 
                        type="text" 
                        defaultValue={ans.text}
                        className="flex-1 bg-transparent border-none text-gray-900 font-medium focus:ring-0 p-2"
                      />
                      <button className="text-gray-300 hover:text-gray-500 p-2">
                        <GripVertical size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button className="mt-4 flex items-center gap-2 text-sm font-bold text-purple-600 py-2 hover:text-purple-700">
                  <Plus size={16} /> Añadir Opción
                </button>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Tiempo Límite (Segundos)</label>
                  <select className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl focus:ring-purple-500 focus:border-purple-500 p-3 shadow-sm font-medium">
                    <option>10</option>
                    <option selected>20</option>
                    <option>30</option>
                    <option>60</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">Puntos Totales</label>
                  <select className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl focus:ring-purple-500 focus:border-purple-500 p-3 shadow-sm font-medium">
                    <option>1</option>
                    <option selected>10</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
