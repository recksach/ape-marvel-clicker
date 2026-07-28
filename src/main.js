import { store } from './store.js';
import { RARITIES, ITEM_CATEGORIES, NPCS, LOCATIONS, MERGE_COST, MERGE_MATRIX, INITIAL_TUTORIAL, QUEST_DURATION } from './config.js';
import { initLang, setLang, getLang, t } from './i18n.js';
import { playTap, playCollect, playMerge, playQuest, playComplete, playError, playLevelUp } from './sounds.js';

let currentScreen = 'temple';
let currentCategory = null;
let currentNPC = null;
let currentRarity = null;

const $ = s => document.querySelector(s);
const fmt = n => String(Math.floor(n));

/* ─── Topbar ─── */
function topbar(title, extra) {
  const s = store.state;
  return `
    <div class="topbar">
      <div class="topbar-left">
        <span class="topbar-title">${title}</span>
      </div>
      <div class="topbar-right">
        <div class="currency-badge"><span class="currency-icon gold">●</span>${fmt(s.gold)}</div>
        <div class="currency-badge"><span class="currency-icon crystal">⬡</span>${fmt(s.crystals)}</div>
        <button class="lang-btn" onclick="W._lang()">${getLang() === 'en' ? 'EN' : 'RU'}</button>
      </div>
    </div>
  `;
}

/* ─── Bottom Nav ─── */
function bottomNav(active) {
  const items = [
    { key: 'temple', label: t('nav_temple'), icon: '△' },
    { key: 'collection', label: t('nav_collection'), icon: '☰' },
    { key: 'merge', label: t('nav_merge'), icon: '⬡' },
    { key: 'npc', label: t('nav_library'), icon: '◉' },
    { key: 'inventory', label: t('nav_vault'), icon: '▣' },
  ];
  return `<div class="bottomnav">
    ${items.map(it => `
      <button class="nav-item ${it.key === active ? 'active' : ''}" onclick="W._nav('${it.key}')">
        <div class="nav-icon">${it.icon}</div>
        <span class="nav-label">${it.label}</span>
      </button>
    `).join('')}
  </div>`;
}

/* ─── Show router ─── */
function show() {
  switch (currentScreen) {
    case 'temple': showTemple(); break;
    case 'collection': showCollection(); break;
    case 'merge': showMerge(); break;
    case 'npc': showNPCList(); break;
    case 'inventory': showInventory(); break;
    case 'npc_detail': showNPCDetail(); break;
    default: showTemple();
  }
  renderTutorial();
  updateTick();
}

