# Guia de Deploy na Hostinger

## 📋 Pré-requisitos

1. Ter o projeto buildado localmente
2. Acesso ao painel da Hostinger (File Manager ou FTP)
3. Saber qual é a URL da sua API backend em produção

## 🚀 Passo a Passo

### 1. Build do Projeto

Execute o comando de build na raiz do projeto:

```bash
npm run build:prod
```

Isso irá gerar os arquivos otimizados na pasta `dist/`.

### 2. Configurar Variáveis de Ambiente

Antes do build, crie um arquivo `.env.production` na raiz do projeto com:

```env
VITE_API_URL=https://sua-api-backend.com
```

**Importante:** Substitua `https://sua-api-backend.com` pela URL real do seu backend em produção.

### 3. Upload dos Arquivos

#### Opção A: File Manager (Recomendado)

1. Acesse o **File Manager** no painel da Hostinger
2. Navegue até a pasta `public_html` (ou a pasta raiz do seu domínio)
3. **Delete todos os arquivos antigos** (se houver)
4. Faça upload de **TODOS os arquivos** da pasta `dist/`:
   - `index.html`
   - Pasta `assets/` (com todos os arquivos dentro)
   - Todos os arquivos da pasta `public/` (imagens, etc.)
   - Arquivo `.htaccess` (deve estar na raiz junto com `index.html`)

#### Opção B: FTP

1. Conecte-se via FTP usando as credenciais da Hostinger
2. Navegue até `public_html`
3. Faça upload de todos os arquivos da pasta `dist/`
4. Certifique-se de que o `.htaccess` está na raiz

### 4. Verificar Estrutura de Arquivos

Após o upload, a estrutura deve estar assim:

```
public_html/
├── .htaccess          ← IMPORTANTE: Deve estar aqui
├── index.html
├── assets/
│   ├── index-XXXXX.js
│   └── index-XXXXX.css
├── logo.png
├── hero1.png
├── hero2.png
├── hero3.png
└── ... (outros arquivos estáticos)
```

### 5. Configurar Permissões

No File Manager, verifique se o `.htaccess` tem permissões de leitura (644 ou 755).

### 6. Testar o Site

1. Acesse seu domínio no navegador
2. Teste navegação entre páginas (ex: `/home`, `/dashboard`)
3. Verifique se as rotas funcionam corretamente (sem erro 404)

## ⚠️ Problemas Comuns

### Erro 404 ao acessar rotas diretamente

**Solução:** Certifique-se de que o arquivo `.htaccess` está na raiz do `public_html` e tem o conteúdo correto.

### Arquivos não carregam (CSS/JS)

**Solução:** 
- Verifique se a pasta `assets/` foi enviada completamente
- Verifique se os caminhos no `index.html` estão corretos (devem começar com `/assets/`)

### API não funciona

**Solução:**
- Verifique se a variável `VITE_API_URL` está configurada corretamente no `.env.production`
- Faça o build novamente após configurar a variável
- Verifique se o backend está acessível e com CORS configurado

### Página em branco

**Solução:**
- Abra o Console do navegador (F12) e verifique erros
- Verifique se todos os arquivos foram enviados
- Limpe o cache do navegador (Ctrl+Shift+R)

## 📝 Notas Importantes

- O arquivo `.htaccess` é **ESSENCIAL** para SPAs Vue Router funcionarem
- Sempre faça o build com `npm run build:prod` antes de fazer upload
- Mantenha o `.env.production` atualizado com a URL correta da API
- O backend precisa estar configurado com CORS para aceitar requisições do domínio de produção

## 🔄 Atualizações Futuras

Para atualizar o site:

1. Faça as alterações no código
2. Execute `npm run build:prod`
3. Faça upload apenas dos arquivos que mudaram (ou todos para garantir)
4. Limpe o cache do navegador ao testar

