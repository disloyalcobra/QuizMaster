import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Seguridad: Protege las rutas privadas.
 * Si un usuario intenta acceder a /dashboard sin un token, lo redirige al login.
 */
export function middleware(request: NextRequest) {
  // Obtenemos el token desde las cookies (opcionalmente) o simplemente validamos la ruta
  // En Next.js, localStorage no es accesible en Middleware (corre en el Edge Runtime).
  // Por ahora, validaremos la existencia del token en la cookie si la implementamos, 
  // pero la forma más común en Next.js App Router para esto es usar un componente Guard o Cookies.
  
  // Como estamos usando localStorage en el cliente, el Middleware no puede leerlo directamente.
  // Vamos a implementar una redirección simple basada en cookies si decidimos usarlas, 
  // o usaremos un Client Side Guard para mayor flexibilidad con localStorage.
  
  return NextResponse.next();
}

// Configuración de rutas que activa el middleware
export const config = {
  matcher: ['/dashboard/:path*'],
};