/* ─── Temple ─── */
function showTemple() {
  const s = store.state;
  const total = s.totalCollected;
  const unique = Object.values(s.collection).filter(c => c > 0).length;
  const xpPct = Math.floor((s.xp / s.xpNeeded) * 100);
  document.getElementById('app').innerHTML = `
    <div class="screen active temple-screen">
      <div class="temple-bg">
        <div class="temple-bg-layer" style="background:radial-gradient(ellipse at 50% 30%,rgba(16,185,129,0.02) 0%,transparent 70%);animation:float 6s infinite"></div>
        <div class="temple-stars"></div>
        <div class="temple-bg-layer" style="bottom:0;height:40%;background:linear-gradient(0deg,rgba(16,185,129,0.02),transparent);opacity:0.5"></div>
      </div>
      ${topbar(t('appName'))}
      <div class="temple-content">
        <div class="temple-header">
          <div class="temple-eye"><div class="temple-eye-inner"></div></div>
          <div class="temple-greeting">${t('nav_temple')}</div>
          <div class="temple-sub">${t('collection_sub')}</div>
        </div>
        <div class="xp-bar-wrap">
          <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${xpPct}%"></div></div>
          <div class="xp-bar-label"><span>${t('level')} ${s.level}</span><span>${fmt(s.xp)}/${fmt(s.xpNeeded)} ${t('xp')}</span></div>
        </div>
        <div class="temple-stats">
          <div class="temple-stat">
            <div class="temple-stat-value">${total}</div>
            <div class="temple-stat-label">${t('total')}</div>
          </div>
          <div class="temple-stat">
            <div class="temple-stat-value">${unique}</div>
            <div class="temple-stat-label">${t('unique')}</div>
          </div>
          <div class="temple-stat">
            <div class="temple-stat-value">${s.completedQuests}</div>
            <div class="temple-stat-label">${t('quests_completed')}</div>
          </div>
          <div class="temple-stat">
            <div class="temple-stat-value">${s.level}</div>
            <div class="temple-stat-label">${t('level')}</div>
          </div>
        </div>
        <div class="temple-actions">
          <button class="temple-action" onclick="W._nav('collection')">
            <div class="temple-action-icon">☰</div>
            <div class="temple-action-label">${t('nav_collection')}</div>
            <div class="hint">${unique}/135+</div>
          </button>
          <button class="temple-action" onclick="W._nav('merge')">
            <div class="temple-action-icon">⬡</div>
            <div class="temple-action-label">${t('nav_merge')}</div>
          </button>
          <button class="temple-action" onclick="W._nav('npc')">
            <div class="temple-action-icon">◉</div>
            <div class="temple-action-label">${t('nav_library')}</div>
          </button>
          <button class="temple-action" onclick="W._daily()">
            <div class="temple-action-icon">◎</div>
            <div class="temple-action-label">${t('daily_title')}</div>
            <div class="hint">${t('daily_streak')} ${s.streak}</div>
          </button>
        </div>
        ${s.questActive ? `<div class="quest-panel" style="margin-top:8px">
          <div class="quest-panel-title">${t('quest_progress')}</div>
          <div class="quest-panel-progress"><div class="quest-panel-fill" id="questFill" style="width:${(store.getQuestProgress()*100).toFixed(0)}%"></div></div>
        </div>` : ''}
      </div>
      ${bottomNav('temple')}
    </div>`;
}

/* ─── Collection ─── */
function showCollection(catFilter) {
  if (catFilter) currentCategory = catFilter;
  const s = store.state;
  const items = store.getAllItems();
  const cats = ITEM_CATEGORIES;
  const totalAll = items.length;
  const unique = Object.values(s.collection).filter(c => c > 0).length;
  const pct = Math.floor((unique / totalAll) * 100);

  let filtered = items;
  if (currentCategory) filtered = filtered.filter(i => i.category === currentCategory);

  document.getElementById('app').innerHTML = `
    <div class="screen active collection-screen">
      ${topbar(t('collection_title'))}
      <div class="coll-header">
        <div class="coll-title">${t('collection_title')}</div>
        <div class="coll-sub">${unique}/${totalAll} ${t('unique')}</div>
      </div>
      <div class="coll-progress-bar"><div class="coll-progress-fill" style="width:${pct}%"></div></div>
      <div class="coll-tabs">
        <button class="coll-tab ${!currentCategory ? 'active' : ''}" onclick="W._cat(null)">${t('total')}</button>
        ${cats.map(c => {
          const prog = store.getCategoryProgress(c.id);
          return `<button class="coll-tab ${currentCategory === c.id ? 'active' : ''}" onclick="W._cat('${c.id}')">${c.icon} ${getLang()==='ru'?c.nameRu:c.name} (${prog.owned})</button>`;
        }).join('')}
      </div>
      <div class="coll-grid">
        ${filtered.map(item => {
          const count = s.collection[item.id] || 0;
          const owned = count > 0;
          const rarityDef = RARITIES.find(r => r.id === item.rarity);
          const catDef = ITEM_CATEGORIES.find(c => c.id === item.category);
          return `<div class="coll-item ${owned ? 'owned' : ''} ${owned && rarityDef && rarityDef.bonus >= 10 ? 'highlight' : ''}" style="${owned && rarityDef ? `border-color:${rarityDef.color}22` : ''}" onclick="${!owned ? `W._showItem('${item.id}')` : ''}">
            <div class="coll-item-icon">${catDef ? catDef.icon : '?'}</div>
            <div class="coll-item-name" style="${owned && rarityDef ? `color:${rarityDef.color}44` : ''}">${getLang()==='ru'?item.nameRu:item.name}</div>
            ${owned ? `<div class="coll-item-count">${count}</div>` : ''}
          </div>`;
        }).join('')}
      </div>
      ${bottomNav('collection')}
    </div>`;
}

