import { store } from './store.js';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let animFrame = null;
let particles = [];
let floatTexts = [];
let npcBob = {};
let lastTime = 0;

export function initGameCanvas(container) {
  container.appendChild(canvas);
  resize();
  window.addEventListener('resize', resize);
  setupClickHandler(container);
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

function setupClickHandler(container) {
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Check NPC hit
    const s = store.state;
    for (const npc of s.activeNPCs) {
      if (!s.unlockedNPCs.includes(npc.id)) continue;
      const cx = npc.x / 100 * canvas.width;
      const cy = npc.y / 100 * canvas.height;
      const r = 40 * npc.scale;
      if (Math.abs(x - cx) < r && Math.abs(y - cy) < r) {
        const result = store.tapNPC(npc.id);
        if (result) {
          spawnParticles(cx, cy, result.gold);
          spawnFloatText(cx, cy - 30, `+${result.gold} ●`, '#f7c948');
          if (typeof window._onNPCTap === 'function') window._onNPCTap(npc.id, result);
        }
        return;
      }
    }
    // Tap on empty space - small gold
    const s2 = store.state;
    s2.gold += 1;
    store.addXP(1);
    store.save();
    spawnParticles(x, y, 1);
    spawnFloatText(x, y - 20, '+1 ●', '#8b7355');
  });
}

/* ─── Particles ─── */
function spawnParticles(x, y, amount) {
  const count = Math.min(12, Math.floor(amount / 2) + 3);
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 5 - 2,
      life: 1,
      decay: 0.015 + Math.random() * 0.02,
      size: 3 + Math.random() * 4,
      color: ['#f7c948', '#10b981', '#e0dcc0', '#8b7355'][Math.floor(Math.random() * 4)],
    });
  }
}

function spawnFloatText(x, y, text, color) {
  floatTexts.push({ x, y, text, color, life: 1, vy: -1.5 });
}

