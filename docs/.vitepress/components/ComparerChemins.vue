<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// Éléments du DOM
const canvasContainer = ref(null)
const canvas = ref(null)
const etalonContainer = ref(null)
const rotateHandle = ref(null)

// Configuration
const ETALON_LENGTH = 80
let ctx = null
let marks = []
let isDragging = false
let isRotating = false
let dragOffset = { x: 0, y: 0 }
let etalonAngle = 0
let feedbackMessage = ref('')
let feedbackType = ref('')
let showConfetti = ref(false)
let showInstructions = ref(false)

// Chemins
let startPoint = { x: 0, y: 0 }
let endPoint = { x: 0, y: 0 }
let path1 = [] // Chemin bleu
let path2 = [] // Chemin rose
let path1Length = 0
let path2Length = 0
let correctAnswer = '' // 'bleu' ou 'rose'
let selectedPath = ref('')

// Confetti
let confettiParticles = []
let confettiAnimationId = null

// Dimensions logiques du canvas (indépendantes de la résolution)
let canvasWidth = 0
let canvasHeight = 0

function initCanvas() {
  if (!canvasContainer.value || !canvas.value) return
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
  
  // Configurer l'étalon (en bas au milieu de l'écran)
  if (etalonContainer.value) {
    etalonContainer.value.style.left = ((canvasWidth - 80) / 2) + 'px'
    etalonContainer.value.style.top = (canvasHeight - 40) + 'px'
  }
  updateEtalonRotation()
}

function updateEtalonRotation() {
  if (etalonContainer.value) {
    etalonContainer.value.style.transform = `rotate(${etalonAngle}deg)`
  }
}

function generatePaths() {
  if (!canvas.value) return
  if (!ctx) {
    ctx = canvas.value.getContext('2d')
  }
  if (!ctx) return
  
  marks = []
  feedbackMessage.value = ''
  feedbackType.value = ''
  selectedPath.value = ''
  showConfetti.value = false
  stopConfetti()

  const w = canvasWidth
  const h = canvasHeight
  
  if (w === 0 || h === 0) return
  
  // Points de départ et d'arrivée (2/3 de l'écran)
  const margin = w / 6
  startPoint = { x: margin, y: h / 2 }
  endPoint = { x: w - margin, y: h / 2 }
  
  // Décider aléatoirement quel chemin sera le plus court
  const vertIsShort = Math.random() < 0.5
  
  // Générer les chemins jusqu'à ce qu'ils aient au moins 30% de différence
  let attempts = 0
  do {
    if (vertIsShort) {
      // Vert = court (2 segments, peu de détour), Rose = long (3 segments, beaucoup de détour)
      path1 = generatePath(startPoint, endPoint, 2, -1, 0.2)
      path2 = generatePath(startPoint, endPoint, 3, 1, 1.5)
    } else {
      // Vert = long (3 segments, beaucoup de détour), Rose = court (2 segments, peu de détour)
      path1 = generatePath(startPoint, endPoint, 3, -1, 1.5)
      path2 = generatePath(startPoint, endPoint, 2, 1, 0.2)
    }
    
    // Calculer les longueurs
    path1Length = calculatePathLength(path1)
    path2Length = calculatePathLength(path2)
    attempts++
    
    // Vérifier que la différence est d'au moins 30%
    const minLength = Math.min(path1Length, path2Length)
    const maxLength = Math.max(path1Length, path2Length)
    const differencePercent = (maxLength - minLength) / minLength
    
    if (differencePercent >= 0.30) break
  } while (attempts < 50)
  
  correctAnswer = path1Length < path2Length ? 'vert' : 'rose'
  
  drawScene()
}

function generatePath(start, end, numSegments, direction, detourFactor = 0.5) {
  const points = [{ ...start }]
  const totalDist = end.x - start.x
  const segmentWidth = totalDist / numSegments
  
  for (let i = 1; i < numSegments; i++) {
    const x = start.x + segmentWidth * i + (Math.random() - 0.5) * 30
    // Le détour dépend du facteur : plus le facteur est grand, plus le détour est important
    const baseOffset = 40 + detourFactor * 80
    const yOffset = direction * (Math.random() * baseOffset + 30 + detourFactor * 50)
    const y = start.y + yOffset + (Math.random() - 0.5) * 20
    points.push({ x, y: Math.max(80, Math.min(canvasHeight - 120, y)) })
  }
  
  points.push({ ...end })
  return points
}

function calculatePathLength(points) {
  let length = 0
  for (let i = 0; i < points.length - 1; i++) {
    const dx = points[i + 1].x - points[i].x
    const dy = points[i + 1].y - points[i].y
    length += Math.sqrt(dx * dx + dy * dy)
  }
  return length
}

// Dessiner les barres de départ et d'arrivée d'un chemin
function drawPathMarks(path, color) {
  if (path.length < 2) return
  
  ctx.strokeStyle = color
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  
  // Barre au départ
  const startSeg = path[1]
  const dx1 = startSeg.x - path[0].x
  const dy1 = startSeg.y - path[0].y
  const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
  const perpX1 = -dy1 / len1 * 12
  const perpY1 = dx1 / len1 * 12
  
  ctx.beginPath()
  ctx.moveTo(path[0].x + perpX1, path[0].y + perpY1)
  ctx.lineTo(path[0].x - perpX1, path[0].y - perpY1)
  ctx.stroke()
  
  // Barre à l'arrivée
  const lastIdx = path.length - 1
  const dx2 = path[lastIdx].x - path[lastIdx - 1].x
  const dy2 = path[lastIdx].y - path[lastIdx - 1].y
  const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
  const perpX2 = -dy2 / len2 * 12
  const perpY2 = dx2 / len2 * 12
  
  ctx.beginPath()
  ctx.moveTo(path[lastIdx].x + perpX2, path[lastIdx].y + perpY2)
  ctx.lineTo(path[lastIdx].x - perpX2, path[lastIdx].y - perpY2)
  ctx.stroke()
}

