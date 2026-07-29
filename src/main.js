const ASSET = 'assets/';

window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();

import { loadUserData, saveUserData } from './firebase.js';
import { initWallet, connectWallet, disconnectWallet, isWalletConnected, getWalletAddress, setStatusChangeHandler } from './wallet.js';

const RARITIES = [
  { id: 'common', name: 'Common', color: '#9e9e9e', glow: '#9e9e9e33', cost: 0, img: 'gorilla-01.png' },
  { id: 'uncommon', name: 'Uncommon', color: '#4caf50', glow: '#4caf5033', cost: 100, img: 'gorilla-01.png' },
  { id: 'rare', name: 'Rare', color: '#2196f3', glow: '#2196f333', cost: 300, img: 'gorilla-02.png' },
  { id: 'epic', name: 'Epic', color: '#9c27b0', glow: '#9c27b033', cost: 800, img: 'gorilla-02.png' },
  { id: 'legendary', name: 'Legendary', color: '#ff9800', glow: '#ff980033', cost: 2000, img: 'gorilla-03.png' },
  { id: 'mythic', name: 'Mythic', color: '#e91e63', glow: '#e91e6333', cost: 5000, img: 'gorilla-03.png' },
  { id: 'ancient', name: 'Ancient', color: '#00bcd4', glow: '#00bcd433', cost: 12000, img: 'gorilla-03.png' },
  { id: 'divine', name: 'Divine', color: '#ffc107', glow: '#ffc10733', cost: 30000, img: 'gorilla-03.png' },
  { id: 'secret', name: 'Secret', color: '#e0e0e0', glow: '#e0e0e033', cost: 80000, img: 'gorilla-03.png' },
  { id: 'cosmic', name: 'Cosmic', color: '#7c4dff', glow: '#7c4dff55', cost: 200000, img: 'gorilla-03.png' }
];

const GORILLA_SHOP = [
  { id: 'g1', name: 'КИБОРГ', rarity: 0, price: 100 },
  { id: 'g2', name: 'НИНДЗЯ', rarity: 1, price: 300 },
  { id: 'g3', name: 'БРУНО', rarity: 2, price: 800 },
  { id: 'g4', name: 'АРХИМАГ', rarity: 3, price: 2000 },
  { id: 'g5', name: 'ТИТАН', rarity: 4, price: 5000 },
  { id: 'g6', name: 'ДРАКОН', rarity: 5, price: 12000 },
  { id: 'g7', name: 'ФЕНИКС', rarity: 6, price: 30000 },
  { id: 'g8', name: 'ДЕМОН', rarity: 7, price: 80000 },
  { id: 'g9', name: 'КОСМИЧЕСКИЙ', rarity: 8, price: 200000 },
  { id: 'g10', name: 'ЛЕГЕНДА', rarity: 9, price: 500000 }
];

const MARKET_LOTS = [
  { id: 'lot1', gorillaId: 'g1', name: 'КИБОРГ', rarity: 0, level: 3, bid: 150, timer: 3600 },
  { id: 'lot2', gorillaId: 'g2', name: 'НИНДЗЯ', rarity: 1, level: 5, bid: 450, timer: 7200 },
  { id: 'lot3', gorillaId: 'g3', name: 'БРУНО', rarity: 2, level: 8, bid: 1200, timer: 1800 },
  { id: 'lot4', gorillaId: 'g4', name: 'АРХИМАГ', rarity: 3, level: 2, bid: 3000, timer: 5400 },
  { id: 'lot5', gorillaId: 'g5', name: 'ТИТАН', rarity: 4, level: 1, bid: 7500, timer: 9000 }
];

const DUMBELL_NAMES = {
  1: 'Железная', 2: 'Стальная', 3: 'Серебряная', 4: 'Золотая',
  5: 'Рубиновая', 6: 'Сапфировая', 7: 'Изумрудная', 8: 'Алмазная',
  9: 'Космическая', 10: 'Легендарная'
};

const TUTORIAL_STEPS = [
  {
    target: '.gorilla-main-img',
    side: 'right',
    title: 'Привет! Я твой горилла-гаид! 🦍',
    text: 'Добро пожаловать в Gorilla Merge! Я буду помогать тебе разобраться. Нажми далее чтобы продолжить.',
    gorilla: 'happy'
  },
  {
    target: '.grid',
    side: 'bottom',
    title: 'Игровое поле 7×7',
    text: 'Здесь ты соединяешь одинаковые гантели. Перетащи одну на другую — они станут сильнее и дадут бананы!',
    gorilla: 'point'
  },
  {
    target: '.btn-feed',
    side: 'bottom',
    title: 'Корми горилл!',
    text: 'Нажми кнопку чтобы накормить гориллу. За 75 бананов ты получаешь +10% прогресса. Когда прогресс reaching 100% — уровень растёт!',
    gorilla: 'happy'
  },
  {
    target: '.shop-list',
    side: 'left',
    title: 'Магазин горилл',
    text: 'Покупай новых горилл разной редкости. Чем выше редкость — тем мощнее бонусы!',
    gorilla: 'point'
  },
  {
    target: '.queue-card',
    side: 'top',
    title: 'Очередь гантелей',
    text: 'Нажми на гантель в очереди чтобы положить её на поле. Новые гантели появляются автоматически!',
    gorilla: 'happy'
  }
];

