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
  walletAddr: ''
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
  let gridHtml = '';
  for (let i = 0; i < 49; i++) {
    const lv = state.grid[i] || 0;
    gridHtml += `<div class="cell" data-idx="${i}">${lv ? item(lv) : ''}</div>`;
  }
  let queueHtml = state.queue.map((lv, i) =>
    `<div class="q-item" data-qidx="${i}">${item(lv)}</div>`
  ).join('');

  return `
    <div class="inventory-head">
      <div class="inventory-title">INVENTORY</div>
      <span class="tag">7×7</span>
    </div>
    <div class="grid" id="merge-grid">${gridHtml}</div>
    <p class="hint">Перетащи одинаковые гантели чтобы соединить</p>
    <div class="queue-card">
      <div class="queue-label">ОЧЕРЕДЬ</div>
      <div class="queue-items" id="queue-items">${queueHtml}</div>
    </div>`;
}

function bindGrid() {
  const cells = document.querySelectorAll('#merge-grid .cell');
  let dragIdx = null;

  cells.forEach(cell => {
    cell.addEventListener('pointerdown', e => {
      const idx = parseInt(cell.dataset.idx);
      if (!state.grid[idx]) return;
      dragIdx = idx;
      cell.classList.add('dragging');
      e.preventDefault();
    });

    cell.addEventListener('pointerup', e => {
      if (dragIdx === null) return;
      const targetIdx = parseInt(cell.dataset.idx);
      if (dragIdx === targetIdx) { dragIdx = null; cell.classList.remove('dragging'); return; }
      tryMerge(dragIdx, targetIdx);
      dragIdx = null;
      cells.forEach(c => c.classList.remove('dragging'));
    });

    cell.addEventListener('pointerleave', () => {
      cell.classList.remove('dragging');
    });
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
  const emptyIdx = state.grid.indexOf(0);
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
  if (current) {
    const r = getRarity(current.rarity);
    const feedPct = Math.min(100, current.feed);
    const onCooldown = current.cooldownEnd > Date.now();
    const cdLeft = onCooldown ? Math.ceil((current.cooldownEnd - Date.now()) / 1000) : 0;
    carouselHtml = `
      <div class="gorilla-card" style="box-shadow:0 0 20px ${r.glow}, inset 0 0 20px ${r.glow};border:2px solid ${r.color};">
        <div class="gorilla-img-wrap">
          <img src="${getGorillaImg(current.rarity)}" class="gorilla-main-img" draggable="false" />
        </div>
        <div class="gorilla-details">
          <div class="gorilla-name" style="color:${r.color}">${current.name}</div>
          <div class="rarity-badge" style="background:${r.color}">${r.name}</div>
          <div class="gorilla-level">Уровень: ${current.level}</div>
          <div class="feed-bar-wrap">
            <div class="feed-bar" style="width:${feedPct}%;background:${r.color}"></div>
            <span class="feed-pct">${feedPct}%</span>
          </div>
          <button class="btn-feed${onCooldown ? ' cooldown' : ''}" data-feed="true" ${onCooldown ? 'disabled' : ''}>
            ${onCooldown ? `Пауза ${formatTime(cdLeft)}` : '🍽 КОРМИТЬ (75 🍌)'}
          </button>
        </div>
      </div>
      <div class="carousel-nav">
        <button class="arrow-left" data-arrow="left">◀</button>
        <span class="carousel-index">${state.gorillaIndex + 1} / ${owned.length}</span>
        <button class="arrow-right" data-arrow="right">▶</button>
      </div>`;
  } else {
    carouselHtml = `
      <div class="gorilla-empty">
        <div class="empty-lock">🔒</div>
        <p>Нет горилл</p>
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

  document.querySelectorAll('[data-arrow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.arrow;
      if (dir === 'left') {
        state.gorillaIndex = Math.max(0, state.gorillaIndex - 1);
      } else {
        state.gorillaIndex = Math.min(state.gorillas.length - 1, state.gorillaIndex + 1);
      }
      haptic('tab');
      render();
    });
  });

  const feedBtn = document.querySelector('.btn-feed');
  if (feedBtn) {
    feedBtn.addEventListener('click', () => feedGorilla());
  }

  let touchStartX = 0;
  const carousel = document.getElementById('gorilla-carousel');
  if (carousel) {
    carousel.addEventListener('pointerdown', e => { touchStartX = e.clientX; });
    carousel.addEventListener('pointerup', e => {
      const diff = e.clientX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0 && state.gorillaIndex < state.gorillas.length - 1) {
          state.gorillaIndex++;
        } else if (diff > 0 && state.gorillaIndex > 0) {
          state.gorillaIndex--;
        }
        haptic('tab');
        render();
      }
    });
  }
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

function feedGorilla() {
  const g = state.gorillas[state.gorillaIndex];
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
