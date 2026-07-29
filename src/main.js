const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const RARITIES = [
  { name: 'COMMON', color: '#8B8B8B', glow: '#555', tapCostBase: 1, trainingHours: 6, dumbbellLevel: 1, trainReward: 10 },
  { name: 'UNCOMMON', color: '#2ECC71', glow: '#1a8c4a', tapCostBase: 3, trainingHours: 8, dumbbellLevel: 2, trainReward: 12 },
  { name: 'RARE', color: '#3498DB', glow: '#1a6fa0', tapCostBase: 8, trainingHours: 12, dumbbellLevel: 3, trainReward: 15 },
  { name: 'EPIC', color: '#9B59B6', glow: '#6c3483', tapCostBase: 20, trainingHours: 24, dumbbellLevel: 4, trainReward: 20 },
  { name: 'LEGENDARY', color: '#F1C40F', glow: '#b7950b', tapCostBase: 50, trainingHours: 48, dumbbellLevel: 5, trainReward: 30 }
];

const GORILLA_NAMES = ['БРУНО','КОНГО','БАНАНА','ГРОМИЛА','МАГНУС','АЛЬФА','ОМЕГА','ЗОРРО','ТИТАН','ВУЛКАН'];

function getRarity(r) { return RARITIES[r] || RARITIES[0]; }

function getGorillaImg(r, training) {
  if (training) return `assets/gorilla-03.png`;
  const map = [1, 1, 2, 2, 3];
  const num = map[r] || 1;
  return `assets/gorilla-${num.toString().padStart(2,'0')}.png`;
}

function image(l) {
  const colors = ['#8B8B8B','#2ECC71','#3498DB','#9B59B6','#F1C40F'];
  const color = colors[l-1] || '#aaa';
  return `<div style="width:100%;height:100%;background:${color};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#fff">${l}</div>`;
}

function buzz() {
  if (navigator.vibrate) navigator.vibrate(20);
}

function haptic(t) {
  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      const h = window.Telegram.WebApp.HapticFeedback;
      if (t === 'tap') h.impactOccurred('light');
      else if (t === 'collect') h.notificationOccurred('success');
      else if (t === 'error') h.notificationOccurred('error');
      else h.impactOccurred('medium');
    }
  } catch(e) {}
}

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function getOrCreateUserId() {
  try {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
      const tgId = window.Telegram.WebApp.initDataUnsafe.user.id;
      if (tgId) return 'tg_' + tgId;
    }
  } catch (e) {}
  let id = localStorage.getItem('gm_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    localStorage.setItem('gm_user_id', id);
  }
  return id;
}

function item(level, extra) {
  const colors = ['#8B8B8B','#2ECC71','#3498DB','#9B59B6','#F1C40F'];
  const c = colors[level-1] || '#aaa';
  return `<div class="grid-item${extra||''}" style="background:${c};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:bold;color:#fff;cursor:pointer">${level}</div>`;
}

let toastTimer = null;

function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); }, 2500);
}

