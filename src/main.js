import { store } from './store.js';
import { initLang, getLang, setLang, t } from './i18n.js';
import { playTap, playCollect, playMerge, playComplete, playError, playLevelUp } from './sounds.js';
import { initGameCanvas, stopGame } from './game.js';
import { initWallet, connectWallet, disconnectWallet, getWalletAddress, buyApe, getApeRate } from './wallet.js';
import { getOrCreateUserId, saveUserData, loadUserData } from './firebase.js';

let currentScreen = 'game';
let currentCategory = null;
let currentRarity = null;
let prevScreen = null;

const $ = s => document.querySelector(s);
const fmt = n => String(Math.floor(n));

initLang();
const userId = getOrCreateUserId();
store.state.userId = userId;

loadUserData(userId).then(data => {
  if (data) { Object.assign(store.state, data); store.save(); }
});

setInterval(() => { saveUserData(userId, store.state); }, 30000);

if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
  if (tgUser) { store.state.tgUser = tgUser; store.save(); }
}

initWallet();

const APP = document.getElementById('app');

function header(title, showBack) {
  return `
    <div class="header">
      ${showBack ? `<button class="back-btn" onclick="W._back()">←</button>` : `<div class="header-icon">△</div>`}
      <span class="header-title">${title}</span>
      <div class="header-right">
        <button class="lang-btn" onclick="W._lang()">${getLang()}</button>
      </div>
    </div>`;
}

function currencyBar() {
  const s = store.state;
  return `
    <div class="currency-bar">
      <div class="currency-item"><span class="currency-gold">●</span><span>${fmt(s.gold)}</span></div>
      <div class="currency-item"><span class="currency-ape">◆</span><span>${fmt(s.apeBalance)}</span></div>
      <div class="currency-item"><span class="currency-crystal">⬡</span><span>${fmt(s.crystals)}</span></div>
    </div>`;
}

function bottomNav(active) {
  const items = [
    { key: 'game', icon: '△', label: t('nav_temple') },
    { key: 'collection', icon: '☰', label: t('nav_collection') },
    { key: 'merge', icon: '⬡', label: t('nav_merge') },
    { key: 'outfit', icon: '◉', label: t('nav_outfit') },
    { key: 'shop', icon: '●', label: t('nav_shop') },
  ];
  return `<nav class="bottom-nav">${items.map(it => `
    <button class="nav-btn ${it.key === active ? 'active' : ''}" onclick="W._nav('${it.key}')">
      <div class="nav-icon">${it.icon}</div>
      <span class="nav-label">${it.label}</span>
    </button>`).join('')}</nav>`;
}

function show() {
  saveUserData(userId, store.state);
  switch (currentScreen) {
    case 'game': showGame(); break;
    case 'collection': showCollection(); break;
    case 'merge': showMerge(); break;
    case 'outfit': showOutfit(); break;
    case 'shop': showShop(); break;
    case 'stats': showStats(); break;
    default: showGame();
  }
}

function showGame() {
  const s = store.state;
  const rank = store.getRank();
  const rankName = getLang() === 'ru' ? rank.nameRu : rank.name;
  const xpPct = Math.floor((s.xp / s.xpNeeded) * 100);

  APP.innerHTML = `
    <div class="screen game-screen">
      <div class="game-top">
        <div class="rank-badge">${rankName}</div>
        <div class="level-info">${t('level')} ${s.level}</div>
        <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
      </div>
      <div class="game-canvas-wrap" id="gameCanvasWrap"></div>
      <div class="mason-tap-hint" id="tapHint">${t('tut_tap')}</div>
      <div class="game-stats-row">
        <div class="stat-mini"><span class="stat-mini-label">${t('recipes')}</span><span class="stat-mini-val">${s.totalCollected}</span></div>
        <div class="stat-mini"><span class="stat-mini-label">${t('total_taps')}</span><span class="stat-mini-val">${fmt(s.totalTaps)}</span></div>
      </div>
      ${bottomNav('game')}
    </div>`;
  stopGame();
  const wrap = document.getElementById('gameCanvasWrap');
  initGameCanvas(wrap, (result) => {
    playTap();
    const hint = document.getElementById('tapHint');
    if (hint) hint.style.opacity = '0';
  });
}

