let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type, vol) {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol || 0.1, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + duration);
  } catch {}
}

export function playTap() { playTone(800, 0.08, 'sine', 0.06); }
export function playCollect() { playTone(1200, 0.12, 'sine', 0.08); playTone(1600, 0.1, 'sine', 0.06); }
export function playMerge() { playTone(600, 0.15, 'triangle', 0.1); playTone(900, 0.15, 'triangle', 0.08); playTone(1200, 0.2, 'sine', 0.06); }
export function playQuest() { playTone(400, 0.1, 'square', 0.04); }
export function playComplete() { playTone(1000, 0.15, 'sine', 0.1); setTimeout(() => playTone(1400, 0.15, 'sine', 0.08), 150); setTimeout(() => playTone(1800, 0.2, 'sine', 0.06), 300); }
export function playError() { playTone(200, 0.2, 'sawtooth', 0.04); }
export function playLevelUp() { playTone(500, 0.1, 'sine', 0.1); setTimeout(() => playTone(700, 0.1, 'sine', 0.08), 100); setTimeout(() => playTone(900, 0.1, 'sine', 0.06), 200); setTimeout(() => playTone(1200, 0.3, 'sine', 0.08), 300); }