function animateValue(el, start, end, duration) {
  if (!el) return;
  const range = end - start;
  const startTime = performance.now();
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = start + range * eased;
    if (Number.isInteger(start) && Number.isInteger(end)) {
      el.textContent = Math.floor(value);
    } else {
      el.textContent = value.toFixed(2);
    }
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function generateLockedCells() {
  const locked = [];
  const patterns = [
    [6,7,13,14,20,21,27,28,34,35,41,42],
    [3,4,5,6,10,11,12,13,17,18,19,20,24,25,26,27,31,32,33,34,38,39,40,41,45,46,47,48],
    [0,1,2,7,8,9,14,15,16,21,22,23,28,29,30,35,36,37,42,43,44],
    [0,6,7,13,14,20,21,27,28,34,35,41,42,48],
    []
  ];
  const level = Math.min(state.totalTrainingSends || 0, patterns.length - 1);
  const p = patterns[level];
  for (const i of p) locked.push(i);
  state.lockedCells = locked;
}

function isLocked(idx) {
  return state.lockedCells.includes(idx);
}

const state = {
  tab: 'gorillas',
  bananas: 100,
  gems: 0,
  ape: 0,
  mason: 0,
  grid: [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  gridCounts: [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  queue: [1],
  gorillas: [
    { id: 'g0', name: 'БРУНО', rarity: 0, level: 1, feed: 0, tapCount: 0, tapsForLevel: 50, trainingEnd: 0, earnedDumbbells: 0, equipped: null }
  ],
  gorillaIndex: 0,
  marketTab: 'all',
  quests: [
    { id: 'q1', icon: '👆', title: 'Покорми гориллу 100 раз', progress: 0, total: 100, reward: 5, rewardType: 'gems', claimed: false },
    { id: 'q2', icon: '🏋️', title: 'Отправь на тренировку 5 раз', progress: 0, total: 5, reward: 200, rewardType: 'bananas', claimed: false },
    { id: 'q3', icon: '🔥', title: 'Собери 1000 бананов', progress: 0, total: 1000, reward: 10, rewardType: 'gems', claimed: false }
  ],
  totalTaps: 0,
  totalTrainingSends: 0,
  totalBananasEarned: 0,
  userId: '',
  walletConnected: false,
  walletAddr: '',
  tutorialStep: 0,
  tutorialDone: false,
  lockedCells: [],
  floatingDumbbells: []
};

function sync() {
  const b = document.getElementById('bananas'); if (b) animateValue(b, parseInt(b.textContent) || 0, state.bananas, 400);
  const g = document.getElementById('gems'); if (g) animateValue(g, parseInt(g.textContent) || 0, state.gems, 400);
  const a = document.getElementById('ape-coins'); if (a) animateValue(a, parseFloat(a.textContent) || 0, state.ape, 400);
  const m = document.getElementById('mason-coins'); if (m) m.textContent = state.mason.toFixed(2);
}

function getSerializableState() {
  return {
    bananas: state.bananas,
    gems: state.gems,
    ape: state.ape,
    mason: state.mason,
    grid: state.grid,
    gridCounts: state.gridCounts,
    queue: state.queue,
    gorillas: state.gorillas,
    totalTaps: state.totalTaps,
    totalTrainingSends: state.totalTrainingSends,
    totalBananasEarned: state.totalBananasEarned,
    quests: state.quests,
    lockedCells: state.lockedCells
  };
}

function saveState() {
  try {
    const data = getSerializableState();
    localStorage.setItem('gm_state', JSON.stringify(data));
    if (state.userId && window.firebaseDatabase) {
      const ref = window.firebaseDatabase.ref('users/' + state.userId);
      ref.set(data).catch(() => {});
    }
  } catch(e) {}
}

function loadStateFromFirebase(userId) {
  try {
    const local = localStorage.getItem('gm_state');
    if (local) {
      const data = JSON.parse(local);
      if (data.bananas !== undefined) state.bananas = data.bananas;
      if (data.gems !== undefined) state.gems = data.gems;
      if (data.ape !== undefined) state.ape = data.ape;
      if (data.mason !== undefined) state.mason = data.mason;
      if (data.grid) state.grid = data.grid;
      if (data.gridCounts) state.gridCounts = data.gridCounts;
      if (data.queue) state.queue = data.queue;
      if (data.gorillas) state.gorillas = data.gorillas;
      if (data.totalTaps !== undefined) state.totalTaps = data.totalTaps;
      if (data.totalTrainingSends !== undefined) state.totalTrainingSends = data.totalTrainingSends;
      if (data.totalBananasEarned !== undefined) state.totalBananasEarned = data.totalBananasEarned;
      if (data.quests) state.quests = data.quests;
      if (data.lockedCells) state.lockedCells = data.lockedCells;
    }
  } catch(e) {}
}

function updateQuestProgress(type, amount) {
  for (const q of state.quests) {
    if (q.claimed) continue;
    if (type === 'tap' && q.id === 'q1') q.progress = Math.min(q.total, state.totalTaps);
    if (type === 'training' && q.id === 'q2') q.progress = Math.min(q.total, state.totalTrainingSends);
    if (type === 'bananas' && q.id === 'q3') q.progress = Math.min(q.total, state.totalBananasEarned);
  }
}

function updateBadges() {
  const claimable = state.quests.filter(q => !q.claimed && q.progress >= q.total).length;
  const badges = document.querySelectorAll('.badge');
  badges.forEach(b => { b.textContent = claimable; b.style.display = claimable > 0 ? 'flex' : 'none'; });
  const navQuests = document.querySelector('[data-tab="quests"] .badge');
  if (navQuests) { navQuests.textContent = claimable; navQuests.style.display = claimable > 0 ? 'flex' : 'none'; }
}

function createBananaParticle(e) {
  const container = document.getElementById('gorilla-container');
  if (!container) return;
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('div');
    p.className = 'banana-particle';
    p.textContent = '🍌';
    const rect = container.getBoundingClientRect();
    const x = (e && e.clientX) ? e.clientX - rect.left : rect.width / 2;
    const y = (e && e.clientY) ? e.clientY - rect.top : rect.height / 2;
    p.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
    p.style.top = (y + (Math.random() - 0.5) * 40) + 'px';
    p.style.setProperty('--dx', ((Math.random() - 0.5) * 120) + 'px');
    p.style.setProperty('--dy', (-80 - Math.random() * 120) + 'px');
    container.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function tapGorilla(e) {
  const g = state.gorillas[state.gorillaIndex];
  if (!g) return;
  const r = getRarity(g.rarity);
  const cost = Math.floor(r.tapCostBase + g.tapCount * 1.5);
  if (g.trainingEnd > Date.now()) return;
  if (g.feed >= 100) return;
  if (state.bananas < cost) { toast('Недостаточно бананов!'); haptic('error'); return; }

  state.bananas -= cost;
  state.ape += 0.1;
  state.mason += 0.01;
  g.feed = Math.min(100, g.feed + 2);
  g.tapCount++;
  state.totalTaps++;
  state.totalBananasEarned += cost;

  const img = document.getElementById('gorilla-img');
  if (img) { img.style.transform = 'scale(.88)'; setTimeout(() => img.style.transform = 'scale(1)', 150); }

  createBananaParticle(e);
  haptic('tap');
  buzz();
  updateQuestProgress('tap');
  updateQuestProgress('bananas');
  sync();
  renderGorillaOnly();
}

function sendToTraining() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g || g.feed < 100 || g.trainingEnd > Date.now()) return;
  const r = getRarity(g.rarity);
  g.trainingEnd = Date.now() + r.trainingHours * 60 * 60 * 1000;
  g.feed = 0;
  state.totalTrainingSends++;
  haptic('collect');
  toast(`Отправлен на ${r.trainingHours}ч тренировку!`);
  updateQuestProgress('training');
  render();
}

function collectTraining() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g || g.trainingEnd > Date.now()) return;
  g.trainingEnd = 0;

  const earnedLevel = Math.max(1, getRarity(g.rarity).dumbbellLevel);
  state.floatingDumbbells = Array.from({length: 10}, (_, i) => ({
    level: earnedLevel,
    x: 30 + Math.random() * 60,
    y: 20 + Math.random() * 30
  }));

  g.earnedDumbbells += 10;
  haptic('collect');
  toast(`+10 гантелей ${earnedLevel} уровня!`);

  const tapsNeeded = g.level * 50;
  if (g.tapCount >= tapsNeeded && g.level < 5) {
    g.level++;
    g.tapCount = 0;
    toast(`Уровень повышен! LVL ${g.level}`);
  }

  render();

  setTimeout(() => {
    for (let i = 0; i < 10; i++) {
      const emptyIdx = state.grid.indexOf(0);
      if (emptyIdx >= 0 && !isLocked(emptyIdx)) {
        state.grid[emptyIdx] = earnedLevel;
        state.gridCounts[emptyIdx] = 1;
      } else {
        state.queue.push(earnedLevel);
      }
    }
    state.floatingDumbbells = [];
    render();
    toast('Гантели на поле!');
  }, 2000);
}

