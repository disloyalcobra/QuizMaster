import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "QuizMaster Pro | Plataforma de Quizzes Interactivos con IA",
  description:
    "Crea, gestiona y distribuye quizzes interactivos con IA. Plataforma para educadores y creadores de contenido.",
};

/**
 * RootLayout: El componente que envuelve toda la aplicación.
 * Aquí se definen las fuentes globales, metadatos SEO y los contextos (como Auth).
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-[#fcfcff] text-gray-900 font-inter antialiased">
        {/* AuthProvider envuelve toda la app para manejar el estado de sesión */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
