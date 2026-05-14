"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { BrainCircuit, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Componente principal de la página de Login.
 * Gestiona el acceso de los usuarios validando sus credenciales contra la base de datos de Supabase.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login: performLogin } = useAuth();

  // Estados para manejar los campos del formulario y el feedback al usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Procesa el intento de inicio de sesión.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Usamos el método login del contexto para asegurar que el estado global se actualice
      await performLogin(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-[#fcfcff] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-purple-300/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-96 h-96 bg-blue-300/30 blur-[120px] rounded-full pointer-events-none" />

      {/* Left Image/Hero info */}
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
            <h1 className="text-4xl font-bold mb-4 font-outfit leading-tight">Elevando la educación interactiva al futuro.</h1>
            <p className="text-lg text-purple-100 font-medium">
              Aprovecha nuestra infraestructura impulsada por IA y bases de datos dinámicas con Supabase. Gestiona grupos, quizzes y reportes en segundos.
            </p>
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="w-full lg:w-[500px] flex flex-col justify-center px-8 lg:px-16 relative z-10">
        <div className="w-full max-w-sm mx-auto">

          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <BrainCircuit size={22} />
            </div>
            <span className="font-bold text-2xl font-outfit tracking-tight text-gray-900">QuizMaster Pro</span>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold font-outfit mb-2 text-gray-900">Bienvenido de vuelta</h2>
            <p className="text-gray-500 font-medium">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Correo Electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 shadow-sm font-medium transition-all hover:bg-gray-50 outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl focus:ring-purple-500 focus:border-purple-500 block pl-11 p-3.5 shadow-sm font-medium transition-all hover:bg-gray-50 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white p-3.5 rounded-2xl font-bold shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>Iniciar Sesión <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-bold text-purple-600 hover:text-purple-700 hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
