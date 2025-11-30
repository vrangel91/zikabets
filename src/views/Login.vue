<template>
  <div class="login-page">
    <div class="login-container glass-panel">
      <div class="login-header">
        <div class="logo-mini">
          <div class="logo-dot"></div>
          <h1>ZIKABET</h1>
        </div>
        <p class="subtitle">Entre na sua conta</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="seu@email.com"
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

        <button type="submit" class="submit-btn" :disabled="userStore.loading">
          {{ userStore.loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="login-footer">
        <p>
          Não tem conta?
          <RouterLink to="/register" class="link">Cadastre-se</RouterLink>
        </p>
        <RouterLink to="/forgot-password" class="forgot-link">Esqueci minha senha</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store/useUserStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const form = ref({
  email: '',
  password: '',
});

const error = ref('');

const handleLogin = async () => {
  error.value = '';

  try {
    await userStore.login(form.value.email, form.value.password);
    // Redirecionar para a página que o usuário tentou acessar ou para home
    const redirect = route.query.redirect as string;
    router.push(redirect || '/home');
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login. Tente novamente.';
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gradient-bg), var(--bg-primary);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
}

.login-header {
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
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
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
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.login-form {
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
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  background: var(--input-bg-hover);
  box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
}

.form-group input::placeholder {
  color: var(--text-muted);
}

.submit-btn {
  padding: 1rem;
  border: none;
  border-radius: 12px;
  background: var(--gradient-button);
  color: var(--gradient-button-text);
  font-weight: 600;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
  padding: 0.5rem;
  background: rgba(255, 71, 87, 0.1);
  border-radius: 8px;
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.login-footer p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.link {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.forgot-link {
  color: var(--text-tertiary);
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--accent-primary);
}

@media (max-width: 480px) {
  .login-container {
    padding: 2rem 1.5rem;
  }
}
</style>

