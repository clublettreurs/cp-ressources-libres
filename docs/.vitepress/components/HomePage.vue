<script setup>
import { ref } from 'vue'

const showMenu = ref(false)
</script>

<template>
  <div class="home-wrapper">
    <!-- Menu burger -->
    <div class="menu-overlay">
      <div class="menu-toggle" @click="showMenu = !showMenu">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </div>
      <div class="menu-card" v-show="showMenu">
        <div class="menu-close" @click="showMenu = false">✕</div>
        
        <div class="menu-section">
          <strong>📍 Navigation</strong>
          <ul>
            <li><a href="/">🏠 Accueil</a></li>
            <li><a href="/grandeurs-mesures/">📏 Grandeurs et mesures</a></li>
            <li><a href="/ecriture/">✏️ Écriture</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="home-content">
      <h1>📚 CP Ressources Libres</h1>
      <p class="tagline">Ressources pédagogiques numériques libres pour les enseignants de CP</p>
      
      <div class="cards">
        <a href="/grandeurs-mesures/" class="card">
          <div class="card-icon card-icon-mesure">
            <svg viewBox="0 0 100 40" class="icon-mesure">
              <line x1="2" y1="20" x2="98" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"/>
              <line x1="2" y1="12" x2="2" y2="28" stroke="#fbb90d" stroke-width="3" stroke-linecap="round"/>
              <line x1="34" y1="12" x2="34" y2="28" stroke="#fbb90d" stroke-width="3" stroke-linecap="round"/>
              <line x1="66" y1="12" x2="66" y2="28" stroke="#fbb90d" stroke-width="3" stroke-linecap="round"/>
              <line x1="98" y1="12" x2="98" y2="28" stroke="#fbb90d" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="card-title">Grandeurs et mesures</div>
          <div class="card-desc">Les longueurs</div>
        </a>
        
        <a href="/ecriture/" class="card">
          <div class="card-icon card-icon-ecriture">
            <span class="icon-guide">b</span>
            <span class="icon-abc">abc</span>
          </div>
          <div class="card-title">Écriture</div>
          <div class="card-desc">Écriture cursive</div>
        </a>
      </div>
      
      <p class="footer-text">
        Exercices interactifs conçus pour TNI.<br>
        Contenus libres, modifiables et partageables.
      </p>
    </div>
  </div>
</template>

<style scoped>
.home-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fafafa;
  font-family: 'Borel', cursive;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Menu burger */
.menu-overlay {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 200;
}

.menu-toggle {
  width: 45px;
  height: 45px;
  background: #2e59a6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.menu-toggle:hover {
  transform: scale(1.05);
}

.burger-line {
  width: 24px;
  height: 3px;
  background: white;
  border-radius: 2px;
}

.menu-card {
  position: absolute;
  top: 55px;
  left: 0;
  background: white;
  border: 2px solid #2e59a6;
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
  min-width: 250px;
}

.menu-section strong {
  color: #2e59a6;
  font-size: 1.4rem;
  display: block;
  margin-bottom: 8px;
  font-family: 'BorelSans', sans-serif;
}

.menu-section ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.menu-section li {
  margin: 8px 0;
}

.menu-section a {
  color: #000;
  text-decoration: none;
  font-size: 1.4rem;
}

.menu-section a:hover {
  color: #2e59a6;
}

.menu-close {
  position: absolute;
  top: 8px;
  right: 10px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #000;
}

.menu-close:hover {
  color: #2e59a6;
}

/* Contenu */
.home-content {
  text-align: center;
  padding: 20px;
}

h1 {
  font-size: 3rem;
  color: #000;
  margin-bottom: 10px;
  font-family: 'BorelSans', sans-serif;
}

.tagline {
  font-size: 1.6rem;
  color: #000;
  margin-bottom: 40px;
}

.cards {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.card {
  background: #2e59a6;
  border: none;
  border-radius: 16px;
  padding: 30px 40px;
  text-decoration: none;
  color: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 200px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-mesure .icon-mesure {
  width: 80px;
  height: 40px;
}

.card-icon-ecriture {
  position: relative;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-ecriture .icon-guide {
  position: absolute;
  font-family: 'BorelGuides', sans-serif !important;
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1;
}

.card-icon-ecriture .icon-abc {
  position: relative;
  font-family: 'BorelFRTrad', cursive !important;
  font-size: 2rem;
  color: #fbb90d;
  z-index: 1;
  text-align: center;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 8px;
  font-family: 'BorelSans', sans-serif;
}

.card-desc {
  font-size: 1.3rem;
  color: #fff;
}

.footer-text {
  color: #000;
  font-size: 1rem;
  line-height: 1.6;
}
</style>