const state = {
  tab: 'inventory',
  bananas: 1280,
  gems: 42,
  grid: [1,1,2,2,3,3,4,4,0,1,0,2,0,3,0,0,4,0,0,1,0,2,0,0,3,0,0,4,0,0,1,0,0,2,0,0,3,0,0,4,0,0,1,0,0,2,0,0,3],
  queue: [1,1,2,1],
  gorillas: [
    { id: 'g3', name: 'БРУНО', rarity: 2, level: 7, feed: 62, cooldownEnd: 0, equipped: null }
  ],
  gorillaIndex: 0,
  gorillaShopSort: 'rarity',
  marketTab: 'all',
  quests: [
    { id: 'q1', icon: '🔗', title: 'Соедини гантели 50 раз', progress: 30, total: 50, reward: 5, rewardType: 'gems', claimed: false },
    { id: 'q2', icon: '🍌', title: 'Накорми горилл 10 раз', progress: 4, total: 10, reward: 100, rewardType: 'bananas', claimed: false },
    { id: 'q3', icon: '⚡', title: 'Собери 500 бананов', progress: 500, total: 500, reward: 5, rewardType: 'gems', claimed: true }
  ],
  mergeCount: 0,
  feedCount: 0,
  totalBananasEarned: 0,
  userId: '',
  walletConnected: false,
  walletAddr: '',
  tutorialStep: 0,
  tutorialDone: false
};

const $ = s => document.querySelector(s);
const image = l => ASSET + 'dumbbell-' + String(l).padStart(2, '0') + '.png';

function sync() {
  const bEl = $('#bananas');
  const gEl = $('#gems');
  if (bEl) animateValue(bEl, parseInt(bEl.textContent) || 0, state.bananas, 400);
  if (gEl) animateValue(gEl, parseInt(gEl.textContent) || 0, state.gems, 400);
}

function toast(msg) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function buzz() {
  navigator.vibrate?.(25);
}

function haptic(type) {
  try {
    if (type === 'merge') {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium');
    } else if (type === 'claim') {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success');
    } else if (type === 'tab') {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
    } else if (type === 'feed') {
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
    } else if (type === 'error') {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error');
    } else {
      window.Telegram?.WebApp?.HapticFeedback?.[type]?.();
    }
  } catch (e) {}
}

function item(level, extra = '') {
  if (level === 0) return '';
  return `<img src="${image(level)}" class="dumbbell${extra}" draggable="false" />`;
}

function getRarity(r) {
  return RARITIES[r] || RARITIES[0];
}

function getGorillaImg(rarity) {
  return ASSET + RARITIES[rarity].img;
}

function animateValue(el, start, end, duration) {
  if (start === end) { el.textContent = end; return; }
  const range = end - start;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + range * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

function getOrCreateUserId() {
  let uid = localStorage.getItem('gm_uid');
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('gm_uid', uid);
  }
  return uid;
}

function inventory() {
  const lockedCells = [6, 13, 20, 27, 34, 41, 42, 43, 44, 45, 46, 47, 48];
  let gridHtml = '';
  for (let i = 0; i < 49; i++) {
    const lv = state.grid[i] || 0;
    const locked = lockedCells.includes(i);
    if (locked) {
      gridHtml += `<div class="cell locked" data-idx="${i}"></div>`;
    } else {
      gridHtml += `<div class="cell${lv ? '' : ''}" data-idx="${i}">${lv ? `<span class="level-badge">${lv}</span>${item(lv)}` : ''}</div>`;
    }
  }
  let queueHtml = state.queue.map((lv, i) =>
    `<div class="q-item" data-qidx="${i}">${item(lv)}<span class="q-timer">${i === 0 ? 'Готово' : '02:' + String(27 + i * 3).padStart(2, '0')}</span></div>`
  ).join('');

  return `
    <div class="inventory-head">
      <div class="inventory-title">INVENTORY</div>
      <span class="tag">7×7</span>
    </div>
    <div class="grid" id="merge-grid">${gridHtml}</div>
    <p class="hint">Перетащи одинаковые гантели чтобы соединить</p>
    <div class="queue-card">
      <div class="queue-label">СЛЕДУЮЩАЯ ГАНТЕЛЬ · В ОЧЕРЕДИ ЕЩЁ ${state.queue.length}</div>
      <div class="queue-items" id="queue-items">${queueHtml}</div>
    </div>`;
}

