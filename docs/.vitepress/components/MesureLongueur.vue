<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  minSegments: {
    type: Number,
    default: 1
  },
  maxSegments: {
    type: Number,
    default: 1
  }
})

// Éléments du DOM
const canvasContainer = ref(null)
const canvas = ref(null)
const etalonContainer = ref(null)
const rotateHandle = ref(null)

// Configuration
const ETALON_LENGTH = 80
let ctx = null
let segments = []
let marks = []
let answer = ref(0)
let correctAnswer = 0
let isDragging = false
let isRotating = false
let dragOffset = { x: 0, y: 0 }
let etalonAngle = 0
let feedbackMessage = ref('')
let feedbackType = ref('')
let showConfetti = ref(false)
let showInstructions = ref(false)

// Confetti
let confettiParticles = []
let confettiAnimationId = null

function initCanvas() {
  if (!canvasContainer.value || !canvas.value) return
  const rect = canvasContainer.value.getBoundingClientRect()
  canvas.value.width = rect.width
  canvas.value.height = rect.height
  ctx = canvas.value.getContext('2d')
  
  // Configurer l'étalon (en bas de l'écran)
  if (etalonContainer.value) {
    etalonContainer.value.style.left = '20px'
    etalonContainer.value.style.top = (rect.height - 40) + 'px'
  }
  updateEtalonRotation()
}

function updateEtalonRotation() {
  if (etalonContainer.value) {
    etalonContainer.value.style.transform = `rotate(${etalonAngle}deg)`
  }
}

function generateLine() {
  if (!canvas.value || !ctx) return
  
  segments = []
  marks = []
  updateMarkCounter()
  feedbackMessage.value = ''
  feedbackType.value = ''
  answer.value = 0
  showConfetti.value = false
  stopConfetti()

  const numSegments = props.minSegments === props.maxSegments 
    ? props.minSegments 
    : Math.floor(Math.random() * (props.maxSegments - props.minSegments + 1)) + props.minSegments
  
  // Calculer la longueur totale souhaitée (entre 3 et 6 étalons)
  const totalEtalons = Math.floor(Math.random() * 4) + 3
  correctAnswer = totalEtalons
  const totalLength = totalEtalons * ETALON_LENGTH
  
  // Répartir sur les segments
  const segmentLengths = []
  let remainingLength = totalLength
  
  for (let i = 0; i < numSegments; i++) {
    if (i === numSegments - 1) {
      segmentLengths.push(remainingLength)
    } else {
      const minLength = ETALON_LENGTH
      const maxLength = remainingLength - (numSegments - i - 1) * ETALON_LENGTH
      const length = minLength + Math.random() * (maxLength - minLength)
      const roundedLength = Math.round(length / ETALON_LENGTH) * ETALON_LENGTH
      segmentLengths.push(Math.max(ETALON_LENGTH, roundedLength))
      remainingLength -= segmentLengths[i]
    }
  }

  // Générer les angles pour chaque segment (avec alternance pour les lignes brisées)
  const angles = []
  let lastAngle = (Math.random() - 0.5) * Math.PI / 6
  for (let i = 0; i < numSegments; i++) {
    if (i === 0) {
      angles.push(lastAngle)
    } else {
      // Alterner la direction pour créer une vraie ligne brisée
      const minAngleChange = Math.PI / 3 // Au moins 60 degrés de changement
      const angleChange = minAngleChange + Math.random() * Math.PI / 6
      // Alterner systématiquement haut/bas
      const direction = i % 2 === 0 ? 1 : -1
      lastAngle = lastAngle + direction * angleChange
      angles.push(lastAngle)
    }
  }

  // Calculer les points de la ligne temporairement
  let tempSegments = []
  let currentX = 0
  let currentY = 0
  
  for (let i = 0; i < numSegments; i++) {
    const length = segmentLengths[i]
    const angle = angles[i]
    
    const endX = currentX + Math.cos(angle) * length
    const endY = currentY + Math.sin(angle) * length

    tempSegments.push({
      x1: currentX,
      y1: currentY,
      x2: endX,
      y2: endY
    })

    currentX = endX
    currentY = endY
  }

  // Calculer les bornes de la ligne
  let minX = 0, maxX = 0, minY = 0, maxY = 0
  tempSegments.forEach(seg => {
    minX = Math.min(minX, seg.x1, seg.x2)
    maxX = Math.max(maxX, seg.x1, seg.x2)
    minY = Math.min(minY, seg.y1, seg.y2)
    maxY = Math.max(maxY, seg.y1, seg.y2)
  })

  const lineWidth = maxX - minX
  const lineHeight = maxY - minY

  // Centrer la ligne dans le canvas
  const offsetX = (canvas.value.width - lineWidth) / 2 - minX
  const offsetY = (canvas.value.height - lineHeight) / 2 - minY

  // Appliquer le décalage pour centrer
  tempSegments.forEach(seg => {
    segments.push({
      x1: seg.x1 + offsetX,
      y1: seg.y1 + offsetY,
      x2: seg.x2 + offsetX,
      y2: seg.y2 + offsetY
    })
  })

  drawScene()
}

