"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BrainCircuit,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { mediaApi, usersApi } from '@/lib/api';

/**
 * MENU_ITEMS: Navegación principal del Dashboard.
 * Define los enlaces a las secciones principales de la plataforma.
 * Nota: Las estadísticas ahora están disponibles por quiz y por grupo.
 */
interface MenuItem {
  name: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { name: 'Mis Quizzes', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Grupos', icon: Users, path: '/dashboard/grupos' },
  { name: 'Administración', icon: Shield, path: '/dashboard/admin', adminOnly: true },
];

/**
 * Sidebar: Barra lateral de navegación persistente en el dashboard.
 * Permite alternar entre vistas contraída/expandida, subir avatar y cerrar sesión.
 */
export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Inicial del nombre del usuario para el avatar
  const userInitial = user?.nombre?.charAt(0).toUpperCase() ?? 'U';

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await mediaApi.upload(file, "avatars");
      await usersApi.updateMe({ avatarUrl: res.url });
      
      // Update local storage to reflect immediately (hacky but works without refreshing full app context if auth context doesn't auto-fetch)
      const qmUser = localStorage.getItem('qm_user');
      if (qmUser) {
        const parsed = JSON.parse(qmUser);
        parsed.avatarUrl = res.url;
        localStorage.setItem('qm_user', JSON.stringify(parsed));
      }
      
      // We could also do window.location.reload() or implement `refreshUser()` in useAuth, 
      // but for simplicity let's just reload to update the whole app state smoothly.
      window.location.reload();
    } catch(err) {
      console.error(err);
      alert("Error subiendo el avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: isExpanded ? 260 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col justify-between relative shadow-sm z-20 flex-shrink-0"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-200 transition-colors shadow-sm"
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      <div>
        {/* Brand */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] flex-shrink-0">
              <BrainCircuit size={22} />
            </div>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-xl tracking-tight text-gray-900 font-outfit"
              >
                QuizMaster
              </motion.span>
            )}
          </div>
        </div>

        {/* Links */}
        <nav className="mt-6 px-3 space-y-1">
          {MENU_ITEMS.filter(item => !item.adminOnly || user?.rol === 'admin').map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));

            return (
              <Link key={item.name} href={item.path}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative overflow-hidden",
                    isActive
                      ? "bg-purple-50 text-purple-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon
                    size={20}
                    className={cn(
                      "flex-shrink-0 transition-colors",
                      isActive ? "text-purple-600" : "text-gray-400 group-hover:text-purple-500"
                    )}
                  />
                  {isExpanded && (
                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl">
          <label className={cn("relative flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 text-sm overflow-hidden border border-gray-200 cursor-pointer shadow-sm", uploadingAvatar && "opacity-50 pointer-events-none")}>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {userInitial}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/40 hidden md:flex opacity-0 hover:opacity-100 items-center justify-center transition-opacity">
              <span className="text-white text-[10px] font-bold">Editar</span>
            </div>
          </label>
          {isExpanded && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{user?.nombre ?? 'Usuario'}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user?.rol ?? 'creador'}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
};
