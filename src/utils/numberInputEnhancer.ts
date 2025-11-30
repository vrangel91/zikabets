/**
 * Automatic Number Input Enhancer
 * Adiciona setas personalizadas a todos os inputs type="number"
 */

export function enhanceNumberInputs() {
  // Função para criar as setas
  function createArrows(input: HTMLInputElement) {
    // Verificar se já tem setas
    if (input.parentElement?.classList.contains('number-input-wrapper')) {
      return;
    }

    // Criar wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'number-input-wrapper';
    
    // Mover input para dentro do wrapper
    // Se o input está dentro de um label, inserir o wrapper dentro do label
    const parent = input.parentNode;
    if (parent) {
      parent.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

    // Criar container de setas
    const arrowsContainer = document.createElement('div');
    arrowsContainer.className = 'number-input-arrows';

    // Seta para cima (incrementar)
    const arrowUp = document.createElement('button');
    arrowUp.type = 'button';
    arrowUp.className = 'number-input-arrow up';
    arrowUp.tabIndex = -1;
    arrowUp.innerHTML = `
      <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 1L9 5H1L5 1Z" fill="currentColor"/>
      </svg>
    `;
    arrowUp.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      incrementValue(input);
    });

    // Seta para baixo (decrementar)
    const arrowDown = document.createElement('button');
    arrowDown.type = 'button';
    arrowDown.className = 'number-input-arrow down';
    arrowDown.tabIndex = -1;
    arrowDown.innerHTML = `
      <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 5L9 1H1L5 5Z" fill="currentColor"/>
      </svg>
    `;
    arrowDown.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      decrementValue(input);
    });

    // Adicionar setas ao container
    arrowsContainer.appendChild(arrowUp);
    arrowsContainer.appendChild(arrowDown);
    wrapper.appendChild(arrowsContainer);

    // Atualizar estado das setas
    updateArrowStates(input, arrowUp, arrowDown);

    // Flag para evitar loop infinito
    let isUpdating = false;

    // Observar mudanças no input
    input.addEventListener('input', () => {
      if (isUpdating) return;
      isUpdating = true;
      updateArrowStates(input, arrowUp, arrowDown);
      isUpdating = false;
    });
  }

  function incrementValue(input: HTMLInputElement) {
    const step = parseFloat(input.step || '1');
    const max = input.max ? parseFloat(input.max) : undefined;
    const currentValue = parseFloat(input.value) || 0;
    const newValue = currentValue + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    
    // Atualizar valor diretamente sem disparar eventos que causam loop
    input.value = finalValue.toString();
    // Disparar apenas o evento change para Vue
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function decrementValue(input: HTMLInputElement) {
    const step = parseFloat(input.step || '1');
    const min = input.min ? parseFloat(input.min) : undefined;
    const currentValue = parseFloat(input.value) || 0;
    const newValue = currentValue - step;
    const finalValue = min !== undefined ? Math.max(newValue, min) : newValue;
    
    // Atualizar valor diretamente sem disparar eventos que causam loop
    input.value = finalValue.toString();
    // Disparar apenas o evento change para Vue
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function updateArrowStates(input: HTMLInputElement, arrowUp: HTMLButtonElement, arrowDown: HTMLButtonElement) {
    const value = parseFloat(input.value) || 0;
    const min = input.min ? parseFloat(input.min) : undefined;
    const max = input.max ? parseFloat(input.max) : undefined;
    const disabled = input.disabled;

    arrowUp.disabled = disabled || (max !== undefined && value >= max);
    arrowDown.disabled = disabled || (min !== undefined && value <= min);
  }

  // Função para processar todos os inputs
  function processInputs() {
    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="number"]:not(.number-input-wrapper input)');
    inputs.forEach((input) => {
      createArrows(input);
    });
  }

  // Processar inputs existentes
  processInputs();

  // Observar novos inputs adicionados dinamicamente
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          // Verificar se o próprio nó é um input
          if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'number') {
            createArrows(element as HTMLInputElement);
          }
          // Verificar inputs dentro do nó
          const inputs = element.querySelectorAll<HTMLInputElement>('input[type="number"]:not(.number-input-wrapper input)');
          inputs.forEach((input) => {
            createArrows(input);
          });
        }
      });
    });
  });

  // Observar mudanças no DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
  };
}

// Variável global para evitar múltiplas inicializações
let enhancerInitialized = false;

// Função para inicializar apenas uma vez
export function initNumberInputEnhancer() {
  if (enhancerInitialized) return;
  enhancerInitialized = true;
  enhanceNumberInputs();
}