/* ─── NPC rendering ─── */
function drawNPC(npc, time) {
  const w = canvas.width;
  const h = canvas.height;
  const cx = npc.x / 100 * w;
  const cy = npc.y / 100 * h;
  const s = npc.scale;
  const bob = Math.sin(time * 0.002 + npc.id.charCodeAt(0)) * 4;
  const rarityColors = ['#8b7355', '#10b981', '#3b82f6', '#a855f7', '#f7c948', '#ef4444'];
  const colorIdx = Math.floor(Math.abs(Math.sin(npc.id.charCodeAt(0))) * rarityColors.length);
  const mainColor = rarityColors[colorIdx % rarityColors.length];

  ctx.save();
  ctx.translate(cx, cy + bob);

  // Glow
  const grad = ctx.createRadialGradient(0, 0, 10 * s, 0, 0, 50 * s);
  grad.addColorStop(0, mainColor + '33');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, 50 * s, 0, Math.PI * 2);
  ctx.fill();

  // Body (robe)
  ctx.fillStyle = mainColor + '44';
  ctx.beginPath();
  ctx.moveTo(-18 * s, 5 * s);
  ctx.lineTo(18 * s, 5 * s);
  ctx.lineTo(22 * s, 40 * s);
  ctx.lineTo(-22 * s, 40 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = mainColor + '66';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Head
  ctx.fillStyle = mainColor + '55';
  ctx.beginPath();
  ctx.arc(0, -8 * s, 14 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = mainColor + '88';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#e0dcc0';
  ctx.beginPath();
  ctx.arc(-5 * s, -9 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.arc(5 * s, -9 * s, 2.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // Hood/cowl
  ctx.strokeStyle = mainColor + '77';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -8 * s, 16 * s, Math.PI * 0.8, Math.PI * 0.2, true);
  ctx.stroke();

  // Outfit items
  if (npc.outfit.body) {
    ctx.fillStyle = mainColor + '88';
    ctx.fillRect(-16 * s, 12 * s, 32 * s, 20 * s);
  }
  if (npc.outfit.head) {
    ctx.fillStyle = '#f7c948' + '88';
    ctx.beginPath();
    ctx.arc(0, -10 * s, 18 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (npc.outfit.accessory) {
    ctx.fillStyle = '#10b981' + 'aa';
    ctx.beginPath();
    ctx.arc(0, -8 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arms
  ctx.strokeStyle = mainColor + '55';
  ctx.lineWidth = 3 * s;
  const armWave = Math.sin(time * 0.003 + npc.id.charCodeAt(0)) * 3;
  ctx.beginPath();
  ctx.moveTo(-18 * s, 10 * s);
  ctx.lineTo(-28 * s, 20 * s + armWave);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(18 * s, 10 * s);
  ctx.lineTo(28 * s, 20 * s - armWave);
  ctx.stroke();

  // Happiness indicator
  const happyPct = npc.happiness / 100;
  ctx.fillStyle = happyPct > 0.5 ? '#10b981' : '#f7c948';
  ctx.fillRect(-15 * s, -32 * s, 30 * s * happyPct, 3 * s);

  // Name
  const npcDef = store.getAllNPCs().find(n => n.id === npc.id);
  if (npcDef) {
    ctx.fillStyle = '#e0dcc066';
    ctx.font = `${10 * s}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(npcDef.name, 0, 52 * s);
  }

  ctx.restore();
}

/* ─── Background ─── */
function drawBackground(time) {
  const w = canvas.width;
  const h = canvas.height;

  // Dark gradient
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.3, 0, w * 0.5, h * 0.3, w * 0.7);
  bg.addColorStop(0, '#1a1a1a');
  bg.addColorStop(0.5, '#0d0d0d');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Floor line
  ctx.strokeStyle = '#10b98111';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  ctx.lineTo(w, h * 0.55);
  ctx.stroke();

  // Temple pillars
  const pillarGrad = ctx.createLinearGradient(0, 0, 0, h);
  pillarGrad.addColorStop(0, '#10b98108');
  pillarGrad.addColorStop(1, '#10b98103');
  ctx.fillStyle = pillarGrad;
  ctx.fillRect(w * 0.05, h * 0.2, w * 0.02, h * 0.35);
  ctx.fillRect(w * 0.93, h * 0.2, w * 0.02, h * 0.35);

  // Stars
  ctx.fillStyle = '#e0dcc020';
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137.5 + i * i * 7.3) % w;
    const sy = (i * 89.3 + i * 13.7) % (h * 0.5);
    const twinkle = Math.sin(time * 0.001 + i) * 0.5 + 0.5;
    ctx.globalAlpha = twinkle * 0.5;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }
  ctx.globalAlpha = 1;
}

/* ─── Game Loop ─── */
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (let i = floatTexts.length - 1; i >= 0; i--) {
    const f = floatTexts[i];
    f.y += f.vy;
    f.life -= 0.015;
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

function updateNPCs(time) {
  const s = store.state;
  for (const npc of s.activeNPCs) {
    if (!s.unlockedNPCs.includes(npc.id)) continue;
    // Random walk
    npc.x += npc.vx;
    npc.y += npc.vy;
    // Boundary bounce
    if (npc.x < 5 || npc.x > 95) npc.vx *= -1;
    if (npc.y < 15 || npc.y > 60) npc.vy *= -1;
    // Random direction change
    if (Math.random() < 0.005) {
      npc.vx = (Math.random() - 0.5) * 0.3;
      npc.vy = (Math.random() - 0.5) * 0.2;
    }
    // Happiness decay
    if (Math.random() < 0.001) npc.happiness = Math.max(0, npc.happiness - 0.5);
  }
}

function loop(time) {
  if (!lastTime) lastTime = time;
  const dt = time - lastTime;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(time);
  updateNPCs(time);
  // Draw NPCs
  const s = store.state;
  for (const npc of s.activeNPCs) {
    if (!s.unlockedNPCs.includes(npc.id)) continue;
    drawNPC(npc, time);
  }
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