function mergeGorillas() {
  const commonMax = state.gorillas.filter(g => g.rarity === 0 && g.level >= 5);
  if (commonMax.length < 4) { toast('Нужно 4 COMMON MAX уровня'); return; }

  let removed = 0;
  state.gorillas = state.gorillas.filter(g => {
    if (g.rarity === 0 && g.level >= 5 && removed < 4) { removed++; return false; }
    return true;
  });

  const newGorilla = {
    id: 'g_' + Date.now(),
    name: 'ГИБРИД',
    rarity: 1,
    level: 1,
    feed: 0,
    tapCount: 0,
    tapsForLevel: 50,
    trainingEnd: 0,
    earnedDumbbells: 0,
    equipped: null
  };
  state.gorillas.push(newGorilla);
  state.gorillaIndex = state.gorillas.length - 1;

  haptic('collect');
  toast('Поздравляем! Получена UNCOMMON горилла! 🎉');
  render();
}

function buyGorilla(cost) {
  if (state.bananas < cost) { toast('Недостаточно бананов!'); return; }
  state.bananas -= cost;
  const rarity = Math.random() < 0.7 ? 0 : (Math.random() < 0.6 ? 1 : (Math.random() < 0.4 ? 2 : (Math.random() < 0.2 ? 3 : 4)));
  const nameIdx = state.gorillas.length % GORILLA_NAMES.length;
  const newG = {
    id: 'g_' + Date.now(),
    name: GORILLA_NAMES[nameIdx],
    rarity: rarity,
    level: 1,
    feed: 0,
    tapCount: 0,
    tapsForLevel: 50,
    trainingEnd: 0,
    earnedDumbbells: 0,
    equipped: null
  };
  state.gorillas.push(newG);
  state.gorillaIndex = state.gorillas.length - 1;
  haptic('collect');
  toast(`Куплена ${getRarity(rarity).name} горилла!`);
  sync();
  render();
}

function renderGorillaOnly() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g) return;
  const r = getRarity(g.rarity);
  const cost = Math.floor(r.tapCostBase + g.tapCount * 1.5);
  const inTraining = g.trainingEnd > Date.now();
  const trainingDone = g.trainingEnd > 0 && g.trainingEnd <= Date.now();
  const feedWidth = g.feed;

  const imgEl = document.getElementById('gorilla-img');
  if (imgEl) {
    imgEl.src = getGorillaImg(g.rarity, inTraining);
    imgEl.style.transform = 'scale(1)';
  }

  const feedBar = document.getElementById('feed-bar');
  if (feedBar) feedBar.style.width = feedWidth + '%';

  const feedText = document.getElementById('feed-text');
  if (feedText) feedText.textContent = feedWidth.toFixed(0) + '%';

  const tapCostEl = document.getElementById('tap-cost');
  if (tapCostEl) tapCostEl.textContent = cost;

  const trainBtn = document.getElementById('train-btn');
  const collectBtn = document.getElementById('collect-btn');

  if (trainBtn) {
    if (feedWidth >= 100 && !inTraining && !trainingDone) {
      trainBtn.style.display = 'flex';
    } else {
      trainBtn.style.display = 'none';
    }
  }

  if (collectBtn) {
    if (trainingDone) {
      collectBtn.style.display = 'flex';
    } else {
      collectBtn.style.display = 'none';
    }
  }

  const trainingOverlay = document.getElementById('training-overlay');
  if (trainingOverlay) {
    trainingOverlay.style.display = inTraining ? 'flex' : 'none';
  }

  const rarityBadge = document.getElementById('gorilla-rarity');
  if (rarityBadge) { rarityBadge.textContent = r.name; rarityBadge.style.color = r.color; }

  const levelBadge = document.getElementById('gorilla-level');
  if (levelBadge) levelBadge.textContent = 'LVL ' + g.level;

  const tapsCounter = document.getElementById('taps-counter');
  if (tapsCounter) tapsCounter.textContent = `${g.tapCount}/${g.level * 50} TAPS`;

  const gorillaName = document.getElementById('gorilla-name');
  if (gorillaName) gorillaName.textContent = g.name;

  sync();
}

