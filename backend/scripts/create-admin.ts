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
  console.log('🔐 Criando usuário admin...');
  console.log('📧 Email: admin@zika.games');
  console.log('🔑 Senha: zika123admin');

  const email = 'admin@zika.games';
  const password = 'zika123admin';
  const name = 'Admin Zika';
  const cpf = '00000000000';

  // Hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Atualizar usuário existente
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Usuário admin atualizado com sucesso!');
      console.log('   Email:', updatedUser.email);
      console.log('   Nome:', updatedUser.name);
      console.log('   Role:', updatedUser.role);
    } else {
      // Criar novo usuário
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          cpf,
          password: hashedPassword,
          role: 'ADMIN',
          balance: 0,
        },
      });
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('   Email:', newUser.email);
      console.log('   Nome:', newUser.name);
      console.log('   Role:', newUser.role);
    }
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário admin:', error.message);
    
    // Se o erro for de CPF duplicado, tentar atualizar
    if (error.code === 'P2002' && error.meta?.target?.includes('cpf')) {
      console.log('⚠️  CPF já existe, tentando atualizar pelo CPF...');
      try {
        const updatedUser = await prisma.user.update({
          where: { cpf },
          data: {
            email,
            name,
            password: hashedPassword,
            role: 'ADMIN',
          },
        });
        console.log('✅ Usuário admin atualizado pelo CPF!');
        console.log('   Email:', updatedUser.email);
        console.log('   Nome:', updatedUser.name);
        console.log('   Role:', updatedUser.role);
      } catch (updateError: any) {
        console.error('❌ Erro ao atualizar:', updateError.message);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

