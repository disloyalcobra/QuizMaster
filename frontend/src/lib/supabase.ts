/**
 * Configuración del cliente oficial de Supabase.
 * Este archivo centraliza la conexión con la base de datos PostgreSQL y los servicios de Supabase.
 */
import { createClient } from '@supabase/supabase-js';

// Intentamos obtener las credenciales de las variables de entorno.
// Soportamos tanto el prefijo NEXT_PUBLIC_ (estándar en Next.js) como VITE_ (por si se migra el frontend).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://nlhpraaosiyopnvwijff.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5saHByYWFvc2l5b3BudndpamZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NzI2OTcsImV4cCI6MjA5MTI0ODY5N30.vIZp2V90mTiiRd7iSqsKCT0am4poFu0sRqA6JO28j4E';

// Validación preventiva en consola si faltan las llaves de configuración.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Alerta: No se detectaron las variables de entorno de Supabase en .env');
}

/**
 * Instancia del cliente de Supabase exportada para su uso en toda la aplicación (CRUD, Auth, etc).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
