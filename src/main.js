import { store } from './store.js';
import { t, getLang, initLang, setLang } from './i18n.js';
import { playTap, playCollect, playMerge, playError } from './sounds.js';
import { initGameCanvas, stopGame } from './game.js';
import { initWallet, connectWallet, disconnectWallet, getWalletAddress, buyApe, getApeRate } from './wallet.js';
import { loadUserData, saveUserData, getOrCreateUserId } from './firebase.js';
import { ITEMS, MERGE_COST, MERGE_MATRIX } from './config.js';

let currentScreen = 'game';
let selectedCategory = 'all';
let statsEl, overlayEl, toastEl;

function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2200);
}

function showScreen(screen) {
  currentScreen = screen;
  show();
}

function renderCurrencyBar() {
  const s = store.getState();
  return `
    <div class="currency-bar">
      <span class="currency-item">🍌 ${s.bananas}</span>
      <span class="currency-item">⭐ ${s.gold}</span>
      <span class="currency-item">◆ ${s.ape || 0}</span>
    </div>`;
}

function renderHeader() {
  const titles = { game: t('main'), collection: t('collection'), merge: t('merge'), shop: t('shop'), stats: t('stats') };
  const showBack = currentScreen !== 'game';
  const langLabel = getLang() === 'en' ? 'RU' : 'EN';
  return `
    <header class="header">
      ${showBack ? `<button class="btn-icon" onclick="W._back()">←</button>` : '<span></span>'}
      <h1 class="header-title">${titles[currentScreen]}</h1>
      <button class="btn-icon" onclick="W._lang()">${langLabel}</button>
    </header>`;
}

function renderNav() {
  const tabs = [
    { id: 'game', icon: '🐻', label: t('main') },
    { id: 'collection', icon: '☰', label: t('collection') },
    { id: 'merge', icon: '⬡', label: t('merge') },
    { id: 'shop', icon: '🛒', label: t('shop') },
    { id: 'stats', icon: '⚔', label: t('stats') }
  ];
  return `
    <nav class="bottom-nav">
      ${tabs.map(tb => `
        <button class="nav-btn ${currentScreen === tb.id ? 'active' : ''}" onclick="W._nav('${tb.id}')">
          <span class="nav-icon">${tb.icon}</span>
          <span class="nav-label">${tb.label}</span>
        </button>`).join('')}
    </nav>`;
}

function renderGameScreen() {
  const rank = store.getRank();
  const s = store.getState();
  const xpForNext = 100 * (1 + store.getState().level);
  const xpPercent = Math.min(100, ((s.xp || 0) / xpForNext) * 100);
  return `
    <section class="screen screen-game">
      <div class="rank-badge">${rank.name}</div>
      <div class="level-row">${t('level')} ${s.level || 1}</div>
      <div class="xp-bar-wrap">
        <div class="xp-bar" style="width:${xpPercent}%"></div>
        <span class="xp-text">${s.xp || 0} / ${xpForNext}</span>
      </div>
      <div class="canvas-wrap" onclick="W._tap()">
        <canvas id="gameCanvas" width="300" height="300"></canvas>
      </div>
      <p class="tap-hint">${t('tapHint')}</p>
      <div class="stats-row">
        <span>💪 ${s.stats?.strength || 0}</span>
        <span>🏃 ${s.stats?.stamina || 0}</span>
        <span>⚡ ${s.stats?.speed || 0}</span>
        <span>🍀 ${s.stats?.luck || 0}</span>
      </div>
    </section>`;
}