function bindGrid() {
  const cells = document.querySelectorAll('#merge-grid .cell:not(.locked)');
  let dragIdx = null;
  let dragClone = null;
  let dragStart = null;
  let highlightCells = [];

  function clearHighlights() {
    highlightCells.forEach(c => c.classList.remove('merge-hint'));
    highlightCells = [];
  }

  function showMergeHints(level) {
    clearHighlights();
    cells.forEach(c => {
      const idx = parseInt(c.dataset.idx);
      if (state.grid[idx] === level && idx !== dragIdx) {
        c.classList.add('merge-hint');
        highlightCells.push(c);
      }
    });
  }

  function createDragClone(cell, x, y) {
    const lv = state.grid[parseInt(cell.dataset.idx)];
    if (!lv) return null;
    const clone = document.createElement('div');
    clone.className = 'drag-clone';
    clone.innerHTML = `<img src="${image(lv)}" class="drag-clone-img" /><span class="drag-clone-level">${lv}</span>`;
    clone.style.left = (x - 30) + 'px';
    clone.style.top = (y - 30) + 'px';
    document.body.appendChild(clone);
    return clone;
  }

  function moveDragClone(x, y) {
    if (!dragClone) return;
    dragClone.style.left = (x - 30) + 'px';
    dragClone.style.top = (y - 30) + 'px';
  }

  function removeDragClone() {
    if (dragClone) { dragClone.remove(); dragClone = null; }
  }

  cells.forEach(cell => {
    cell.addEventListener('pointerdown', e => {
      const idx = parseInt(cell.dataset.idx);
      if (!state.grid[idx]) return;
      dragIdx = idx;
      dragStart = { x: e.clientX, y: e.clientY };
      cell.classList.add('dragging');
      dragClone = createDragClone(cell, e.clientX, e.clientY);
      showMergeHints(state.grid[idx]);
      e.preventDefault();
    });

    cell.addEventListener('pointermove', e => {
      if (dragIdx === null) return;
      moveDragClone(e.clientX, e.clientY);
      e.preventDefault();
    });

    cell.addEventListener('pointerup', e => {
      if (dragIdx === null) return;
      const targetIdx = parseInt(cell.dataset.idx);
      const targetCell = document.querySelector(`#merge-grid .cell[data-idx="${targetIdx}"]`);
      if (targetCell && targetCell.classList.contains('locked')) {
        dragIdx = null;
        removeDragClone();
        clearHighlights();
        cell.classList.remove('dragging');
        return;
      }
      const dx = e.clientX - (dragStart?.x || 0);
      const dy = e.clientY - (dragStart?.y || 0);
      const moved = Math.abs(dx) + Math.abs(dy);

      if (dragIdx === targetIdx && moved < 10) {
        showDumbbellDetail(state.grid[dragIdx]);
        dragIdx = null;
        removeDragClone();
        clearHighlights();
        cell.classList.remove('dragging');
        return;
      }
      tryMerge(dragIdx, targetIdx);
      dragIdx = null;
      removeDragClone();
      clearHighlights();
      cells.forEach(c => c.classList.remove('dragging'));
    });

    cell.addEventListener('pointercancel', () => {
      dragIdx = null;
      removeDragClone();
      clearHighlights();
      cells.forEach(c => c.classList.remove('dragging'));
    });
  });

  document.addEventListener('pointermove', e => {
    if (dragIdx !== null) {
      moveDragClone(e.clientX, e.clientY);
    }
  });

  document.addEventListener('pointerup', () => {
    if (dragIdx !== null) {
      dragIdx = null;
      removeDragClone();
      clearHighlights();
      cells.forEach(c => c.classList.remove('dragging'));
    }
  });

  const queueItems = document.querySelectorAll('#queue-items .q-item');
  queueItems.forEach(qi => {
    qi.addEventListener('click', () => {
      const qidx = parseInt(qi.dataset.qidx);
      placeFromQueue(qidx);
    });
  });
}

function tryMerge(a, b) {
  const lockedCells = [6, 13, 20, 27, 34, 41, 42, 43, 44, 45, 46, 47, 48];
  if (lockedCells.includes(b)) return;
  const lvA = state.grid[a];
  const lvB = state.grid[b];
  if (lvA === 0 || lvB === 0) return;
  if (lvA !== lvB) return;
  if (lvA >= 10) return;

  state.grid[b] = lvA + 1;
  state.grid[a] = 0;

  const earned = lvA * 5;
  state.bananas += earned;
  state.totalBananasEarned += earned;
  state.mergeCount++;

  haptic('merge');
  buzz();
  toast(`+${earned} 🍌`);

  updateQuestProgress('merge');
  updateQuestProgress('bananas');
  render();
}

function placeFromQueue(qidx) {
  const lockedCells = [6, 13, 20, 27, 34, 41, 42, 43, 44, 45, 46, 47, 48];
  let emptyIdx = -1;
  for (let i = 0; i < 49; i++) {
    if (state.grid[i] === 0 && !lockedCells.includes(i)) { emptyIdx = i; break; }
  }
  if (emptyIdx === -1) { toast('Сетка заполнена!'); return; }
  state.grid[emptyIdx] = state.queue[qidx];
  state.queue.splice(qidx, 1);
  generateQueueItem();
  haptic('tab');
  render();
}

function generateQueueItem() {
  const maxLv = Math.min(10, Math.floor(state.mergeCount / 5) + 2);
  state.queue.push(Math.ceil(Math.random() * maxLv));
}

