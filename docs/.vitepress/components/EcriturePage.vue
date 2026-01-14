<script setup>
import { ref } from 'vue'

const showMenu = ref(false)
</script>

<template>
  <div class="home-wrapper">
    <!-- Menu burger -->
    <div class="menu-overlay">
      <div class="menu-toggle" @click="showMenu = !showMenu" @touchend.prevent="showMenu = !showMenu">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </div>
      <div class="menu-card" v-show="showMenu">
        <div class="menu-close" @click="showMenu = false" @touchend.prevent="showMenu = false">✕</div>
        
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
      <h1>✏️ Écriture</h1>
      <p class="tagline">Exercices d'écriture cursive</p>
      
      <div class="cards">
        <a href="/cp-ressources-libres/ecriture/tracer-lettres" class="card">
          <div class="card-icon card-icon-ecriture">
            <span class="icon-guide">b</span>
            <span class="icon-text">Abc</span>
          </div>
          <div class="card-title">Lettres</div>
          <div class="card-desc">Tracer les lettres</div>
        </a>
        
        <a href="/cp-ressources-libres/ecriture/tracer-mots" class="card">
          <div class="card-icon card-icon-ecriture">
            <span class="icon-guide">bb</span>
            <span class="icon-text">Stylo</span>
          </div>
          <div class="card-title">Mots</div>
          <div class="card-desc">Tracer les mots</div>
        </a>
      </div>
      
      <p class="footer-text">
        <a href="/cp-ressources-libres/" class="back-link">← Retour à l'accueil</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==============================================
   GRILLE 4px - Système d'espacement responsive
   Tous les espacements sont multiples de 4px
   ============================================== */

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
  padding: 64px 16px 24px 16px; /* 16x4, 4x4, 6x4, 4x4 */
  overflow-y: auto;
}

/* Menu burger */
.menu-overlay {
  position: fixed;
  top: 16px; /* 4x4 */
  left: 16px; /* 4x4 */
  z-index: 200;
}

.menu-toggle {
  width: 48px; /* 12x4 */
  height: 48px; /* 12x4 */
  background: #2e59a6;
  border-radius: 8px; /* 2x4 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: transform 0.2s;
}

.menu-toggle:hover {
  transform: scale(1.05);
}

.burger-line {
  width: 24px; /* 6x4 */
  height: 4px; /* 1x4 */
  background: white;
  border-radius: 2px;
  margin: 4px 0; /* 1x4 */
}

.menu-card {
  position: absolute;
  top: 56px; /* 14x4 */
  left: 0;
  background: white;
  border: 2px solid #2e59a6;
  border-radius: 12px; /* 3x4 */
  padding: 16px 20px; /* 4x4, 5x4 */
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  min-width: 240px; /* 60x4 */
}

.menu-section strong {
  color: #2e59a6;
  font-size: 1.25rem;
  line-height: 1.4;
  display: block;
  margin-bottom: 8px; /* 2x4 */
  font-family: 'BorelSans', sans-serif;
}

.menu-section ul {
  margin: 0;
  padding-left: 20px; /* 5x4 */
  list-style: none;
}

.menu-section li {
  margin: 8px 0; /* 2x4 */
}

.menu-section a {
  color: #000;
  text-decoration: none;
  font-size: 1.125rem;
  line-height: 1.5;
}

.menu-section a:hover {
  color: #2e59a6;
}

.menu-close {
  position: absolute;
  top: 8px; /* 2x4 */
  right: 12px; /* 3x4 */
  cursor: pointer;
  font-size: 1.25rem;
  color: #000;
  padding: 4px; /* 1x4 */
}

.menu-close:hover {
  color: #2e59a6;
}

/* Contenu */
.home-content {
  text-align: center;
  padding: 24px 16px; /* 6x4, 4x4 */
  max-width: 100%;
}

h1 {
  font-size: 2rem;
  line-height: 1.3;
  color: #000;
  margin: 0 0 12px 0; /* 3x4 */
  font-family: 'BorelSans', sans-serif;
}

.tagline {
  font-size: 1.125rem;
  line-height: 1.5;
  color: #000;
  margin: 0 0 32px 0; /* 8x4 */
}

.cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px; /* 8x4 */
}

.card {
  background: #2e59a6;
  border: none;
  border-radius: 12px; /* 3x4 */
  padding: 20px 24px; /* 5x4, 6x4 */
  margin: 8px; /* 2x4 */
  text-decoration: none;
  color: #fff;
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 140px; /* 35x4 */
}

