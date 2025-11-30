import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';
import { routes } from '@/utils/routes';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  balance: number;
  role: string;
  adminPermissions?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  gameId?: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'BET' | 'WIN';
  amount: number;
  description?: string;
  createdAt: string;
  game?: any;
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('token'));
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const balance = computed(() => user.value?.balance || 0);

  // Set token
  function setToken(newToken: string | null) {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Register
  async function register(data: {
    name: string;
    email: string;
    cpf: string;
    password: string;
  }) {
    try {
      loading.value = true;
      // Formatar CPF para o formato esperado pelo backend: 000.000.000-00
      const cpfNumbers = data.cpf.replace(/\D/g, '');
      const formattedCPF = cpfNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      
      const response = await api.post(routes.auth.register(), {
        name: data.name,
        email: data.email,
        cpf: formattedCPF,
        password: data.password,
      });
      setToken(response.data.token);
      user.value = response.data.user;
      return response.data;
    } catch (error: any) {
      // Melhorar mensagem de erro
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao registrar';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        const detailsMessage = errorDetails.map((d: any) => `${d.path?.join('.') || 'campo'}: ${d.message}`).join(', ');
        throw new Error(`${errorMessage}. ${detailsMessage}`);
      }
      
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Login
  async function login(email: string, password: string) {
    try {
      loading.value = true;
      // Normalizar email (lowercase e trim)
      const normalizedEmail = email.toLowerCase().trim();
      
      const response = await api.post(routes.auth.login(), { 
        email: normalizedEmail, 
        password 
      });
      
      setToken(response.data.token);
      user.value = response.data.user;
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      console.error('[Login Error]', {
        status: error.response?.status,
        message: errorMessage,
        details: error.response?.data,
        requestData: { email: email.toLowerCase().trim() },
      });
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  }

  // Logout
  function logout() {
    user.value = null;
    setToken(null);
    transactions.value = [];
  }

  // Get profile
  async function fetchProfile() {
    if (!token.value) return;

    try {
      loading.value = true;
      const response = await api.get(routes.users.me());
      user.value = response.data.user;
      return response.data.user;
    } catch (error: any) {
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Update profile
  async function updateProfile(data: { name?: string; email?: string }) {
    try {
      loading.value = true;
      const response = await api.patch(routes.users.update(), data);
      user.value = response.data.user;
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      loading.value = false;
    }
  }

  // Get transactions
  async function fetchTransactions(limit = 20) {
    try {
      loading.value = true;
      const response = await api.get(routes.wallet.transactions(limit));
      transactions.value = response.data.transactions;
      return response.data.transactions;
    } catch (error: any) {
      throw error;
    } finally {
      loading.value = false;
    }
  }

  // Create PIX deposit (desabilitado temporariamente)
  async function createPixDeposit(_amount: number) {
    throw new Error('Depósito PIX temporariamente desabilitado');
    // try {
    //   loading.value = true;
    //   const response = await api.post(routes.wallet.depositPix(), { amount });
    //   return response.data.pixTransaction;
    // } catch (error: any) {
    //   throw new Error(error.response?.data?.error || 'Erro ao criar depósito');
    // } finally {
    //   loading.value = false;
    // }
  }

  return {
    user,
    token,
    transactions,
    loading,
    isAuthenticated,
    balance,
    setToken,
    register,
    login,
    logout,
    fetchProfile,
    updateProfile,
    fetchTransactions,
    createPixDeposit,
  };
});
