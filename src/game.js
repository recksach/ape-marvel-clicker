import { store } from './store.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let animFrame = null;
let particles = [];
let floatTexts = [];
let lastTime = 0;
let masonBob = 0;
let masonScale = 1;
let onTapCallback = null;

export function initGameCanvas(container, onTap) {
  onTapCallback = onTap;
  container.appendChild(canvas);
  resize();
  window.addEventListener('resize', resize);
  setupClickHandler();
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
    const r = 90 * masonScale;
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) {
      const result = store.tapMason();
      if (result) {
        spawnParticles(cx, cy - 40, result.gold);
        spawnFloatText(cx + (Math.random() - 0.5) * 40, cy - 60, `+${result.gold}`, '#f7c948');
        spawnFloatText(cx + (Math.random() - 0.5) * 30, cy - 80, `+${result.xp} XP`, '#10b981');
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
  bg.addColorStop(0, '#1a3a1a');
  bg.addColorStop(0.4, '#0d1f0d');
  bg.addColorStop(1, '#050a05');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#10b98106';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137.5 + i * i * 7.3) % w;
    const sy = (i * 89.3 + i * 13.7) % (h * 0.6);
    const twinkle = Math.sin(time * 0.0008 + i) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.4;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const pillarGrad = ctx.createLinearGradient(0, 0, 0, h);
  pillarGrad.addColorStop(0, '#10b98108');
  pillarGrad.addColorStop(1, '#10b98102');
  ctx.fillStyle = pillarGrad;
  ctx.fillRect(w * 0.06, h * 0.15, w * 0.025, h * 0.45);
  ctx.fillRect(w * 0.915, h * 0.15, w * 0.025, h * 0.45);
}

function drawMason(time) {
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h * 0.42;
  masonScale = Math.min(w, h) / 400;
  const s = masonScale;
  const bob = Math.sin(time * 0.0015) * 5;
  masonBob = bob;

  ctx.save();
  ctx.translate(cx, cy + bob);

  const glow = ctx.createRadialGradient(0, 0, 20 * s, 0, 0, 100 * s);
  glow.addColorStop(0, '#10b98115');
  glow.addColorStop(0.5, '#10b98108');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, 100 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a4a1a';
  ctx.beginPath();
  ctx.moveTo(-25 * s, 10 * s);
  ctx.lineTo(25 * s, 10 * s);
  ctx.lineTo(30 * s, 60 * s);
  ctx.lineTo(-30 * s, 60 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#2d6b2d';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#2d6b2d';
  ctx.beginPath();
  ctx.moveTo(-30 * s, 60 * s);
  ctx.lineTo(30 * s, 60 * s);
  ctx.lineTo(35 * s, 80 * s);
  ctx.lineTo(-35 * s, 80 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c4956a';
  ctx.beginPath();
  ctx.arc(0, -10 * s, 18 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5a3a2a';
  ctx.beginPath();
  ctx.ellipse(0, 2 * s, 12 * s, 8 * s, 0, 0, Math.PI);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(-6 * s, -12 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.arc(6 * s, -12 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(-6 * s, -12 * s, 1 * s, 0, Math.PI * 2);
  ctx.arc(6 * s, -12 * s, 1 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0d3d0d';
  ctx.beginPath();
  ctx.arc(0, -28 * s, 22 * s, Math.PI, 0, true);
  ctx.lineTo(22 * s, -20 * s);
  ctx.quadraticCurveTo(0, -14 * s, -22 * s, -20 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1a5a1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const outfit = store.state.outfit;
  if (outfit.head) {
    ctx.fillStyle = '#f7c94844';
    ctx.beginPath();
    ctx.arc(0, -30 * s, 25 * s, Math.PI, 0, true);
    ctx.fill();
  }
  if (outfit.body) {
    ctx.fillStyle = '#3b82f622';
    ctx.fillRect(-22 * s, 12 * s, 44 * s, 30 * s);
  }
  if (outfit.accessory) {
    ctx.fillStyle = '#a855f744';
    ctx.beginPath();
    ctx.arc(0, -8 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = '#c4956a';
  ctx.lineWidth = 4 * s;
  const armWave = Math.sin(time * 0.002) * 4;
  ctx.beginPath();
  ctx.moveTo(-25 * s, 18 * s);
  ctx.lineTo(-40 * s, 30 * s + armWave);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(25 * s, 18 * s);
  ctx.lineTo(40 * s, 30 * s - armWave);
  ctx.stroke();

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
    ctx.font = `bold ${14}px monospace`;
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
  drawMason(time);
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