function renderCollectionScreen() {
  const items = store.getAllItems();
  const rarities = store.getRarities();
  const categories = store.getCategories();
  const s = store.getState();
  const owned = s.inventory || {};

  const filtered = items.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const total = items.length;
  const ownedCount = Object.keys(owned).length;

  const catTabs = [
    { id: 'all', label: t('all') },
    { id: 'banana', label: t('bananas') },
    { id: 'dumbbell', label: t('dumbbells') }
  ];

  return `
    <section class="screen screen-collection">
      <div class="progress-bar-wrap">
        <div class="progress-bar" style="width:${((ownedCount / total) * 100).toFixed(1)}%"></div>
        <span class="progress-text">${ownedCount} / ${total}</span>
      </div>
      <div class="cat-tabs">
        ${catTabs.map(c => `
          <button class="cat-tab ${selectedCategory === c.id ? 'active' : ''}" onclick="W._cat('${c.id}')">${c.label}</button>`).join('')}
      </div>
      <div class="items-grid">
        ${filtered.map(item => {
          const rarity = rarities.find(r => r.id === item.rarity) || {};
          const count = owned[item.id] || 0;
          return `
            <div class="item-card" style="border-color:${rarity.color || '#666'}">
              <img src="${item.image}" alt="${item.name}" class="item-img" onerror="this.src='./src/assets/placeholder.png'">
              <div class="item-name">${item.name}</div>
              <div class="item-rarity" style="color:${rarity.color || '#aaa'}">${rarity.name || item.rarity}</div>
              <div class="item-count">${count > 0 ? '×' + count : ''}</div>
            </div>`;
        }).join('')}
      </div>
    </section>`;
}

function renderMergeScreen() {
  const s = store.getState();
  const slots = s.mergeSlots || [null, null, null, null];
  const rarities = store.getRarities();

  const slotEls = slots.map((uid, idx) => {
    if (!uid) return `<div class="merge-slot empty" onclick="W._addToSlot(${idx})">+</div>`;
    const item = (store.getAllItems() || []).find(i => i.uid === uid) || {};
    const rarity = rarities.find(r => r.id === item.rarity) || {};
    return `
      <div class="merge-slot filled" style="border-color:${rarity.color || '#666'}">
        <img src="${item.image}" alt="${item.name}" class="merge-slot-img" onerror="this.src='./src/assets/placeholder.png'">
        <button class="merge-remove" onclick="W._removeSlot(${idx})">×</button>
      </div>`;
  });

  return `
    <section class="screen screen-merge">
      <div class="merge-grid">${slotEls.join('')}</div>
      <button class="btn-merge" onclick="W._doMerge()">${t('merge')} (⭐ ${MERGE_COST || 0})</button>
    </section>`;
}

function renderShopScreen() {
  const s = store.getState();
  const rarities = store.getRarities();
  const dumbbells = (store.getAllItems() || []).filter(i => i.category === 'dumbbell');

  return `
    <section class="screen screen-shop">
      <h2 class="section-title">${t('dumbbells')}</h2>
      <div class="shop-list">
        ${dumbbells.map(item => {
          const rIdx = rarities.findIndex(r => r.id === item.rarity);
          const cost = 10 * Math.pow(3, Math.max(0, rIdx));
          return `
            <div class="shop-item">
              <img src="${item.image}" alt="${item.name}" class="shop-item-img" onerror="this.src='./src/assets/placeholder.png'">
              <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-cost">🍌 ${cost}</div>
              </div>
              <button class="btn-buy" onclick="W._buyItem('${item.id}')">${t('buy')}</button>
            </div>`;
        }).join('')}
      </div>
      <div class="ton-section">
        <h3>TON Wallet</h3>
        ${s.walletConnected
          ? `<span class="wallet-addr">${(s.walletAddr || '').slice(0, 6)}...${(s.walletAddr || '').slice(-4)}</span>
             <button class="btn-disconnect" onclick="W._disconnectWallet()">${t('disconnect')}</button>
             <button class="btn-buy-ape" onclick="W._buyApe()">Buy $APE</button>`
          : `<button class="btn-connect" onclick="W._connectWallet()">${t('connectWallet')}</button>`}
      </div>
    </section>`;
}