/* ─── Merge ─── */
function showMerge() {
  const s = store.state;
  const filled = s.mergeSlots.filter(sl => sl !== null).length;
  const canMerge = filled >= 2;
  const allSame = filled >= 2 && s.mergeSlots.filter(sl => sl !== null).every(sl => sl.rarity === s.mergeSlots.find(sl2 => sl2 !== null)?.rarity);
  const mergeEnabled = canMerge && allSame;

  document.getElementById('app').innerHTML = `
    <div class="screen active merge-screen">
      ${topbar(t('merge_title'))}
      <div class="merge-header">
        <div class="merge-title">${t('merge_title')}</div>
        <div class="merge-sub">${t('merge_sub')}</div>
      </div>
      <div class="merge-grid">
        ${s.mergeSlots.map((slot, i) => {
          const unlocked = s.mergeSlotsUnlocked.includes(i);
          const isFilled = slot !== null;
          const rarityDef = isFilled ? RARITIES.find(r => r.id === slot.rarity) : null;
          const catDef = isFilled ? ITEM_CATEGORIES.find(c => c.id === slot.category) : null;
          if (!unlocked) {
            const cost = MERGE_COST.common * (i + 1);
            return `<div class="merge-slot locked" onclick="W._unlockSlot(${i})">
              <div class="merge-slot-lock">🔒</div>
              <div class="merge-slot-cost">${cost}●</div>
            </div>`;
          }
          if (!isFilled) {
            return `<div class="merge-slot" onclick="W._addToSlot(${i})">
              <div class="merge-slot-icon">+</div>
            </div>`;
          }
          return `<div class="merge-slot filled" style="border-color:${rarityDef ? rarityDef.color + '22' : ''}" onclick="W._removeSlot(${i})">
            <div class="merge-slot-icon">${catDef ? catDef.icon : '?'}</div>
            <div class="merge-slot-rarity" style="color:${rarityDef ? rarityDef.color : ''}">${getLang()==='ru'?rarityDef?.nameRu:rarityDef?.name}</div>
          </div>`;
        }).join('')}
      </div>
      <button class="merge-btn" onclick="W._doMerge()" ${mergeEnabled ? '' : 'disabled'}>
        ${t('merge_btn')} ${mergeEnabled ? `— ${MERGE_COST[s.mergeSlots.find(sl => sl !== null)?.rarity] || 50} ●` : filled < 2 ? t('merge_select') : !allSame ? t('merge_empty') : ''}
      </button>
      <div class="merge-info">
        ${filled}/9 ${t('merge_select')} | ${s.mergeSlotsUnlocked.length}/9 ${t('merge_unlock')}
      </div>
      ${bottomNav('merge')}
    </div>`;
}

/* ─── NPC List ─── */
function showNPCList() {
  document.getElementById('app').innerHTML = `
    <div class="screen active npc-screen">
      ${topbar(t('npc_title'))}
      <div class="npc-scroll">
        ${NPCS.map(npc => {
          const color = npc.color || '#8b7355';
          return `<div class="npc-card" onclick="W._npcDetail('${npc.id}')">
            <div class="npc-avatar" style="background:${color}08;border:1px solid ${color}15;color:${color}">◉</div>
            <div class="npc-info">
              <div class="npc-name">${getLang() === 'ru' ? npc.nameRu : npc.name}</div>
              <div class="npc-role">${t('npc_' + npc.id)?.substring(0, 40) || ''}</div>
            </div>
            <div style="color:rgba(255,255,255,0.1);font-size:12px">→</div>
          </div>`;
        }).join('')}
      </div>
      ${bottomNav('npc')}
    </div>`;
}

