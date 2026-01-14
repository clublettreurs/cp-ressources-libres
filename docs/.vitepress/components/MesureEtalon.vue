<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Éléments du DOM
const canvasContainer = ref(null)
const canvas = ref(null)
let ctx = null

// État
const showMenu = ref(false)
let marks = []
let feedbackMessage = ref('')
let feedbackType = ref('')
let showConfetti = ref(false)
let confettiParticles = []
let confettiAnimationId = null

// Dimensions
const ETALON_WIDTH = 80
const ETALON_HEIGHT = 40
const BAND_HEIGHT = 40

// Position de l'étalon (draggable)
let etalonX = 50
let etalonY = 100
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0

// Bande à mesurer
let bandX = 0
let bandY = 0
let bandLength = 0
let correctAnswer = 0
let answer = ref(0)

// Dimensions logiques du canvas (indépendantes de la résolution)
let canvasWidth = 0
let canvasHeight = 0

function initCanvas() {
  if (!canvasContainer.value) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  
  // Stocker les dimensions logiques
  canvasWidth = rect.width
  canvasHeight = rect.height
  
  // Définir les dimensions du buffer (haute résolution)
  canvas.value.width = rect.width * dpr
  canvas.value.height = rect.height * dpr
  
  // Mettre à l'échelle via CSS pour affichage correct
  canvas.value.style.width = rect.width + 'px'
  canvas.value.style.height = rect.height + 'px'
  
  ctx = canvas.value.getContext('2d')
  // Mettre à l'échelle le contexte pour dessiner en coordonnées logiques
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function generateBand() {
  if (!canvas.value || !ctx) return
  
  marks = []
  feedbackMessage.value = ''
  feedbackType.value = ''
  answer.value = 0
  showConfetti.value = false
  stopConfetti()
  
  // Longueur aléatoire entre 3 et 6 étalons
  correctAnswer = Math.floor(Math.random() * 4) + 3
  bandLength = correctAnswer * ETALON_WIDTH
  
  // Centrer la bande horizontalement (utiliser les dimensions logiques)
  bandX = (canvasWidth - bandLength) / 2
  bandY = canvasHeight / 2 - BAND_HEIGHT / 2
  
  // Position initiale de l'étalon (en bas au milieu)
  etalonX = (canvasWidth - ETALON_WIDTH) / 2
  etalonY = canvasHeight - ETALON_HEIGHT - 20
  
  drawScene()
}

function drawScene() {
  if (!ctx || !canvas.value) return
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Dessiner la bande à mesurer (vert clair)
  ctx.fillStyle = '#aed6ba'
  ctx.fillRect(bandX, bandY, bandLength, BAND_HEIGHT)
  
  // Lignes noires au début et à la fin de la bande
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  
  // Ligne au début
  ctx.beginPath()
  ctx.moveTo(bandX, bandY - 8)
  ctx.lineTo(bandX, bandY + BAND_HEIGHT + 8)
  ctx.stroke()
  
  // Ligne à la fin
  ctx.beginPath()
  ctx.moveTo(bandX + bandLength, bandY - 8)
  ctx.lineTo(bandX + bandLength, bandY + BAND_HEIGHT + 8)
  ctx.stroke()
  
  // Dessiner les repères placés
  marks.forEach(mark => {
    ctx.strokeStyle = '#e84f6d'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(mark.x, bandY - 10)
    ctx.lineTo(mark.x, bandY + BAND_HEIGHT + 10)
    ctx.stroke()
  })
  
  // Dessiner l'étalon (jaune) avec léger arrondi
  const radius = 2
  ctx.fillStyle = '#fbb90d'
  ctx.beginPath()
  ctx.roundRect(etalonX, etalonY, ETALON_WIDTH, ETALON_HEIGHT, radius)
  ctx.fill()
}

// Gestion du drag de l'étalon
function getMousePos(e) {
  const rect = canvas.value.getBoundingClientRect()
  // Utiliser les dimensions logiques pour la mise à l'échelle
  const scaleX = canvasWidth / rect.width
  const scaleY = canvasHeight / rect.height
  
  if (e.touches) {
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY
    }
  }
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function isOnEtalon(x, y) {
  // Zone de sélection élargie sur les côtés longs (haut et bas)
  const hitPadding = 15
  return x >= etalonX && x <= etalonX + ETALON_WIDTH &&
         y >= etalonY - hitPadding && y <= etalonY + ETALON_HEIGHT + hitPadding
}

function startDrag(e) {
  e.preventDefault()
  const pos = getMousePos(e)
  
  if (isOnEtalon(pos.x, pos.y)) {
    isDragging = true
    dragOffsetX = pos.x - etalonX
    dragOffsetY = pos.y - etalonY
  }
}

function drag(e) {
  if (!isDragging) return
  e.preventDefault()
  
  const pos = getMousePos(e)
  etalonX = pos.x - dragOffsetX
  etalonY = pos.y - dragOffsetY
  
  drawScene()
}

function endDrag(e) {
  isDragging = false
}

// Placer un repère
function traceMark() {
  // Placer un repère au bout droit de l'étalon
  const markX = etalonX + ETALON_WIDTH
  
  // Vérifier si on est sur la bande
  if (markX >= bandX && markX <= bandX + bandLength + 5) {
    // Vérifier qu'il n'y a pas déjà un repère à cet endroit
    const exists = marks.some(m => Math.abs(m.x - markX) < 10)
    if (!exists) {
      marks.push({ x: markX })
      drawScene()
    }
  }
}

function clearMarks() {
  marks = []
  feedbackMessage.value = ''
  feedbackType.value = ''
  answer.value = 0
  drawScene()
}

function incrementAnswer() {
  answer.value++
}

function decrementAnswer() {
  if (answer.value > 0) answer.value--
}

function checkAnswer() {
  if (answer.value === correctAnswer) {
    feedbackMessage.value = '🎉 Bravo ! C\'est exact !'
    feedbackType.value = 'success'
    startConfetti()
  } else {
    feedbackMessage.value = '❌ Essaie encore !'
    feedbackType.value = 'error'
    showConfetti.value = false
    stopConfetti()
  }
}

// Confetti animation
function startConfetti() {
  showConfetti.value = true
  confettiParticles = []
  
  const colors = ['#2bb0a3', '#aed6ba', '#2e59a6', '#53c2e2', '#e84f6d', '#f19bb1']
  
  for (let i = 0; i < 150; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 100,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: (Math.random() - 0.5) * 4,
      speedY: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    })
  }
  
  nextTick(() => {
    animateConfetti()
  })
}

