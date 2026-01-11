<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const showMenu = ref(false)
const showInstructions = ref(false)

// Lettres minuscules (sans accents pour simplifier)
const lettres = 'abcdefghijklmnopqrstuvwxyz'

// Lettre courante
const lettreIndex = ref(0)
const lettre = computed(() => lettres[lettreIndex.value])
const lettreMaj = computed(() => lettres[lettreIndex.value].toUpperCase())

// Canvas refs
const containerRef = ref(null)
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

// Dimensions (dynamiques)
let canvasWidth = 600
let canvasHeight = 400
const letterSize = 280
let baselineY = 320

// Initialiser les canvas
function initCanvas() {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  canvasWidth = rect.width
  canvasHeight = rect.height
  baselineY = canvasHeight / 2 + letterSize * 0.3
  
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

// Générer une lettre aléatoire
function generateLetter() {
  lettreIndex.value = Math.floor(Math.random() * lettres.length)
  hasDrawn.value = false
  feedback.value = ''
  feedbackType.value = ''
  clearDrawing()
  drawLetterAndGuides()
}

// Dessiner les guides (BorelGuides)
function drawGuides() {
  const ctx = guideCanvas.value?.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Utiliser BorelGuides avec "LL" pour avoir les lignes sous les deux lettres
  ctx.font = `${letterSize}px 'BorelGuides', cursive`
  ctx.fillStyle = '#e0e0e0'
  ctx.textBaseline = 'alphabetic'
  
  // Centrer les guides
  const guidesText = 'LL'
  const metrics = ctx.measureText(guidesText)
  const startX = (canvasWidth - metrics.width) / 2
  ctx.fillText(guidesText, startX, baselineY)
}

// Dessiner les lettres modèles
function drawLetterAndGuides() {
  drawGuides()
  
  const ctx = letterCanvas.value?.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  // Configuration de la police BorelFRTrad
  ctx.font = `${letterSize}px 'BorelFRTrad', cursive`
  ctx.fillStyle = '#d0d0d0' // Gris clair
  ctx.textBaseline = 'alphabetic'
  
  // Mesurer les lettres pour les centrer
  const minMetrics = ctx.measureText(lettre.value)
  const majMetrics = ctx.measureText(lettreMaj.value)
  const totalWidth = majMetrics.width + 60 + minMetrics.width
  const startX = (canvasWidth - totalWidth) / 2
  
  // Dessiner la majuscule d'abord
  ctx.fillText(lettreMaj.value, startX, baselineY)
  
  // Dessiner la minuscule après
  ctx.fillText(lettre.value, startX + majMetrics.width + 60, baselineY)
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
    feedback.value = 'Trace d\'abord les lettres !'
    feedbackType.value = 'error'
    return
  }
  
  // Récupérer les pixels des lettres et du tracé
  const letterCtx = letterCanvas.value?.getContext('2d')
  const drawCtx = drawCanvas.value?.getContext('2d')
  if (!letterCtx || !drawCtx) return
  
  const letterData = letterCtx.getImageData(0, 0, canvasWidth, canvasHeight).data
  const drawData = drawCtx.getImageData(0, 0, canvasWidth, canvasHeight).data
  
  let letterPixels = 0
  let coveredPixels = 0
  let outsidePixels = 0
  let totalDrawnPixels = 0
  
  // Tolérance de 15 pixels autour de la lettre
  const tolerance = 15
  
  // Créer une version élargie de la zone de lettre
  const letterMask = new Uint8Array(canvasWidth * canvasHeight)
  
  // Marquer les pixels de la lettre
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4
      if (letterData[i + 3] > 50) { // Pixel de la lettre (alpha > 50)
        letterPixels++
        // Marquer les pixels dans le rayon de tolérance
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
  
  // Compter les pixels du tracé qui sont sur/près de la lettre
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      const i = (y * canvasWidth + x) * 4
      if (drawData[i + 3] > 50) { // Pixel du tracé
        totalDrawnPixels++
        if (letterMask[y * canvasWidth + x]) {
          coveredPixels++
        } else {
          outsidePixels++
        }
      }
    }
  }
  
  // Calcul du score
  const coverageRatio = totalDrawnPixels > 0 ? coveredPixels / totalDrawnPixels : 0
  const minDrawnRatio = letterPixels > 0 ? totalDrawnPixels / letterPixels : 0
  
  // Valider si au moins 70% du tracé est sur la lettre ET qu'on a tracé suffisamment
  if (coverageRatio >= 0.7 && minDrawnRatio >= 0.15) {
    feedback.value = 'Bravo ! 🎉'
    feedbackType.value = 'success'
    launchConfetti()
  } else if (coverageRatio < 0.5) {
    feedback.value = 'Essaie de tracer sur les lettres grises'
    feedbackType.value = 'error'
  } else if (minDrawnRatio < 0.15) {
    feedback.value = 'Continue à tracer les lettres'
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

// Nouvelle lettre
function nouvellelettre() {
  generateLetter()
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
  // Borel est chargée via Google Fonts dans custom.css
  // On attend juste que les fonts soient prêtes
  await document.fonts.ready
}

onMounted(async () => {
  // Attendre le chargement de la police avant de dessiner
  await waitForFont()
  
  initCanvas()
  generateLetter()
  
  // Event listeners pour le tracé
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
  
  // Redimensionnement
  window.addEventListener('resize', () => {
    initCanvas()
    drawLetterAndGuides()
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
        
        <div class="menu-section">
          <strong>❓ Instructions</strong>
          <p>Trace les lettres affichées en gris avec ton doigt ou ta souris.</p>
          <ul>
            <li>Ligne rouge = ligne de base</li>
            <li>Ligne noire = hauteur d'x</li>
            <li>Trace en bleu sur les lettres grises</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Zone principale -->
    <div class="main-area">
      <div class="canvas-container" ref="containerRef">
        <canvas ref="guideCanvas" class="guide-canvas"></canvas>
        <canvas ref="letterCanvas" class="letter-canvas"></canvas>
        <canvas ref="drawCanvas" class="draw-canvas"></canvas>
      </div>
    </div>

    <!-- Barre du bas -->
    <div class="bottom-bar">
      <div class="feedback-row">
        <span v-if="feedback" :class="['feedback', feedbackType]">{{ feedback }}</span>
      </div>
      <div class="buttons-row">
        <button class="btn btn-clear" @click="effacer">Effacer</button>
        <button class="btn btn-new" @click="nouvellelettre">Autre lettre</button>
        <button class="btn btn-check" @click="verifier">Vérifier</button>
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
  background: #fafafa;
  font-family: 'Borel', cursive;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Confettis */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.confetti {
  position: absolute;
  border-radius: 2px;
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
  border-radius: 12px;
  padding: 20px;
  min-width: 280px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
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
}

.menu-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-section li {
  margin: 5px 0;
}

.menu-section a {
  color: #2e59a6;
  text-decoration: none;
}

.menu-section a:hover {
  text-decoration: underline;
}

.menu-section p {
  margin: 5px 0;
  color: #000;
  font-size: 0.95rem;
}

/* Zone principale */
.main-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: none;
  background: #fff;
  border: 3px solid #000;
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
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.feedback-row {
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback {
  font-size: 1.3rem;
  font-weight: 600;
  padding: 5px 20px;
  border-radius: 8px;
}

.feedback.success {
  color: #2bb0a3;
  background: #aed6ba;
}

.feedback.error {
  color: #e84f6d;
  background: #f19bb1;
}

.buttons-row {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn {
  padding: 16px 25px 8px 25px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  font-family: 'Borel', cursive;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}

.btn:hover {
  transform: translateY(-2px);
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
</style>