function gorillas() {
  const owned = state.gorillas;
  const current = owned[state.gorillaIndex] || null;

  let shopHtml = GORILLA_SHOP.map(g => {
    const r = getRarity(g.rarity);
    const ownedIdx = owned.findIndex(o => o.id === g.id);
    const isOwned = ownedIdx >= 0;
    return `
      <div class="shop-card" data-gid="${g.id}">
        <div class="shop-img-wrap" style="box-shadow:0 0 20px ${r.glow}, inset 0 0 20px ${r.glow};border:2px solid ${r.color};">
          <img src="${getGorillaImg(g.rarity)}" class="shop-img" draggable="false" />
        </div>
        <div class="shop-info">
          <div class="shop-name" style="color:${r.color}">${g.name}</div>
          <div class="rarity-badge" style="background:${r.color}">${r.name}</div>
          <div class="shop-price">${g.price} 🍌</div>
        </div>
        <button class="btn-buy${isOwned ? ' owned' : ''}" data-buy="${g.id}" ${isOwned ? 'disabled' : ''}>
          ${isOwned ? '✓' : 'КУПИТЬ'}
        </button>
      </div>`;
  }).join('');

  let carouselHtml = '';
  if (owned.length > 0) {
    carouselHtml = `
      <div class="gorilla-carousel-wrap" id="gorilla-carousel">
        ${owned.map((g, i) => {
          const r = getRarity(g.rarity);
          const feedPct = Math.min(100, g.feed);
          const onCooldown = g.cooldownEnd > Date.now();
          const cdLeft = onCooldown ? Math.ceil((g.cooldownEnd - Date.now()) / 1000) : 0;
          return `
            <div class="gorilla-card rarity-${r.id}" data-gidx="${i}">
              <div class="gorilla-level-badge">LVL ${g.level} · ${r.name.toUpperCase()}</div>
              <div class="gorilla-img-wrap">
                <img src="${getGorillaImg(g.rarity)}" class="gorilla-main-img" draggable="false" />
              </div>
              <div class="gorilla-name" style="color:${r.color}">${g.name}</div>
              <div class="feed-bar-wrap">
                <div class="feed-bar" style="width:${feedPct}%;background:${r.color}"></div>
                <span class="feed-pct">${feedPct}%</span>
              </div>
              <button class="btn-feed${onCooldown ? ' cooldown' : ''}" data-feed="${i}" ${onCooldown ? 'disabled' : ''}>
                ${onCooldown ? `СБРОС ЧЕРЕЗ ${formatTime(cdLeft)}` : '🍽 КОРМИТЬ 🍌 75'}
              </button>
              ${onCooldown ? `<div class="cooldown-overlay"><div class="timer">${formatTime(cdLeft)}</div><div class="label">Кулдаун кормления</div></div>` : ''}
            </div>`;
        }).join('')}
      </div>
      <div class="carousel-dots" id="carousel-dots">
        ${owned.map((_, i) => `<div class="carousel-dot${i === state.gorillaIndex ? ' active' : ''}" data-dot="${i}"></div>`).join('')}
      </div>
      <div class="carousel-arrow-row">
        <button class="arrow-left" data-arrow="left">◀</button>
        <span class="carousel-index">${state.gorillaIndex + 1} / ${owned.length}</span>
        <button class="arrow-right" data-arrow="right">▶</button>
      </div>`;
  } else {
    carouselHtml = `
      <div class="gorilla-empty">
        <div class="empty-lock">🔒</div>
        <p>Нет горилл</p>
        <button class="unlock-btn" data-buy="g1">ПОЛУЧИТЬ НОВЫЙ СЛОТ ⭐ 100</button>
      </div>`;
  }

  return `
    <div class="gorillas-section">
      <div class="section-title">МАГАЗИН</div>
      <div class="shop-list">${shopHtml}</div>
    </div>
    <div class="gorillas-section">
      <div class="section-title">МОИ ГОРИЛЛЫ</div>
      <div class="carousel" id="gorilla-carousel">${carouselHtml}</div>
    </div>`;
}

function bindGorillas() {
  document.querySelectorAll('.btn-buy').forEach(btn => {
    btn.addEventListener('click', () => {
      const gid = btn.dataset.buy;
      buyGorilla(gid);
    });
  });

  document.querySelectorAll('.shop-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-buy')) return;
      const gid = card.dataset.gid;
      const shopItem = GORILLA_SHOP.find(g => g.id === gid);
      if (shopItem) showGorillaDetail(shopItem);
    });
  });

  document.querySelectorAll('.gorilla-main-img').forEach(img => {
    img.addEventListener('click', () => {
      const card = img.closest('.gorilla-card');
      if (!card) return;
      const gidx = parseInt(card.dataset.gidx);
      const g = state.gorillas[gidx];
      if (g) {
        const shopItem = GORILLA_SHOP.find(s => s.id === g.id) || { id: g.id, name: g.name, rarity: g.rarity, price: 0 };
        showGorillaDetail(shopItem);
      }
    });
  });

  document.querySelectorAll('.btn-feed').forEach(btn => {
    btn.addEventListener('click', () => {
      const gidx = parseInt(btn.dataset.feed);
      feedGorilla(gidx);
    });
  });

  document.querySelectorAll('[data-arrow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.arrow;
      if (dir === 'left') {
        state.gorillaIndex = Math.max(0, state.gorillaIndex - 1);
      } else {
        state.gorillaIndex = Math.min(state.gorillas.length - 1, state.gorillaIndex + 1);
      }
      haptic('tab');
      scrollToGorilla();
    });
  });

  document.querySelectorAll('.carousel-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      state.gorillaIndex = parseInt(dot.dataset.dot);
      haptic('tab');
      scrollToGorilla();
    });
  });

  const carousel = document.getElementById('gorilla-carousel');
  if (carousel) {
    let scrollTimeout;
    carousel.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const cardWidth = carousel.firstElementChild?.offsetWidth || 300;
        const gap = 12;
        const newIndex = Math.round(carousel.scrollLeft / (cardWidth + gap));
        if (newIndex !== state.gorillaIndex && newIndex >= 0 && newIndex < state.gorillas.length) {
          state.gorillaIndex = newIndex;
          updateDots();
        }
      }, 100);
    });
  }

  scrollToGorilla();
}

function scrollToGorilla() {
  const carousel = document.getElementById('gorilla-carousel');
  if (!carousel) return;
  const card = carousel.children[state.gorillaIndex];
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  updateDots();
}

function updateDots() {
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === state.gorillaIndex);
  });
  const idxEl = document.querySelector('.carousel-index');
  if (idxEl) idxEl.textContent = `${state.gorillaIndex + 1} / ${state.gorillas.length}`;
}

