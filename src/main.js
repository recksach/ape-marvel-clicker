import { store } from './store.js';
import { initLang, getLang, t } from './i18n.js';
import { playTap, playCollect, playMerge, playQuest, playComplete, playError, playLevelUp } from './sounds.js';
import { initGameCanvas, stopGame, getCanvas, resize } from './game.js';
import { initWallet, connectWallet, disconnectWallet, getWalletAddress, isWalletConnected, buyApe, getApeRate } from './wallet.js';
import { getOrCreateUserId, saveUserData, loadUserData } from './firebase.js';

let currentScreen = 'game';
let currentCategory = null;
let currentNPC = null;
let currentRarity = null;

const $ = s => document.querySelector(s);
const fmt = n => String(Math.floor(n));

/* ─── Init ─── */
initLang();
const userId = getOrCreateUserId();
store.state.userId = userId;

// Load from Firebase
loadUserData(userId).then(data => {
  if (data) {
    Object.assign(store.state, data);
    store.save();
  }
});

// Auto-save to Firebase periodically
setInterval(() => {
  saveUserData(userId, store.state);
}, 30000);

// Telegram
if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
  const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
  if (tgUser) {
    store.state.tgUser = tgUser;
    store.save();
  }
}

// TON
initWallet();

/* ─── App container ─── */
const APP = document.getElementById('app');
APP.style.position = 'relative';
APP.style.overflow = 'hidden';

/* ─── Top bar ─── */
function topbar(title, back) {
  const s = store.state;
  return `
    <div class="topbar">
      <div class="topbar-left">
        ${back ? `<button class="topbar-back" onclick="W._nav('${back}')">←</button>` : ''}
        <span class="topbar-title">${title}</span>
      </div>
      <div class="topbar-right">
        <div class="currency-badge"><span class="currency-icon">●</span>${fmt(s.gold)}</div>
        <div class="currency-badge"><span class="currency-icon" style="color:#10b981">◆</span>${fmt(s.apeBalance)}</div>
        <div class="currency-badge"><span class="currency-icon" style="color:#a855f7">⬡</span>${fmt(s.crystals)}</div>
        <button class="lang-btn" onclick="W._lang()">${getLang()}</button>
      </div>
    </div>
  `;
}

/* ─── Bottom Nav ─── */
function bottomNav(active) {
  const items = [
    { key: 'game', label: t('nav_temple'), icon: '△' },
    { key: 'collection', label: t('nav_collection'), icon: '☰' },
    { key: 'characters', label: t('nav_library'), icon: '◉' },
    { key: 'merge', label: t('nav_merge'), icon: '⬡' },
    { key: 'shop', label: '●', icon: '●' },
  ];
  return `<div class="bottomnav">${items.map(it => `
    <button class="nav-item ${it.key === active ? 'active' : ''}" onclick="W._nav('${it.key}')">
      <div class="nav-icon">${it.icon}</div>
      <span class="nav-label">${it.label}</span>
    </button>`).join('')}</div>`;
}

/* ─── Router ─── */
function show() {
  saveUserData(userId, store.state);
  switch (currentScreen) {
    case 'game': showGame(); break;
    case 'collection': showCollection(); break;
    case 'merge': showMerge(); break;
    case 'characters': showCharacters(); break;
    case 'character_detail': showCharacterDetail(); break;
    case 'inventory': showInventory(); break;
    case 'shop': showShop(); break;
    case 'stats': showStats(); break;
    default: showGame();
  }
  updateQuestTick();
}

/* ─── Screen: Game ─── */
function showGame() {
  const s = store.state;
  APP.innerHTML = `
    <div class="screen active game-screen">
      ${topbar(t('appName'))}
      <div class="game-container" id="gameContainer"></div>
      <div class="game-hud" id="gameHud">
        <div class="game-level">${t('level')} ${s.level}</div>
        <div class="game-npc-count">${s.unlockedNPCs.length}/${store.getAllNPCs().length} ${t('nav_library')}</div>
      </div>
      ${bottomNav('game')}
    </div>`;
  const container = document.getElementById('gameContainer');
  container.style.position = 'absolute';
  container.style.top = '44px';
  container.style.left = '0';
  container.style.right = '0';
  container.style.bottom = '56px';
  stopGame();
  initGameCanvas(container);
}