function drawBar(x, y, nextX, nextY) {
  if (!ctx) return
  const dx = nextX - x
  const dy = nextY - y
  const length = Math.sqrt(dx * dx + dy * dy)
  const perpX = -dy / length * 10
  const perpY = dx / length * 10

  ctx.strokeStyle = '#2e59a6'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x + perpX, y + perpY)
  ctx.lineTo(x - perpX, y - perpY)
  ctx.stroke()
}

function drawScene() {
  if (!ctx || !canvas.value) return
  
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

  // Dessiner la ligne brisée
  ctx.strokeStyle = '#2e59a6'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  if (segments.length > 0) {
    ctx.moveTo(segments[0].x1, segments[0].y1)
    segments.forEach(seg => {
      ctx.lineTo(seg.x2, seg.y2)
    })
  }
  ctx.stroke()

  // Barre au départ
  if (segments.length > 0) {
    drawBar(segments[0].x1, segments[0].y1, segments[0].x2, segments[0].y2)
  }

  // Barre à l'arrivée
  if (segments.length > 0) {
    const lastSeg = segments[segments.length - 1]
    drawBar(lastSeg.x2, lastSeg.y2, lastSeg.x1, lastSeg.y1)
  }

  // Dessiner les repères (lignes verticales)
  marks.forEach(mark => {
    ctx.strokeStyle = '#e84f6d'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    
    const markLength = 15
    const angle = mark.angle + Math.PI / 2

    ctx.beginPath()
    ctx.moveTo(
      mark.x + markLength * Math.cos(angle),
      mark.y + markLength * Math.sin(angle)
    )
    ctx.lineTo(
      mark.x - markLength * Math.cos(angle),
      mark.y - markLength * Math.sin(angle)
    )
    ctx.stroke()
  })
}

function startDrag(e) {
  if (e.target === rotateHandle.value) return
  isDragging = true
  const rect = etalonContainer.value.getBoundingClientRect()
  dragOffset.x = e.clientX - rect.left
  dragOffset.y = e.clientY - rect.top - 5
}

function startRotate(e) {
  e.stopPropagation()
  isRotating = true
}

function onMouseMove(e) {
  if (!canvasContainer.value || !etalonContainer.value) return
  const containerRect = canvasContainer.value.getBoundingClientRect()
  
  if (isDragging) {
    let x = e.clientX - containerRect.left - dragOffset.x
    let y = e.clientY - containerRect.top - dragOffset.y

    x = Math.max(10, Math.min(containerRect.width - 20, x))
    y = Math.max(30, Math.min(containerRect.height - 30, y))

    etalonContainer.value.style.left = x + 'px'
    etalonContainer.value.style.top = y + 'px'
  }
  
  if (isRotating) {
    const etalonRect = etalonContainer.value.getBoundingClientRect()
    const anchorX = etalonRect.left
    const anchorY = etalonRect.top + 5
    
    const angle = Math.atan2(e.clientY - anchorY, e.clientX - anchorX)
    etalonAngle = angle * 180 / Math.PI
    updateEtalonRotation()
  }
}

function stopDragRotate() {
  isDragging = false
  isRotating = false
}

function traceMark() {
  const angleRad = etalonAngle * Math.PI / 180
  
  const anchorX = parseFloat(etalonContainer.value.style.left) || 0
  const anchorY = (parseFloat(etalonContainer.value.style.top) || 0) + 3
  
  const markX = anchorX + ETALON_LENGTH * Math.cos(angleRad)
  const markY = anchorY + ETALON_LENGTH * Math.sin(angleRad)

  marks.push({ x: markX, y: markY, angle: angleRad })
  updateMarkCounter()
  drawScene()
}

