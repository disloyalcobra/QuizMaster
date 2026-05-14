# 📘 Guía Completa de QuizMaster Pro

Este documento describe la arquitectura, la ubicación de las páginas y la función de cada archivo clave en el proyecto.

---

## 🏗️ Arquitectura General
El proyecto es una aplicación **Fullstack** dividida en dos grandes bloques:
1. **Frontend (`/frontend`)**: Construido con **Next.js 15+** (App Router), Tailwind CSS v4 para estilos y Framer Motion para animaciones.
2. **Backend (`/backend`)**: Construido con **NestJS**, utilizando **Prisma ORM** para el modelado de datos y **Supabase** como base de datos PostgreSQL y sistema de autenticación.

---

## 🎨 Frontend (Carpeta `frontend`)

### 📍 Mapa de Páginas (Rutas)
Las rutas se encuentran en `src/app/`. Aquí se define qué ve el usuario en el navegador:

| Ruta en Navegador | Archivo en Código | Descripción |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | **Página de Login**. Es la puerta de entrada. |
| `/dashboard` | `src/app/dashboard/page.tsx` | **Panel Principal**. Muestra la lista de Quizzes del usuario. |
| `/dashboard/grupos` | `src/app/dashboard/grupos/page.tsx` | **Gestión de Grupos**. Listado y creación de grupos de estudiantes. |
| `/dashboard/etiquetas` | `src/app/dashboard/etiquetas/page.tsx` | **Gestión de Etiquetas**. Clasificación de contenidos por temas. |
| `/dashboard/estadisticas` | `src/app/dashboard/estadisticas/page.tsx` | **Panel de Datos**. Visualización de rendimiento y métricas. |
| `/dashboard/quizzes/[id]/builder` | `src/app/dashboard/quizzes/[id]/builder/page.tsx` | **Constructor de Quizzes**. Editor visual para crear preguntas. |

### 📂 Organización de Archivos Clave
*   **`src/lib/supabase.ts`**: El "corazón" de la conexión. Configura el cliente para hablar con la base de datos de Supabase.
*   **`src/app/layout.tsx`**: Define la estructura global (Fuentes, Providers de Auth y el archivo de CSS principal).
*   **`src/app/dashboard/layout.tsx`**: Define el diseño del panel interno, incluyendo la **Sidebar**.
*   **`src/components/layout/Sidebar.tsx`**: El menú lateral interactivo y colapsable.
*   **`src/components/ui/`**: Componentes reutilizables como la `QuizCard.tsx` o cartas de estadísticas.
*   **`src/app/globals.css`**: Configuración de Tailwind v4 y estilos de diseño "Premium" (Glassmorphism).

---

## ⚙️ Backend (Carpeta `backend`)

### 📂 Estructura de Lógica
El backend está modularizado por funcionalidades en `src/`:
*   **`quizzes/`**: Lógica para crear, editar y listar cuestionarios.
*   **`grupos/`**: Manejo de agrupaciones de usuarios/estudiantes.
*   **`users/`**: Gestión de perfiles y roles.
*   **`auth/`**: Control de seguridad y tokens (si se usa API propia).
*   **`prisma/`**: Contiene `schema.prisma`, que es el plano maestro de las tablas en la base de datos.

### 📄 Archivos de Configuración
*   **`.env`**: Archivo crítico. Contiene las llaves secretas de Supabase y la URL de la base de datos.
*   **`main.ts`**: Punto de entrada donde arranca el servidor NestJS.

---

## 🗄️ Base de Datos (Supabase)
La base de datos es PostgreSQL y las tablas principales son:
*   `usuarios`: Almacena credenciales y perfiles.
*   `quizzes`: Contiene los títulos, descripciones y configuraciones de cada test.
*   `preguntas`: El contenido específico de cada quiz.
*   `grupos`: Organización de alumnos.

---

## 🚀 Cómo trabajar en el proyecto
1.  **Modificar Estilos**: Ve a `frontend/src/app/globals.css`.
2.  **Cambiar Lógica de Datos**: Ve a `frontend/src/lib/supabase.ts` o directamente al archivo de la página.
3.  **Añadir una nueva pantalla**: Crea una carpeta dentro de `frontend/src/app/dashboard/` con un archivo `page.tsx`.
