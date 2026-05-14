"use client";

import { useState, useRef } from "react";
import { aiApi } from "@/lib/api";
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IAWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (questions: any[]) => void;
}

type Step = "prompt" | "review";

/**
 * IAWizard: Modal para generar cuestionarios mediante IA local (Ollama).
 * Permite ingresar un prompt de texto y visualizar las preguntas generadas
 * antes de integrarlas al editor.
 */
export function IAWizard({ isOpen, onClose, onGenerated }: IAWizardProps) {
  const [step, setStep] = useState<Step>("prompt");
  const [prompt, setPrompt] = useState("");
  const [numPreguntas, setNumPreguntas] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Por favor ingresa un prompt para generar el cuestionario");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Crear nuevo AbortController para esta petición
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await aiApi.generateQuiz({
        prompt: prompt.trim(),
        numPreguntas,
      }, controller.signal);

      if (result.preguntas && Array.isArray(result.preguntas)) {
        setGeneratedQuestions(result.preguntas);
        setStep("review");
      } else {
        setError("La respuesta de la IA no tiene el formato esperado");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Generación cancelada por el usuario');
        return;
      }
      setError(
        err.message ||
          "Error al generar el cuestionario. Asegúrate de que Ollama esté corriendo localmente."
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleConfirm = () => {
    onGenerated(generatedQuestions);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setStep("prompt");
    setPrompt("");
    setNumPreguntas(5);
    setError(null);
    setGeneratedQuestions([]);
  };

  const handleClose = () => {
    // Si está cargando, cancelamos la petición antes de cerrar
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generar con IA</h2>
              <p className="text-xs text-purple-100">
                Usando Ollama local (qwen2.5)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                step === "prompt"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                  step === "prompt"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-400 text-white"
                )}
              >
                {step === "review" ? <CheckCircle2 size={12} /> : "1"}
              </span>
              Configuración
            </div>
            <ChevronRight size={14} className="text-gray-300" />
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                step === "review"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px]",
                  step === "review"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-300 text-white"
                )}
              >
                2
              </span>
              Revisar
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "prompt" ? (
            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  <Wand2 size={12} className="inline mr-1" />
                  Instrucciones para la IA
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ej: Genera un quiz de la Revolución Industrial nivel principiante..."
                  rows={4}
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-purple-300 resize-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Sé específico sobre el tema, nivel de dificultad y tipo de
                  preguntas que deseas.
                </p>
              </div>

              {/* Num Questions */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Cantidad de preguntas
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={numPreguntas}
                    onChange={(e) => setNumPreguntas(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <span className="w-12 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold text-sm">
                    {numPreguntas}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>
          ) : (
            /* Review Step */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Preguntas generadas ({generatedQuestions.length})
                </h3>
                <button
                  onClick={() => setStep("prompt")}
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  Volver a configurar
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          {q.texto}
                        </p>
                        <div className="space-y-1">
                          {q.respuestas?.map((r: any, rIdx: number) => (
                            <div
                              key={rIdx}
                              className={cn(
                                "flex items-center gap-2 text-xs px-2 py-1.5 rounded-lg",
                                r.esCorrecta
                                  ? "bg-green-100 text-green-700 font-medium"
                                  : "text-gray-600"
                              )}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: r.color || "#ccc" }}
                              />
                              {r.texto}
                              {r.esCorrecta && (
                                <CheckCircle2 size={12} className="ml-auto" />
                              )}
                            </div>
                          ))}
                        </div>
                        {q.explicacion && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            💡 {q.explicacion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          {step === "prompt" ? (
            <>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-purple-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generar cuestionario
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep("prompt")}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-200"
              >
                <CheckCircle2 size={16} />
                Agregar al editor
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
