// Proteção contra DevTools
// Detecta se o DevTools está aberto e redireciona o usuário

let checkInterval: number | null = null;
let warningShown = false;

// Técnica 1: Detectar mudança no tamanho da janela
function detectWindowResize() {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    return true;
  }
  return false;
}

// Técnica 2: Detectar console aberto (desabilitada para evitar problemas)
function detectConsole() {
  // Esta técnica pode causar problemas, então vamos desabilitar
  return false;
}

// Técnica 3: Detectar debugger
function detectDebugger() {
  const start = performance.now();
  debugger; // eslint-disable-line no-debugger
  const end = performance.now();
  return end - start > 100; // Se demorar mais de 100ms, provavelmente está em debug
}

// Técnica 4: Detectar foco na janela (não utilizada atualmente)
// function detectFocus() {
//   let devtools = false;
//   const threshold = 200;
//   
//   setInterval(() => {
//     if (window.outerHeight - window.innerHeight > threshold || 
//         window.outerWidth - window.innerWidth > threshold) {
//       if (!devtools) {
//         devtools = true;
//       }
//     } else {
//       devtools = false;
//     }
//   }, 500);
//   
//   return () => devtools;
// }

// Função principal de detecção
function checkDevTools(): boolean {
  // Múltiplas técnicas para maior precisão
  const method1 = detectWindowResize();
  const method2 = detectConsole();
  const method3 = detectDebugger();
  
  return method1 || method2 || method3;
}

// Redirecionar usuário
function redirectUser() {
  // Limpar dados sensíveis
  localStorage.clear();
  sessionStorage.clear();
  
  // Redirecionar
  window.location.href = '/login';
}

// Mostrar aviso
function showWarning() {
  if (warningShown) return;
  warningShown = true;
  
  // Limpar tudo
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Criar aviso
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0E0F10;
    color: #C9D1D9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 999999;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = 'text-align: center; padding: 2rem;';
  
  const title = document.createElement('h1');
  title.textContent = '⚠️ Acesso Negado';
  title.style.cssText = 'color: #C94A4A; margin-bottom: 1rem; font-size: 2rem;';
  
  const message = document.createElement('p');
  message.textContent = 'O uso de ferramentas de desenvolvedor não é permitido.';
  message.style.cssText = 'font-size: 1.2rem; margin-bottom: 2rem; color: #C9D1D9;';
  
  const redirect = document.createElement('p');
  redirect.textContent = 'Esta página será redirecionada em alguns segundos...';
  redirect.style.cssText = 'color: rgba(201, 209, 217, 0.6);';
  
  content.appendChild(title);
  content.appendChild(message);
  content.appendChild(redirect);
  wrapper.appendChild(content);
  document.body.appendChild(wrapper);
  
  setTimeout(() => {
    redirectUser();
  }, 3000);
}

// Iniciar proteção
export function initDevToolsProtection() {
  // Verificar imediatamente
  if (checkDevTools()) {
    showWarning();
    return;
  }
  
  // Verificar periodicamente
  checkInterval = window.setInterval(() => {
    if (checkDevTools()) {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      showWarning();
    }
  }, 1000);
  
  // Detectar mudanças no tamanho da janela
  window.addEventListener('resize', () => {
    if (detectWindowResize()) {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      showWarning();
    }
  });
  
  // Desabilitar console (com fallback)
  try {
    const noop = () => {};
    Object.defineProperty(window, 'console', {
      value: {
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
        debug: noop,
        trace: noop,
        dir: noop,
        dirxml: noop,
        group: noop,
        groupCollapsed: noop,
        groupEnd: noop,
        time: noop,
        timeEnd: noop,
        count: noop,
        clear: noop,
        assert: noop,
        profile: noop,
        profileEnd: noop,
      },
      writable: false,
      configurable: false,
    });
  } catch (e) {
    // Ignorar erro se não conseguir desabilitar
  }
  
  // Proteger contra debugger (com intervalo maior para evitar performance issues)
  const debuggerInterval = setInterval(() => {
    try {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        clearInterval(debuggerInterval);
        if (checkInterval) {
          clearInterval(checkInterval);
        }
        showWarning();
      }
    } catch (e) {
      // Ignorar erros
    }
  }, 2000);
  
  // Detectar F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      showWarning();
      return false;
    }
    // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      showWarning();
      return false;
    }
    // Ctrl+Shift+J
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      showWarning();
      return false;
    }
    // Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      showWarning();
      return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      showWarning();
      return false;
    }
  });
  
  // Desabilitar clique direito
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Desabilitar seleção de texto
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });
  
  // Desabilitar arrastar
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });
}

// Parar proteção (para desenvolvimento)
export function stopDevToolsProtection() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

