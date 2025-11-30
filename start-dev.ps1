# Script para iniciar frontend e backend simultaneamente
Write-Host "🚀 Iniciando Frontend e Backend..." -ForegroundColor Green

# Inicia o backend em background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev" -WindowStyle Minimized

# Aguarda um pouco para o backend iniciar
Start-Sleep -Seconds 2

# Inicia o frontend (este vai ficar no terminal atual)
Write-Host "✅ Backend iniciado em background" -ForegroundColor Cyan
Write-Host "🌐 Iniciando Frontend..." -ForegroundColor Magenta
npm run dev:frontend

