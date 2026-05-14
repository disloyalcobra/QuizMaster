import "dotenv/config";
import { defineConfig } from "prisma/config";

// Configuración mínima para que el CLI de Prisma 7 funcione correctamente
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
    directUrl: process.env.DIRECT_URL,
  },
});