function drawScene() {
  if (!ctx || !canvas.value) return
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  
  if (path1.length === 0 || path2.length === 0) return

  // Dessiner le chemin 1 (vert clair)
  ctx.strokeStyle = '#aed6ba'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(path1[0].x, path1[0].y)
  for (let i = 1; i < path1.length; i++) {
    ctx.lineTo(path1[i].x, path1[i].y)
  }
  ctx.stroke()
  
  // Marques de départ et arrivée chemin 1 (vert clair)
  drawPathMarks(path1, '#aed6ba')

  // Dessiner le chemin 2 (rose)
  ctx.strokeStyle = '#f19bb1'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(path2[0].x, path2[0].y)
  for (let i = 1; i < path2.length; i++) {
    ctx.lineTo(path2[i].x, path2[i].y)
  }
  ctx.stroke()
  
  // Marques de départ et arrivée chemin 2 (rose)
  drawPathMarks(path2, '#f19bb1')

  // Emojis maison et école (décalés pour ne pas couvrir les lignes)
  ctx.font = '70px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('🏠', startPoint.x - 60, startPoint.y)
  ctx.fillText('🏫', endPoint.x + 60, endPoint.y)

  // Dessiner les repères
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
  etalonContainer.value.classList.add('dragging')
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
  if (etalonContainer.value) {
    etalonContainer.value.classList.remove('dragging')
  }
}

function traceMark() {
  const angleRad = etalonAngle * Math.PI / 180
  
  const anchorX = parseFloat(etalonContainer.value.style.left) || 0
  const anchorY = (parseFloat(etalonContainer.value.style.top) || 0) + 3
  
  const markX = anchorX + ETALON_LENGTH * Math.cos(angleRad)
  const markY = anchorY + ETALON_LENGTH * Math.sin(angleRad)

  marks.push({ x: markX, y: markY, angle: angleRad })
  drawScene()
}

function clearMarks() {
  marks = []
  drawScene()
}

function selectPath(path) {
  selectedPath.value = path
}

function checkAnswer() {
  if (!selectedPath.value) {
    feedbackMessage.value = 'Choisis un chemin !'
    feedbackType.value = 'error'
    return
  }
  
  if (selectedPath.value === correctAnswer) {
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
  const confettiCanvas = document.getElementById('confettiCanvasChemins')
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
        generatePaths()
      } else {
        // Réessayer après un délai si les dimensions ne sont pas prêtes
        setTimeout(() => {
          initCanvas()
          generatePaths()
        }, 100)
      }
    }, 50)
  })
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', stopDragRotate)
  
  window.addEventListener('resize', () => {
    initCanvas()
    generatePaths()
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
    <canvas v-if="showConfetti" id="confettiCanvasChemins" class="confetti-canvas"></canvas>
    
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
            <li><a href="/cp-ressources-libres/">🏠 Accueil</a></li>
            <li><a href="/cp-ressources-libres/grandeurs-mesures/">📏 Grandeurs et mesures</a></li>
            <li><a href="/cp-ressources-libres/grandeurs-mesures/comparer-chemins">• Comparer chemins</a></li>
          </ul>
        </div>
        
        <div class="menu-section">
          <strong>❓ Instructions</strong>
          <ol>
            <li>Mesure chaque chemin avec l'étalon</li>
            <li>Choisis le chemin le plus court</li>
            <li>Vérifie ta réponse</li>
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
        <button class="btn btn-new" @click="generatePaths">Nouveau</button>
      </div>

      <div class="answer-section">
        <div class="answer-label">Le plus court :</div>
        <div class="path-buttons">
          <button 
            class="btn-path btn-vert" 
            :class="{ selected: selectedPath === 'vert' }"
            @click="selectPath('vert')"
          >
            Vert
          </button>
          <button 
            class="btn-path btn-rose" 
            :class="{ selected: selectedPath === 'rose' }"
            @click="selectPath('rose')"
          >
            Rose
          </button>
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
  left: 20px;
  top: calc(100% - 40px);
  cursor: grab;
  user-select: none;
  z-index: 100;
  transform-origin: 0% 50%;
  /* Zone de sélection élargie */
  padding: 15px 5px;
  margin: -15px -5px;
}

.etalon-container:active,
.etalon-container.dragging {
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
  cursor: inherit;
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

.path-buttons {
  display: flex;
}

.path-buttons > * {
  margin: 0 5px;
}

.btn-path {
  font-family: 'Borel', cursive;
  font-size: 1rem;
  padding: 16px 24px 8px 24px;
  border: 3px solid transparent;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.btn-vert {
  background: #aed6ba;
  color: #000;
}

.btn-rose {
  background: #f19bb1;
  color: white;
}

.btn-path.selected {
  border-color: #000;
  transform: scale(1.05);
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
