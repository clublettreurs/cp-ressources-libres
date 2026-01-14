<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const showMenu = ref(false)

// Liste de mots simples de 3 à 5 lettres (français uniquement)
const mots = [
  'ami', 'eau', 'rue', 'été', 'île', 'oie', 'vie', 'cou', 'fou', 'mur',
  'chat', 'loup', 'ours', 'père', 'mère', 'fils',
  'lune', 'rose', 'bleu', 'vert', 'noir', 'gris',
  'pain', 'lait', 'poire', 'soupe',
  'main', 'pied', 'tête', 'yeux', 'nez', 'dent',
  'jour', 'nuit', 'midi', 'soir',
  'livre', 'table', 'lit', 'porte',
  'arbre', 'fleur', 'herbe',
  'papa', 'maman', 'bébé', 'tata'
].filter(m => m.length >= 3 && m.length <= 5)

// Mot courant
const motIndex = ref(0)
const mot = computed(() => {
  const m = mots[motIndex.value]
  return m.charAt(0).toUpperCase() + m.slice(1)
})

// Canvas refs
const canvasContainer = ref(null)
const letterCanvas = ref(null)
const drawCanvas = ref(null)
const guideCanvas = ref(null)

// État du tracé
const isDrawing = ref(false)
const hasDrawn = ref(false)
const feedback = ref('')
const feedbackType = ref('')
const showConfetti = ref(false)
const confettiPieces = ref([])

// Dimensions
const letterSize = 200

// Dimensions canvas (mises à jour dynamiquement)
let canvasWidth = 900
let canvasHeight = 350

// Générer un mot aléatoire
function generateWord() {
  motIndex.value = Math.floor(Math.random() * mots.length)
  hasDrawn.value = false
  feedback.value = ''
  feedbackType.value = ''
  clearDrawing()
  drawWordAndGuides()
}

// Initialiser les canvas
function initCanvas() {
  if (!canvasContainer.value) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  canvasWidth = rect.width
  canvasHeight = rect.height
  
  if (guideCanvas.value) {
    guideCanvas.value.width = canvasWidth
    guideCanvas.value.height = canvasHeight
  }
  if (letterCanvas.value) {
    letterCanvas.value.width = canvasWidth
    letterCanvas.value.height = canvasHeight
  }
  if (drawCanvas.value) {
    drawCanvas.value.width = canvasWidth
    drawCanvas.value.height = canvasHeight
  }
}

// Dessiner le mot modèle
function drawWordAndGuides() {
  const guideCtx = guideCanvas.value?.getContext('2d')
  const letterCtx = letterCanvas.value?.getContext('2d')
  if (!guideCtx || !letterCtx) return
  
  guideCtx.clearRect(0, 0, canvasWidth, canvasHeight)
  letterCtx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Centrer verticalement et horizontalement
  // La baseline est environ à 80% de la hauteur de la police
  const centerY = canvasHeight / 2 + letterSize * 0.3
  
  // 1. D'abord BorelGuides en arrière-plan - "L" répétés pour chaque lettre
  guideCtx.font = `${letterSize}px 'BorelGuides', cursive`
  guideCtx.fillStyle = '#e0e0e0'
  guideCtx.textBaseline = 'alphabetic'
  
  // Créer une chaîne de "L" de même longueur que le mot
  const guidesText = 'L'.repeat(mot.value.length)
  let metrics = guideCtx.measureText(guidesText)
  let startX = (canvasWidth - metrics.width) / 2
  guideCtx.fillText(guidesText, startX, centerY)
  
  // 2. Ensuite BorelFRTrad en premier plan (le vrai mot)
  letterCtx.font = `${letterSize}px 'BorelFRTrad', cursive`
  letterCtx.fillStyle = '#c0c0c0'
  letterCtx.textBaseline = 'alphabetic'
  
  metrics = letterCtx.measureText(mot.value)
  startX = (canvasWidth - metrics.width) / 2
  letterCtx.fillText(mot.value, startX, centerY)
}

// Effacer le tracé
function clearDrawing() {
  const ctx = drawCanvas.value?.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
}