function gorillas() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g) return '<div style="padding:40px;text-align:center;color:#fff">Нет гориллы</div>';
  const r = getRarity(g.rarity);
  const cost = Math.floor(r.tapCostBase + g.tapCount * 1.5);
  const inTraining = g.trainingEnd > Date.now();
  const trainingDone = g.trainingEnd > 0 && g.trainingEnd <= Date.now();
  const feedWidth = g.feed;

  let dotsHtml = '';
  for (let i = 0; i < state.gorillas.length; i++) {
    dotsHtml += `<span class="gorilla-dot${i === state.gorillaIndex ? ' active' : ''}" data-index="${i}"></span>`;
  }

  let mergeBtnHtml = '';
  const commonMax = state.gorillas.filter(gg => gg.rarity === 0 && gg.level >= 5).length;
  if (commonMax >= 4) {
    mergeBtnHtml = `<button class="merge-btn" onclick="mergeGorillas()">СКРЕСТИТЬ 4× COMMON MAX → UNCOMMON</button>`;
  }

  let floatingHtml = '';
  if (state.floatingDumbbells.length > 0) {
    floatingHtml = state.floatingDumbbells.map(db => {
      const num = db.level.toString().padStart(2, '0');
      return `<div class="floating-dumbbell" style="left:${db.x}%;top:${db.y}%"><img src="assets/dumbbell-${num}.png" class="db-img-sm" draggable="false"></div>`;
    }).join('');
  }

  const now = Date.now();
  let trainingTimeLeft = '';
  if (inTraining) {
    const left = Math.max(0, Math.floor((g.trainingEnd - now) / 1000));
    trainingTimeLeft = formatTime(left);
  }

  return `
<div class="gorilla-screen" id="gorilla-screen">
  <div class="gorilla-header">
    <div class="gorilla-dots">${dotsHtml}</div>
    <div class="gorilla-nav">
      <button class="gorilla-arrow" onclick="changeGorilla(-1)"${state.gorillaIndex === 0 ? ' disabled' : ''}>‹</button>
      <div class="gorilla-badges">
        <span class="rarity-badge" id="gorilla-rarity" style="color:${r.color}">${r.name}</span>
        <span class="level-badge" id="gorilla-level">LVL ${g.level}</span>
        <span class="taps-badge" id="taps-counter">${g.tapCount}/${g.level * 50} TAPS</span>
      </div>
      <button class="gorilla-arrow" onclick="changeGorilla(1)"${state.gorillaIndex === state.gorillas.length - 1 ? ' disabled' : ''}>›</button>
    </div>
  </div>

  <div class="gorilla-info-name" id="gorilla-name">${g.name}</div>

  <div class="gorilla-card" id="gorilla-container" style="--glow:${r.glow}">
    <div class="training-overlay" id="training-overlay" style="display:${inTraining ? 'flex' : 'none'}">
      <div class="training-timer">
        <span>🏋️</span>
        <span id="training-countdown">${trainingTimeLeft}</span>
      </div>
    </div>
    <div class="floating-dumbbells-container">${floatingHtml}</div>
    <img id="gorilla-img" class="gorilla-image" src="${getGorillaImg(g.rarity, inTraining)}" alt="gorilla" draggable="false" oncontextmenu="return false;">
  </div>

  <div class="feed-section">
    <div class="feed-bar-container">
      <div class="feed-bar" id="feed-bar" style="width:${feedWidth}%"></div>
      <span class="feed-text" id="feed-text">${feedWidth.toFixed(0)}%</span>
    </div>
    <div class="tap-info">
      <span>🍌 <b id="tap-cost">${cost}</b> за тап</span>
      <span>⚖ +0.01 $MASON</span>
    </div>
  </div>

  <div class="gorilla-actions">
    <button class="train-btn" id="train-btn" style="display:${feedWidth >= 100 && !inTraining && !trainingDone ? 'flex' : 'none'}" onclick="sendToTraining()">
      🏋️ ОТПРАВИТЬ НА ТРЕНИРОВКУ
    </button>
    <button class="collect-btn" id="collect-btn" style="display:${trainingDone ? 'flex' : 'none'}" onclick="collectTraining()">
      ЗАБРАТЬ +10 🏋️
    </button>
    ${mergeBtnHtml}
  </div>

  <div class="mason-earned">
    ⚖ $MASON: <span id="mason-tap-counter">${state.mason.toFixed(2)}</span>
  </div>

  <div class="gorilla-mini-shop">
    <button class="shop-btn" onclick="buyGorilla(100)">🍌 100</button>
    <button class="shop-btn" onclick="buyGorilla(500)">🍌 500</button>
    <button class="shop-btn" onclick="buyGorilla(2000)">🍌 2000</button>
  </div>
</div>`;
}

function changeGorilla(dir) {
  const newIdx = state.gorillaIndex + dir;
  if (newIdx < 0 || newIdx >= state.gorillas.length) return;
  state.gorillaIndex = newIdx;
  state.floatingDumbbells = [];
  render();
}

function bindGorillaScreen() {
  const container = document.getElementById('gorilla-container');
  if (container) {
    container.onpointerdown = tapGorilla;
  }

  const dots = document.querySelectorAll('.gorilla-dot');
  dots.forEach(d => {
    d.onclick = () => {
      const idx = parseInt(d.dataset.index);
      if (idx >= 0 && idx < state.gorillas.length) {
        state.gorillaIndex = idx;
        state.floatingDumbbells = [];
        render();
      }
    };
  });

  if (window._trainingTick) clearInterval(window._trainingTick);
  window._trainingTick = setInterval(() => {
    const g = state.gorillas[state.gorillaIndex];
    if (g && g.trainingEnd > Date.now()) {
      const left = Math.max(0, Math.floor((g.trainingEnd - Date.now()) / 1000));
      const el = document.getElementById('training-countdown');
      if (el) el.textContent = formatTime(left);
    }
    if (g && g.trainingEnd > 0 && g.trainingEnd <= Date.now()) {
      const collectBtn = document.getElementById('collect-btn');
      if (collectBtn) collectBtn.style.display = 'flex';
      const overlay = document.getElementById('training-overlay');
      if (overlay) overlay.style.display = 'none';
    }
  }, 1000);
}