/* ─── Screen: Collection ─── */
function showCollection(catFilter) {
  if (catFilter) currentCategory = catFilter;
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
    <div class="screen active collection-screen">
      ${topbar(t('collection_title'))}
      <div class="coll-header">
        <span class="coll-title">${t('collection_title')}</span>
        <span class="coll-sub">${owned}/${total}</span>
      </div>
      <div class="coll-progress-bar"><div class="coll-progress-fill" style="width:${pct}%"></div></div>
      <div class="coll-scroll-wrap">
        <div class="coll-tabs">
          <button class="coll-tab ${!currentCategory?'active':''}" onclick="W._cat(null)">${t('total')}</button>
          ${cats.map(c => {
            const prog = store.getCategoryProgress ? store.getCategoryProgress(c.id) : { owned: 0 };
            return `<button class="coll-tab ${currentCategory===c.id?'active':''}" onclick="W._cat('${c.id}')">${c.icon} ${prog.owned}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="coll-scroll-wrap">
        <div class="coll-rarity-tabs">
          ${store.getRarities().map(r => `
            <button class="coll-tab rarity ${currentRarity===r.id?'active':''}" onclick="W._rarity('${r.id}')" style="color:${r.color}">${r.name.substring(0,4)}</button>
          `).join('')}
          <button class="coll-tab rarity ${!currentRarity?'active':''}" onclick="W._rarity(null)">${t('total')}</button>
        </div>
      </div>
      <div class="coll-grid" id="collGrid">
        ${filtered.map(item => {
          const count = s.collection[item.id] || 0;
          const rarityDef = store.getRarities().find(r => r.id === item.rarity);
          const catDef = store.getCategories().find(c => c.id === item.category);
          return `<div class="coll-item ${count>0?'owned':''}" style="${count>0&&rarityDef?`border-color:${rarityDef.color}22;box-shadow:0 0 ${12+count*2}px ${rarityDef.color}11`:''}" onclick="${count<=0?`W._showItem('${item.id}')`:''}">
            <div class="coll-item-icon" style="${rarityDef?`color:${rarityDef.color}`:''}">${catDef?catDef.icon:'?'}</div>
            <div class="coll-item-name" style="${rarityDef?`color:${rarityDef.color}${count>0?'88':'33'}`:''}">${getLang()==='ru'?item.nameRu:item.name}</div>
            ${count>0?`<div class="coll-item-count" style="background:${rarityDef?rarityDef.color+'22':'transparent'}">${count}</div>`:''}
          </div>`;
        }).join('')}
      </div>
      ${bottomNav('collection')}
    </div>`;
}

/* ─── Screen: Characters ─── */
function showCharacters() {
  stopGame();
  const s = store.state;
  const npcs = store.getAllNPCs();
  APP.innerHTML = `
    <div class="screen active npc-screen">
      ${topbar(t('nav_library'))}
      <div class="npc-scroll">
        ${npcs.map(npc => {
          const unlocked = s.unlockedNPCs.includes(npc.id);
          const active = s.activeNPCs.find(n => n.id === npc.id);
          const happiness = active ? Math.floor(active.happiness) : 0;
          return `<div class="npc-card ${unlocked?'':'locked'}" onclick="${unlocked?`W._charDetail('${npc.id}')`:''}" style="${unlocked?`border-color:${npc.color}22`:''}">
            <div class="npc-avatar" style="background:${npc.color}08;border:1px solid ${npc.color}22;color:${npc.color}">◉</div>
            <div class="npc-info">
              <div class="npc-name">${getLang()==='ru'?npc.nameRu:npc.name}</div>
              <div class="npc-role">${t('happiness')}: ${happiness}%</div>
            </div>
            ${!unlocked?`<div class="npc-lock" onclick="event.stopPropagation();W._unlockNPC('${npc.id}')">🔒 50 ${t('knowledge')}</div>`:`<div style="color:rgba(255,255,255,0.1);font-size:12px">→</div>`}
          </div>`;
        }).join('')}
      </div>
      ${bottomNav('characters')}
    </div>`;
}

/* ─── Screen: Character Detail ─── */
function showCharacterDetail() {
  if (!currentNPC) { showCharacters(); return; }
  stopGame();
  const s = store.state;
  const npcDef = store.getAllNPCs().find(n => n.id === currentNPC);
  if (!npcDef) { showCharacters(); return; }
  const npcState = s.activeNPCs.find(n => n.id === currentNPC);
  if (!npcState) { showCharacters(); return; }
  const color = npcDef.color || '#8b7355';
  const happiness = Math.floor(npcState.happiness);

  APP.innerHTML = `
    <div class="screen active npc-screen">
      ${topbar(getLang()==='ru'?npcDef.nameRu:npcDef.name, 'characters')}
      <div class="npc-scroll">
        <div class="npc-detail-header">
          <div class="npc-detail-avatar" style="background:${color}08;border:2px solid ${color}33;color:${color}">◉</div>
          <div>
            <div style="font-size:16px;font-weight:600;color:rgba(255,255,255,0.6)">${getLang()==='ru'?npcDef.nameRu:npcDef.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.1)">${t('happiness')}: ${happiness}%</div>
          </div>
        </div>
        <div class="npc-dialog">${t('npc_' + npcDef.id)}</div>

        <div class="section-title">${t('outfit_title')}</div>
        <div class="outfit-slots">
          ${['head','body','accessory'].map(slot => {
            const equipped = npcState.outfit[slot];
            return `<div class="outfit-slot" onclick="W._outfitSlot('${slot}')">
              <div class="outfit-slot-label">${t('slot_'+slot)}</div>
              <div class="outfit-slot-icon">${equipped ? (store.getCategories().find(c=>c.id===equipped.category)?.icon || '?') : '+'}</div>
              <div class="outfit-slot-name">${equipped ? (getLang()==='ru'?equipped.nameRu:equipped.name) : t('empty')}</div>
              ${equipped ? `<button class="outfit-unequip" onclick="event.stopPropagation();W._unequip('${slot}')">✕</button>` : ''}
            </div>`;
          }).join('')}
        </div>

        <div class="section-title">${t('nav_merge')}</div>
        <div class="npc-quest-actions">
          <button class="npc-btn primary" onclick="W._startQuest('${npcDef.id}')">${t('quest_start')}</button>
          <button class="npc-btn secondary" onclick="W._nav('inventory')">${t('inventory_title')}</button>
        </div>
        ${s.questActive && s.questNPC === npcDef.id ? `
          <div class="quest-panel">
            <div class="quest-panel-title">${t('quest_progress')}</div>
            <div class="quest-panel-progress"><div class="quest-panel-fill" id="questFill" style="width:${(store.getQuestProgress()*100).toFixed(0)}%"></div></div>
          </div>` : ''}
      </div>
      ${bottomNav('characters')}
    </div>`;
}

/* ─── Screen: Merge ─── */
function showMerge() {
  stopGame();
  const s = store.state;
  const filled = s.mergeSlots.filter(sl => sl !== null).length;
  const allSame = filled >= 2 && s.mergeSlots.filter(sl => sl !== null).every(sl => sl.rarity === s.mergeSlots.find(sl2 => sl2 !== null)?.rarity);
  const mergeEnabled = filled >= 2 && allSame;

  APP.innerHTML = `
    <div class="screen active merge-screen">
      ${topbar(t('merge_title'))}
      <div class="merge-scroll">
        <div class="merge-header">
          <div class="merge-title">${t('merge_title')}</div>
          <div class="merge-sub">${t('merge_sub')}</div>
        </div>
        <div class="merge-grid">
          ${s.mergeSlots.map((slot, i) => {
            const unlocked = s.mergeSlotsUnlocked.includes(i);
            if (!unlocked) {
              const cost = (store.getRarities().find(r => r.id === 'common')?.bonus || 10) * (i + 1);
              return `<div class="merge-slot locked" onclick="W._unlockSlot(${i})">
                <div class="merge-slot-lock">🔒</div>
                <div class="merge-slot-cost">${cost}●</div>
              </div>`;
            }
            if (!slot) {
              return `<div class="merge-slot" onclick="W._addToSlot(${i})"><div class="merge-slot-icon">+</div></div>`;
            }
            const rarityDef = store.getRarities().find(r => r.id === slot.rarity);
            const catDef = store.getCategories().find(c => c.id === slot.category);
            return `<div class="merge-slot filled" style="border-color:${rarityDef?rarityDef.color+'33':''}" onclick="W._removeSlot(${i})">
              <div class="merge-slot-icon" style="color:${rarityDef?rarityDef.color:''}">${catDef?catDef.icon:'?'}</div>
              <div class="merge-slot-rarity" style="color:${rarityDef?rarityDef.color:''}">${rarityDef?rarityDef.name.substring(0,6):''}</div>
            </div>`;
          }).join('')}
        </div>
        <button class="merge-btn" onclick="W._doMerge()" ${mergeEnabled?'':'disabled'}>
          ${mergeEnabled ? `${t('merge_btn')} — ${(store.getRarities().find(r=>r.id===s.mergeSlots.find(sl=>sl!==null)?.rarity)?.bonus||5)*10} ●` : filled<2 ? t('merge_select') : t('merge_empty')}
        </button>
        <div class="merge-info">${filled}/9 ${t('merge_select')} | ${s.mergeSlotsUnlocked.length}/9 ${t('merge_unlock')}</div>
      </div>
      ${bottomNav('merge')}
    </div>`;
}

/* ─── Screen: Inventory ─── */
function showInventory() {
  stopGame();
  const s = store.state;
  APP.innerHTML = `
    <div class="screen active inventory-screen">
      ${topbar(t('inventory_title'), 'character_detail')}
      <div class="inv-header">
        <div class="merge-title">${t('inventory_title')}</div>
        <div class="merge-sub">${s.inventory.length}/50</div>
      </div>
      <div class="inv-grid">
        ${s.inventory.length === 0 ? `<div class="inv-empty">${t('inventory_empty')}</div>` :
          s.inventory.map(item => {
            const r = store.getRarities().find(rr => rr.id === item.rarity);
            const c = store.getCategories().find(cc => cc.id === item.category);
            return `<div class="inv-item" style="border-color:${r?r.color+'22':''}" onclick="W._useItem('${item.uid}')">
              <div class="inv-item-icon" style="color:${r?r.color:''}">${c?c.icon:'?'}</div>
              <div class="inv-item-name" style="color:${r?r.color+'88':''}">${getLang()==='ru'?item.nameRu:item.name}</div>
            </div>`;
          }).join('')}
      </div>
      ${bottomNav('characters')}
    </div>`;
}

/* ─── Screen: Shop ─── */
function showShop() {
  stopGame();
  const s = store.state;
  const rate = getApeRate();
  const walletAddr = getWalletAddress();
  APP.innerHTML = `
    <div class="screen active shop-screen">
      ${topbar(t('shop_title'))}
      <div class="shop-scroll">
        <div class="shop-section">
          <div class="merge-title">$APE ${t('shop_title')}</div>
          <div class="shop-balance">${t('balance')}: ${fmt(s.apeBalance)} $APE</div>
          ${walletAddr ? `
            <div class="shop-wallet">${t('wallet_connected')}: ${walletAddr.substring(0,6)}...${walletAddr.substring(walletAddr.length-4)}</div>
            <button class="shop-btn" onclick="W._disconnectWallet()">${t('disconnect')}</button>
          ` : `
            <button class="shop-btn primary" onclick="W._connectWallet()">${t('connect_wallet')}</button>
          `}
          <div class="shop-rate">1 TON = ${rate.toLocaleString()} $APE</div>
          <div class="shop-packs">
            ${[0.1, 0.5, 1, 5, 10].map(ton => {
              const ape = Math.floor(ton * rate);
              return `<div class="shop-pack" onclick="${walletAddr?`W._buyApe(${ton})`:''}">
                <div class="shop-pack-amount">${ape.toLocaleString()} $APE</div>
                <div class="shop-pack-price">${ton} TON</div>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="shop-section" style="margin-top:12px">
          <div class="merge-title" style="font-size:13px">${t('upgrades')}</div>
          <div class="shop-pack" onclick="W._nav('stats')">
            <div class="shop-pack-amount" style="font-size:12px">${t('stats_title')}</div>
            <div class="shop-pack-price" style="font-size:10px">${s.statPoints} ${t('points')}</div>
          </div>
          <div class="shop-pack" onclick="W._buyEnergy()">
            <div class="shop-pack-amount" style="font-size:12px">${t('energy')}</div>
            <div class="shop-pack-price" style="font-size:10px">+50 ●50</div>
          </div>
        </div>
      </div>
      ${bottomNav('shop')}
    </div>`;
}

/* ─── Screen: Stats ─── */
function showStats() {
  stopGame();
  const s = store.state;
  APP.innerHTML = `
    <div class="screen active stats-screen">
      ${topbar(t('stats_title'), 'shop')}
      <div class="stats-scroll">
        <div class="merge-title">${t('stats_title')}</div>
        <div class="stats-points">${t('points')}: ${s.statPoints}</div>
        ${Object.entries(s.stats).map(([key, val]) => `
          <div class="stat-row">
            <div class="stat-name">${t('stat_'+key)}</div>
            <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${val}%"></div></div>
            <div class="stat-value">${val}</div>
            <button class="stat-up-btn" onclick="W._upgradeStat('${key}')" ${s.statPoints<=0?'disabled':''}>+</button>
          </div>
        `).join('')}
        <div class="stat-info">
          <div class="stat-info-row">${t('level')}: ${s.level}</div>
          <div class="stat-info-row">${t('total_taps')}: ${s.totalTaps}</div>
          <div class="stat-info-row">${t('collected')}: ${s.totalCollected}</div>
          <div class="stat-info-row">${t('quests_completed')}: ${s.completedQuests}</div>
        </div>
      </div>
      ${bottomNav('shop')}
    </div>`;
}

/* ─── Game tick (quests) ─── */
let questJustCompleted = false;
function updateQuestTick() {
  const s = store.state;
  if (s.questActive && !questJustCompleted) {
    if (store.tickQuest()) {
      questJustCompleted = true;
      playComplete();
      showToast(t('quest_complete'));
      setTimeout(() => { questJustCompleted = false; if (currentScreen === 'character_detail') showCharacterDetail(); }, 800);
    }
  }
  const fill = document.getElementById('questFill');
  if (fill) fill.style.width = (store.getQuestProgress() * 100).toFixed(0) + '%';
}
setInterval(updateQuestTick, 1000);

/* ─── Toast ─── */
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ─── Overlays ─── */
function showMergePicker(idx) {
  const s = store.state;
  if (s.inventory.length === 0) { showToast(t('inventory_empty')); return; }
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel" style="max-width:300px;max-height:60vh;overflow-y:auto;position:relative">
      <button style="position:sticky;top:0;float:right;font-size:18px;color:rgba(255,255,255,0.1);background:none;z-index:1" onclick="this.remove()">&times;</button>
      <div class="quest-panel-title">${t('merge_select')}</div>
      ${s.inventory.map(item => {
        const r = store.getRarities().find(rr => rr.id === item.rarity);
        const c = store.getCategories().find(cc => cc.id === item.category);
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer" onclick="W._placeInSlot(${idx},'${item.uid}')">
          <span style="font-size:16px;color:${r?r.color:''}">${c?c.icon:'?'}</span>
          <span style="flex:1;font-size:10px;text-align:left;color:${r?r.color+'aa':''}">${getLang()==='ru'?item.nameRu:item.name}</span>
        </div>`;
      }).join('')}
    </div>`;
  document.body.appendChild(overlay);
}

function showMergeResult(result) {
  const r = store.getRarities().find(rr => rr.id === result.nextRarity);
  const c = store.getCategories().find(cc => cc.id === result.result.category);
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel">
      <div class="quest-panel-title" style="color:${r?r.color:'#f7c948'}">${t('merge_success')}!</div>
      <div style="font-size:32px;margin:8px 0;color:${r?r.color:''}">${c?c.icon:'⬡'}</div>
      <div style="font-size:13px;color:${r?r.color:''}">${getLang()==='ru'?result.result.nameRu:result.result.name}</div>
      <div style="font-size:10px;color:${r?r.color+'88':''}">${r?r.name:''}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.05);margin-bottom:12px">-${result.cost} ●</div>
      <button class="quest-panel-btn" onclick="this.closest('.quest-overlay').remove();show()">OK</button>
    </div>`;
  document.body.appendChild(overlay);
}

