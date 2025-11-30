<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container glass-panel">
      <div class="forgot-password-header">
        <div class="logo-mini">
          <div class="logo-dot"></div>
          <h1>ZIKABET</h1>
        </div>
        <p class="subtitle">Recuperar senha</p>
      </div>

      <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
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

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </form>

      <div class="forgot-password-footer">
        <p>
          Lembrou sua senha?
          <RouterLink to="/login" class="link">Voltar ao login</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const form = ref({
  email: '',
});

const error = ref('');
const success = ref('');
const loading = ref(false);

const handleForgotPassword = async () => {
  error.value = '';
  success.value = '';
  loading.value = true;

  try {
    // TODO: Implementar chamada à API quando o endpoint estiver disponível
    // Por enquanto, apenas simula o envio
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    success.value = 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.';
    form.value.email = '';
  } catch (err: any) {
    error.value = err.message || 'Erro ao enviar solicitação. Tente novamente.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gradient-bg), var(--bg-primary);
}

.forgot-password-container {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
}

.forgot-password-header {
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

.forgot-password-form {
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

.success-message {
  color: var(--accent-primary);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
  padding: 0.5rem;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 8px;
}

.forgot-password-footer {
  margin-top: 2rem;
  text-align: center;
}

.forgot-password-footer p {
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

@media (max-width: 480px) {
  .forgot-password-container {
    padding: 2rem 1.5rem;
  }
}
</style>