/* ─── NPC Detail ─── */
function showNPCDetail() {
  if (!currentNPC) { showNPCList(); return; }
  const s = store.state;
  const npc = NPCS.find(n => n.id === currentNPC);
  if (!npc) { showNPCList(); return; }
  const color = npc.color || '#8b7355';
  const questActive = s.questActive && s.questNPC === npc.id;
  const canQuest = !s.questActive;

  document.getElementById('app').innerHTML = `
    <div class="screen active npc-screen">
      ${topbar(getLang() === 'ru' ? npc.nameRu : npc.name, `<button class="topbar-back" onclick="W._nav('npc')">←</button>`)}
      <div class="npc-scroll">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div class="npc-avatar" style="width:56px;height:56px;border-radius:12px;background:${color}08;border:2px solid ${color}20;color:${color};font-size:28px;display:flex;align-items:center;justify-content:center">◉</div>
          <div>
            <div style="font-size:15px;font-weight:600;color:rgba(255,255,255,0.5)">${getLang() === 'ru' ? npc.nameRu : npc.name}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.1)">${npc.role}</div>
          </div>
        </div>
        <div class="npc-dialog">${t('npc_' + npc.id)}</div>
        <div class="npc-actions">
          ${canQuest ? `<button class="npc-btn primary" onclick="W._startQuest('${npc.id}')">${t('quest_start')}</button>` : 
            questActive ? `<button class="npc-btn secondary" disabled>${t('quest_progress')}</button>` : 
            `<button class="npc-btn primary" onclick="W._startQuest('${npc.id}')">${t('quest_start')}</button>`}
          <button class="npc-btn secondary" onclick="W._nav('collection')">${t('nav_collection')}</button>
        </div>
        ${questActive ? `
          <div class="quest-panel" style="margin-top:12px">
            <div class="quest-panel-title">${t('quest_progress')}</div>
            <div class="quest-panel-progress"><div class="quest-panel-fill" id="questFill2" style="width:${(store.getQuestProgress()*100).toFixed(0)}%"></div></div>
          </div>
        ` : ''}
      </div>
      ${bottomNav('npc')}
    </div>`;
}

/* ─── Inventory ─── */
function showInventory() {
  const s = store.state;
  const inv = s.inventory;
  document.getElementById('app').innerHTML = `
    <div class="screen active collection-screen">
      ${topbar(t('inventory_title'))}
      <div class="merge-header" style="padding-top:56px">
        <div class="merge-title">${t('inventory_title')}</div>
        <div class="merge-sub">${inv.length}/50</div>
      </div>
      ${inv.length === 0 ? `<div class="inv-empty">${t('inventory_empty')}</div>` : `
        <div class="inv-grid">
          ${inv.map(item => {
            const rarityDef = RARITIES.find(r => r.id === item.rarity);
            const catDef = ITEM_CATEGORIES.find(c => c.id === item.category);
            return `<div class="inv-item" style="border-color:${rarityDef ? rarityDef.color + '15' : ''}" onclick="W._useItem('${item.uid}')">
              <div class="inv-item-icon">${catDef ? catDef.icon : '?'}</div>
              <div class="inv-item-name" style="color:${rarityDef ? rarityDef.color + '44' : ''}">${getLang()==='ru'?item.nameRu:item.name}</div>
            </div>`;
          }).join('')}
        </div>
      `}
      ${bottomNav('inventory')}
    </div>`;
}

/* ─── Quests tick ─── */
let _questJustCompleted = false;
function updateTick() {
  const s = store.state;
  if (s.questActive && !_questJustCompleted) {
    const completed = store.tickQuest();
    if (completed) {
      _questJustCompleted = true;
      playComplete();
      showToast(t('quest_complete'));
      setTimeout(() => { _questJustCompleted = false; show(); }, 800);
      return;
    }
  }
  // Update quest progress bars without re-render
  const pct = (store.getQuestProgress() * 100).toFixed(0) + '%';
  const fill = document.getElementById('questFill');
  if (fill) fill.style.width = pct;
  const fill2 = document.getElementById('questFill2');
  if (fill2) fill2.style.width = pct;
}

let tickInterval = null;
function startTick() {
  if (tickInterval) return;
  tickInterval = setInterval(updateTick, 1000);
}
function stopTick() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}

