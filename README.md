# QuizMaster Pro

Una plataforma completa para la creación y gestión de cuestionarios interactivos.

## Estructura del Proyecto

- `frontend/`: Aplicación Next.js (Dashboard y visualización de Quizzes).
- `backend/`: API REST construida con NestJS y Prisma.

## Requisitos

- Node.js (v18+)
- PostgreSQL (Base de datos)
- Ollama (Para generación de quizzes con IA)

## Instalación

### Backend

1. Entra a la carpeta backend: `cd backend`
2. Instala dependencias: `npm install`
3. Configura el archivo `.env`
4. Ejecuta las migraciones de Prisma: `npx prisma migrate dev`
5. Inicia el servidor: `npm run start:dev`

### Frontend

1. Entra a la carpeta frontend: `cd frontend`
2. Instala dependencias: `npm install`
3. Configura el archivo `.env.local` con `NEXT_PUBLIC_API_URL`
4. Inicia el servidor: `npm run dev`

## Despliegue en Vercel (Frontend)

Para desplegar el frontend en Vercel:
1. Conecta este repositorio a Vercel.
2. Configura la carpeta raíz (`Root Directory`) como `frontend`.
3. Agrega la variable de entorno `NEXT_PUBLIC_API_URL` apuntando a tu backend en producción.
