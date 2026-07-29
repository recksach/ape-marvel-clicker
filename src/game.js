import { store } from './store.js';
import { GORILLA_IMAGES } from './config.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let animFrame = null;
let particles = [];
let floatTexts = [];
let lastTime = 0;
let gorillaState = 'happy';
let gorillaScale = 1;
let onTapCallback = null;
let preloadedImages = {};

function preloadImages() {
  for (const [key, src] of Object.entries(GORILLA_IMAGES)) {
    const img = new Image();
    img.src = src;
    img.onload = () => { preloadedImages[key] = img; };
  }
}

export function initGameCanvas(container, onTap) {
  onTapCallback = onTap;
  container.appendChild(canvas);
  resize();
  window.addEventListener('resize', resize);
  setupClickHandler();
  preloadImages();
  startLoop();
}

export function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1';
  canvas.style.pointerEvents = 'auto';
}

function setupClickHandler() {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.42;
    const r = 100 * gorillaScale;
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) {
      gorillaState = 'arms';
      setTimeout(() => { gorillaState = 'happy'; }, 300);
      const result = store.tapGorilla();
      if (result) {
        spawnParticles(cx, cy - 30, result.bananas);
        spawnFloatText(cx + (Math.random() - 0.5) * 50, cy - 60, '+' + result.bananas, '#f7c948');
        if (onTapCallback) onTapCallback(result);
      }
    }
  });
}

function spawnParticles(x, y, amount) {
  const count = Math.min(15, Math.floor(amount / 2) + 4);
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 6 - 2,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      size: 3 + Math.random() * 5,
      color: ['#f7c948', '#10b981', '#e0dcc0', '#ffd700'][Math.floor(Math.random() * 4)],
    });
  }
}

function spawnFloatText(x, y, text, color) {
  floatTexts.push({ x, y, text, color, life: 1, vy: -2 });
}

function drawBackground(time) {
  const w = canvas.width;
  const h = canvas.height;
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.8);
  bg.addColorStop(0, '#1a1a1a');
  bg.addColorStop(0.5, '#0d0d0d');
  bg.addColorStop(1, '#050505');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#10b98108';
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137.5 + i * i * 7.3) % w;
    const sy = (i * 89.3 + i * 13.7) % (h * 0.5);
    const twinkle = Math.sin(time * 0.0008 + i) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGorilla(time) {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h * 0.42;
  gorillaScale = Math.min(w, h) / 500;
  const s = gorillaScale;
  const bob = Math.sin(time * 0.0015) * 4;

  ctx.save();
  ctx.translate(cx, cy + bob);

  const glow = ctx.createRadialGradient(0, 0, 20 * s, 0, 0, 120 * s);
  glow.addColorStop(0, '#10b98112');
  glow.addColorStop(0.5, '#10b98106');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 120 * s, 0, Math.PI * 2);
  ctx.fill();

  const img = preloadedImages[gorillaState] || preloadedImages.happy;
  if (img) {
    const imgW = 280 * s;
    const imgH = 300 * s;
    ctx.drawImage(img, -imgW / 2, -imgH / 2 + 10 * s, imgW, imgH);
  } else {
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, -10 * s, 35 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(0, 30 * s, 30 * s, 40 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(-10 * s, -15 * s, 4 * s, 0, Math.PI * 2);
    ctx.arc(10 * s, -15 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = floatTexts.length - 1; i >= 0; i--) {
    const f = floatTexts[i];
    f.y += f.vy;
    f.life -= 0.018;
    if (f.life <= 0) floatTexts.splice(i, 1);
  }
}

function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const f of floatTexts) {
    ctx.globalAlpha = f.life;
    ctx.fillStyle = f.color;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
}

function loop(time) {
  if (!lastTime) lastTime = time;
  lastTime = time;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(time);
  drawGorilla(time);
  updateParticles();
  drawParticles();
  animFrame = requestAnimationFrame(loop);
}

function startLoop() {
  if (animFrame) cancelAnimationFrame(animFrame);
  animFrame = requestAnimationFrame(loop);
}

export function stopGame() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
}

export function getCanvas() { return canvas; }