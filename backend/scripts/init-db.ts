import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@zikabet.com' },
    update: {},
    create: {
      name: 'Admin Zikabet',
      email: 'admin@zikabet.com',
      cpf: '00000000000',
      password: adminPassword,
      role: 'ADMIN',
      balance: 0,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      name: 'Usuário Teste',
      email: 'user@test.com',
      cpf: '11111111111',
      password: userPassword,
      role: 'USER',
      balance: 100,
    },
  });

  console.log('✅ Test user created:', user.email);
  console.log('🎉 Database initialized!');
}

main()
  .catch((e) => {
    console.error('❌ Initialization failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

