import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Iniciando Frontend e Backend...\n');

// Inicia o backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'inherit',
  shell: true,
});

// Inicia o frontend
const frontend = spawn('npm', ['run', 'dev:frontend'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

// Trata o encerramento
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando servidores...');
  backend.kill();
  frontend.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});

