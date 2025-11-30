<template>
  <div id="app">
    <div class="global-bg-image"></div>
    <audio ref="backgroundAudio" loop preload="auto" @canplay="handleAudioReady" @loadeddata="handleAudioReady">
      <source src="/bet.mp3" type="audio/mpeg" />
    </audio>
    <RouterView />
    <AppFooter v-if="shouldShowFooter" />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { onMounted, onUnmounted, watch, nextTick, ref, computed } from 'vue';
// @ts-ignore - Vue Router module resolution
import { RouterView, useRoute } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';
import { initNumberInputEnhancer } from '@/utils/numberInputEnhancer';
// @ts-ignore - Vue component with script setup
import AppFooter from '@/components/AppFooter.vue';

const userStore = useUserStore();
const route = useRoute();
const backgroundAudio = ref<HTMLAudioElement | null>(null);
const audioStarted = ref(false);

// Verificar se deve mostrar o footer (não mostrar em páginas de admin ou login)
const shouldShowFooter = computed(() => {
  const path = route.path;
  // Não mostrar footer em páginas de admin, login, register, etc
  return !path.startsWith('/panel') &&
    path !== '/login' &&
    path !== '/register' &&
    path !== '/forgot-password';
});

// Função para iniciar o áudio
const startAudio = async () => {
  if (!backgroundAudio.value || audioStarted.value) return;

  try {
    // Configurar volume
    backgroundAudio.value.volume = 0.7;

    // Tentar iniciar o áudio
    await backgroundAudio.value.play();
    audioStarted.value = true;
  } catch (error) {
    // Alguns navegadores bloqueiam autoplay até interação do usuário
    // Silenciosamente ignora o erro de autoplay
  }
};

// Quando o áudio estiver pronto para tocar
const handleAudioReady = () => {
  if (!audioStarted.value) {
    startAudio();
  }
};

// Listener para iniciar áudio na primeira interação do usuário
const handleUserInteraction = () => {
  if (!audioStarted.value) {
    startAudio();
  }
};

// Restaurar perfil do usuário ao carregar a aplicação
onMounted(async () => {
  if (userStore.token && !userStore.user) {
    try {
      await userStore.fetchProfile();
    } catch (error) {
      // Se falhar, o token pode estar inválido, então limpa
      console.error('Erro ao restaurar perfil:', error);
    }
  }

  // Tentar iniciar áudio imediatamente
  await nextTick();
  if (backgroundAudio.value) {
    // Forçar carregamento do áudio
    backgroundAudio.value.load();

    // Se já tiver dados carregados, iniciar imediatamente
    if (backgroundAudio.value.readyState >= 2) {
      startAudio();
    }
    // Caso contrário, o evento @canplay ou @loadeddata vai iniciar
  }

  // Adicionar listeners para iniciar áudio na primeira interação
  // (caso o autoplay seja bloqueado)
  document.addEventListener('click', handleUserInteraction, { once: true });
  document.addEventListener('touchstart', handleUserInteraction, { once: true });
  document.addEventListener('keydown', handleUserInteraction, { once: true });

  // Melhorar inputs numéricos após montagem
  setTimeout(() => {
    initNumberInputEnhancer();
  }, 100);
});

// Limpar listeners ao desmontar
onUnmounted(() => {
  document.removeEventListener('click', handleUserInteraction);
  document.removeEventListener('touchstart', handleUserInteraction);
  document.removeEventListener('keydown', handleUserInteraction);
});

// Melhorar inputs numéricos quando a rota mudar
watch(() => route.path, async () => {
  await nextTick();
  setTimeout(() => {
    initNumberInputEnhancer();
  }, 100);
});
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
  z-index: 1;
}

.global-bg-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/hero1.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.15;
  z-index: 0;
  pointer-events: none;
}
</style>