function buyGorilla(gid) {
  const shopItem = GORILLA_SHOP.find(g => g.id === gid);
  if (!shopItem) return;
  if (state.gorillas.find(g => g.id === gid)) { toast('Уже куплено!'); return; }
  if (state.bananas < shopItem.price) { toast('Недостаточно бананов!'); haptic('error'); return; }

  state.bananas -= shopItem.price;
  state.gorillas.push({
    id: shopItem.id,
    name: shopItem.name,
    rarity: shopItem.rarity,
    level: 1,
    feed: 0,
    cooldownEnd: 0,
    equipped: null
  });

  haptic('claim');
  toast(`Куплено: ${shopItem.name}!`);
  render();
}

function feedGorilla(gidx) {
  const g = state.gorillas[gidx !== undefined ? gidx : state.gorillaIndex];
  if (!g) return;
  if (g.cooldownEnd > Date.now()) { toast('На кулдауне!'); return; }
  if (state.bananas < 75) { toast('Недостаточно бананов!'); haptic('error'); return; }

  state.bananas -= 75;
  g.feed += 10;
  state.feedCount++;

  if (g.feed >= 100) {
    g.level++;
    g.feed = 0;
    toast(`${g.name}提升了等级到 ${g.level}!`);
    haptic('claim');
  } else {
    haptic('feed');
    toast(`+10% к прогрессу`);
  }

  if (state.feedCount % 5 === 0) {
    g.cooldownEnd = Date.now() + 5 * 60 * 1000;
  }

  updateQuestProgress('feed');
  render();
}

function market() {
  const tabs = ['all', 'uncom', 'rare', 'epic', 'leg', 'mymarket'];
  const tabLabels = ['Все', 'Uncom', 'Rare', 'Epic', 'Leg', 'Мой'];

  let filtered = MARKET_LOTS;
  if (state.marketTab === 'uncom') filtered = MARKET_LOTS.filter(l => l.rarity === 1);
  else if (state.marketTab === 'rare') filtered = MARKET_LOTS.filter(l => l.rarity === 2);
  else if (state.marketTab === 'epic') filtered = MARKET_LOTS.filter(l => l.rarity === 3);
  else if (state.marketTab === 'leg') filtered = MARKET_LOTS.filter(l => l.rarity === 4);
  else if (state.marketTab === 'mymarket') filtered = [];

  let lotsHtml = filtered.map(lot => {
    const r = getRarity(lot.rarity);
    const sold = lot.timer <= 0;
    return `
      <div class="lot-card${sold ? ' sold' : ''}" data-lot="${lot.id}">
        <div class="lot-img-wrap" style="border:2px solid ${r.color};box-shadow:0 0 15px ${r.glow};">
          <img src="${getGorillaImg(lot.rarity)}" class="lot-img" draggable="false" />
        </div>
        <div class="lot-info">
          <div class="lot-name" style="color:${r.color}">${lot.name}</div>
          <div class="rarity-badge" style="background:${r.color}">${r.name}</div>
          <div class="lot-level">Ур. ${lot.level}</div>
          <div class="lot-timer">${sold ? 'ПРОДАНО' : formatTime(lot.timer)}</div>
          <div class="lot-bid">${lot.bid} 🍌</div>
        </div>
        <button class="btn-bid${sold ? ' disabled' : ''}" data-bid="${lot.id}" ${sold ? 'disabled' : ''}>
          ${sold ? '—' : 'СТАВКА'}
        </button>
      </div>`;
  }).join('');

  if (filtered.length === 0) {
    lotsHtml = '<div class="empty-market">Нет лотов</div>';
  }

  let walletSection = '';
  if (state.walletConnected) {
    walletSection = `
      <div class="wallet-section">
        <div class="wallet-addr">${state.walletAddr.slice(0, 6)}...${state.walletAddr.slice(-4)}</div>
        <button class="btn-disconnect" id="btn-disconnect">Отключить</button>
      </div>`;
  } else {
    walletSection = `
      <div class="wallet-section">
        <button class="btn-connect" id="btn-connect">Подключить кошелёк</button>
      </div>`;
  }

  return `
    <div class="market-tabs">
      ${tabs.map((t, i) => `<button class="mtab${state.marketTab === t ? ' active' : ''}" data-mtab="${t}">${tabLabels[i]}</button>`).join('')}
    </div>
    <div class="lot-list">${lotsHtml}</div>
    ${walletSection}`;
}

function bindMarket() {
  document.querySelectorAll('.mtab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.marketTab = btn.dataset.mtab;
      haptic('tab');
      render();
    });
  });

  document.querySelectorAll('.btn-bid').forEach(btn => {
    btn.addEventListener('click', () => {
      const lotId = btn.dataset.bid;
      placeBid(lotId);
    });
  });

  document.querySelectorAll('.lot-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.btn-bid')) return;
      const lotId = card.dataset.lot;
      showLotDetail(lotId);
    });
  });

  const connectBtn = document.getElementById('btn-connect');
  if (connectBtn) {
    connectBtn.addEventListener('click', () => connectWallet());
  }

  const disconnectBtn = document.getElementById('btn-disconnect');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => disconnectWallet());
  }
}

function placeBid(lotId) {
  const lot = MARKET_LOTS.find(l => l.id === lotId);
  if (!lot || lot.timer <= 0) return;

  const bidCost = Math.floor(lot.bid * 0.5);
  if (state.bananas < bidCost) { toast('Недостаточно бананов!'); haptic('error'); return; }

  state.bananas -= bidCost;
  lot.bid = Math.floor(lot.bid * 1.5);
  haptic('merge');
  toast(`Ставка: ${lot.bid} 🍌`);
  render();
}