function inventory() {
  let html = '<div class="grid-container">';
  for (let i = 0; i < 49; i++) {
    const val = state.grid[i] || 0;
    const locked = isLocked(i);
    if (locked) {
      html += `<div class="grid-item grid-locked" data-idx="${i}">🔒</div>`;
    } else if (val > 0) {
      const num = val.toString().padStart(2, '0');
      const count = state.gridCounts[i] || 1;
      const countBadge = count > 1 ? `<div class="stack-count">${count}</div>` : '';
      html += `<div class="grid-item grid-drag" data-idx="${i}" data-level="${val}" style="background:linear-gradient(145deg,#1c1640,#110e28)"><img src="assets/dumbbell-${num}.png" class="db-img" draggable="false"><div class="db-level">${val}</div>${countBadge}</div>`;
    } else {
      html += `<div class="grid-item grid-empty" data-idx="${i}"></div>`;
    }
  }
  html += '</div>';

  html += '<div class="queue-section">';
  if (state.queue.length > 0) {
    html += '<div class="queue-label">Очередь:</div><div class="queue-items">';
    for (const q of state.queue) {
      const num = q.toString().padStart(2, '0');
      html += `<div class="queue-item" style="background:linear-gradient(145deg,#1c1640,#110e28)"><img src="assets/dumbbell-${num}.png" class="db-img-sm" draggable="false"><span class="db-queue-lvl">${q}</span></div>`;
    }
    html += '</div>';
  }
  html += '</div>';

  return html;
}

function bindGrid() {
  let dragData = null;
  let clone = null;

  const clearDrag = () => {
    if (clone) { clone.remove(); clone = null; }
    dragData = null;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
  };

  const onMove = (e) => {
    if (clone) {
      clone.style.left = (e.clientX - 30) + 'px';
      clone.style.top = (e.clientY - 30) + 'px';
    }
  };

  const onUp = (e) => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const gridItem = target ? target.closest('.grid-item') : null;
    if (gridItem && dragData) {
      const targetIdx = parseInt(gridItem.dataset.idx);
      if (!isNaN(targetIdx) && targetIdx !== dragData.idx) {
        if (state.grid[targetIdx] === 0 && !isLocked(targetIdx)) {
          // Move to empty cell
          state.grid[targetIdx] = dragData.level;
          state.gridCounts[targetIdx] = dragData.count;
          state.grid[dragData.idx] = 0;
          state.gridCounts[dragData.idx] = 0;
          haptic('tap');
          render();
          clearDrag();
          return;
        } else if (state.grid[targetIdx] === dragData.level && !isLocked(targetIdx)) {
          // Same level - combine
          const totalCount = state.gridCounts[targetIdx] + dragData.count;
          if (totalCount >= 3) {
            // Merge to next level
            const newLevel = dragData.level + 1;
            if (newLevel <= 10) {
              state.grid[targetIdx] = newLevel;
              state.gridCounts[targetIdx] = 1;
              const remaining = totalCount - 3;
              if (remaining > 0) {
                state.grid[dragData.idx] = dragData.level;
                state.gridCounts[dragData.idx] = remaining;
              } else {
                state.grid[dragData.idx] = 0;
                state.gridCounts[dragData.idx] = 0;
              }
              toast(`Слияние! ${dragData.level}→${newLevel}`);
              haptic('collect');
            }
          } else {
            // Just stack
            state.gridCounts[targetIdx] = totalCount;
            state.grid[dragData.idx] = 0;
            state.gridCounts[dragData.idx] = 0;
            haptic('tap');
          }
          render();
          clearDrag();
          return;
        }
      }
    }
    // Cancel - snap back
    clearDrag();
  };

  document.querySelectorAll('.grid-drag').forEach(el => {
    el.onpointerdown = (e) => {
      e.preventDefault();
      const idx = parseInt(el.dataset.idx);
      const level = parseInt(el.dataset.level);
      if (isNaN(idx) || isNaN(level)) return;

      dragData = { idx, level, count: state.gridCounts[idx] || 1 };

      const num = level.toString().padStart(2, '0');
      clone = document.createElement('div');
      clone.className = 'drag-clone';
      clone.innerHTML = `<img src="assets/dumbbell-${num}.png" class="drag-clone-img" draggable="false"><span class="drag-clone-level">${level}</span>`;
      clone.style.left = (e.clientX - 30) + 'px';
      clone.style.top = (e.clientY - 30) + 'px';
      document.body.appendChild(clone);

      el.style.opacity = '0.4';
      setTimeout(() => { if (el) el.style.opacity = '1'; }, 300);

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    };
  });

  const empties = document.querySelectorAll('.grid-empty');
  empties.forEach(el => {
    el.onclick = () => {
      if (state.queue.length > 0) {
        placeFromQueue(parseInt(el.dataset.idx));
      }
    };
  });
}

function tryMerge() {
  let anyMerged = false;
  let merged;

  do {
    merged = false;
    const groups = {};
    for (let i = 0; i < state.grid.length; i++) {
      const v = state.grid[i];
      if (v > 0 && !isLocked(i)) {
        if (!groups[v]) groups[v] = [];
        groups[v].push(i);
      }
    }

    for (const lvl of Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b))) {
      const idxs = groups[parseInt(lvl)];
      if (idxs.length >= 3) {
        const numMerges = Math.floor(idxs.length / 3);
        for (let m = 0; m < numMerges; m++) {
          const mergeIdx = idxs.slice(m * 3, m * 3 + 3);
          const targetIdx = mergeIdx[2];
          for (const mi of mergeIdx) state.grid[mi] = 0;
          const newLevel = parseInt(lvl) + 1;
          if (newLevel <= 10) {
            state.grid[targetIdx] = newLevel;
            toast(`Слияние! ${lvl}→${newLevel}`);
            haptic('collect');
          }
        }
        merged = true;
        anyMerged = true;
        break;
      }
    }
  } while (merged);

  if (anyMerged) render();
  else toast('Нужно 3 одинаковых уровня для слияния');
}

