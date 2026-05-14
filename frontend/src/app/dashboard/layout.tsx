"use client";

import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

/**
 * Layout maestro para todas las rutas dentro de /dashboard.
 * Proporciona la Sidebar lateral y el contenedor principal con efectos visuales de fondo.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#fcfcff] overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto w-full relative">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-200/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-blue-200/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="p-8 md:p-10 relative z-10 w-full">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