function quests() {
  let html = state.quests.map(q => {
    const pct = Math.min(100, Math.round((q.progress / q.total) * 100));
    const done = q.progress >= q.total;
    const claimable = done && !q.claimed;
    const rewardLabel = q.rewardType === 'gems' ? `${q.reward} 💎` : `${q.reward} 🍌`;

    return `
      <div class="quest-card" data-qid="${q.id}">
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-body">
          <div class="quest-title">${q.title}</div>
          <div class="quest-progress-bar">
            <div class="quest-fill" style="width:${pct}%"></div>
          </div>
          <div class="quest-count">${q.progress}/${q.total}</div>
        </div>
        <div class="quest-reward">${rewardLabel}</div>
        <button class="btn-quest${claimable ? ' claimable' : ''}" data-claim="${q.id}" ${!claimable ? 'disabled' : ''}>
          ${claimable ? 'ЗАБРАТЬ' : done ? 'ЗАБРАНО' : 'В РАБОТЕ'}
        </button>
      </div>`;
  }).join('');

  return `
    <div class="quests-section">
      <div class="section-title">КВЕСТЫ</div>
      <div class="quest-list">${html}</div>
    </div>`;
}

function bindQuests() {
  document.querySelectorAll('.btn-claim').forEach(btn => {
    btn.addEventListener('click', () => {
      const qid = btn.dataset.claim;
      claimQuest(qid);
    });
  });
}

function claimQuest(qid) {
  const q = state.quests.find(q => q.id === qid);
  if (!q || q.claimed || q.progress < q.total) return;

  q.claimed = true;
  if (q.rewardType === 'gems') state.gems += q.reward;
  else state.bananas += q.reward;

  haptic('claim');
  buzz();

  showBottomSheet(`
    <div class="sheet-reward">
      <div class="sheet-icon">${q.icon}</div>
      <div class="sheet-title">Квест выполнен!</div>
      <div class="sheet-desc">${q.title}</div>
      <div class="sheet-amount">+${q.reward} ${q.rewardType === 'gems' ? '💎' : '🍌'}</div>
      <button class="btn-sheet-close" id="sheet-close">ОТЛИЧНО</button>
    </div>
  `);

  render();
}

function clan() {
  return `
    <div class="clan-panel">
      <div class="clan-crest">🦍</div>
      <div class="clan-name">APE MARVEL</div>
      <div class="clan-stats">
        <div class="clan-stat"><span class="stat-val">12</span><span class="stat-lbl">Участники</span></div>
        <div class="clan-stat"><span class="stat-val">156</span><span class="stat-lbl">Уровень</span></div>
        <div class="clan-stat"><span class="stat-val">42</span><span class="stat-lbl">Ранг</span></div>
      </div>
      <div class="clan-progress-wrap">
        <div class="clan-progress-label">Клановый опыт</div>
        <div class="clan-progress-bar">
          <div class="clan-progress-fill" style="width:65%"></div>
        </div>
        <div class="clan-progress-text">650 / 1000</div>
      </div>
      <div class="clan-bonus">Бонус клана: +15% к бананам</div>
    </div>`;
}

function showBottomSheet(content) {
  let overlay = document.getElementById('sheet-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'sheet-overlay';
  overlay.className = 'bottom-sheet-overlay';
  overlay.innerHTML = `<div class="bottom-sheet">${content}</div>`;

  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);

  const closeBtn = document.getElementById('sheet-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => overlay.remove());
  }
}

function updateQuestProgress(type) {
  if (type === 'merge') {
    const q = state.quests.find(q => q.id === 'q1');
    if (q && !q.claimed) q.progress = Math.min(q.total, state.mergeCount);
  }
  if (type === 'feed') {
    const q = state.quests.find(q => q.id === 'q2');
    if (q && !q.claimed) q.progress = Math.min(q.total, state.feedCount);
  }
  if (type === 'bananas') {
    const q = state.quests.find(q => q.id === 'q3');
    if (q && !q.claimed) q.progress = Math.min(q.total, state.totalBananasEarned);
  }
}

function updateBadges() {
  const gorillaBadge = document.querySelector('[data-tab="gorillas"] .badge');
  const questBadge = document.querySelector('[data-tab="quests"] .badge');

  if (gorillaBadge) {
    const cdCount = state.gorillas.filter(g => g.cooldownEnd > Date.now()).length;
    gorillaBadge.textContent = cdCount > 0 ? cdCount : '';
    gorillaBadge.style.display = cdCount > 0 ? '' : 'none';
  }

  if (questBadge) {
    const claimable = state.quests.filter(q => q.progress >= q.total && !q.claimed).length;
    questBadge.textContent = claimable > 0 ? claimable : '';
    questBadge.style.display = claimable > 0 ? '' : 'none';
  }
}

function render() {
  const screens = { inventory, gorillas, market, quests, clan };
  const screenEl = $('#screen');
  if (screenEl && screens[state.tab]) {
    screenEl.innerHTML = screens[state.tab]();
  }

  document.querySelectorAll('.bottom-nav button').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === state.tab);
  });

  sync();

  if (state.tab === 'inventory') bindGrid();
  if (state.tab === 'gorillas') bindGorillas();
  if (state.tab === 'market') bindMarket();
  if (state.tab === 'quests') bindQuests();

  updateBadges();
}

document.addEventListener('click', e => {
  const navBtn = e.target.closest('.bottom-nav button');
  if (navBtn && navBtn.dataset.tab) {
    state.tab = navBtn.dataset.tab;
    haptic('tab');
    render();
    return;
  }
});

