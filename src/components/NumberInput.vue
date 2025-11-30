<template>
  <div class="number-input-wrapper">
    <input
      :type="type"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      @input="handleInput"
      @focus="$emit('focus', $event)"
      @blur="$emit('blur', $event)"
      :class="inputClass"
      :style="inputStyle"
    />
    <div class="number-input-arrows">
      <button
        type="button"
        class="number-input-arrow up"
        @click="increment"
        :disabled="disabled || (max !== undefined && Number(modelValue) >= max)"
        tabindex="-1"
      >
        <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 1L9 5H1L5 1Z" fill="currentColor"/>
        </svg>
      </button>
      <button
        type="button"
        class="number-input-arrow down"
        @click="decrement"
        :disabled="disabled || (min !== undefined && Number(modelValue) <= min)"
        tabindex="-1"
      >
        <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5L9 1H1L5 5Z" fill="currentColor"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: number | string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  inputClass?: string;
  inputStyle?: string | Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'number',
  step: 1,
  inputClass: '',
  inputStyle: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value === '' ? '' : Number(target.value);
  emit('update:modelValue', value as number);
};

const increment = () => {
  if (props.disabled) return;
  const currentValue = Number(props.modelValue) || 0;
  const newValue = currentValue + (props.step || 1);
  const finalValue = props.max !== undefined ? Math.min(newValue, props.max) : newValue;
  emit('update:modelValue', finalValue);
};

const decrement = () => {
  if (props.disabled) return;
  const currentValue = Number(props.modelValue) || 0;
  const newValue = currentValue - (props.step || 1);
  const finalValue = props.min !== undefined ? Math.max(newValue, props.min) : newValue;
  emit('update:modelValue', finalValue);
};
</script>

<style scoped>
.number-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.number-input-wrapper input[type="number"] {
  width: 100%;
  padding-right: 40px !important;
  -moz-appearance: textfield !important;
  appearance: textfield !important;
}

.number-input-wrapper input[type="number"]::-webkit-inner-spin-button,
.number-input-wrapper input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none !important;
  margin: 0 !important;
}

.number-input-arrows {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
  z-index: 1;
}

.number-input-arrow {
  width: 20px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: all;
  transition: all 0.2s ease;
  border-radius: 4px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  padding: 0;
  margin: 0;
}

.number-input-arrow:hover:not(:disabled) {
  background: rgba(0, 255, 136, 0.1);
  color: var(--accent-primary);
}

.number-input-arrow:active:not(:disabled) {
  background: rgba(0, 255, 136, 0.2);
  transform: scale(0.95);
}

.number-input-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.number-input-arrow svg {
  width: 10px;
  height: 10px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>

