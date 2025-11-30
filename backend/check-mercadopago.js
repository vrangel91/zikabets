import { existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verificando instalação do Mercado Pago...\n');

const nodeModulesPath = join(process.cwd(), 'node_modules', 'mercadopago');
console.log('📁 Caminho esperado:', nodeModulesPath);
console.log('✅ Existe?', existsSync(nodeModulesPath));

if (existsSync(nodeModulesPath)) {
  console.log('✅ Pacote encontrado!');
  
  try {
    const pkg = await import(join(nodeModulesPath, 'package.json'), { assert: { type: 'json' } });
    console.log('   Versão:', pkg.default?.version || 'N/A');
  } catch (e) {
    console.log('   Erro ao ler package.json:', e.message);
  }
  
  try {
    console.log('\n🔄 Tentando importar...');
    const mp = await import('mercadopago');
    console.log('✅ Importação bem-sucedida!');
    console.log('   Tipo:', typeof mp);
    console.log('   Tem default?', !!mp.default);
    if (mp.default) {
      console.log('   Chaves do default:', Object.keys(mp.default).slice(0, 5).join(', '));
    }
  } catch (e) {
    console.log('❌ Erro na importação:', e.message);
  }
} else {
  console.log('❌ Pacote NÃO encontrado!');
  console.log('\n💡 Tente executar:');
  console.log('   npm install mercadopago@2.1.4');
}

