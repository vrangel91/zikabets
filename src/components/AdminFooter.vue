<template>
  <footer class="admin-footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="system-info">
          <h3 class="system-name">ZIKABET ADMIN</h3>
          <div class="version-info">
            <span class="version-label">Versão:</span>
            <span class="version-value">{{ version }}</span>
          </div>
          <div class="update-info">
            <span class="update-label">Última atualização:</span>
            <span class="update-value">{{ lastUpdate }}</span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <div class="status-info">
          <div class="status-indicator" :class="{ online: isApiOnline }">
            <div class="status-dot"></div>
            <span class="status-text">{{ apiStatusText }}</span>
          </div>
        </div>
      </div>

      <div class="footer-section">
        <div class="developer-info">
          <div class="developer-name">
            <svg class="developer-svg" viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="devGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#00ccff;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#00ff88;stop-opacity:1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <text x="200" y="35" font-family="Arial, sans-serif" font-size="28" font-weight="bold"
                text-anchor="middle" fill="url(#devGradient)" filter="url(#glow)" class="dev-text">
                viNNNNNNNicius
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// @ts-ignore - Vue module resolution
import { ref, onMounted, onUnmounted } from 'vue';
import api from '@/services/api';

const version = ref('v1.4.2');
const lastUpdate = ref('29/11/2025');
const isApiOnline = ref(true);
const apiStatusText = ref('API Online');

const checkApiStatus = async () => {
  try {
    await api.get('/health');
    isApiOnline.value = true;
    apiStatusText.value = 'API Online';
  } catch (error) {
    isApiOnline.value = false;
    apiStatusText.value = 'API Offline';
  }
};

let statusInterval: NodeJS.Timeout | null = null;

onMounted(() => {
  checkApiStatus();
  // Verificar status a cada 30 segundos
  statusInterval = setInterval(checkApiStatus, 30000);
});

onUnmounted(() => {
  if (statusInterval) {
    clearInterval(statusInterval);
  }
});
</script>

<style scoped>
.admin-footer {
  margin-top: auto;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(20, 25, 45, 0.5);
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
}

.footer-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.system-name {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: var(--gradient-button);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.version-info,
.update-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.version-label,
.update-label {
  color: rgba(255, 255, 255, 0.5);
}

.version-value,
.update-value {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.status-info {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.status-indicator.online {
  border-color: rgba(0, 255, 136, 0.3);
  background: rgba(0, 255, 136, 0.1);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 71, 87, 0.8);
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.online .status-dot {
  background: rgba(0, 255, 136, 0.8);
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.5);
}

.status-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.developer-info {
  display: flex;
  align-items: center;
}

.developer-name {
  display: flex;
  align-items: center;
}

.developer-svg {
  width: 280px;
  height: 50px;
  overflow: visible;
}

.dev-text {
  animation: textGlow 3s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes textGlow {

  0%,
  100% {
    filter: drop-shadow(0 0 5px rgba(0, 255, 136, 0.5));
  }

  50% {
    filter: drop-shadow(0 0 15px rgba(0, 204, 255, 0.8));
  }
}

@media (max-width: 1200px) {
  .footer-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }

  .footer-section {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .admin-footer {
    padding: 1rem;
  }

  .developer-svg {
    width: 240px;
    height: 40px;
  }

  .system-name {
    font-size: 0.875rem;
  }

  .version-info,
  .update-info {
    font-size: 0.7rem;
  }
}
</style>