function animateConfetti() {
  const confettiCanvas = document.getElementById('confettiCanvas')
  if (!confettiCanvas) return
  
  const ctx = confettiCanvas.getContext('2d')
  confettiCanvas.width = window.innerWidth
  confettiCanvas.height = window.innerHeight
  
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height)
  
  let activeParticles = 0
  
  confettiParticles.forEach(p => {
    p.x += p.speedX
    p.y += p.speedY
    p.rotation += p.rotationSpeed
    p.speedY += 0.1
    
    if (p.y < confettiCanvas.height + 20) {
      activeParticles++
      
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation * Math.PI / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }
  })
  
  if (activeParticles > 0 && showConfetti.value) {
    confettiAnimationId = requestAnimationFrame(animateConfetti)
  } else {
    stopConfetti()
  }
}

function stopConfetti() {
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId)
    confettiAnimationId = null
  }
}

onMounted(() => {
  // Attendre que le DOM soit prêt avec nextTick puis un petit délai pour Chromium Android
  nextTick(() => {
    setTimeout(() => {
      initCanvas()
      // Vérifier que les dimensions sont valides
      if (canvasWidth > 0 && canvasHeight > 0) {
        generateBand()
      } else {
        // Réessayer après un délai si les dimensions ne sont pas prêtes
        setTimeout(() => {
          initCanvas()
          generateBand()
        }, 100)
      }
    }, 50)
  })
  
  // Event listeners
  canvas.value.addEventListener('mousedown', startDrag)
  canvas.value.addEventListener('mousemove', drag)
  canvas.value.addEventListener('mouseup', endDrag)
  canvas.value.addEventListener('mouseleave', endDrag)
  canvas.value.addEventListener('touchstart', startDrag, { passive: false })
  canvas.value.addEventListener('touchmove', drag, { passive: false })
  canvas.value.addEventListener('touchend', endDrag)
  
  window.addEventListener('resize', () => {
    initCanvas()
    generateBand()
  })
})

onUnmounted(() => {
  stopConfetti()
})
</script>

