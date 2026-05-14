'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute: Componente Guard que protege rutas privadas en el cliente.
 * Verifica si existe un usuario/token; si no, redirige al login.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si terminó de cargar y no hay usuario, mandamos al login
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Mientras carga o si no hay usuario (está redirigiendo), mostramos un spinner
  if (loading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#fcfcff]">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-500 font-bold font-outfit">Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}
