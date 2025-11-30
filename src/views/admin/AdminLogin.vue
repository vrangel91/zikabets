<template>
  <div class="admin-login-page">
    <div class="admin-login-container glass-panel">
      <div class="admin-login-header">
        <div class="logo-mini">
          <div class="logo-dot"></div>
          <h1>ZIKABET</h1>
        </div>
        <p class="subtitle">Painel Administrativo</p>
      </div>

      <form @submit.prevent="handleLogin" class="admin-login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="admin@zikabet.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="admin-login-footer">
        <RouterLink to="/login" class="link">Voltar para login de usuário</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  email: '',
  password: '',
});

const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    await userStore.login(form.value.email, form.value.password);
    
    // Verificar se é admin
    if (userStore.user?.role !== 'ADMIN') {
      error.value = 'Acesso negado. Apenas administradores podem acessar este painel.';
      userStore.logout();
      return;
    }

    router.push('/panel/dashboard');
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login. Tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gradient-bg), var(--bg-primary);
}

.admin-login-container {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(10, 14, 26, 0.8);
  backdrop-filter: blur(20px);
}

.admin-login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-dot {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--gradient-button);
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.2);
}

.logo-mini h1 {
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: var(--gradient-button);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0;
}

.admin-login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.form-group input {
  padding: 0.875rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.submit-btn {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--accent-error);
  font-size: 0.85rem;
  text-align: center;
  margin-top: 0.5rem;
}

.admin-login-footer {
  margin-top: 2rem;
  text-align: center;
}

.link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s;
}

.link:hover {
  color: var(--accent-primary);
}
</style>