function showItemDetail(itemId) {
  const item = store.getItem(itemId);
  if (!item) return;
  const r = store.getRarities().find(rr => rr.id === item.rarity);
  const c = store.getCategories().find(cc => cc.id === item.category);
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel" style="position:relative">
      <button style="position:absolute;top:8px;right:12px;font-size:18px;color:rgba(255,255,255,0.1);background:none" onclick="this.closest('.quest-overlay').remove()">&times;</button>
      <div class="quest-panel-title" style="color:${r?r.color:'#fff'}">${c?c.icon:''} ${getLang()==='ru'?item.nameRu:item.name}</div>
      <div style="font-size:11px;color:${r?r.color:'#fff'}">${r?r.name:''}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.1);margin-bottom:12px">${c?c.name:''}</div>
      <button class="quest-panel-btn" onclick="this.closest('.quest-overlay').remove()">OK</button>
    </div>`;
  document.body.appendChild(overlay);
}

function showOutfitPicker(slot) {
  const s = store.state;
  if (!currentNPC) return;
  const npcState = s.activeNPCs.find(n => n.id === currentNPC);
  if (!npcState) return;
  const compatible = s.inventory.filter(i => {
    if (slot === 'head') return ['masks','amulets'].includes(i.category);
    if (slot === 'body') return ['books','artifacts'].includes(i.category);
    if (slot === 'accessory') return ['crystals','seals','coins'].includes(i.category);
    return false;
  });
  if (compatible.length === 0) { showToast(t('inventory_empty')); return; }
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel" style="max-width:300px;max-height:60vh;overflow-y:auto;position:relative">
      <button style="position:sticky;top:0;float:right;font-size:18px;color:rgba(255,255,255,0.1);background:none;z-index:1" onclick="this.remove()">&times;</button>
      <div class="quest-panel-title">${t('slot_'+slot)}</div>
      ${compatible.map(item => {
        const r = store.getRarities().find(rr => rr.id === item.rarity);
        const c = store.getCategories().find(cc => cc.id === item.category);
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer" onclick="W._equipOutfit('${slot}','${item.uid}')">
          <span style="font-size:14px;color:${r?r.color:''}">${c?c.icon:'?'}</span>
          <span style="flex:1;font-size:10px;text-align:left;color:${r?r.color+'aa':''}">${getLang()==='ru'?item.nameRu:item.name}</span>
        </div>`;
      }).join('')}
    </div>`;
  document.body.appendChild(overlay);
}

/* ─── Global Handlers ─── */
window.W = {};

window.W._nav = (s) => {
  currentScreen = s;
  if (s !== 'character_detail') currentNPC = null;
  if (s !== 'collection') { currentCategory = null; currentRarity = null; }
  show();
};

window.W._lang = () => {
  const l = getLang() === 'en' ? 'ru' : 'en';
  localStorage.setItem('mason_lang', l);
  setLang(l);
  show();
};

window.W._cat = (cat) => { currentCategory = cat; showCollection(); };
window.W._rarity = (r) => { currentRarity = r; showCollection(); };
window.W._showItem = (id) => showItemDetail(id);
window.W._charDetail = (id) => { currentNPC = id; currentScreen = 'character_detail'; showCharacterDetail(); };
window.W._unlockNPC = (id) => { if (store.unlockNPC(id)) { playCollect(); showCharacters(); } else showToast(t('need_more_knowledge')); };

// Outfit
window.W._outfitSlot = (slot) => { showOutfitPicker(slot); };
window.W._equipOutfit = (slot, uid) => {
  if (store.equipOutfit(currentNPC, slot, uid)) {
    playCollect();
    document.querySelector('.quest-overlay')?.remove();
    showCharacterDetail();
  }
};
window.W._unequip = (slot) => {
  if (store.unequipOutfit(currentNPC, slot)) {
    playTap();
    showCharacterDetail();
  }
};

// Stats
window.W._upgradeStat = (key) => {
  if (store.upgradeStat(key)) { playCollect(); showStats(); }
  else showToast(t('no_points'));
};
window.W._navstats = () => { currentScreen = 'stats'; showStats(); };

// Quests
window.W._startQuest = (npcId) => {
  if (store.startQuest(npcId)) { playQuest(); showToast(t('quest_start')); showCharacterDetail(); }
  else showToast(t('quest_progress'));
};

// Merge
window.W._addToSlot = (idx) => showMergePicker(idx);
window.W._placeInSlot = (idx, uid) => {
  if (store.placeInMergeSlot(idx, uid)) { playTap(); document.querySelector('.quest-overlay')?.remove(); showMerge(); }
  else showToast(t('inventory_empty'));
};
window.W._removeSlot = (idx) => { store.removeFromMergeSlot(idx); playTap(); showMerge(); };
window.W._unlockSlot = (idx) => { if (store.unlockMergeSlot()) { playCollect(); showMerge(); } else showToast(t('merge_no_gold')); };
window.W._doMerge = () => {
  const result = store.tryMerge();
  if (!result || !result.result) { showToast(t('merge_empty')); playError(); return; }
  playMerge();
  showMergeResult(result);
};

// Inventory
window.W._useItem = (uid) => {
  const item = store.state.inventory.find(i => i.uid === uid);
  if (!item) return;
  if (store.collectItem(item.id)) {
    store.addCurrency('knowledge', 1);
    store.removeFromInventory(uid);
    playCollect();
    show();
    showToast(`+1 ${t('knowledge')}`);
  }
};

// Shop / Wallet
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
window.W._buyEnergy = () => {
  if (store.spendCurrency('gold', 50)) {
    store.state.energy = Math.min(100, store.state.energy + 50);
    store.save();
    playCollect();
    showToast(`+50 ${t('energy')}`);
  } else showToast(t('merge_no_gold'));
};

// Daily
window.W._daily = () => {
  if (!store.canClaimDaily()) return;
  const r = store.claimDaily();
  if (r) {
    playCollect();
    showToast(`+${r.gold} ● +${r.crystals} ⬡`);
    show();
  }
};

// NPC tap callback from game canvas
window._onNPCTap = (npcId, result) => {
  // Could show floating status
};

/* ─── Init ─── */
show();