function placeFromQueue(idx) {
  if (state.queue.length === 0) return;
  if (state.grid[idx] !== 0) return;
  if (isLocked(idx)) { toast('Ячейка заблокирована'); return; }
  state.grid[idx] = state.queue.shift();
  state.gridCounts[idx] = 1;
  haptic('tap');
  render();
}

function generateQueueItem() {
  const lvl = Math.random() < 0.6 ? 1 : (Math.random() < 0.5 ? 2 : (Math.random() < 0.3 ? 3 : (Math.random() < 0.1 ? 4 : 5)));
  state.queue.push(lvl);
  haptic('tap');
  toast(`+1 гантель ${lvl} уровня в очередь!`);
  render();
}

function market() {
  const tab = state.marketTab || 'all';
  let html = `
<div class="market-container">
  <div class="market-tabs">
    <button class="market-tab${tab === 'all' ? ' active' : ''}" data-tab="all">ВСЕ</button>
    <button class="market-tab${tab === 'gorillas' ? ' active' : ''}" data-tab="gorillas">ГОРИЛЛЫ</button>
    <button class="market-tab${tab === 'dumbbells' ? ' active' : ''}" data-tab="dumbbells">ГАНТЕЛИ</button>
    <button class="market-tab${tab === 'skins' ? ' active' : ''}" data-tab="skins">СКИНЫ</button>
  </div>
  <div class="market-lots" id="market-lots">
    <div class="market-empty">Лоты не найдены</div>
  </div>
  <div class="market-wallet">
    <div class="wallet-section">
      <h3>💼 Кошелек</h3>
      <div class="wallet-addr">${state.walletConnected ? state.walletAddr : 'Не подключен'}</div>
      <button class="wallet-btn" onclick="${state.walletConnected ? 'disconnectWallet()' : 'connectWallet()'}">
        ${state.walletConnected ? 'Отключить' : 'Подключить кошелек'}
      </button>
    </div>
  </div>
</div>`;
  return html;
}

function bindMarket() {
  const tabs = document.querySelectorAll('.market-tab');
  tabs.forEach(t => {
    t.onclick = () => {
      state.marketTab = t.dataset.tab;
      render();
    };
  });
}

function placeBid(lotId, amount) {
  if (!state.walletConnected) { toast('Подключите кошелек'); return; }
  if (state.bananas < amount) { toast('Недостаточно бананов'); return; }
  state.bananas -= amount;
  toast(`Ставка ${amount} 🍌 на лот #${lotId}`);
  sync();
  render();
}

function connectWallet() {
  if (window.Telegram && window.Telegram.WebApp) {
    state.walletConnected = true;
    state.walletAddr = 'UQ' + Math.random().toString(36).slice(2, 12).toUpperCase();
    toast('Кошелек подключен');
    render();
  } else {
    toast('Доступно только в Telegram');
  }
}

function disconnectWallet() {
  state.walletConnected = false;
  state.walletAddr = '';
  toast('Кошелек отключен');
  render();
}

function initWallet() {
  const saved = localStorage.getItem('gm_wallet');
  if (saved) {
    try {
      const w = JSON.parse(saved);
      state.walletConnected = w.connected || false;
      state.walletAddr = w.addr || '';
    } catch(e) {}
  }
}

function quests() {
  let html = '<div class="quests-container">';
  for (const q of state.quests) {
    const done = q.progress >= q.total;
    const pct = Math.min(100, (q.progress / q.total) * 100);
    html += `
<div class="quest-card${q.claimed ? ' claimed' : ''}">
  <div class="quest-icon">${q.icon}</div>
  <div class="quest-body">
    <div class="quest-title">${q.title}</div>
    <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
    <div class="quest-progress-text">${q.progress}/${q.total}</div>
  </div>
  <div class="quest-reward">
    <div class="quest-reward-icon">${q.rewardType === 'gems' ? '💎' : '🍌'}</div>
    <div class="quest-reward-amount">+${q.reward}</div>
    ${q.claimed ? '<div class="quest-claimed-badge">✓</div>' : (done ? `<button class="quest-claim-btn" data-quest="${q.id}">ЗАБРАТЬ</button>` : '')}
  </div>
</div>`;
  }
  html += '</div>';
  return html;
}

function bindQuests() {
  const btns = document.querySelectorAll('.quest-claim-btn');
  btns.forEach(b => {
    b.onclick = () => claimQuest(b.dataset.quest);
  });
}

function claimQuest(questId) {
  const q = state.quests.find(x => x.id === questId);
  if (!q || q.claimed || q.progress < q.total) return;
  q.claimed = true;
  if (q.rewardType === 'gems') state.gems += q.reward;
  else state.bananas += q.reward;
  haptic('collect');
  toast(`+${q.reward} ${q.rewardType === 'gems' ? '💎' : '🍌'}`);
  sync();
  render();
}

function clan() {
  return `
<div class="clan-container">
  <div class="clan-header">
    <div class="clan-icon">🦍</div>
    <div class="clan-name">СТАЯ</div>
    <div class="clan-members">12 участников</div>
  </div>
  <div class="clan-stats">
    <div class="clan-stat"><span class="stat-label">Всего $APE</span><span class="stat-value">${state.ape.toFixed(1)}</span></div>
    <div class="clan-stat"><span class="stat-label">Всего $MASON</span><span class="stat-value">${state.mason.toFixed(2)}</span></div>
    <div class="clan-stat"><span class="stat-label">Тренировок</span><span class="stat-value">${state.totalTrainingSends}</span></div>
  </div>
  <div class="clan-raids">
    <h3>⚔ Рейды</h3>
    <div class="clan-no-raids">Рейдов пока нет</div>
  </div>
  <div class="reset-section">
    <button class="reset-btn" onclick="resetGame()">🔄 Сбросить прогресс</button>
  </div>
</div>`;
}

