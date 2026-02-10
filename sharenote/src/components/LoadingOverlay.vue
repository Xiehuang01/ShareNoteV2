<template>
  <div class="loading-overlay" role="status" aria-live="polite">
    <div class="spinner" />
    <div v-if="message" class="loading-message">{{ message }}</div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped lang="scss">
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(3, 6, 23, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  z-index: 50;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top-color: rgba(21, 187, 129, 0.9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
