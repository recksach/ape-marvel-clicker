let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function play(freq, dur, type = 'sine', vol = 0.12) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

export function playTap() { play(600, 0.08, 'sine', 0.10); }
export function playCollect() { play(880, 0.12, 'sine', 0.12); setTimeout(() => play(1100, 0.15), 60); }
export function playMerge() { play(440, 0.15, 'sine', 0.12); setTimeout(() => play(660, 0.2), 100); setTimeout(() => play(880, 0.25), 200); }
export function playQuest() { play(523, 0.12, 'triangle', 0.10); }
export function playComplete() { play(660, 0.15, 'sine', 0.12); setTimeout(() => play(880, 0.2), 120); setTimeout(() => play(1100, 0.3), 240); }
export function playError() { play(200, 0.2, 'sawtooth', 0.08); }
export function playLevelUp() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => play(f, 0.2, 'sine', 0.12), i * 100));
}