<template>
  <div class="exercise-wrapper">
    <!-- Canvas confettis -->
    <canvas v-if="showConfetti" id="confettiCanvas" class="confetti-canvas"></canvas>
    
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
        
        <div class="menu-section">
          <strong>❓ Instructions</strong>
          <p>Déplace l'étalon jaune sur la bande bleue.</p>
          <p>Clique sur "Repère" pour marquer chaque mesure.</p>
          <p>Compte combien d'étalons rentrent dans la bande.</p>
        </div>
      </div>
    </div>

    <!-- Zone de dessin -->
    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="canvas"></canvas>
    </div>

    <!-- Barre de contrôles en bas -->
    <div class="bottom-bar">
      <div class="controls">
        <button class="btn btn-mark" @click="traceMark">Repère</button>
        <button class="btn btn-clear" @click="clearMarks">Effacer</button>
        <button class="btn btn-new" @click="generateBand">Nouveau</button>
      </div>

      <div class="answer-section">
        <div class="answer-label">Combien d'étalons ?</div>
        <div class="answer-input">
          <button class="btn-counter btn-minus" @click="decrementAnswer">−</button>
          <div class="answer-display">{{ answer }}</div>
          <button class="btn-counter btn-plus" @click="incrementAnswer">+</button>
        </div>
        <button class="btn btn-check" @click="checkAnswer">Vérifier</button>
        <div class="feedback" :class="feedbackType">{{ feedbackMessage }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  font-family: 'Borel', cursive;
}

.confetti-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
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
  justify-content: center;
  align-items: center;
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
  border-radius: 12px;
  padding: 20px;
  min-width: 280px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.menu-section {
  margin-bottom: 15px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-section strong {
  display: block;
  margin-bottom: 8px;
  color: #2e59a6;
  font-size: 1.1rem;
}

.menu-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-section li {
  margin: 8px 0;
}

.menu-section a {
  color: #000;
  text-decoration: none;
  font-size: 1.1rem;
}

.menu-section a:hover {
  color: #2e59a6;
}

.menu-section p {
  margin: 5px 0;
  font-size: 1rem;
  color: #000;
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

/* Canvas */
.canvas-container {
  flex: 1;
  position: relative;
  background: #fff;
  border: 3px solid #000;
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.canvas-container canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.canvas-container canvas:active {
  cursor: grabbing;
}

/* Barre du bas */
.bottom-bar {
  background: white;
  padding: 12px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.bottom-bar > * {
  margin: 0 10px;
}

.controls {
  display: flex;
}

.controls > * {
  margin: 0 5px;
}

.btn {
  font-family: 'Borel', cursive;
  font-size: 1rem;
  padding: 16px 20px 8px 20px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-mark {
  background: #2e59a6;
  color: white;
}

.btn-new {
  background: #fbb90d;
  color: #000;
}

.btn-clear {
  background: #e84f6d;
  color: white;
}

.answer-section {
  display: flex;
  align-items: center;
}

.answer-section > * {
  margin: 0 7px;
}

.answer-label {
  font-size: 1.1rem;
  color: #000;
  font-weight: 500;
  padding: 16px 0 8px 0;
  line-height: 1;
}

.answer-input {
  display: flex;
  align-items: center;
}

.answer-input > * {
  margin: 0 4px;
}

.btn-counter {
  width: 45px;
  height: 45px;
  font-size: 1.8rem;
  line-height: 1;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
  padding: 20px 0 0 0;
  font-family: system-ui, sans-serif;
}

.btn-counter:active {
  transform: scale(0.95);
}

.btn-minus {
  background: #e84f6d;
  color: white;
}

.btn-plus {
  background: #2bb0a3;
  color: white;
}

.answer-display {
  width: 60px;
  height: 50px;
  background: white;
  border: 2px solid #000;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 1.8rem;
  color: #000;
  padding: 18px 0 0 0;
  line-height: 1;
  font-family: system-ui, sans-serif;
}

.btn-check {
  background: #2e59a6;
  color: white;
  font-size: 1rem;
  padding: 16px 20px 8px 20px;
}

.feedback {
  font-size: 1.3rem;
  min-width: 150px;
  text-align: center;
  padding: 16px 0 8px 0;
  line-height: 1;
}

.feedback.success {
  color: #2bb0a3;
  font-weight: bold;
}

.feedback.error {
  color: #e84f6d;
}
</style>
