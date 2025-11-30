<template>
  <div class="register-page">
    <div class="register-container glass-panel">
      <div class="register-header">
        <div class="logo-mini">
          <div class="logo-dot"></div>
          <h1>ZIKABET</h1>
        </div>
        <p class="subtitle">Crie sua conta</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Nome completo</label>
          <input id="name" v-model="form.name" type="text" placeholder="Seu nome" required autocomplete="name" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" placeholder="seu@email.com" required
            autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="cpf">CPF</label>
          <input id="cpf" v-model="form.cpf" type="text" placeholder="000.000.000-00" required maxlength="14"
            @input="formatCPF" />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input id="password" v-model="form.password" type="password" placeholder="Mínimo 6 caracteres" required
            autocomplete="new-password" minlength="6" />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar senha</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password"
            placeholder="Digite a senha novamente" required autocomplete="new-password" minlength="6" />
        </div>

        <button type="submit" class="submit-btn" :disabled="userStore.loading">
          {{ userStore.loading ? 'Criando conta...' : 'Criar conta' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>

      <div class="register-footer">
        <p>
          Já tem conta?
          <RouterLink to="/login" class="link">Entrar</RouterLink>
        </p>
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
  name: '',
  email: '',
  cpf: '',
  password: '',
  confirmPassword: '',
});

const error = ref('');

const formatCPF = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');

  if (value.length <= 11) {
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    form.value.cpf = value;
  }
};

const validateForm = () => {
  if (!form.value.name.trim()) {
    error.value = 'Nome é obrigatório';
    return false;
  }

  if (!form.value.email.trim()) {
    error.value = 'Email é obrigatório';
    return false;
  }

  if (!form.value.cpf.replace(/\D/g, '').match(/^\d{11}$/)) {
    error.value = 'CPF inválido';
    return false;
  }

  if (form.value.password.length < 6) {
    error.value = 'Senha deve ter no mínimo 6 caracteres';
    return false;
  }

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'As senhas não coincidem';
    return false;
  }

  return true;
};

const handleRegister = async () => {
  error.value = '';

  if (!validateForm()) {
    return;
  }

  try {
    await userStore.register({
      name: form.value.name.trim(),
      email: form.value.email.trim().toLowerCase(),
      cpf: form.value.cpf,
      password: form.value.password,
    });
    router.push('/home');
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar conta. Tente novamente.';
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--gradient-bg), var(--bg-primary);
}

.register-container {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid var(--border-primary);
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  max-height: 90vh;
  overflow-y: auto;
}

.register-header {
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

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.register-footer {
  margin-top: 2rem;
  text-align: center;
}

.register-footer p {
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
  .register-container {
    padding: 2rem 1.5rem;
  }
}
</style>