/* ─── Toast ─── */
function showToast(msg) {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

/* ─── Daily Bonus ─── */
function showDailyBonus() {
  if (!store.canClaimDaily()) return;
  const s = store.state;
  const overlay = document.createElement('div');
  overlay.id = 'dailyOverlay';
  overlay.className = 'daily-overlay';
  overlay.innerHTML = `
    <div class="daily-panel" style="position:relative">
      <button class="daily-close" onclick="document.getElementById('dailyOverlay').remove()">&times;</button>
      <div class="daily-title">${t('daily_title')}</div>
      <div class="daily-streak">${t('daily_streak')}: ${s.streak + 1}</div>
      <div class="daily-rewards">
        <div class="daily-reward">
          <div class="daily-reward-icon">●</div>
          <div class="daily-reward-amount">+${(s.streak + 1) * 10}</div>
          <div style="font-size:8px;color:rgba(255,255,255,0.1)">${t('daily_gold')}</div>
        </div>
        <div class="daily-reward">
          <div class="daily-reward-icon">⬡</div>
          <div class="daily-reward-amount">+${Math.floor((s.streak + 1) / 2)}</div>
          <div style="font-size:8px;color:rgba(255,255,255,0.1)">${t('daily_crystals')}</div>
        </div>
      </div>
      <button class="daily-btn" onclick="W._claimDaily()">${t('daily_claim')}</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ─── Tutorial ─── */
function renderTutorial() {
  const s = store.state;
  if (s.tutorialDone) return;
  let existing = document.getElementById('tutOverlay');
  if (existing) existing.remove();

  const step = s.tutorialStep;
  if (step >= INITIAL_TUTORIAL.length) return;

  const overlay = document.createElement('div');
  overlay.id = 'tutOverlay';
  overlay.className = 'tut-overlay';
  overlay.innerHTML = `
    <div class="tut-panel">
      <div class="tut-text">${t(INITIAL_TUTORIAL[step])}</div>
      <div class="tut-actions">
        <button class="tut-btn primary" onclick="W._tutNext()">${t('tut_next')}</button>
        <button class="tut-btn skip" onclick="W._tutSkip()">${t('tut_skip')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ─── Item reveal ─── */
function showItemDetail(itemId) {
  const item = store.getItem(itemId);
  if (!item) return;
  const rarityDef = RARITIES.find(r => r.id === item.rarity);
  const catDef = ITEM_CATEGORIES.find(c => c.id === item.category);
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel" style="position:relative">
      <button style="position:absolute;top:8px;right:12px;font-size:18px;color:rgba(255,255,255,0.1);background:none" onclick="this.closest('.quest-overlay').remove()">&times;</button>
      <div class="quest-panel-title" style="color:${rarityDef ? rarityDef.color : '#fff'}">${catDef ? catDef.icon : ''} ${getLang()==='ru'?item.nameRu:item.name}</div>
      <div style="font-size:11px;color:${rarityDef ? rarityDef.color : '#fff'};margin:4px 0">${rarityDef ? (getLang()==='ru'?rarityDef.nameRu:rarityDef.name) : ''}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.1);margin-bottom:12px">${getLang()==='ru'?catDef?.nameRu:catDef?.name}</div>
      <button class="quest-panel-btn" onclick="this.closest('.quest-overlay').remove()">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ─── Merge slot picker ─── */
function showMergePicker(idx) {
  const s = store.state;
  const inv = s.inventory;
  if (inv.length === 0) { showToast(t('inventory_empty')); return; }
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel" style="max-width:300px;max-height:60vh;overflow-y:auto;position:relative">
      <button style="position:sticky;top:0;float:right;font-size:18px;color:rgba(255,255,255,0.1);background:none;z-index:1" onclick="this.closest('.quest-overlay').remove()">&times;</button>
      <div class="quest-panel-title" style="margin-bottom:8px">${t('merge_select')}</div>
      ${inv.map(item => {
        const rarityDef = RARITIES.find(r => r.id === item.rarity);
        const catDef = ITEM_CATEGORIES.find(c => c.id === item.category);
        return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.03);cursor:pointer" onclick="W._placeInSlot(${idx},'${item.uid}')">
          <span style="font-size:16px">${catDef ? catDef.icon : '?'}</span>
          <span style="flex:1;font-size:10px;text-align:left;color:${rarityDef ? rarityDef.color : ''}">${getLang()==='ru'?item.nameRu:item.name}</span>
          <span style="font-size:8px;color:rgba(255,255,255,0.1)">${rarityDef ? (getLang()==='ru'?rarityDef.nameRu:rarityDef.name) : ''}</span>
        </div>`;
      }).join('')}
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ─── Merge result ─── */
function showMergeResult(result) {
  const rarityDef = RARITIES.find(r => r.id === result.nextRarity);
  const catDef = ITEM_CATEGORIES.find(c => c.id === result.result.category);
  const overlay = document.createElement('div');
  overlay.className = 'quest-overlay';
  overlay.innerHTML = `
    <div class="quest-panel">
      <div class="quest-panel-title" style="color:${rarityDef ? rarityDef.color : '#f7c948'}">${t('merge_success')}!</div>
      <div style="font-size:32px;margin:8px 0">${catDef ? catDef.icon : '⬡'}</div>
      <div style="font-size:13px;font-weight:600;color:${rarityDef ? rarityDef.color : '#f7c948'}">${getLang()==='ru'?result.result.nameRu:result.result.name}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.1);margin:4px 0">${rarityDef ? (getLang()==='ru'?rarityDef.nameRu:rarityDef.name) : ''}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.05);margin-bottom:12px">-${result.cost} ●</div>
      <button class="quest-panel-btn" onclick="this.closest('.quest-overlay').remove();show()">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ─── Global Handlers ─── */
window.W = {};

window.W._nav = (s) => {
  currentScreen = s;
  if (s !== 'npc_detail') currentNPC = null;
  if (s !== 'collection') currentCategory = null;
  show();
};
window.W._lang = () => {
  setLang(getLang() === 'en' ? 'ru' : 'en');
  show();
};
window.W._cat = (cat) => {
  currentCategory = cat;
  showCollection();
};
window.W._npcDetail = (id) => {
  currentNPC = id;
  currentScreen = 'npc_detail';
  showNPCDetail();
};
window.W._startQuest = (npcId) => {
  if (store.startQuest(npcId)) {
    playQuest();
    showToast(t('quest_start'));
    show();
  } else {
    showToast(t('quest_progress'));
  }
};
window.W._showItem = (id) => { showItemDetail(id); };
window.W._addToSlot = (idx) => { showMergePicker(idx); };
window.W._placeInSlot = (idx, uid) => {
  if (store.placeInMergeSlot(idx, uid)) {
    playTap();
    document.querySelector('.quest-overlay')?.remove();
    showMerge();
  } else {
    showToast(t('inventory_empty'));
  }
};
window.W._removeSlot = (idx) => {
  store.removeFromMergeSlot(idx);
  playTap();
  showMerge();
};
window.W._unlockSlot = (idx) => {
  if (store.unlockMergeSlot()) { playCollect(); showMerge(); }
  else showToast(t('merge_no_gold'));
};
window.W._doMerge = () => {
  const result = store.tryMerge();
  if (!result) { showToast(t('merge_empty')); playError(); return; }
  if (!result.result) {
    if (result.messageKey) showToast(t(result.messageKey));
    playError();
    return;
  }
  playMerge();
  showMergeResult(result);
};
window.W._useItem = (uid) => {
  const item = store.state.inventory.find(i => i.uid === uid);
  if (!item) return;
  const catDef = ITEM_CATEGORIES.find(c => c.id === item.category);
  // Click to collect + gain knowledge
  if (store.collectItem(item.id)) {
    store.addCurrency('knowledge', 1);
    store.removeFromInventory(uid);
    playCollect();
    show();
    showToast(`+1 ${t('knowledge')}`);
  }
};
window.W._daily = () => { showDailyBonus(); };
window.W._claimDaily = () => {
  const r = store.claimDaily();
  if (r) {
    playCollect();
    document.getElementById('dailyOverlay')?.remove();
    show();
    showToast(`+${r.gold} ● +${r.crystals} ⬡`);
  }
};
window.W._tutNext = () => {
  store.advanceTutorial();
  document.getElementById('tutOverlay')?.remove();
  renderTutorial();
};
window.W._tutSkip = () => {
  store.completeTutorial();
  document.getElementById('tutOverlay')?.remove();
};

/* ─── Init ─── */
initLang();
startTick();

// Check Telegram
if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

// Show
currentScreen = 'temple';
currentCategory = null;
show();

// Daily bonus check
setTimeout(() => {
  if (store.canClaimDaily()) showDailyBonus();
}, 1000);
