import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@quizmaster.com';
  const password = 'admin123';
  const nombre = 'Administrador Quizmaster';

  console.log(`--- Recuperando Acceso para ${email} ---`);

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.usuario.upsert({
      where: { email },
      update: {
        passwordHash,
        rol: 'admin',
      },
      create: {
        nombre,
        email,
        passwordHash,
        rol: 'admin',
        emailVerificado: true,
      },
    });

    console.log(`✅ Contraseña actualizada/Usuario creado con éxito: ${user.email}`);
    console.log(`🔑 Credenciales:`);
    console.log(`   Email: ${email}`);
    console.log(`   Pass:  ${password}`);
    
    // Listar usuarios existentes para debug
    const allUsers = await prisma.usuario.findMany({ select: { email: true, rol: true } });
    console.log(`\nUsuarios actualmente en la base de datos (${allUsers.length}):`);
    allUsers.forEach(u => console.log(`- ${u.email} (Rol: ${u.rol})`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
