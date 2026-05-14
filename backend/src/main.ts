import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Función Bootstrap: Punto de entrada principal de la aplicación NestJS.
 * Aquí se configura el servidor web, CORS y los pipes globales.
 */
async function bootstrap() {
  // Crea la instancia de la aplicación basada en el módulo raíz (AppModule)
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS para permitir peticiones desde el frontend (Next.js)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Configuración de Pipes Globales: Valida automáticamente los datos de entrada (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,         // Elimina propiedades que no estén en el DTO
      transform: true,         // Transforma tipos automáticamente (ej: string a number)
      forbidNonWhitelisted: false,
    }),
  );

  // Prefijo global para todas las rutas de la API (Ej: http://localhost:3000/api/quizzes)
  app.setGlobalPrefix('api');

  // Definición del puerto y arranque del servidor
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 QuizMaster Pro backend corriendo en: http://localhost:${port}/api`);
}

bootstrap();
