import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { initDevToolsProtection } from './utils/devtoolsProtection';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');

// Iniciar proteção contra DevTools (apenas em produção)
if (import.meta.env.PROD) {
  initDevToolsProtection();
}