function showCollection() {
  stopGame();
  const s = store.state;
  const items = store.getAllItems();
  const cats = store.getCategories();
  const total = items.length;
  const owned = Object.values(s.collection).filter(c => c > 0).length;
  const pct = Math.floor(owned / total * 100);

  let filtered = items;
  if (currentCategory) filtered = filtered.filter(i => i.category === currentCategory);
  if (currentRarity) filtered = filtered.filter(i => i.rarity === currentRarity);

  APP.innerHTML = `
    <div class="screen collection-screen">
      ${header(t('collection_title'))}
      ${currencyBar()}
      <div class="coll-progress">
        <span>${owned}/${total}</span>
        <div class="coll-bar"><div class="coll-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="coll-tabs-scroll">
        <div class="coll-tabs">
          <button class="coll-tab ${!currentCategory ? 'active' : ''}" onclick="W._cat(null)">${t('total')}</button>
          ${cats.map(c => `<button class="coll-tab ${currentCategory === c.id ? 'active' : ''}" onclick="W._cat('${c.id}')">${c.icon}</button>`).join('')}
        </div>
      </div>
      <div class="rarity-tabs">
        ${store.getRarities().map(r => `
          <button class="rarity-tab ${currentRarity === r.id ? 'active' : ''}" onclick="W._rarity('${r.id}')" style="border-color:${currentRarity === r.id ? r.color : 'transparent'};color:${r.color}">${r.nameRu.substring(0, 4)}</button>
        `).join('')}
        <button class="rarity-tab ${!currentRarity ? 'active' : ''}" onclick="W._rarity(null)">${t('total')}</button>
      </div>
      <div class="coll-grid">
        ${filtered.map(item => {
          const count = s.collection[item.id] || 0;
          const r = store.getRarities().find(r => r.id === item.rarity);
          return `<div class="coll-item ${count > 0 ? 'owned' : ''}" style="${count > 0 ? `border-color:${r.color}44;box-shadow:0 0 8px ${r.color}11` : ''}">
            <div class="coll-item-icon" style="color:${r.color}">${(cats.find(c => c.id === item.category) || {}).icon || '?'}</div>
            <div class="coll-item-name" style="color:${r.color}${count > 0 ? 'cc' : '44'}">${getLang() === 'ru' ? item.nameRu : item.name}</div>
            ${count > 0 ? `<div class="coll-item-count" style="background:${r.color}22;color:${r.color}">${count}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${bottomNav('collection')}
    </div>`;
}

function showMerge() {
  stopGame();
  const s = store.state;
  const filled = s.mergeSlots.filter(sl => sl !== null).length;
  const allSame = filled >= 2 && s.mergeSlots.filter(sl => sl !== null).every(sl => sl.rarity === s.mergeSlots.find(sl2 => sl2 !== null)?.rarity);
  const mergeEnabled = filled >= 2 && allSame;
  const firstRarity = s.mergeSlots.find(sl => sl !== null)?.rarity;
  const cost = firstRarity ? (MERGE_COST[firstRarity] || 50) : 0;

  APP.innerHTML = `
    <div class="screen merge-screen">
      ${header(t('merge_title'))}
      ${currencyBar()}
      <div class="merge-subtitle">${t('merge_sub')}</div>
      <div class="merge-grid-2x2">
        ${s.mergeSlots.map((slot, i) => {
          if (!slot) {
            return `<div class="merge-slot empty" onclick="W._addToSlot(${i})"><div class="merge-slot-plus">+</div></div>`;
          }
          const r = store.getRarities().find(r => r.id === slot.rarity);
          const c = store.getCategories().find(c => c.id === slot.category);
          return `<div class="merge-slot filled" style="border-color:${r.color}66" onclick="W._removeSlot(${i})">
            <div class="merge-slot-icon" style="color:${r.color}">${c ? c.icon : '?'}</div>
            <div class="merge-slot-name" style="color:${r.color}">${getLang() === 'ru' ? slot.nameRu : slot.name}</div>
          </div>`;
        }).join('')}
      </div>
      <button class="merge-btn ${mergeEnabled ? '' : 'disabled'}" onclick="W._doMerge()" ${mergeEnabled ? '' : 'disabled'}>
        ${mergeEnabled ? `${t('merge_btn')} — ${cost} ●` : t('merge_select')}
      </button>
      ${bottomNav('merge')}
    </div>`;
}

function showOutfit() {
  stopGame();
  const s = store.state;
  const cats = store.getCategories();

  APP.innerHTML = `
    <div class="screen outfit-screen">
      ${header(t('outfit_title'))}
      ${currencyBar()}
      <div class="outfit-subtitle">${t('outfit_sub')}</div>
      <div class="outfit-slots">
        ${['head', 'body', 'accessory'].map(slot => {
          const equipped = s.outfit[slot];
          return `<div class="outfit-slot" onclick="W._outfitSlot('${slot}')">
            <div class="outfit-slot-label">${t('slot_' + slot)}</div>
            <div class="outfit-slot-icon">${equipped ? ((cats.find(c => c.id === equipped.category) || {}).icon || '?') : '+'}</div>
            <div class="outfit-slot-name">${equipped ? (getLang() === 'ru' ? equipped.nameRu : equipped.name) : t('empty')}</div>
            ${equipped ? `<button class="outfit-remove" onclick="event.stopPropagation();W._unequip('${slot}')">✕</button>` : ''}
          </div>`;
        }).join('')}
      </div>
      <div class="section-title">${t('inventory_title')}</div>
      <div class="inv-grid">
        ${s.inventory.length === 0 ? `<div class="inv-empty">${t('inventory_empty')}</div>` :
          s.inventory.map(item => {
            const r = store.getRarities().find(r => r.id === item.rarity);
            const c = store.getCategories().find(c => c.id === item.category);
            return `<div class="inv-item" style="border-color:${r.color}33" onclick="W._useItem('${item.uid}')">
              <div class="inv-item-icon" style="color:${r.color}">${c ? c.icon : '?'}</div>
              <div class="inv-item-name" style="color:${r.color}aa">${getLang() === 'ru' ? item.nameRu : item.name}</div>
            </div>`;
          }).join('')}
      </div>
      ${bottomNav('outfit')}
    </div>`;
}

function showShop() {
  stopGame();
  const s = store.state;
  const rate = getApeRate();
  const walletAddr = getWalletAddress();

  APP.innerHTML = `
    <div class="screen shop-screen">
      ${header(t('shop_title'))}
      ${currencyBar()}
      <div class="shop-section">
        <div class="section-title">$APE ${t('shop_title')}</div>
        <div class="shop-balance">${t('balance')}: ${fmt(s.apeBalance)} $APE</div>
        ${walletAddr ? `
          <div class="shop-wallet">${walletAddr.substring(0, 6)}...${walletAddr.substring(walletAddr.length - 4)}</div>
          <button class="shop-btn" onclick="W._disconnectWallet()">${t('disconnect')}</button>
        ` : `
          <button class="shop-btn primary" onclick="W._connectWallet()">${t('connect_wallet')}</button>
        `}
        <div class="shop-rate">1 TON = ${rate.toLocaleString()} $APE</div>
        <div class="shop-packs">
          ${[0.1, 0.5, 1, 5, 10].map(ton => {
            const ape = Math.floor(ton * rate);
            return `<div class="shop-pack" onclick="${walletAddr ? `W._buyApe(${ton})` : ''}">
              <div class="shop-pack-ape">${ape.toLocaleString()} $APE</div>
              <div class="shop-pack-ton">${ton} TON</div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="shop-section">
        <div class="section-title">${t('stats_title')}</div>
        <div class="shop-pack" onclick="W._nav('stats')">
          <div class="shop-pack-ape">${t('stats_title')}</div>
          <div class="shop-pack-ton">${s.statPoints} ${t('points')}</div>
        </div>
      </div>
      ${bottomNav('shop')}
    </div>`;
}

function showStats() {
  stopGame();
  const s = store.state;

  APP.innerHTML = `
    <div class="screen stats-screen">
      ${header(t('stats_title'), 'shop')}
      ${currencyBar()}
      <div class="stats-points">${t('points')}: ${s.statPoints}</div>
      ${Object.entries(s.stats).map(([key, val]) => `
        <div class="stat-row">
          <div class="stat-name">${t('stat_' + key)}</div>
          <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${val}%"></div></div>
          <div class="stat-val">${val}</div>
          <button class="stat-up-btn" onclick="W._upgradeStat('${key}')" ${s.statPoints <= 0 ? 'disabled' : ''}>+</button>
        </div>
      `).join('')}
      <div class="stat-info">
        <div>${t('level')}: ${s.level}</div>
        <div>${t('total_taps')}: ${s.totalTaps}</div>
        <div>${t('collected')}: ${s.totalCollected}</div>
      </div>
      ${bottomNav('shop')}
    </div>`;
}

function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function showOverlay(html) {
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = html;
  document.body.appendChild(overlay);
  return overlay;
}

function showMergePicker(idx) {
  const s = store.state;
  if (s.inventory.length === 0) { showToast(t('inventory_empty')); return; }
  showOverlay(`
    <div class="overlay-panel scroll-panel">
      <button class="overlay-close" onclick="this.closest('.overlay').remove()">&times;</button>
      <div class="overlay-title">${t('merge_select')}</div>
      ${s.inventory.map(item => {
        const r = store.getRarities().find(r => r.id === item.rarity);
        const c = store.getCategories().find(c => c.id === item.category);
        return `<div class="picker-item" onclick="W._placeInSlot(${idx},'${item.uid}')">
          <span style="color:${r.color}">${c ? c.icon : '?'}</span>
          <span style="flex:1;color:${r.color}aa">${getLang() === 'ru' ? item.nameRu : item.name}</span>
          <span style="color:${r.color}66;font-size:10px">${r.nameRu}</span>
        </div>`;
      }).join('')}
    </div>`);
}

function showOutfitPicker(slot) {
  const s = store.state;
  const compatible = s.inventory.filter(i => {
    if (slot === 'head') return ['relics', 'crystals'].includes(i.category);
    if (slot === 'body') return ['armor', 'scrolls'].includes(i.category);
    if (slot === 'accessory') return ['rings', 'potions'].includes(i.category);
    return false;
  });
  if (compatible.length === 0) { showToast(t('inventory_empty')); return; }
  showOverlay(`
    <div class="overlay-panel scroll-panel">
      <button class="overlay-close" onclick="this.closest('.overlay').remove()">&times;</button>
      <div class="overlay-title">${t('slot_' + slot)}</div>
      ${compatible.map(item => {
        const r = store.getRarities().find(r => r.id === item.rarity);
        const c = store.getCategories().find(c => c.id === item.category);
        return `<div class="picker-item" onclick="W._equipOutfit('${slot}','${item.uid}')">
          <span style="color:${r.color}">${c ? c.icon : '?'}</span>
          <span style="flex:1;color:${r.color}aa">${getLang() === 'ru' ? item.nameRu : item.name}</span>
        </div>`;
      }).join('')}
    </div>`);
}

function showMergeResult(result) {
  const r = store.getRarities().find(r => r.id === result.nextRarity);
  const c = store.getCategories().find(c => c.id === result.result.category);
  showOverlay(`
    <div class="overlay-panel">
      <div class="overlay-title" style="color:${r ? r.color : '#f7c948'}">${t('merge_success')}!</div>
      <div style="font-size:48px;margin:16px 0;color:${r ? r.color : ''}">${c ? c.icon : '⬡'}</div>
      <div style="font-size:16px;color:${r ? r.color : '#fff'}">${getLang() === 'ru' ? result.result.nameRu : result.result.name}</div>
      <div style="font-size:12px;color:${r ? r.color + '88' : '#888'};margin:4px 0 16px">${r ? r.nameRu : ''}</div>
      <button class="overlay-btn" onclick="this.closest('.overlay').remove();W._show()">OK</button>
    </div>`);
}

/* ─── Global Handlers ─── */
window.W = {};

window.W._nav = (s) => {
  prevScreen = currentScreen;
  currentScreen = s;
  if (s !== 'collection') { currentCategory = null; currentRarity = null; }
  show();
};

window.W._back = () => {
  currentScreen = prevScreen || 'game';
  prevScreen = null;
  show();
};

window.W._lang = () => {
  const l = getLang() === 'en' ? 'ru' : 'en';
  setLang(l);
  show();
};

window.W._cat = (cat) => { currentCategory = cat; showCollection(); };
window.W._rarity = (r) => { currentRarity = r; showCollection(); };

window.W._addToSlot = (idx) => showMergePicker(idx);
window.W._placeInSlot = (idx, uid) => {
  if (store.placeInMergeSlot(idx, uid)) {
    playTap();
    document.querySelector('.overlay')?.remove();
    showMerge();
  }
};
window.W._removeSlot = (idx) => { store.removeFromMergeSlot(idx); playTap(); showMerge(); };
window.W._doMerge = () => {
  const result = store.tryMerge();
  if (!result || !result.result) {
    if (result && result.messageKey) showToast(t(result.messageKey));
    else showToast(t('merge_empty'));
    playError();
    return;
  }
  playMerge();
  showMergeResult(result);
};

window.W._outfitSlot = (slot) => showOutfitPicker(slot);
window.W._equipOutfit = (slot, uid) => {
  if (store.equipOutfit(slot, uid)) {
    playCollect();
    document.querySelector('.overlay')?.remove();
    showOutfit();
  }
};
window.W._unequip = (slot) => {
  if (store.unequipOutfit(slot)) { playTap(); showOutfit(); }
};
window.W._useItem = (uid) => {
  const item = store.state.inventory.find(i => i.uid === uid);
  if (!item) return;
  if (store.collectItem(item.id)) {
    store.removeFromInventory(uid);
    playCollect();
    show();
    showToast(`+1 ${t('recipes')}`);
  }
};

window.W._connectWallet = async () => {
  const addr = await connectWallet();
  if (addr) { store.state.walletAddress = addr; store.save(); showShop(); }
};
window.W._disconnectWallet = () => {
  disconnectWallet();
  store.state.walletAddress = null;
  store.save();
  showShop();
};
window.W._buyApe = async (ton) => {
  const result = await buyApe(ton);
  if (result && result.ok) {
    store.state.apeBalance += result.apeAmount;
    store.save();
    showToast(`+${result.apeAmount.toLocaleString()} $APE`);
    showShop();
  } else if (result && result.msg) {
    showToast(t(result.msg));
  }
};

window.W._upgradeStat = (key) => {
  if (store.upgradeStat(key)) { playCollect(); showStats(); }
  else showToast(t('no_points'));
};

window.W._daily = () => {
  if (!store.canClaimDaily()) { showToast(t('daily_claimed')); return; }
  const r = store.claimDaily();
  if (r) { playCollect(); showToast(`+${r.gold} ● +${r.crystals} ⬡`); show(); }
};

window.W._show = show;

show();
