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
            <li><a href="/cp-ressources-libres/">🏠 Accueil</a></li>
            <li><a href="/cp-ressources-libres/grandeurs-mesures/">📏 Grandeurs et mesures</a></li>
            <li><a href="/cp-ressources-libres/ecriture/">✏️ Écriture</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="home-content">
      <h1>📏 Grandeurs et mesures</h1>
      <p class="tagline">Les longueurs - Mesurer avec une unité étalon</p>
      
      <!-- Ligne 1: Étalon -->
      <div class="cards-row">
        <a href="/cp-ressources-libres/grandeurs-mesures/mesure-etalon" class="card">
          <div class="card-icon card-icon-mesure">
            <svg viewBox="0 0 80 30" class="icon-mesure">
              <rect x="5" y="8" width="30" height="14" fill="#fbb90d" rx="2"/>
              <rect x="40" y="8" width="35" height="14" fill="#aed6ba" rx="2"/>
            </svg>
          </div>
          <div class="card-title">Étalon</div>
          <div class="card-desc">Déplacer l'étalon</div>
        </a>
      </div>
      
      <!-- Ligne 2: 3 segments -->
      <div class="cards-row">
        <a href="/cp-ressources-libres/grandeurs-mesures/mesure-1-segment" class="card">
          <div class="card-icon card-icon-mesure">
            <svg viewBox="0 0 80 30" class="icon-mesure">
              <line x1="5" y1="15" x2="75" y2="15" stroke="#fbb90d" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="card-title">1 segment</div>
          <div class="card-desc">Ligne droite</div>
        </a>
        
        <a href="/cp-ressources-libres/grandeurs-mesures/mesure-2-segments" class="card">
          <div class="card-icon card-icon-mesure">
            <svg viewBox="0 0 80 30" class="icon-mesure">
              <polyline points="5,22 40,8 75,22" fill="none" stroke="#fbb90d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="card-title">2 segments</div>
          <div class="card-desc">Ligne brisée</div>
        </a>
        
        <a href="/cp-ressources-libres/grandeurs-mesures/mesure-3-segments" class="card">
          <div class="card-icon card-icon-mesure">
            <svg viewBox="0 0 80 30" class="icon-mesure">
              <polyline points="5,20 25,8 55,22 75,10" fill="none" stroke="#fbb90d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="card-title">3 segments</div>
          <div class="card-desc">Ligne brisée</div>
        </a>
      </div>
      
      <!-- Ligne 3: Chemins -->
      <div class="cards-row">
        <a href="/cp-ressources-libres/grandeurs-mesures/comparer-chemins" class="card">
          <div class="card-icon card-icon-mesure">
            <svg viewBox="0 0 80 30" class="icon-mesure">
              <text x="2" y="18" font-size="14">🏠</text>
              <polyline points="18,15 35,6 55,6 62,15" fill="none" stroke="#2e59a6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="18,15 35,24 55,24 62,15" fill="none" stroke="#f19bb1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="62" y="18" font-size="14">🏫</text>
            </svg>
          </div>
          <div class="card-title">Chemins</div>
          <div class="card-desc">Comparer deux trajets</div>
        </a>
      </div>
      
      <p class="footer-text">
        <a href="/cp-ressources-libres/" class="back-link">← Retour à l'accueil</a>
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
  margin: 2.5px 0;
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

.cards-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.card {
  background: #2e59a6;
  border: none;
  border-radius: 16px;
  padding: 30px 40px;
  margin: 10px 15px;
  text-decoration: none;
  color: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 180px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-mesure .icon-mesure {
  width: 80px;
  height: 30px;
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
  margin-top: 20px;
}

.back-link {
  color: #2e59a6;
  text-decoration: none;
  font-size: 1.4rem;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
