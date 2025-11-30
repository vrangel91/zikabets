<template>
  <div class="loading-screen">
    <div class="loading-content">
      <div class="logo-container">
        <img src="/logo.png" alt="ZIKABET Logo" class="logo-image" />
        <h1 class="logo-text">ZIKABET</h1>
        <p class="logo-subtitle">Dota Edition</p>
      </div>
      <div class="loading-bar">
        <div class="loading-progress"></div>
      </div>
      <div class="status-message">
        <p class="status-text" :class="{ 'fade-out': !isVisible, 'fade-in': isVisible }" :key="currentStatus">{{ currentStatus }}</p>
      </div>
    </div>
    <div class="glow-effect"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';

const router = useRouter();
const userStore = useUserStore();

const statusMessages = [
  'Status: Carregando odds…',
  'Status: Verificando jogadores online…',
  'Status: Analisando histórico da partida…',
  'Status: Finalizando preparação…',
];

const currentStatus = ref(statusMessages[0]);
const isVisible = ref(true);
let statusIndex = 0;

onMounted(async () => {
  // Alternar mensagens de status a cada 800ms (mais tempo para ler)
  const statusInterval = setInterval(() => {
    // Fade out
    isVisible.value = false;
    
    setTimeout(() => {
      statusIndex = (statusIndex + 1) % statusMessages.length;
      currentStatus.value = statusMessages[statusIndex];
      // Fade in
      isVisible.value = true;
    }, 300); // Tempo de transição
  }, 800);

  // Verificar autenticação após o loading
  setTimeout(async () => {
    clearInterval(statusInterval);
    isVisible.value = false;
    
    // Aguardar transição de fade out
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Verificar se há token e tentar restaurar perfil se necessário
    if (userStore.token && !userStore.user) {
      try {
        await userStore.fetchProfile();
      } catch (error) {
        // Se falhar ao restaurar perfil, token pode estar inválido
        console.error('Erro ao verificar autenticação:', error);
        userStore.logout();
      }
    }
    
    // Verificar se o usuário está autenticado
    if (userStore.isAuthenticated) {
      // Usuário está logado, redirecionar para home
      router.push('/home');
    } else {
      // Usuário não está logado, redirecionar para login
      router.push('/login');
    }
  }, 4000);
});
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  background: var(--gradient-bg), var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.glow-effect {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.15), transparent 60%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}

.loading-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  width: 240px;
  height: 240px;
  object-fit: contain;
  animation: pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.4));
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.logo-text {
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--accent-primary);
  text-transform: uppercase;
  margin: 0;
  animation: glow 2s ease-in-out infinite;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 10px rgba(0, 255, 136, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.5));
  }
}

.logo-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin: 0;
}

.loading-bar {
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.loading-progress {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
  animation: loading 4s ease-in-out;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.4);
}

@keyframes loading {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.status-message {
  margin-top: 2rem;
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-size: 0.95rem;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  margin: 0;
  text-align: center;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  opacity: 1;
  transform: translateY(0);
}

.status-text.fade-out {
  opacity: 0;
  transform: translateY(-10px);
}

.status-text.fade-in {
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 768px) {
  .logo-image {
    width: 180px;
    height: 180px;
  }

  .logo-text {
    font-size: 2rem;
  }

  .loading-bar {
    width: 250px;
  }
}
</style>

