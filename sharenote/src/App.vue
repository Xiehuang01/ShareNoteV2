<script setup>
import { ref } from 'vue'

// 定义响应式变量 theme，用于控制主题
const theme = ref('light') // 初始值为 'light'，表示亮色主题
</script>

<template>
  <!-- 绑定 data-theme 为 theme 变量 -->
  <div :data-theme="theme"><router-view></router-view></div>
</template>

<style>
/* 默认：暗色模式 */
:root {
  --bg-color: #121212;
  --text-color: #f5f9fe;
}

/* 亮色模式：当 data-theme 为 'light' 时应用 */
:root[data-theme='light'] {
  --bg-color: #ffffff;
  --text-color: #222222;
}

body {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  background-color: var(--bg-color);
  color: var(--text-color); /* 添加文本颜色 */
}
</style>
