"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * Componente de Registro de nuevos creadores.
 * Llama a authApi.register y otorga acceso inmediato al sistema al completarse.
 */
export default function RegisterPage() {
  const router = useRouter();
  const { register: performRegister } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await performRegister(nombre, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-[#fcfcff] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-purple-300/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-blue-300/30 blur-[120px] rounded-full pointer-events-none" />

      {/* Left Hero Panel */}
      <div className="hidden lg:flex flex-col flex-1 p-12 relative z-10">
        <div className="glass-card flex-1 rounded-3xl overflow-hidden relative flex flex-col justify-end p-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-indigo-800/90 z-0" />
          <div className="relative z-10 w-full max-w-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-xl">
                <BrainCircuit size={28} />
              </div>
              <span className="font-bold text-3xl font-outfit tracking-tight">QuizMaster Pro</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 font-outfit leading-tight">
              Tu plataforma de quizzes interactivos te está esperando.
            </h1>
            <p className="text-lg text-purple-100 font-medium">
              Regístrate gratis y comienza a crear experiencias de aprendizaje únicas con IA, grupos dinámicos y reportes en tiempo real.
            </p>

            {/* Feature list */}
            <ul className="mt-8 space-y-3">
              {[
                "Generación de quizzes con Inteligencia Artificial",
                "Gestión de grupos y etiquetas",
                "Reportes y estadísticas en tiempo real",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-purple-100 font-medium">
                  <CheckCircle2 size={18} className="text-purple-300 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right Register Form */}
      <div className="w-full lg:w-[520px] flex flex-col justify-center px-8 lg:px-16 relative z-10">
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <BrainCircuit size={22} />
            </div>
            <span className="font-bold text-2xl font-outfit tracking-tight text-gray-900">QuizMaster Pro</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-outfit mb-2 text-gray-900">Crear cuenta</h2>
            <p className="text-gray-500 font-medium">Completa el formulario para obtener acceso al sistema</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-1">
              <label htmlFor="reg-nombre" className="text-sm font-bold text-gray-700 ml-1">
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  id="reg-nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 shadow-sm font-medium transition-all hover:bg-gray-50 outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-sm font-bold text-gray-700 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 shadow-sm font-medium transition-all hover:bg-gray-50 outline-none"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1">
              <label htmlFor="reg-password" className="text-sm font-bold text-gray-700 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 shadow-sm font-medium transition-all hover:bg-gray-50 outline-none"
                  required
                />
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-1">
              <label htmlFor="reg-confirm" className="text-sm font-bold text-gray-700 ml-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 shadow-sm font-medium transition-all hover:bg-gray-50 outline-none"
                  required
                />
              </div>
            </div>

            <button
              id="btn-register"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-3.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgba(109,40,217,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(109,40,217,0.4)] hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>Crear cuenta y acceder <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/" className="font-bold text-purple-600 hover:text-purple-700 hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