function renderStatsScreen() {
  const s = store.getState();
  const stats = s.stats || { strength: 0, stamina: 0, speed: 0, luck: 0 };
  const statDefs = [
    { key: 'strength', icon: '💪', label: t('strength') },
    { key: 'stamina', icon: '🏃', label: t('stamina') },
    { key: 'speed', icon: '⚡', label: t('speed') },
    { key: 'luck', icon: '🍀', label: t('luck') }
  ];

  return `
    <section class="screen screen-stats">
      ${statDefs.map(sd => `
        <div class="stat-row">
          <span class="stat-icon">${sd.icon}</span>
          <span class="stat-label">${sd.label}</span>
          <div class="stat-bar-wrap">
            <div class="stat-bar" style="width:${Math.min(100, (stats[sd.key] || 0) * 2)}%"></div>
          </div>
          <span class="stat-val">${stats[sd.key] || 0}</span>
          <button class="btn-upgrade" onclick="W._upgradeStat('${sd.key}')">⬆</button>
        </div>`).join('')}
    </section>`;
}

function renderScreen() {
  switch (currentScreen) {
    case 'game': return renderGameScreen();
    case 'collection': return renderCollectionScreen();
    case 'merge': return renderMergeScreen();
    case 'shop': return renderShopScreen();
    case 'stats': return renderStatsScreen();
    default: return renderGameScreen();
  }
}

export function show() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="app-container">
      ${renderHeader()}
      ${renderCurrencyBar()}
      <main class="main-content">${renderScreen()}</main>
      ${renderNav()}
    </div>`;

  statsEl = document.getElementById('statsOverlay');
  overlayEl = document.getElementById('mergeOverlay');
  toastEl = document.getElementById('toast');

  if (currentScreen === 'game') { stopGame(); initGameCanvas(document.getElementById('gameCanvas'), function() { playTap(); }); }
}

window.W = {
  _nav: (screen) => { playTap(); showScreen(screen); },
  _lang: () => { setLang(getLang() === 'en' ? 'ru' : 'en'); show(); },
  _cat: (cat) => { selectedCategory = cat; show(); },
  _addToSlot: (idx) => {
    const s = store.getState();
    const inv = s.inventory || {};
    const owned = Object.keys(inv).find(k => inv[k] > 0);
    if (owned) {
      store.placeInMergeSlot(idx, owned);
      show();
    } else {
      toast(t('noItems'));
    }
  },
  _removeSlot: (idx) => { store.removeFromMergeSlot(idx); show(); },
  _placeInSlot: (idx, uid) => { store.placeInMergeSlot(idx, uid); show(); },
  _doMerge: () => {
    const result = store.tryMerge();
    if (result) {
      toast(t('mergeSuccess'));
    } else {
      toast(t('mergeFail'));
    }
    show();
  },
  _buyItem: (id) => {
    if (store.buyItem(id)) {
      toast(t('bought'));
    } else {
      toast(t('notEnough'));
    }
    show();
  },
  _connectWallet: async () => {
    try {
      await connectWallet();
      toast(t('walletConnected'));
    } catch (e) {
      toast(t('walletFail'));
    }
    show();
  },
  _disconnectWallet: () => {
    disconnectWallet();
    toast(t('walletDisconnected'));
    show();
  },
  _buyApe: async () => {
    try {
      await buyApe();
      toast(t('apePurchased'));
    } catch (e) {
      toast(t('apeFail'));
    }
    show();
  },
  _upgradeStat: (key) => {
    if (store.upgradeStat(key)) {
      toast(t('upgraded'));
    } else {
      toast(t('notEnoughGold'));
    }
    show();
  },
  _back: () => { currentScreen = 'game'; show(); },
  _show: (screen) => { showScreen(screen); },
  _daily: () => {
    const s = store.getState();
    const now = Date.now();
    if (s.dailyClaimed && (now - s.dailyClaimed) < 86400000) {
      toast(t('alreadyClaimed'));
      return;
    }
    store.setState({ dailyClaimed: now, bananas: (s.bananas || 0) + 50 });
    toast('+50 🍌');
  },
  _tap: () => {
    const result = store.tapGorilla();
    show();
  }
};

async function init() {
  initLang();
  const userId = getOrCreateUserId();
  await loadUserData(userId);

  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast';
  toastContainer.className = 'toast';
  document.body.appendChild(toastContainer);

  initWallet();

  if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }

  show();

  setInterval(() => saveUserData(userId), 30000);
}

document.addEventListener('DOMContentLoaded', init);