// Gestion du tracé
function getPos(e) {
  const rect = drawCanvas.value.getBoundingClientRect()
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

function startDraw(e) {
  e.preventDefault()
  isDrawing.value = true
  hasDrawn.value = true
  
  const ctx = drawCanvas.value?.getContext('2d')
  if (!ctx) return
  
  const pos = getPos(e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  ctx.strokeStyle = '#2e59a6'
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function draw(e) {
  if (!isDrawing.value) return
  e.preventDefault()
  
  const ctx = drawCanvas.value?.getContext('2d')
  if (!ctx) return
  
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function endDraw() {
  isDrawing.value = false
}

// Vérifier le tracé
function verifier() {
  if (!hasDrawn.value) {
    feedback.value = 'Trace d\'abord le mot !'
    feedbackType.value = 'error'
    return
  }
  
  const letterCtx = letterCanvas.value?.getContext('2d')
  const drawCtx = drawCanvas.value?.getContext('2d')
  if (!letterCtx || !drawCtx) return
  
  const letterData = letterCtx.getImageData(0, 0, canvasWidth, canvasHeight).data
  const drawData = drawCtx.getImageData(0, 0, canvasWidth, canvasHeight).data
  
  let letterPixels = 0
  let coveredPixels = 0
  let totalDrawnPixels = 0
  
  const tolerance = 15
  const letterMask = new Uint8Array(canvasWidth * canvasHeight)
  
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4
      if (letterData[i + 3] > 50) {
        letterPixels++
        for (let dy = -tolerance; dy <= tolerance; dy++) {
          for (let dx = -tolerance; dx <= tolerance; dx++) {
            const ny = y + dy
            const nx = x + dx
            if (nx >= 0 && nx < canvasWidth && ny >= 0 && ny < canvasHeight) {
              letterMask[ny * canvasWidth + nx] = 1
            }
          }
        }
      }
    }
  }
  
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4
      if (drawData[i + 3] > 50) {
        totalDrawnPixels++
        if (letterMask[y * canvasWidth + x]) {
          coveredPixels++
        }
      }
    }
  }
  
  const coverageRatio = totalDrawnPixels > 0 ? coveredPixels / totalDrawnPixels : 0
  const minDrawnRatio = letterPixels > 0 ? totalDrawnPixels / letterPixels : 0
  
  if (coverageRatio >= 0.7 && minDrawnRatio >= 0.12) {
    feedback.value = 'Bravo ! 🎉'
    feedbackType.value = 'success'
    launchConfetti()
  } else if (coverageRatio < 0.5) {
    feedback.value = 'Essaie de tracer sur le mot gris'
    feedbackType.value = 'error'
  } else if (minDrawnRatio < 0.12) {
    feedback.value = 'Continue à tracer le mot'
    feedbackType.value = 'error'
  } else {
    feedback.value = 'Presque ! Essaie encore'
    feedbackType.value = 'error'
  }
}

