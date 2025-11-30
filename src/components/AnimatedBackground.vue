<template>
  <div class="animated-bg">
    <div v-if="showImage" class="bg-image" :style="{ backgroundImage: `url('${imageUrl}')` }"></div>
    <div class="bg-gradient-1"></div>
    <div class="bg-gradient-2"></div>
    <div class="bg-pattern"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showImage?: boolean;
  imageUrl?: string;
}

withDefaults(defineProps<Props>(), {
  showImage: false,
  imageUrl: '/imagemcamp.png',
});
</script>

<style scoped>
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.15;
  z-index: 1;
}

.bg-gradient-1,
.bg-gradient-2 {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
  z-index: 2;
}

.bg-gradient-1 {
  width: 600px;
  height: 600px;
  background: var(--accent-primary);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.bg-gradient-2 {
  width: 500px;
  height: 500px;
  background: var(--accent-secondary);
  bottom: -150px;
  right: -150px;
  animation-delay: 10s;
}

.bg-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.5;
  z-index: 3;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(50px, 50px) scale(1.1);
  }
}
</style>

