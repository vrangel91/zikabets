<template>
  <div class="ranking-page">
    <!-- Animated Background -->
    <AnimatedBackground :show-image="true" image-url="/ranking.png" />

    <AppHeader />

    <main class="ranking-main">
      <section class="ranking-section glass-panel">
        <div class="ranking-header">
          <h1 class="ranking-title">🏆 Ranking de Apostadores</h1>
          <p class="ranking-subtitle">
            Classificação baseada em apostas ganhas
          </p>
        </div>

        <div v-if="loading" class="loading-container">
          <p>Carregando ranking...</p>
        </div>

        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="loadRanking" class="retry-btn">Tentar novamente</button>
        </div>

        <div v-else-if="ranking.length === 0" class="empty-container">
          <p>Nenhum usuário no ranking ainda.</p>
          <p>Seja o primeiro a ganhar uma aposta!</p>
        </div>

        <div v-else class="ranking-list">
          <div
            v-for="(user, index) in ranking"
            :key="user.userId"
            class="ranking-item"
            :class="{
              'top-1': user.position === 1,
              'top-2': user.position === 2,
              'top-3': user.position === 3,
            }"
          >
            <div class="position-badge">
              <span v-if="user.position === 1" class="medal gold">🥇</span>
              <span v-else-if="user.position === 2" class="medal silver">🥈</span>
              <span v-else-if="user.position === 3" class="medal bronze">🥉</span>
              <span v-else class="position-number">{{ user.position }}º</span>
            </div>

            <div class="user-info">
              <div class="user-avatar">
                {{ getUserInitials(user.userName) }}
              </div>
              <div class="user-details">
                <h3 class="user-name">{{ user.userName }}</h3>
                <p class="user-email">{{ user.userEmail }}</p>
              </div>
            </div>

            <div class="points-container">
              <div class="points-value">{{ user.points }}</div>
              <div class="points-label">
                {{ user.points === 1 ? 'ponto' : 'pontos' }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="ranking-info glass-panel">
        <h3>Como funciona o ranking?</h3>
        <ul class="info-list">
          <li>
            <strong>Apostas únicas:</strong> Cada aposta ganha vale 1 ponto
          </li>
          <li>
            <strong>Apostas múltiplas:</strong> Se todas as apostas da múltipla forem ganhas, você ganha 1 ponto para cada tipo de mercado diferente acertado (Vitória, Duração, Top Killer, Top Dead)
          </li>
          <li>
            <strong>Exemplo:</strong> Uma múltipla com Vitória + Duração + Top Killer ganha = 3 pontos
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
// @ts-ignore - Vue component with script setup
import AppHeader from '@/components/AppHeader.vue';
// @ts-ignore - Vue component with script setup
import AnimatedBackground from '@/components/AnimatedBackground.vue';
import api from '@/services/api';

interface RankingUser {
  position: number;
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
}

const ranking = ref<RankingUser[]>([]);
const loading = ref(false);
const error = ref('');

const getUserInitials = (name: string): string => {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const loadRanking = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await api.get('/bets/ranking');
    ranking.value = response.data.ranking || [];
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Erro ao carregar ranking';
    console.error('Erro ao carregar ranking:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadRanking();
});
</script>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: var(--gradient-bg), var(--bg-primary);
  padding-bottom: 2rem;
}

.ranking-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.ranking-section {
  margin-bottom: 2rem;
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
}

.ranking-header {
  text-align: center;
  margin-bottom: 2rem;
}

.ranking-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: var(--gradient-button);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ranking-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.error-message {
  color: var(--accent-error);
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  transition: all 0.3s;
}

.ranking-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.ranking-item.top-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05));
  border-color: rgba(255, 215, 0, 0.3);
}

.ranking-item.top-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.1), rgba(192, 192, 192, 0.05));
  border-color: rgba(192, 192, 192, 0.3);
}

.ranking-item.top-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.1), rgba(205, 127, 50, 0.05));
  border-color: rgba(205, 127, 50, 0.3);
}

.position-badge {
  min-width: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.medal {
  font-size: 2rem;
}

.position-number {
  color: var(--text-secondary);
  font-size: 1.25rem;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--gradient-button);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--gradient-button-text);
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-email {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.points-container {
  text-align: center;
  min-width: 100px;
}

.points-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.points-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ranking-info {
  padding: 2rem;
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
}

.ranking-info h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-list li {
  color: var(--text-secondary);
  line-height: 1.6;
  padding-left: 1.5rem;
  position: relative;
}

.info-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--accent-primary);
  font-size: 1.5rem;
  line-height: 1;
}

.info-list li strong {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .ranking-main {
    padding: 1rem;
  }

  .ranking-section,
  .ranking-info {
    padding: 1.5rem;
  }

  .ranking-title {
    font-size: 1.5rem;
  }

  .ranking-item {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .position-badge {
    min-width: 50px;
  }

  .points-container {
    width: 100%;
    margin-top: 0.5rem;
  }
}
</style>

