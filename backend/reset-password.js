// Script para resetar senha de um usuário
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/password.js';

const prisma = new PrismaClient();

async function resetPassword(email, newPassword) {
  try {
    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log(`❌ Usuário não encontrado: ${normalizedEmail}`);
      return;
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar senha
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    console.log(`✅ Senha resetada para: ${normalizedEmail}`);
    console.log(`   Nova senha: ${newPassword}`);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Resetar senha do usuário de teste
const email = process.argv[2] || 'user@test.com';
const password = process.argv[3] || '123456';

resetPassword(email, password);

