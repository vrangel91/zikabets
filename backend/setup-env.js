import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env');

// Credenciais do Mercado Pago fornecidas pelo usuário
const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-e238f241-a6dd-4d4b-a785-f3a159319518';
const MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-5508652347665820-090516-036cdc32c2fd6037f0dce6a4fa077580-2090664884';

// Conteúdo do arquivo .env
const envContent = `# Variáveis de Ambiente - Backend ZIKABET

# Banco de Dados
DATABASE_URL="file:./prisma/prisma/dev.db"

# JWT Secret (altere em produção)
JWT_SECRET=zikabet-super-secret-jwt-key-change-in-production

# Mercado Pago - Credenciais de PRODUÇÃO
# ⚠️ ATENÇÃO: Estas são credenciais de PRODUÇÃO (APP_USR-)
# Para desenvolvimento/teste, considere usar credenciais de TESTE (TEST-)
MERCADOPAGO_ACCESS_TOKEN=${MERCADOPAGO_ACCESS_TOKEN}
MERCADOPAGO_PUBLIC_KEY=${MERCADOPAGO_PUBLIC_KEY}

# Porta do servidor
PORT=3333
`;

try {
  if (existsSync(envPath)) {
    console.log('⚠️  Arquivo .env já existe!');
    console.log('📝 Criando backup como .env.backup...');
    const backupPath = join(process.cwd(), '.env.backup');
    const { readFileSync } = await import('fs');
    const currentContent = readFileSync(envPath, 'utf-8');
    writeFileSync(backupPath, currentContent, 'utf-8');
    console.log('✅ Backup criado com sucesso!');
  }

  writeFileSync(envPath, envContent, 'utf-8');
  console.log('✅ Arquivo .env criado/atualizado com sucesso!');
  console.log('');
  console.log('📋 Credenciais configuradas:');
  console.log(`   MERCADOPAGO_ACCESS_TOKEN: ${MERCADOPAGO_ACCESS_TOKEN.substring(0, 20)}...`);
  console.log(`   MERCADOPAGO_PUBLIC_KEY: ${MERCADOPAGO_PUBLIC_KEY.substring(0, 20)}...`);
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Estas são credenciais de PRODUÇÃO (APP_USR-)');
  console.log('   - Em ambiente de desenvolvimento, podem causar erro "Unauthorized use of live credentials"');
  console.log('   - Para desenvolvimento, considere usar credenciais de TESTE (TEST-)');
  console.log('');
  console.log('🔄 Reinicie o servidor para aplicar as mudanças!');
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env:', error.message);
  console.log('');
  console.log('💡 Crie manualmente o arquivo backend/.env com o seguinte conteúdo:');
  console.log('');
  console.log(envContent);
  process.exit(1);
}