.card:hover {
  transform: translateY(-4px); /* 1x4 */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 12px; /* 3x4 */
  height: 48px; /* 12x4 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-ecriture {
  position: relative;
  width: 100%;
  height: 48px; /* 12x4 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-icon-ecriture .icon-guide {
  position: absolute;
  font-family: 'BorelGuides', sans-serif !important;
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1;
}

.card-icon-ecriture .icon-text {
  position: relative;
  font-family: 'BorelFRTrad', cursive !important;
  font-size: 1.5rem;
  color: #fbb90d;
  z-index: 1;
  text-align: center;
}

.card-title {
  font-size: 1.25rem;
  line-height: 1.4;
  font-weight: 600;
  margin-bottom: 4px; /* 1x4 */
  font-family: 'BorelSans', sans-serif;
}

.card-desc {
  font-size: 1rem;
  line-height: 1.4;
  color: #fff;
}

.footer-text {
  margin-top: 24px; /* 6x4 */
}

.back-link {
  color: #2e59a6;
  text-decoration: none;
  font-size: 1.125rem;
  line-height: 1.5;
}

.back-link:hover {
  text-decoration: underline;
}

/* ==============================================
   RESPONSIVE - Tablette (768px+)
   ============================================== */
@media (min-width: 768px) {
  .home-wrapper {
    padding: 80px 24px 32px 24px; /* 20x4, 6x4, 8x4, 6x4 */
  }

  .menu-overlay {
    top: 20px; /* 5x4 */
    left: 20px; /* 5x4 */
  }

  h1 {
    font-size: 2.5rem;
    margin: 0 0 16px 0; /* 4x4 */
  }

  .tagline {
    font-size: 1.375rem;
    margin: 0 0 40px 0; /* 10x4 */
  }

  .cards {
    margin-bottom: 40px; /* 10x4 */
  }

  .card {
    padding: 28px 36px; /* 7x4, 9x4 */
    margin: 12px; /* 3x4 */
    min-width: 180px; /* 45x4 */
  }

  .card-icon {
    height: 56px; /* 14x4 */
    margin-bottom: 16px; /* 4x4 */
  }

  .card-icon-ecriture {
    height: 56px; /* 14x4 */
  }

  .card-icon-ecriture .icon-guide {
    font-size: 3.5rem;
  }

  .card-icon-ecriture .icon-text {
    font-size: 1.75rem;
  }

  .card-title {
    font-size: 1.5rem;
    margin-bottom: 8px; /* 2x4 */
  }

  .card-desc {
    font-size: 1.125rem;
  }
}

/* ==============================================
   RESPONSIVE - Desktop / TNI (1024px+)
   ============================================== */
@media (min-width: 1024px) {
  .home-wrapper {
    padding: 24px; /* 6x4 */
  }

  .menu-overlay {
    top: 24px; /* 6x4 */
    left: 24px; /* 6x4 */
  }

  .menu-toggle {
    width: 52px; /* 13x4 */
    height: 52px; /* 13x4 */
  }

  h1 {
    font-size: 3rem;
    margin: 0 0 20px 0; /* 5x4 */
  }

  .tagline {
    font-size: 1.5rem;
    margin: 0 0 48px 0; /* 12x4 */
  }

  .card {
    padding: 32px 44px; /* 8x4, 11x4 */
    margin: 16px; /* 4x4 */
    min-width: 200px; /* 50x4 */
    border-radius: 16px; /* 4x4 */
  }

  .card-icon {
    height: 64px; /* 16x4 */
    margin-bottom: 20px; /* 5x4 */
  }

  .card-icon-ecriture {
    height: 64px; /* 16x4 */
  }

  .card-icon-ecriture .icon-guide {
    font-size: 4rem;
  }

  .card-icon-ecriture .icon-text {
    font-size: 2rem;
  }

  .card-title {
    font-size: 1.75rem;
    margin-bottom: 12px; /* 3x4 */
  }

  .card-desc {
    font-size: 1.25rem;
  }

  .back-link {
    font-size: 1.25rem;
  }
}

/* ==============================================
   RESPONSIVE - Grand écran / TNI 4K (1440px+)
   ============================================== */
@media (min-width: 1440px) {
  h1 {
    font-size: 3.5rem;
  }

  .tagline {
    font-size: 1.75rem;
    margin: 0 0 56px 0; /* 14x4 */
  }

  .card {
    padding: 36px 52px; /* 9x4, 13x4 */
    margin: 20px; /* 5x4 */
  }

  .card-title {
    font-size: 2rem;
  }

  .card-desc {
    font-size: 1.375rem;
  }
}
</style>
