"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usersApi, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Mail,
  Shield,
  User as UserIcon,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Modal for creating/editing users
function UserModal({
  open,
  onClose,
  onSuccess,
  userEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userEdit?: User | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(userEdit?.nombre ?? "");
  const [email, setEmail] = useState(userEdit?.email ?? "");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState(userEdit?.rol ?? "creador");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (userEdit) {
      setNombre(userEdit.nombre);
      setEmail(userEdit.email);
      setRol(userEdit.rol);
      setPassword("");
    } else {
      setNombre("");
      setEmail("");
      setRol("creador");
      setPassword("");
    }
    setError(null);
  }, [userEdit, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !email.trim()) {
      setError("Nombre y email son requeridos");
      return;
    }

    if (!userEdit && !password.trim()) {
      setError("La contraseña es requerida para nuevos usuarios");
      return;
    }

    setLoading(true);
    try {
      if (userEdit) {
        // Update existing user
        const updateData: Partial<User> = { nombre, email, rol };
        if (password.trim()) {
          // In a real implementation, you'd have a separate endpoint or include password
          // For now, we'll just update the basic info
        }
        await usersApi.update(userEdit.id, updateData);
      } else {
        // Create new user
        await usersApi.create({ nombre, email, password, rol });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setShowPassword(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {userEdit ? "Editar Usuario" : "Nuevo Usuario"}
            </h2>
            <p className="text-sm text-gray-500">
              {userEdit ? "Actualiza los datos del usuario" : "Crea una nueva cuenta de usuario"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              Nombre completo *
            </label>
            <div className="relative">
              <UserIcon
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              Correo electrónico *
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1.5 block">
              Rol *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "creador", label: "Creador", desc: "Puede crear quizzes" },
                { id: "admin", label: "Administrador", desc: "Acceso completo" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRol(r.id)}
                  className={cn(
                    "p-3 rounded-xl border-2 text-left transition-all",
                    rol === r.id
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-100 hover:border-purple-200"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Shield
                      size={16}
                      className={rol === r.id ? "text-purple-600" : "text-gray-400"}
                    />
                    <span className="font-bold text-sm">{r.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {!userEdit && (
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1.5 block">
                Contraseña *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Generar
                </button>
              </div>
              {password && (
                <p className="text-xs text-gray-500 mt-1">
                  Contraseña generada: {" "}
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {password}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{userEdit ? "Guardar cambios" : "Crear usuario"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete confirmation modal
function DeleteModal({
  open,
  onClose,
  onConfirm,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
}) {
  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} />
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
          ¿Eliminar usuario?
        </h3>

        <p className="text-sm text-gray-500 text-center mb-6">
          Estás a punto de eliminar a{" "}
          <span className="font-bold text-gray-700">{user.nombre}</span>. Esta acción no se
          puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userEdit, setUserEdit] = useState<User | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "creador">("all");

  // Check if current user is admin
  const isAdmin = currentUser?.rol === "admin";

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await usersApi.remove(userToDelete.id);
      setDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      alert("Error al eliminar usuario: " + err.message);
    }
  };

  const handleEdit = (user: User) => {
    setUserEdit(user);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setUserEdit(null);
    setModalOpen(true);
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.rol === filterRole;
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-12 text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Acceso denegado</h1>
          <p className="text-red-600">
            Solo los administradores pueden acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Administración</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                <Shield size={10} /> Admin
              </span>
            </div>
          </div>
          <p className="text-gray-500">Gestiona los usuarios de la plataforma</p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-purple-500" />
            <span className="text-sm text-gray-500">Total Usuarios</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-amber-500" />
            <span className="text-sm text-gray-500">Administradores</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.rol === "admin").length}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <UserIcon size={20} className="text-blue-500" />
            <span className="text-sm text-gray-500">Creadores</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {users.filter((u) => u.rol === "creador").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as typeof filterRole)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="creador">Creadores</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={40} className="animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-500">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-medium text-gray-500 mb-1">No se encontraron usuarios</p>
            <p className="text-sm">
              {searchQuery || filterRole !== "all"
                ? "Intenta con otros filtros"
                : "Crea tu primer usuario para empezar"}
            </p>
            {!searchQuery && filterRole === "all" && (
              <button
                onClick={handleCreate}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors"
              >
                Crear usuario
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.nombre}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    user.nombre.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900 truncate">{user.nombre}</p>
                    {user.id === currentUser?.id && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                        Tú
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                      user.rol === "admin"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-blue-100 text-blue-700"
                    )}
                  >
                    <Shield size={12} />
                    {user.rol === "admin" ? "Admin" : "Creador"}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(user)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                      title="Editar"
                    >
                      <Edit size={15} />
                    </button>

                    <button
                      onClick={() => openDeleteModal(user)}
                      disabled={user.id === currentUser?.id}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30"
                      title={
                        user.id === currentUser?.id
                          ? "No puedes eliminarte a ti mismo"
                          : "Eliminar"
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setUserEdit(null);
        }}
        onSuccess={loadUsers}
        userEdit={userEdit}
      />

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        user={userToDelete}
      />
    </div>
  );
}
