"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { quizzesApi, gruposApi, etiquetasApi, mediaApi, type Grupo, type Etiqueta } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { IAWizard } from "@/components/editor/IAWizard";
import {
  ChevronLeft, Plus, Save, Trash2,
  Timer, Award, Image, Video, AlignLeft,
  CheckSquare, ToggleLeft, ListChecks, FileText,
  Music, X, Loader2, Eye, Globe, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * QuizEditor: Componente maestro para la creación y edición de cuestionarios.
 * Gestiona el estado local de múltiples preguntas, subida de archivos y sincronización con el backend.
 */


// ── TIPOS LOCALES (ESTADO DE LA UI) ──────────────────────────────────────────

/** Tipos de pregunta soportados por el sistema */
type TipoPregunta = "multiple" | "multi_select" | "verdadero_falso" | "abierta";

/** Estructura de una respuesta dentro del editor (antes de enviarla al API) */
interface RespuestaLocal {
  id?      : string;
  texto    : string;
  esCorrecta: boolean;
  color    : string;
  orden    : number;
}

/** Estructura de una pregunta completa dentro del estado del editor */
interface PreguntaLocal {
  id?          : string;
  texto        : string;
  tipoPregunta : TipoPregunta;
  orden        : number;
  tiempoLimite : number;
  puntosValor  : number;
  imagenUrl    : string;
  explicacion  : string;
  respuestas   : RespuestaLocal[];
  saved?       : boolean; // Indica si la pregunta ha sido sincronizada con la DB
}

// ── CONFIGURACIÓN Y CONSTANTES ───────────────────────────────────────────────

/** Paleta de colores rotativa para las opciones de respuesta */
const COLORES_RESPUESTA = ["#ef4444","#3b82f6","#22c55e","#f59e0b"];

/** Definición de opciones para el selector de tipo de pregunta */
const TIPOS_PREGUNTA = [
  { id: "multiple"       , label: "Opción Múltiple"  , icon: CheckSquare , desc: "Una respuesta correcta"      },
  { id: "multi_select"   , label: "Selec. Múltiple"  , icon: ListChecks  , desc: "Varias correctas"            },
  { id: "verdadero_falso", label: "Verdadero/Falso"  , icon: ToggleLeft  , desc: "Solo dos opciones"           },
  { id: "abierta"        , label: "Resp. Abierta"    , icon: AlignLeft   , desc: "El estudiante escribe"       },
] as const;

/** Valores permitidos para el tiempo límite (en segundos) */
const TIEMPOS = [5, 10, 20, 30, 60];

/** Puntajes estándar por pregunta */
const PUNTOS  = [100, 200, 500];

// ── FUNCIONES DE AYUDA (HELPERS) ─────────────────────────────────────────────

/** Genera la estructura inicial de respuestas según el tipo de pregunta elegido */
function defaultRespuestas(tipo: TipoPregunta): RespuestaLocal[] {
  if (tipo === "verdadero_falso") return [
    { texto: "Verdadero", esCorrecta: true , color: "#22c55e", orden: 1 },
    { texto: "Falso"    , esCorrecta: false, color: "#ef4444", orden: 2 },
  ];
  if (tipo === "abierta") return [];
  return [
    { texto: "", esCorrecta: false, color: COLORES_RESPUESTA[0], orden: 1 },
    { texto: "", esCorrecta: false, color: COLORES_RESPUESTA[1], orden: 2 },
  ];
}

/** Inicializa un objeto de tipo pregunta limpia para añadir al cuestionario */
function newPregunta(orden: number): PreguntaLocal {
  return {
    texto: "", tipoPregunta: "multiple", orden,
    tiempoLimite: 20, puntosValor: 100,
    imagenUrl: "", explicacion: "",
    respuestas: defaultRespuestas("multiple"),
  };
}

/** 
 * Transforma una pregunta proveniente de la API (DB) al formato 
 * que el estado local del editor necesita para funcionar.
 */
function mapPreguntaFromApi(p: any, idx: number): PreguntaLocal {
  return {
    id          : p.id,
    texto       : p.texto ?? "",
    tipoPregunta: p.tipoPregunta as TipoPregunta ?? "multiple",
    orden       : p.orden ?? idx + 1,
    tiempoLimite: p.tiempoLimite ?? 20,
    puntosValor : p.puntosValor ?? 100,
    imagenUrl   : p.imagenUrl ?? "",
    explicacion : p.explicacion ?? "",
    respuestas  : (p.respuestas ?? []).map((r: any) => ({
      id        : r.id,
      texto     : r.texto ?? "",
      esCorrecta: r.esCorrecta ?? false,
      color     : r.color ?? COLORES_RESPUESTA[r.orden - 1] ?? "#6366f1",
      orden     : r.orden ?? 1,
    })),
    saved: true,
  };
}

/**
 * FormularioPregunta: Sub-componente que renderiza el editor para una pregunta individual.
 * Permite cambiar el tipo de pregunta, redactar el enunciado, gestionar opciones de respuesta,
 * subir imágenes específicas y configurar tiempos/puntos.
 */
function FormularioPregunta({ pregunta, onChange, onSave, onDelete, saving }: {
  pregunta : PreguntaLocal;
  onChange : (p: PreguntaLocal) => void;
  onSave   : () => void;
  onDelete : () => void;
  saving   : boolean;
}) {
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = (fields: Partial<PreguntaLocal>) => onChange({ ...pregunta, ...fields });

  const changeTipo = (tipo: TipoPregunta) => set({ tipoPregunta: tipo, respuestas: defaultRespuestas(tipo) });

  const setRespuesta = (idx: number, fields: Partial<RespuestaLocal>) =>
    set({ respuestas: pregunta.respuestas.map((r, i) => i === idx ? { ...r, ...fields } : r) });

  const addRespuesta = () => {
    if (pregunta.respuestas.length >= 4) return;
    const idx = pregunta.respuestas.length;
    set({ respuestas: [...pregunta.respuestas, { texto: "", esCorrecta: false, color: COLORES_RESPUESTA[idx] ?? "#94a3b8", orden: idx + 1 }] });
  };

  const removeRespuesta = (idx: number) =>
    set({ respuestas: pregunta.respuestas.filter((_,i) => i!==idx).map((r,i) => ({...r,orden:i+1})) });

  const handleCorrectaChange = (idx: number, checked: boolean) => {
    if (pregunta.tipoPregunta === "multiple") {
      set({ respuestas: pregunta.respuestas.map((r,i) => ({...r, esCorrecta: i===idx ? checked : false})) });
    } else {
      setRespuesta(idx, { esCorrecta: checked });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const res = await mediaApi.upload(file, "images");
      set({ imagenUrl: res.url });
    } catch (err) {
      console.error(err);
      alert("Error subiendo la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1">
      {/* Tipo */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Tipo de pregunta</label>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS_PREGUNTA.map(t => (
            <button key={t.id} onClick={() => changeTipo(t.id)}
              className={cn("flex items-start gap-2.5 p-3 rounded-2xl border-2 text-left transition-all",
                pregunta.tipoPregunta===t.id ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:border-purple-200 hover:bg-gray-50"
              )}>
              <t.icon size={18} className={pregunta.tipoPregunta===t.id?"text-purple-600 mt-0.5":"text-gray-400 mt-0.5"}/>
              <div>
                <p className={cn("text-sm font-bold",pregunta.tipoPregunta===t.id?"text-purple-700":"text-gray-700")}>{t.label}</p>
                <p className="text-[11px] text-gray-400">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Enunciado */}
      <div className="mb-5">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Enunciado *</label>
        <textarea value={pregunta.texto} onChange={e=>set({texto:e.target.value})} placeholder="Escribe aquí tu pregunta..." rows={3}
          className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-purple-300 resize-none transition-colors"/>
      </div>

      {/* Respuestas */}
      {pregunta.tipoPregunta !== "abierta" && (
        <div className="mb-5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Respuestas</label>
          <div className="space-y-2.5">
            {pregunta.respuestas.map((resp,idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl flex-shrink-0" style={{background:resp.color}}/>
                <input value={resp.texto} onChange={e=>setRespuesta(idx,{texto:e.target.value})}
                  placeholder={`Opción ${idx+1}...`} disabled={pregunta.tipoPregunta==="verdadero_falso"}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-purple-300 disabled:bg-gray-50 disabled:text-gray-500"/>
                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <input type={pregunta.tipoPregunta==="multiple"?"radio":"checkbox"}
                    name={`correcta-${pregunta.orden}`} checked={resp.esCorrecta}
                    onChange={e=>handleCorrectaChange(idx,e.target.checked)} className="accent-green-500 w-4 h-4"/>
                  <span className="text-xs font-bold text-gray-500">✓</span>
                </label>
                {pregunta.tipoPregunta!=="verdadero_falso" && pregunta.respuestas.length>2 && (
                  <button onClick={()=>removeRespuesta(idx)} className="w-5 h-5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"><X size={13}/></button>
                )}
              </div>
            ))}
          </div>
          {pregunta.tipoPregunta!=="verdadero_falso" && pregunta.respuestas.length<4 && (
            <button onClick={addRespuesta} className="mt-3 flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700">
              <Plus size={14}/> Añadir opción
            </button>
          )}
        </div>
      )}

      {/* Tiempo y puntos */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Timer size={12}/> Tiempo</label>
          <div className="flex flex-wrap gap-1.5">
            {TIEMPOS.map(t=>(
              <button key={t} onClick={()=>set({tiempoLimite:t})}
                className={cn("px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",pregunta.tiempoLimite===t?"bg-purple-600 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {t}s
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Award size={12}/> Puntos</label>
          <div className="flex gap-1.5">
            {PUNTOS.map(p=>(
              <button key={p} onClick={()=>set({puntosValor:p})}
                className={cn("px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",pregunta.puntosValor===p?"bg-amber-500 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200")}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recursos opcionales */}
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block"><Image size={11}/> Imagen de la pregunta</label>
        <div className="flex items-center gap-2">
          {pregunta.imagenUrl && (
            <img src={pregunta.imagenUrl} alt="Pregunta" className="h-10 w-10 object-cover rounded-lg border border-gray-200" />
          )}
          <input
            value={pregunta.imagenUrl}
            onChange={e=>set({imagenUrl:e.target.value})}
            placeholder="URL de la imagen o súbela..."
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-purple-300"
          />
          <label className={cn("cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-purple-100 text-purple-600 rounded-xl px-3 py-2 transition-colors", uploadingImage && "opacity-50 pointer-events-none")}>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </label>
        </div>
      </div>

      {/* Explicación */}
      <div className="mb-6">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block"><FileText size={11}/> Explicación (modo estudio)</label>
        <textarea value={pregunta.explicacion} onChange={e=>set({explicacion:e.target.value})}
          placeholder="Explica la respuesta correcta..." rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs resize-none focus:outline-none focus:border-purple-300"/>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-3 mt-auto pt-4 border-t border-gray-100">
        <button onClick={onDelete}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-2xl border border-red-100 transition-colors">
          <Trash2 size={14}/> Eliminar
        </button>
        <button onClick={onSave} disabled={saving||!pregunta.texto.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-2xl disabled:opacity-50 transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>}
          Guardar pregunta
        </button>
      </div>
    </div>
  );
}

// ── Editor Principal ─────────────────────────────────────────────────────────────

interface QuizEditorProps {
  quizId?: string; // Si se recibe un ID, el componente entra en modo "Edición de Quiz Existente"
}

export function QuizEditor({ quizId: initialQuizId }: QuizEditorProps) {
  const router = useRouter();
  const { user } = useAuth();

  // ── ESTADO DE LA METADATA DEL QUIZ ──
  const [titulo, setTitulo]                     = useState("");
  const [descripcion, setDescripcion]           = useState("");
  const [grupoId, setGrupoId]                   = useState("");
  const [etiquetasSelec, setEtiquetasSelec]     = useState<string[]>([]);
  const [isPublic, setIsPublic]                 = useState(false);
  const [estado, setEstado]                     = useState<"borrador"|"publicado">("borrador");
  const [publicUrl, setPublicUrl]               = useState("");
  const [musicaUrl, setMusicaUrl]               = useState("");
  const [imagenPortada, setImagenPortada]       = useState("");
  const [uploadingPortada, setUploadingPortada] = useState(false); // Estado de carga para la imagen de portada
  const [uploadingMusica, setUploadingMusica]   = useState(false);  // Estado de carga para el audio MP3

  // ── CATÁLOGOS (GRUPOS Y ETIQUETAS DISPONIBLES) ──
  const [grupos, setGrupos]       = useState<Grupo[]>([]);
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);

  // ── GESTIÓN DE PREGUNTAS EN MEMORIA ──
  const [preguntas, setPreguntas]               = useState<PreguntaLocal[]>([newPregunta(1)]);
  const [activePreguntaIdx, setActivePreguntaIdx] = useState(0); // Índice de la pregunta que se está editando actualmente

  // ── ESTADOS DE PERSISTENCIA Y CARGA ──
  const [quizId, setQuizId]       = useState<string | null>(initialQuizId ?? null);
  const [savingMeta, setSavingMeta]     = useState(false);
  const [savingPregunta, setSavingPregunta] = useState(false);
  const [savedMeta, setSavedMeta]   = useState(false); // Feedback visual de guardado exitoso
  const [loadingQuiz, setLoadingQuiz] = useState(!!initialQuizId); // Spinner inicial si cargamos un quiz existente

  // ── ESTADO DEL WIZARD DE IA ──
  const [isAIWizardOpen, setIsAIWizardOpen] = useState(false);
  const [savingAll, setSavingAll]           = useState(false);

  // Cargar catálogos
  useEffect(() => {
    Promise.all([gruposApi.getAll(), etiquetasApi.getAll()])
      .then(([g,e]) => { setGrupos(g); setEtiquetas(e); })
      .catch(console.error);
  }, []);

  // ── Si viene quizId, cargar el quiz existente ────────────────────────────

  useEffect(() => {
    if (!initialQuizId) return;
    setLoadingQuiz(true);
    quizzesApi.getOne(initialQuizId)
      .then(quiz => {
        setTitulo(quiz.titulo ?? "");
        setDescripcion(quiz.descripcion ?? "");
        setGrupoId(quiz.grupoId ?? quiz.grupo?.id ?? "");
        setIsPublic(quiz.isPublic ?? false);
        setEstado((quiz.estado as "borrador"|"publicado") ?? "borrador");
        setPublicUrl(quiz.publicUrl ?? "");
        setMusicaUrl(quiz.musicaUrl ?? "");
        setImagenPortada(quiz.imagenPortada ?? "");
        // Etiquetas seleccionadas
        const etIds = (quiz.etiquetas ?? []).map((e: any) => e.etiqueta?.id ?? e.id).filter(Boolean);
        setEtiquetasSelec(etIds);
        // Preguntas
        const preg = (quiz.preguntas ?? []);
        if (preg.length > 0) {
          setPreguntas(preg.sort((a: any, b: any) => a.orden - b.orden).map((p: any, i: number) => mapPreguntaFromApi(p, i)));
        }
        setQuizId(quiz.id);
      })
      .catch(console.error)
      .finally(() => setLoadingQuiz(false));
  }, [initialQuizId]);

  /** 
   * Guarda la información básica del quiz (título, descripción, grupo, etiquetas).
   * Si es la primera vez, crea el registro en la DB; si no, lo actualiza.
   */
  const handleSaveMeta = async () => {
    if (!titulo.trim()) return;
    setSavingMeta(true);
    try {
      const payload = {
        titulo, descripcion,
        grupoId: grupoId || undefined,
        isPublic, estado,
        musicaUrl: musicaUrl || undefined,
        imagenPortada: imagenPortada || undefined,
        etiquetas: etiquetasSelec,
      };
      if (quizId) {
        await quizzesApi.update(quizId, payload as any);
      } else {
        const q = await quizzesApi.create(payload as any);
        setQuizId(q.id);
        if (q.publicUrl) setPublicUrl(q.publicUrl);
      }
      setSavedMeta(true);
      setTimeout(() => setSavedMeta(false), 2000);
    } catch(e){ console.error(e); } finally { setSavingMeta(false); }
  };

  // ── HANDLERS DE SUBIDA A SUPABASE STORAGE ──

  /** Sube la imagen de portada y actualiza la URL en el estado local */
  const handleUploadPortada = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPortada(true);
    try {
      const res = await mediaApi.upload(file, "images");
      setImagenPortada(res.url);
    } catch (err) {
      console.error(err);
      alert("Error subiendo la portada.");
    } finally {
      setUploadingPortada(false);
    }
  };

  /** Sube el archivo de audio y actualiza la URL en el estado local */
  const handleUploadMusica = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMusica(true);
    try {
      const res = await mediaApi.upload(file, "audios");
      setMusicaUrl(res.url);
    } catch (err) {
      console.error(err);
      alert("Error subiendo la música.");
    } finally {
      setUploadingMusica(false);
    }
  };

  /**
   * Sincroniza la pregunta actual con el backend.
   * Valida que el quiz principal ya tenga un ID antes de intentar guardar preguntas.
   */
  const handleSavePregunta = async () => {
    if (!quizId) {
      alert("Primero guarda el quiz (título obligatorio) antes de añadir preguntas.");
      return;
    }
    const p = preguntas[activePreguntaIdx];
    if (!p.texto.trim()) return;
    setSavingPregunta(true);
    try {
      const payload = {
        texto: p.texto, tipoPregunta: p.tipoPregunta, orden: p.orden,
        tiempoLimite: p.tiempoLimite, puntosValor: p.puntosValor,
        imagenUrl: p.imagenUrl || undefined,
        explicacion: p.explicacion || undefined,
        respuestas: p.tipoPregunta !== "abierta" ? p.respuestas : [],
      };
      if (p.id) {
        await quizzesApi.updatePregunta(p.id, payload);
      } else {
        const created = await quizzesApi.addPregunta(quizId, payload);
        setPreguntas(prev => prev.map((pr,i) => i===activePreguntaIdx ? {...pr, id: created.id, saved: true} : pr));
        return;
      }
      setPreguntas(prev => prev.map((pr,i) => i===activePreguntaIdx ? {...pr, saved: true} : pr));
    } catch(e){ console.error(e); } finally { setSavingPregunta(false); }
  };

  /**
   * Guarda todas las preguntas del editor de forma masiva.
   * Útil después de generar preguntas con IA o hacer cambios en muchas preguntas.
   */
  const handleSaveAllQuestions = async () => {
    if (!quizId) {
      alert("Primero guarda el quiz (en la parte superior) antes de guardar las preguntas.");
      return;
    }
    
    // Filtrar preguntas vacías o inválidas si es necesario, pero aquí enviaremos todas
    // Las preguntas deben tener al menos texto para guardarse.
    const validQuestions = preguntas.filter(p => p.texto.trim() !== "");
    if (validQuestions.length === 0) return;

    setSavingAll(true);
    try {
      const payload = validQuestions.map(p => ({
        id: p.id,
        texto: p.texto,
        tipoPregunta: p.tipoPregunta,
        orden: p.orden,
        tiempoLimite: p.tiempoLimite,
        puntosValor: p.puntosValor,
        imagenUrl: p.imagenUrl || undefined,
        explicacion: p.explicacion || undefined,
        respuestas: p.tipoPregunta !== "abierta" ? p.respuestas : [],
      }));

      const syncRes = await quizzesApi.syncPreguntas(quizId, payload);
      
      // Mapear de vuelta los resultados (especialmente los nuevos IDs)
      const updatedPreguntas = syncRes.map((p, idx) => mapPreguntaFromApi(p, idx));
      setPreguntas(updatedPreguntas);
      
      alert("¡Todas las preguntas han sido guardadas con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al guardar todas las preguntas.");
    } finally {
      setSavingAll(false);
    }
  };

  // ── GESTIÓN DE LA LISTA DE PREGUNTAS ──

  /** Añade una pregunta vacía al final de la lista y la selecciona */
  const handleAddPregunta = () => {
    const nueva = newPregunta(preguntas.length + 1);
    setPreguntas(prev => [...prev, nueva]);
    setActivePreguntaIdx(preguntas.length);
  };

  /** Elimina la pregunta seleccionada tanto del estado local como de la DB (si ya existe) */
  const handleDeletePregunta = async () => {
    const p = preguntas[activePreguntaIdx];
    if (p.id && quizId) {
      if (!confirm("¿Eliminar esta pregunta?")) return;
      try { await quizzesApi.removePregunta(p.id); } catch(e){ console.error(e); }
    }
    const next = preguntas.filter((_,i)=>i!==activePreguntaIdx).map((pr,i)=>({...pr,orden:i+1}));
    setPreguntas(next.length ? next : [newPregunta(1)]);
    setActivePreguntaIdx(Math.max(0, activePreguntaIdx-1));
  };

  /** Actualiza la pregunta activa en el estado global y marca como 'pendiete de guardado' */
  const handleChangePregunta = (updated: PreguntaLocal) =>
    setPreguntas(prev => prev.map((p,i) => i===activePreguntaIdx ? {...updated, saved: false} : p));

  /** Agrega o quita una etiqueta del array de seleccionadas */
  const toggleEtiqueta = (id: string) =>
    setEtiquetasSelec(prev => prev.includes(id) ? prev.filter(e=>e!==id) : [...prev, id]);

  /**
   * Maneja las preguntas generadas por IA desde el IAWizard.
   * Convierte el formato de la IA al formato local del editor y las agrega al cuestionario.
   */
  const handleAIGenerated = (aiQuestions: any[]) => {
    if (!quizId) {
      alert("Primero guarda el quiz (título obligatorio) antes de añadir preguntas.");
      return;
    }

    const mappedQuestions: PreguntaLocal[] = aiQuestions.map((q, idx) => ({
      id: undefined, // Las preguntas de IA son nuevas, no tienen ID aún
      texto: q.texto || "",
      tipoPregunta: (q.tipoPregunta as TipoPregunta) || "multiple",
      orden: preguntas.length + idx + 1,
      tiempoLimite: q.tiempoLimite || 20,
      puntosValor: q.puntosValor || 100,
      imagenUrl: q.imagenUrl || "",
      explicacion: q.explicacion || "",
      respuestas: (q.respuestas || []).map((r: any, rIdx: number) => ({
        texto: r.texto || "",
        esCorrecta: r.esCorrecta || false,
        color: r.color || COLORES_RESPUESTA[rIdx % COLORES_RESPUESTA.length],
        orden: r.orden || rIdx + 1,
      })),
      saved: false, // Marcamos como no guardadas para que el usuario las revise
    }));

    setPreguntas(prev => [...prev, ...mappedQuestions]);
    setActivePreguntaIdx(preguntas.length); // Selecciona la primera pregunta generada
  };

  if (loadingQuiz) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"/>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto h-full flex flex-col animate-in fade-in duration-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors">
            <ChevronLeft size={22}/>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-none mb-0.5">{titulo || (initialQuizId ? "Editando Quiz" : "Nuevo Quiz")}</h1>
            <p className="text-xs text-gray-400 font-medium">{quizId ? `ID: ${quizId.slice(0,8)}...` : "Sin guardar"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quizId && (
            <button onClick={() => { if(publicUrl) window.open(`/quiz/${publicUrl}`, '_blank') }} disabled={!publicUrl} className="flex gap-2 items-center bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-purple-700 px-5 py-2.5 rounded-2xl font-bold transition-all disabled:opacity-50 hover:-translate-y-0.5">
            <Globe size={18}/> Vista previa
          </button>
          )}
          <button onClick={handleSaveMeta} disabled={savingMeta||!titulo.trim()}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-2xl transition-all",
              savedMeta ? "bg-green-500 text-white" : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200"
            )}>
            {savingMeta ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
            {savedMeta ? "¡Guardado!" : "Guardar Quiz"}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Título *</label>
            <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Título del quiz..."
              className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 text-base font-bold focus:outline-none focus:border-purple-300 transition-colors"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={2}
              placeholder="Describe brevemente el contenido del quiz..."
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:border-purple-300"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Grupo</label>
            <select value={grupoId} onChange={e=>setGrupoId(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-purple-300 bg-white">
              <option value="">Sin grupo</option>
              {grupos.map(g=><option key={g.id} value={g.id}>{g.icono} {g.nombre}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Estado</label>
              <select value={estado} onChange={e=>setEstado(e.target.value as "borrador"|"publicado")}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-purple-300 bg-white">
                <option value="borrador">Borrador</option>
                <option value="publicado">Publicado</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Público</label>
              <button onClick={()=>setIsPublic(!isPublic)}
                className={cn("h-[46px] px-4 rounded-2xl text-sm font-bold border-2 transition-all",
                  isPublic ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500")}>
                {isPublic?"✓ Sí":"No"}
              </button>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Etiquetas</label>
            <div className="flex flex-wrap gap-2">
              {etiquetas.map(et=>(
                <button key={et.id} onClick={()=>toggleEtiqueta(et.id)}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all",
                    etiquetasSelec.includes(et.id) ? "text-white border-transparent" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                  style={etiquetasSelec.includes(et.id)?{background:et.colorHex??'#6366f1',borderColor:et.colorHex??'#6366f1'}:{}}>
                  {et.nombre}
                </button>
              ))}
              {etiquetas.length===0 && <span className="text-xs text-gray-400">Crea etiquetas desde Grupos.</span>}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block"><Image size={11}/> Imagen de portada</label>
            <div className="flex items-center gap-2">
              {imagenPortada && <img src={imagenPortada} alt="Portada" className="h-10 w-10 object-cover rounded-lg border border-gray-200"/>}
              <input value={imagenPortada} onChange={e=>setImagenPortada(e.target.value)} placeholder="URL o subir archivo..."
                className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-300"/>
              <label className={cn("cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-purple-100 text-purple-600 rounded-xl px-4 py-3 transition-colors", uploadingPortada && "opacity-50 pointer-events-none")}>
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadPortada} />
                {uploadingPortada ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1 block"><Music size={11}/> Música de fondo</label>
            {user?.rol==="admin" ? (
              <div className="flex items-center gap-2">
                <input value={musicaUrl} onChange={e=>setMusicaUrl(e.target.value)} placeholder="URL del MP3 o subir..."
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-300"/>
                <label className={cn("cursor-pointer flex items-center justify-center bg-gray-100 hover:bg-purple-100 text-purple-600 rounded-xl px-4 py-3 transition-colors", uploadingMusica && "opacity-50 pointer-events-none")}>
                  <input type="file" accept="audio/*" className="hidden" onChange={handleUploadMusica} />
                  {uploadingMusica ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                </label>
              </div>
            ) : (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-2xl px-4 py-3">Solo el administrador puede añadir música.</p>
            )}
          </div>
        </div>
      </div>

      {/* Editor de Preguntas */}
      <div className="flex gap-6 flex-1 min-h-[500px]">
        {/* Panel izquierdo */}
        <div className="w-60 flex-shrink-0 flex flex-col">
          <div className="bg-white border border-gray-100 rounded-3xl flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Preguntas</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSaveAllQuestions}
                  disabled={savingAll || preguntas.length === 0}
                  title="Guardar todos los cambios"
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  {savingAll ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                </button>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{preguntas.length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              {preguntas.map((p,idx)=>{
                const TipoIcon = TIPOS_PREGUNTA.find(t=>t.id===p.tipoPregunta)?.icon ?? CheckSquare;
                return (
                  <button key={idx} onClick={()=>setActivePreguntaIdx(idx)}
                    className={cn("w-full flex items-center gap-2.5 px-3 py-3 rounded-2xl text-left transition-all border-2",
                      activePreguntaIdx===idx ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50 border-transparent"
                    )}>
                    <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black",
                      activePreguntaIdx===idx?"bg-purple-600 text-white":"bg-gray-100 text-gray-500")}>
                      {idx+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 truncate">{p.texto||"Sin enunciado"}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <TipoIcon size={9} className="text-gray-400"/>
                        <span className="text-[10px] text-gray-400">{p.tiempoLimite}s · {p.puntosValor}pts</span>
                      </div>
                    </div>
                    {p.saved && <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="Guardada"/>}
                  </button>
                );
              })}
            </div>

            <div className="p-3 border-t border-gray-100 space-y-2">
              <button onClick={handleAddPregunta}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-purple-600 hover:bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200 transition-colors"
              >
                <Plus size={15}/> Añadir pregunta
              </button>

              {quizId && (
                <button
                  onClick={() => setIsAIWizardOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200 transition-colors"
                >
                  <Sparkles size={15} />
                  ✨ Hazlo con IA
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 overflow-hidden flex flex-col">
          {preguntas[activePreguntaIdx] ? (
            <>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-black">{activePreguntaIdx+1}</div>
                <h3 className="font-bold text-gray-900">Pregunta {activePreguntaIdx+1}</h3>
                {preguntas[activePreguntaIdx].saved && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold ml-auto">✓ Guardada</span>}
              </div>
              <FormularioPregunta
                pregunta={preguntas[activePreguntaIdx]}
                onChange={handleChangePregunta}
                onSave={handleSavePregunta}
                onDelete={handleDeletePregunta}
                saving={savingPregunta}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Plus size={36} className="mb-3 opacity-20"/>
              <p className="font-medium">Selecciona o añade una pregunta</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal del Wizard de IA */}
      <IAWizard
        isOpen={isAIWizardOpen}
        onClose={() => setIsAIWizardOpen(false)}
        onGenerated={handleAIGenerated}
      />
    </div>
  );
}
