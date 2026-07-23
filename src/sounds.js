let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', vol = 0.15) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playNoise(duration, vol = 0.08) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {}
}

export function playTap() {
  playTone(800, 0.08, 'sine', 0.1);
  playTone(1200, 0.05, 'sine', 0.06);
}

export function playBuy() {
  playTone(523, 0.1, 'square', 0.08);
  setTimeout(() => playTone(659, 0.1, 'square', 0.08), 60);
  setTimeout(() => playTone(784, 0.15, 'square', 0.08), 120);
}

export function playWin() {
  playTone(523, 0.12, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.12), 100);
  setTimeout(() => playTone(784, 0.12, 'sine', 0.12), 200);
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.15), 300);
}

export function playJackpot() {
  [523, 659, 784, 1047, 1318, 1568].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 'sine', 0.12), i * 80);
  });
  setTimeout(() => playNoise(0.3, 0.05), 400);
}

export function playLose() {
  playTone(300, 0.2, 'sawtooth', 0.06);
  setTimeout(() => playTone(200, 0.3, 'sawtooth', 0.06), 150);
}

export function playClick() {
  playTone(600, 0.04, 'sine', 0.06);
}

export function playRouletteSpin() {
  let i = 0;
  const iv = setInterval(() => {
    playTone(400 + (i % 8) * 50, 0.03, 'sine', 0.04);
    i++;
    if (i > 20) clearInterval(iv);
  }, 80);
}

export function playPortal() {
  playTone(200, 0.4, 'sine', 0.08);
  setTimeout(() => playTone(300, 0.4, 'sine', 0.08), 200);
  setTimeout(() => playTone(400, 0.5, 'sine', 0.1), 400);
}

export function playStar() {
  playTone(1200, 0.15, 'sine', 0.1);
  setTimeout(() => playTone(1500, 0.15, 'sine', 0.1), 80);
  setTimeout(() => playTone(1800, 0.2, 'sine', 0.12), 160);
}

export function playDailyBonus() {
  const notes = [523, 659, 784, 1047, 784, 1047, 1318];
  notes.forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'sine', 0.1), i * 100);
  });
}