function getSerializableState() {
  return {
    bananas: state.bananas,
    gems: state.gems,
    grid: state.grid,
    queue: state.queue,
    gorillas: state.gorillas,
    mergeCount: state.mergeCount,
    feedCount: state.feedCount,
    totalBananasEarned: state.totalBananasEarned,
    quests: state.quests
  };
}

async function loadStateFromFirebase(userId) {
  try {
    const data = await loadUserData(userId);
    if (data) {
      if (data.bananas !== undefined) state.bananas = data.bananas;
      if (data.gems !== undefined) state.gems = data.gems;
      if (data.grid) state.grid = data.grid;
      if (data.queue) state.queue = data.queue;
      if (data.gorillas) state.gorillas = data.gorillas;
      if (data.mergeCount !== undefined) state.mergeCount = data.mergeCount;
      if (data.feedCount !== undefined) state.feedCount = data.feedCount;
      if (data.totalBananasEarned !== undefined) state.totalBananasEarned = data.totalBananasEarned;
      if (data.quests) state.quests = data.quests;
    }
  } catch (e) {
    console.warn('Failed to load from Firebase:', e);
  }
}

// ── TUTORIAL SYSTEM ──

function showTutorial() {
  const step = TUTORIAL_STEPS[state.tutorialStep];
  if (!step) { closeTutorial(); return; }

  let overlay = document.getElementById('tutorial-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    document.body.appendChild(overlay);
  }

  const gorillaImg = ASSET + (step.gorilla === 'happy' ? 'gorilla-02.png' : 'gorilla-03.png');

  overlay.innerHTML = `
    <div class="tutorial-spotlight" data-target="${step.target}"></div>
    <div class="tutorial-hand" data-side="${step.side}">👆</div>
    <div class="tutorial-bubble" data-side="${step.side}">
      <div class="tutorial-gorilla">
        <img src="${gorillaImg}" class="tutorial-gorilla-img" draggable="false" />
      </div>
      <div class="tutorial-text">
        <div class="tutorial-title">${step.title}</div>
        <div class="tutorial-desc">${step.text}</div>
      </div>
    </div>
    <div class="tutorial-controls">
      <span class="tutorial-step">${state.tutorialStep + 1} / ${TUTORIAL_STEPS.length}</span>
      <button class="tutorial-btn tutorial-skip" id="tutorial-skip">Пропустить</button>
      <button class="tutorial-btn tutorial-next" id="tutorial-next">${state.tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Далее →' : 'Начать! 🚀'}</button>
    </div>
  `;

  overlay.classList.add('show');

  requestAnimationFrame(() => positionTutorial(step.target, step.side));

  document.getElementById('tutorial-skip').addEventListener('click', closeTutorial);
  document.getElementById('tutorial-next').addEventListener('click', () => {
    state.tutorialStep++;
    if (state.tutorialStep >= TUTORIAL_STEPS.length) {
      closeTutorial();
    } else {
      showTutorial();
    }
    haptic('tab');
  });
}

function positionTutorial(targetSel, side) {
  const target = document.querySelector(targetSel);
  const spotlight = document.querySelector('.tutorial-spotlight');
  const hand = document.querySelector('.tutorial-hand');
  const bubble = document.querySelector('.tutorial-bubble');

  if (!target || !spotlight) return;

  const rect = target.getBoundingClientRect();
  spotlight.style.top = rect.top + 'px';
  spotlight.style.left = rect.left + 'px';
  spotlight.style.width = rect.width + 'px';
  spotlight.style.height = rect.height + 'px';

  if (hand) {
    const hx = side === 'left' ? rect.left - 40 : side === 'right' ? rect.right + 10 : rect.left + rect.width / 2 - 15;
    const hy = side === 'top' ? rect.top - 50 : side === 'bottom' ? rect.bottom + 10 : rect.top + rect.height / 2 - 15;
    hand.style.left = hx + 'px';
    hand.style.top = hy + 'px';
  }

  if (bubble) {
    const bx = side === 'left' ? rect.left - 10 : side === 'right' ? rect.right + 20 : rect.left + rect.width / 2;
    const by = side === 'top' ? rect.top - 180 : side === 'bottom' ? rect.bottom + 60 : rect.top + rect.height / 2 - 60;
    bubble.style.left = Math.max(10, Math.min(bx, window.innerWidth - 290)) + 'px';
    bubble.style.top = Math.max(10, by) + 'px';
  }
}

function closeTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) overlay.remove();
  state.tutorialDone = true;
  localStorage.setItem('gm_tutorial_done', '1');
}

function checkTutorial() {
  if (!localStorage.getItem('gm_tutorial_done')) {
    setTimeout(() => showTutorial(), 600);
  }
}

// ── ITEM DETAIL POPUPS ──