function updateMarkCounter() {
  // Handled by reactive ref
}

function clearMarks() {
  marks = []
  updateMarkCounter()
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
    p.speedY += 0.1 // gravity
    
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
  initCanvas()
  generateLine()
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopDragRotate)
  
  window.addEventListener('resize', () => {
    initCanvas()
    drawScene()
  })
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', stopDragRotate)
  stopConfetti()
})
</script>

<template>
  <div class="exercise-wrapper">
    <canvas v-if="showConfetti" id="confettiCanvas" class="confetti-canvas"></canvas>
    
    <!-- Menu burger en overlay -->
    <div class="menu-overlay">
      <div class="menu-toggle" @click="showInstructions = !showInstructions">
        <span class="burger-line"></span>
        <span class="burger-line"></span>
        <span class="burger-line"></span>
      </div>
      <div class="menu-card" v-show="showInstructions">
        <div class="menu-close" @click="showInstructions = false">✕</div>
        
        <div class="menu-section">
          <strong>📍 Navigation</strong>
          <ul>
            <li><a href="/">🏠 Accueil</a></li>
            <li><a href="/grandeurs-mesures/">📏 Grandeurs et mesures</a></li>
            <li><a href="/grandeurs-mesures/mesure-1-segment">• 1 segment</a></li>
            <li><a href="/grandeurs-mesures/mesure-2-segments">• 2 segments</a></li>
            <li><a href="/grandeurs-mesures/mesure-3-segments">• 3 segments</a></li>
          </ul>
        </div>
        
        <div class="menu-section">
          <strong>❓ Instructions</strong>
          <ol>
            <li>Déplace l'étalon</li>
            <li>Pivote avec ↺</li>
            <li>Clique "Repère"</li>
            <li>Compte et vérifie</li>
          </ol>
        </div>
      </div>
    </div>
    
    <!-- Zone de dessin principale -->
    <div class="canvas-container" ref="canvasContainer">
      <canvas ref="canvas"></canvas>
      <div class="etalon-container" ref="etalonContainer" @mousedown="startDrag">
        <div class="etalon-wrapper">
          <div class="etalon">
            <div class="etalon-arrow"></div>
          </div>
          <div class="rotate-handle" ref="rotateHandle" @mousedown="startRotate"></div>
        </div>
      </div>
    </div>

    <!-- Barre de contrôles en bas -->
    <div class="bottom-bar">
      <div class="controls">
        <button class="btn btn-mark" @click="traceMark">Repère</button>
        <button class="btn btn-clear" @click="clearMarks">Effacer</button>
        <button class="btn btn-new" @click="generateLine">Nouveau</button>
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
@font-face {
  font-family: 'PereCastor';
  src: url('/fonts/PereCastor-Standard.woff2') format('woff2'),
       url('/fonts/PereCastor-Standard.woff') format('woff'),
       url('/fonts/PereCastor-Standard.otf') format('opentype');
  font-weight: normal;
  font-style: normal;
}

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

.menu-section ul,
.menu-section ol {
  margin: 0;
  padding-left: 20px;
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
  cursor: grab;
}

.canvas-container canvas {
  display: block;
}

.etalon-container {
  position: absolute;
  cursor: grab;
  user-select: none;
  z-index: 100;
  transform-origin: 0% 50%;
}

.etalon-container:active {
  cursor: grabbing;
}

.etalon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.etalon {
  width: 80px;
  height: 6px;
  background: #ffc107;
  border: none;
  border-radius: 0;
  cursor: grab;
  position: relative;
}

.etalon:active {
  cursor: grabbing;
}

.etalon::before {
  content: '';
  position: absolute;
  left: 0;
  top: -4px;
  width: 2px;
  height: 14px;
  background: #e84f6d;
}

.etalon::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -4px;
  width: 2px;
  height: 14px;
  background: #000;
}

.etalon-arrow {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 2px;
  background: #000;
}

.etalon-arrow::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid #000;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.rotate-handle {
  position: absolute;
  top: 50%;
  right: -32px;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #000;
}

.rotate-handle:active {
  cursor: grabbing;
}

.rotate-handle::before {
  content: '↺';
}

/* Barre du bas */
.bottom-bar {
  background: white;
  padding: 12px 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.controls {
  display: flex;
  gap: 10px;
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
  gap: 15px;
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
  gap: 8px;
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