function showDumbbellDetail(idx, level) {
  const names = ['Обычная','Необычная','Редкая','Эпическая','Легендарная'];
  const num = level.toString().padStart(2, '0');
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
<div class="modal-content">
  <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
  <div class="dumbbell-preview"><img src="assets/dumbbell-${num}.png" class="db-img-lg" draggable="false"></div>
  <div class="dumbbell-name">Гантель ${names[level-1] || ''}</div>
  <div class="dumbbell-level">Уровень ${level}</div>
  <div class="dumbbell-actions">
    <button class="btn-sell" onclick="sellDumbbell(${idx}, ${level}); this.closest('.modal-overlay').remove()">Продать за 🍌 ${level * 50}</button>
    <button onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
  </div>
</div>`;
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function sellDumbbell(idx, level) {
  if (state.grid[idx] === 0) return;
  const price = level * 50;
  state.bananas += price;
  state.grid[idx] = 0;
  haptic('collect');
  toast(`Продано за ${price} 🍌`);
  sync();
  render();
}

function showBananaCounter() {
  toast(`🍌 ${state.bananas.toFixed(0)} бананов`);
}

function showGorillaDetail(idx) {
  const g = state.gorillas[idx];
  if (!g) return;
  const r = getRarity(g.rarity);
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
<div class="modal-content">
  <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
  <div class="gorilla-detail-card" style="border-color:${r.color}">
    <div class="gorilla-detail-name">${g.name}</div>
    <div class="gorilla-detail-rarity" style="color:${r.color}">${r.name}</div>
    <div class="gorilla-detail-level">Уровень ${g.level}/5</div>
    <div class="gorilla-detail-stats">
      <div>🍌 Тапов: ${g.tapCount}</div>
      <div>🏋️ Тренировок: ${g.earnedDumbbells > 0 ? Math.floor(g.earnedDumbbells / 10) : 0}</div>
      <div>📊 Корм: ${g.feed.toFixed(0)}%</div>
    </div>
  </div>
</div>`;
  document.body.appendChild(overlay);
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

function showLotDetail(lotId) {
  toast(`Лот #${lotId} - скоро`);
}

function showBottomSheet(title, content) {
  const sheet = document.createElement('div');
  sheet.className = 'bottom-sheet';
  sheet.innerHTML = `
<div class="bottom-sheet-content">
  <div class="bottom-sheet-handle"></div>
  <div class="bottom-sheet-title">${title}</div>
  <div class="bottom-sheet-body">${content}</div>
</div>`;
  document.body.appendChild(sheet);
  setTimeout(() => sheet.classList.add('open'), 10);
  const closeSheet = () => {
    sheet.classList.remove('open');
    setTimeout(() => sheet.remove(), 300);
  };
  sheet.addEventListener('click', (e) => { if (e.target === sheet) closeSheet(); });
}

function showTutorial() {
  if (state.tutorialDone) return;
  const steps = [
    {
      title: 'Шаг 1',
      text: 'Привет! Я твоя горилла-гайд! Нажимай на гориллу, чтобы кормить её бананами. 🍌',
      target: '#gorilla-container',
      pointer: 'bottom',
      spotlight: true
    },
    {
      title: 'Шаг 2',
      text: 'Переключайся на вкладку с гантелями. Здесь можно объединять и продавать их за бананы! 💪',
      target: '[data-tab="inventory"]',
      pointer: 'top',
      spotlight: true
    },
    {
      title: 'Шаг 3',
      text: 'Корми гориллу до 100%, заполняя шкалу корма! 🍌',
      target: '.feed-bar-container',
      pointer: 'bottom',
      spotlight: true
    },
    {
      title: 'Шаг 4',
      text: 'Когда шкала полная — отправь гориллу на тренировку! Она принесёт 10 гантелей! 🏋️',
      target: '#train-btn',
      pointer: 'top',
      spotlight: true
    },
    {
      title: 'Шаг 5',
      text: 'Собери гантели — они прилетят на поле для слияния! 🎯',
      target: '.floating-dumbbells-container',
      pointer: 'bottom',
      spotlight: true
    },
    {
      title: 'Шаг 6',
      text: 'Каждый тап даёт 0.01 $MASON. В конце сезона будет листинг — твои монеты превратятся в реальную стоимость! ⚖',
      target: '.mason-earned',
      pointer: 'top',
      spotlight: true
    }
  ];

  if (state.tutorialStep >= steps.length) return;
  const step = steps[state.tutorialStep];

  const existing = document.querySelector('.tutorial-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'tutorial-overlay';
  overlay.innerHTML = `
<div class="tutorial-backdrop"></div>
<div class="tutorial-hand" id="tutorial-hand">👇</div>
<div class="tutorial-card">
  <div class="tutorial-title">${step.title}</div>
  <div class="tutorial-text">${step.text}</div>
  <div class="tutorial-actions">
    <button class="tutorial-skip" onclick="closeTutorial()">Пропустить</button>
    <button class="tutorial-next" onclick="nextTutorialStep()">${state.tutorialStep === steps.length - 1 ? 'Готово!' : 'Далее'}</button>
  </div>
</div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));

  if (step.target) {
    const targetEl = document.querySelector(step.target);
    if (targetEl) {
      positionTutorial(overlay, targetEl, step);
    }
  }
}

function positionTutorial(overlay, targetEl, step) {
  const card = overlay.querySelector('.tutorial-card');
  const hand = overlay.querySelector('.tutorial-hand');
  if (!card) return;
  const targetRect = targetEl.getBoundingClientRect();

  // Position card near target
  const cardW = 280;
  let cardTop, cardLeft;
  if (step.pointer === 'top') {
    cardTop = Math.max(10, targetRect.top - 90);
    cardLeft = Math.max(10, Math.min(targetRect.left + targetRect.width / 2 - cardW / 2, window.innerWidth - cardW - 10));
  } else {
    cardTop = Math.min(window.innerHeight - 100, targetRect.bottom + 10);
    cardLeft = Math.max(10, Math.min(targetRect.left + targetRect.width / 2 - cardW / 2, window.innerWidth - cardW - 10));
    if (cardTop < targetRect.bottom + 10) cardTop = targetRect.bottom + 10;
  }

  card.style.position = 'fixed';
  card.style.top = cardTop + 'px';
  card.style.left = cardLeft + 'px';

  // Position hand near target
  if (hand) {
    let hx = targetRect.left + targetRect.width / 2 - 18;
    let hy;
    if (step.pointer === 'top') {
      hy = targetRect.top - 40;
    } else {
      hy = targetRect.bottom + 5;
    }
    hand.style.left = hx + 'px';
    hand.style.top = hy + 'px';
  }

  // Spotlight backdrop
  const backdrop = overlay.querySelector('.tutorial-backdrop');
  if (backdrop && step.spotlight) {
    const r = targetEl.getBoundingClientRect();
    backdrop.style.setProperty('--spotlight-x', (r.left + r.width / 2) + 'px');
    backdrop.style.setProperty('--spotlight-y', (r.top + r.height / 2) + 'px');
    backdrop.style.setProperty('--spotlight-r', Math.max(r.width, r.height) / 2 + 16 + 'px');
  }
}

function nextTutorialStep() {
  state.tutorialStep++;
  if (state.tutorialStep >= 6) {
    closeTutorial();
    return;
  }
  showTutorial();
}

function closeTutorial() {
  const overlay = document.querySelector('.tutorial-overlay');
  if (overlay) overlay.remove();
  state.tutorialDone = true;
  state.tutorialStep = 0;
  localStorage.setItem('gm_tutorial_done', '1');
}

function checkTutorial() {
  if (state.tutorialDone) return;
  const done = localStorage.getItem('gm_tutorial_done');
  if (done) { state.tutorialDone = true; return; }
  if (state.totalTaps < 2) {
    showTutorial();
  }
}

function render() {
  const screens = { gorillas, inventory, market, quests, clan };
  const screenEl = $('#screen');
  if (screenEl && screens[state.tab]) screenEl.innerHTML = screens[state.tab]();

  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
  sync();
  if (state.tab === 'gorillas') bindGorillaScreen();
  if (state.tab === 'inventory') bindGrid();
  if (state.tab === 'market') bindMarket();
  if (state.tab === 'quests') bindQuests();
  updateBadges();
  if (!state.tutorialDone && state.totalTaps < 3) checkTutorial();
}

function init() {
  state.userId = getOrCreateUserId();
  generateLockedCells();
  initWallet();

  const done = localStorage.getItem('gm_tutorial_done');
  if (done) state.tutorialDone = true;

  loadStateFromFirebase(state.userId);

  const navBtns = document.querySelectorAll('.bottom-nav button');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.tab = btn.dataset.tab;
      render();
    });
  });

  render();

  setInterval(() => { saveState(); }, 30000);

  setInterval(() => {
    const g = state.gorillas[state.gorillaIndex];
    if (g && g.trainingEnd > 0 && g.trainingEnd <= Date.now()) {
      render();
    }
  }, 1000);

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-tab]');
    if (target && target.dataset.tab) {
      state.tab = target.dataset.tab;
      render();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

function resetGame() {
  if (!confirm('Сбросить весь прогресс? Это действие нельзя отменить.')) return;
  localStorage.removeItem('gm_state');
  localStorage.removeItem('gm_tutorial_done');
  state.bananas = 100;
  state.gems = 0;
  state.ape = 0;
  state.mason = 0;
  state.grid = [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  state.gridCounts = [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  state.queue = [1];
  state.gorillas = [{ id: 'g0', name: 'БРУНО', rarity: 0, level: 1, feed: 0, tapCount: 0, tapsForLevel: 50, trainingEnd: 0, earnedDumbbells: 0, equipped: null }];
  state.gorillaIndex = 0;
  state.totalTaps = 0;
  state.totalTrainingSends = 0;
  state.totalBananasEarned = 0;
  state.tutorialDone = false;
  state.tutorialStep = 0;
  state.floatingDumbbells = [];
  for (const q of state.quests) { q.progress = 0; q.claimed = false; }
  toast('Прогресс сброшен! Добро пожаловать заново 🦍');
  render();
  setTimeout(() => checkTutorial(), 500);
}

window.state = state;
window.tapGorilla = tapGorilla;
window.sendToTraining = sendToTraining;
window.collectTraining = collectTraining;
window.mergeGorillas = mergeGorillas;
window.buyGorilla = buyGorilla;
window.changeGorilla = changeGorilla;
window.sellDumbbell = sellDumbbell;
window.showGorillaDetail = showGorillaDetail;
window.claimQuest = claimQuest;
window.placeFromQueue = placeFromQueue;
window.generateQueueItem = generateQueueItem;
window.showBottomSheet = showBottomSheet;
window.showTutorial = showTutorial;
window.nextTutorialStep = nextTutorialStep;
window.closeTutorial = closeTutorial;
window.resetGame = resetGame;
window.render = render;
window.toast = toast;
