<script setup>
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <div class="exercise-layout">
    <div class="exercise-header">
      <a href="/" class="home-link">🏠 Accueil</a>
      <a href="/grandeurs-mesures/" class="back-link">← Retour aux exercices</a>
    </div>
    <div class="exercise-content">
      <Content />
    </div>
  </div>
</template>

<style scoped>
.exercise-layout {
  min-height: 100vh;
  background: #fafafa;
  padding: 10px 20px;
}

.exercise-header {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.home-link,
.back-link {
  font-size: 1rem;
  color: #2e59a6;
  text-decoration: none;
  padding: 8px 16px;
  background: white;
  border-radius: 8px;
  transition: background 0.2s;
}

.home-link:hover,
.back-link:hover {
  background: #53c2e2;
}

.exercise-content {
  max-width: 100%;
}

.exercise-content :deep(h1) {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 15px;
  color: #000;
}

.exercise-content :deep(.tip) {
  display: none;
}
</style>