function showDumbbellDetail(level) {
  const nextLevel = level < 10 ? level + 1 : null;
  const name = DUMBELL_NAMES[level] || `Уровень ${level}`;
  const nextName = nextLevel ? DUMBELL_NAMES[nextLevel] : null;
  const earn = level * 5;

  let pathHtml = '';
  let lv = level;
  while (lv < 10) {
    const n = lv + 1;
    pathHtml += `<div class="path-step">
      <img src="${image(lv)}" class="path-img" />
      <span class="path-arrow">→</span>
      <img src="${image(n)}" class="path-img" />
    </div>`;
    lv = n;
  }

  showBottomSheet(`
    <div class="detail-header">
      <img src="${image(level)}" class="detail-img" />
      <div class="detail-info">
        <div class="detail-name">${name}</div>
        <div class="detail-level">Уровень ${level}</div>
        <div class="detail-earn">+${earn} 🍌 за слияние</div>
      </div>
    </div>
    ${nextLevel ? `
      <div class="detail-section">
        <div class="detail-section-title">Путь улучшения</div>
        <div class="detail-path">
          ${pathHtml}
        </div>
        <div class="detail-note">Соедини 2 одинаковые чтобы получить ${nextName || 'следующий уровень'}</div>
      </div>
    ` : `
      <div class="detail-section">
        <div class="detail-section-title">МАКСИМУМ!</div>
        <div class="detail-note">Это самая сильная гантель! Держи её гордо 💪</div>
      </div>
    `}
    <button class="btn-sheet-close" id="sheet-close">ЗАКРЫТЬ</button>
  `);
}

function showGorillaDetail(shopItem) {
  const r = getRarity(shopItem.rarity);
  const owned = state.gorillas.find(g => g.id === shopItem.id);

  let statsHtml = '';
  if (owned) {
    statsHtml = `
      <div class="detail-stats">
        <div class="detail-stat"><span class="stat-val">${owned.level}</span><span class="stat-lbl">Уровень</span></div>
        <div class="detail-stat"><span class="stat-val">${owned.feed}%</span><span class="stat-lbl">Прогресс</span></div>
        <div class="detail-stat"><span class="stat-val">${owned.cooldownEnd > Date.now() ? '⏳' : '✓'}</span><span class="stat-lbl">Статус</span></div>
      </div>`;
  }

  showBottomSheet(`
    <div class="detail-header">
      <div class="detail-gorilla-frame" style="border:3px solid ${r.color};box-shadow:0 0 25px ${r.glow};">
        <img src="${getGorillaImg(shopItem.rarity)}" class="detail-gorilla-img" />
      </div>
      <div class="detail-info">
        <div class="detail-name" style="color:${r.color}">${shopItem.name}</div>
        <div class="rarity-badge" style="background:${r.color}">${r.name}</div>
        <div class="detail-price">${shopItem.price} 🍌</div>
      </div>
    </div>
    ${statsHtml}
    <div class="detail-section">
      <div class="detail-section-title">Особенности</div>
      <div class="detail-perks">
        <div class="perk">🦴 Кормление: 75 🍌 за +10%</div>
        <div class="perk">⚡ Бонус: x${(shopItem.rarity + 1) * 0.5} к бананам</div>
        <div class="perk">🛡 Защита клана: +${shopItem.rarity * 2}%</div>
      </div>
    </div>
    <div class="detail-section">
      <div class="detail-section-title">Все редкости</div>
      <div class="detail-rarity-list">
        ${RARITIES.map((rr, i) => `<div class="rarity-row${i === shopItem.rarity ? ' active' : ''}" style="border-color:${rr.color}">
          <span class="rarity-dot" style="background:${rr.color}"></span>
          <span>${rr.name}</span>
        </div>`).join('')}
      </div>
    </div>
    <button class="btn-sheet-close" id="sheet-close">ЗАКРЫТЬ</button>
  `);
}

function showLotDetail(lotId) {
  const lot = MARKET_LOTS.find(l => l.id === lotId);
  if (!lot) return;
  const r = getRarity(lot.rarity);
  const sold = lot.timer <= 0;
  const bidCost = Math.floor(lot.bid * 0.5);

  showBottomSheet(`
    <div class="detail-header">
      <div class="detail-gorilla-frame" style="border:3px solid ${r.color};box-shadow:0 0 25px ${r.glow};">
        <img src="${getGorillaImg(lot.rarity)}" class="detail-gorilla-img" />
      </div>
      <div class="detail-info">
        <div class="detail-name" style="color:${r.color}">${lot.name}</div>
        <div class="rarity-badge" style="background:${r.color}">${r.name}</div>
        <div class="detail-level">Уровень ${lot.level}</div>
      </div>
    </div>
    <div class="detail-stats">
      <div class="detail-stat"><span class="stat-val">${formatTime(lot.timer)}</span><span class="stat-lbl">Осталось</span></div>
      <div class="detail-stat"><span class="stat-val">${lot.bid} 🍌</span><span class="stat-lbl">Текущая ставка</span></div>
      <div class="detail-stat"><span class="stat-val">${bidCost} 🍌</span><span class="stat-lbl">Стоимость ставки</span></div>
    </div>
    <button class="btn-sheet-close" id="sheet-close">${sold ? 'ПРОДАНО' : 'СТАВКА ' + bidCost + ' 🍌'}</button>
  `);
}

async function init() {
  state.userId = getOrCreateUserId();
  initWallet();
  setStatusChangeHandler(addr => {
    state.walletConnected = !!addr;
    state.walletAddr = addr || '';
    if (state.tab === 'market') render();
  });

  await loadStateFromFirebase(state.userId);
  render();
  checkTutorial();

  setInterval(() => saveUserData(state.userId, getSerializableState()), 30000);

  setInterval(() => {
    let changed = false;
    MARKET_LOTS.forEach(lot => {
      if (lot.timer > 0) { lot.timer--; changed = true; }
    });
    state.gorillas.forEach(g => {
      if (g.cooldownEnd > Date.now()) changed = true;
    });
    if (changed && (state.tab === 'market' || state.tab === 'gorillas')) render();
  }, 1000);
}

init();