// Confettis
function launchConfetti() {
  showConfetti.value = true
  confettiPieces.value = []
  
  for (let i = 0; i < 80; i++) {
    confettiPieces.value.push({
      x: Math.random() * window.innerWidth,
      y: -20,
      size: Math.random() * 10 + 5,
      color: ['#2bb0a3', '#aed6ba', '#2e59a6', '#53c2e2', '#e84f6d', '#f19bb1'][Math.floor(Math.random() * 6)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 4,
      rotation: Math.random() * 360
    })
  }
  
  animateConfetti()
  setTimeout(() => { showConfetti.value = false }, 3000)
}

function animateConfetti() {
  if (!showConfetti.value) return
  
  confettiPieces.value.forEach(p => {
    p.y += p.speedY
    p.x += p.speedX
    p.rotation += 5
  })
  
  requestAnimationFrame(animateConfetti)
}

// Nouveau mot
function nouveauMot() {
  generateWord()
}

// Effacer
function effacer() {
  clearDrawing()
  hasDrawn.value = false
  feedback.value = ''
  feedbackType.value = ''
}

// Attendre le chargement de la police
async function waitForFont() {
  await document.fonts.ready
}

onMounted(async () => {
  await waitForFont()
  
  // Attendre que le DOM soit prêt avec un petit délai pour Chromium Android
  setTimeout(() => {
    initCanvas()
    if (canvasWidth > 0 && canvasHeight > 0) {
      generateWord()
    } else {
      setTimeout(() => {
        initCanvas()
        generateWord()
      }, 100)
    }
  }, 50)
  
  const canvas = drawCanvas.value
  if (canvas) {
    canvas.addEventListener('mousedown', startDraw)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDraw)
    canvas.addEventListener('mouseleave', endDraw)
    canvas.addEventListener('touchstart', startDraw, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', endDraw)
  }
  
  window.addEventListener('resize', () => {
    initCanvas()
    drawWordAndGuides()
  })
})

onUnmounted(() => {
  const canvas = drawCanvas.value
  if (canvas) {
    canvas.removeEventListener('mousedown', startDraw)
    canvas.removeEventListener('mousemove', draw)
    canvas.removeEventListener('mouseup', endDraw)
    canvas.removeEventListener('mouseleave', endDraw)
    canvas.removeEventListener('touchstart', startDraw)
    canvas.removeEventListener('touchmove', draw)
    canvas.removeEventListener('touchend', endDraw)
  }
})
</script>

<template>
  <div class="exercise-wrapper">
    <!-- Confettis -->
    <div v-if="showConfetti" class="confetti-container">
      <div
        v-for="(piece, index) in confettiPieces"
        :key="index"
        class="confetti"
        :style="{
          left: piece.x + 'px',
          top: piece.y + 'px',
          width: piece.size + 'px',
          height: piece.size + 'px',
          backgroundColor: piece.color,
          transform: `rotate(${piece.rotation}deg)`
        }"
      ></div>
    </div>

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
          <p>Trace le mot affiché en gris avec ton doigt ou ta souris.</p>
        </div>
      </div>
    </div>

    <!-- Zone de dessin principale -->
    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="guideCanvas" class="guide-canvas"></canvas>
      <canvas ref="letterCanvas" class="letter-canvas"></canvas>
      <canvas ref="drawCanvas" class="draw-canvas"></canvas>
    </div>

    <!-- Barre de contrôles en bas -->
    <div class="bottom-bar">
      <div class="controls">
        <button class="btn btn-clear" @click="effacer">Effacer</button>
        <button class="btn btn-new" @click="nouveauMot">Nouveau</button>
        <button class="btn btn-check" @click="verifier">Vérifier</button>
      </div>
      <div class="feedback" :class="feedbackType" v-if="feedback">{{ feedback }}</div>
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

/* Confettis */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}

.confetti {
  position: absolute;
  border-radius: 2px;
}

/* Menu burger overlay */
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
  font-size: 1rem;
}

.menu-section {
  margin-bottom: 15px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-section strong {
  color: #2e59a6;
  font-size: 1.1rem;
  display: block;
  margin-bottom: 8px;
}

.menu-section ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.menu-section li {
  margin: 6px 0;
}

.menu-section a {
  color: #000;
  text-decoration: none;
  transition: color 0.2s;
}

.menu-section a:hover {
  color: #2e59a6;
}

.menu-section p {
  margin: 5px 0;
  color: #000;
  font-size: 0.95rem;
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

/* Canvas principal */
.canvas-container {
  flex: 1;
  position: relative;
  background: #fff;
  border: 3px solid #000;
  margin: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.guide-canvas,
.letter-canvas,
.draw-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.guide-canvas {
  z-index: 1;
}

.letter-canvas {
  z-index: 2;
}

.draw-canvas {
  z-index: 3;
  cursor: crosshair;
}

/* Barre du bas */
.bottom-bar {
  background: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
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

.answer-section {
  display: flex;
  align-items: center;
}

.answer-section > * {
  margin: 0 7px;
}

.btn {
  padding: 16px 25px 8px 25px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  font-family: 'Borel', cursive;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);
}

.btn:active {
  transform: translateY(0);
}

.btn-clear {
  background: #e84f6d;
  color: white;
}

.btn-new {
  background: #fbb90d;
  color: #000;
}

.btn-check {
  background: #2e59a6;
  color: white;
}

.feedback {
  font-size: 1.2rem;
  font-weight: 600;
  padding: 8px 15px;
  border-radius: 8px;
  min-width: 150px;
  text-align: center;
}

.feedback.success {
  background: #aed6ba;
  color: #2bb0a3;
}

.feedback.error {
  background: #f19bb1;
  color: #e84f6d;
}
</style>
