const ASSET = 'assets/';
window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();
import { loadUserData, saveUserData } from './firebase.js';
import { initWallet, connectWallet, disconnectWallet, isWalletConnected, getWalletAddress, setStatusChangeHandler } from './wallet.js';

const RARITIES = [
  { id: 'common', name: 'Common', color: '#9e9e9e', glow: '#9e9e9e33', cost: 0, img: 'gorilla-01.png', tapCostBase: 10, trainingHours: 6, dumbbellLevel: 1 },
  { id: 'uncommon', name: 'Uncommon', color: '#4caf50', glow: '#4caf5033', cost: 500, img: 'gorilla-01.png', tapCostBase: 25, trainingHours: 5, dumbbellLevel: 2 },
  { id: 'rare', name: 'Rare', color: '#2196f3', glow: '#2196f333', cost: 2000, img: 'gorilla-02.png', tapCostBase: 50, trainingHours: 6, dumbbellLevel: 3 },
  { id: 'epic', name: 'Epic', color: '#9c27b0', glow: '#9c27b033', cost: 8000, img: 'gorilla-02.png', tapCostBase: 100, trainingHours: 5, dumbbellLevel: 5 },
  { id: 'legendary', name: 'Legendary', color: '#ff9800', glow: '#ff980033', cost: 25000, img: 'gorilla-03.png', tapCostBase: 200, trainingHours: 6, dumbbellLevel: 7 },
  { id: 'mythic', name: 'Mythic', color: '#e91e63', glow: '#e91e6333', cost: 80000, img: 'gorilla-03.png', tapCostBase: 400, trainingHours: 4, dumbbellLevel: 8 },
  { id: 'ancient', name: 'Ancient', color: '#00bcd4', glow: '#00bcd433', cost: 200000, img: 'gorilla-03.png', tapCostBase: 800, trainingHours: 6, dumbbellLevel: 9 },
  { id: 'divine', name: 'Divine', color: '#ffc107', glow: '#ffc10733', cost: 500000, img: 'gorilla-03.png', tapCostBase: 1500, trainingHours: 3, dumbbellLevel: 10 },
  { id: 'secret', name: 'Secret', color: '#e0e0e0', glow: '#e0e0e033', cost: 1000000, img: 'gorilla-03.png', tapCostBase: 3000, trainingHours: 6, dumbbellLevel: 10 },
  { id: 'cosmic', name: 'Cosmic', color: '#7c4dff', glow: '#7c4dff55', cost: 9999999, img: 'gorilla-03.png', tapCostBase: 5000, trainingHours: 2, dumbbellLevel: 10 }
];

const GORILLA_SHOP = [
  { id: 'g0', name: 'БРУНО', rarity: 0, price: 0 },
  { id: 'g1', name: 'КИБОРГ', rarity: 1, price: 500 },
  { id: 'g2', name: 'НИНДЗЯ', rarity: 2, price: 2000 },
  { id: 'g3', name: 'АРХИМАГ', rarity: 3, price: 8000 },
  { id: 'g4', name: 'ТИТАН', rarity: 4, price: 25000 },
  { id: 'g5', name: 'ДРАКОН', rarity: 5, price: 80000 },
  { id: 'g6', name: 'ФЕНИКС', rarity: 6, price: 200000 },
  { id: 'g7', name: 'ДЕМОН', rarity: 7, price: 500000 },
  { id: 'g8', name: 'КОСМИЧЕСКИЙ', rarity: 8, price: 1000000 },
  { id: 'g9', name: 'ЛЕГЕНДА', rarity: 9, price: 9999999 }
];

const DUMBBELL_NAMES = {
  1: 'Железная', 2: 'Стальная', 3: 'Серебряная', 4: 'Золотая',
  5: 'Рубиновая', 6: 'Сапфировая', 7: 'Изумрудная', 8: 'Алмазная',
  9: 'Космическая', 10: 'Легендарная'
};

const MARKET_LOTS = [
  { id: 'lot1', gorillaId: 'g0', name: 'БРУНО', rarity: 0, level: 3, bid: 150, timer: 3600 },
  { id: 'lot2', gorillaId: 'g1', name: 'КИБОРГ', rarity: 1, level: 5, bid: 450, timer: 7200 },
  { id: 'lot3', gorillaId: 'g2', name: 'НИНДЗЯ', rarity: 2, level: 8, bid: 1200, timer: 1800 },
  { id: 'lot4', gorillaId: 'g3', name: 'АРХИМАГ', rarity: 3, level: 2, bid: 3000, timer: 5400 },
  { id: 'lot5', gorillaId: 'g4', name: 'ТИТАН', rarity: 4, level: 1, bid: 7500, timer: 9000 }
];

const state = {
  tab: 'gorillas',
  bananas: 50,
  gems: 0,
  grid: [0,0,0,0,0,0,0, 0,0,0,0,0,0,0, 0,0,1,1,1,0,0, 0,0,1,1,1,0,0, 0,0,1,1,1,0,0, 0,0,0,0,0,0,0, 0,0,0,0,0,0,0],
  queue: [1,1,1],
  gorillas: [
    { id: 'g0', name: 'БРУНО', rarity: 0, level: 1, feed: 0, tapCount: 0, trainingEnd: 0, earnedDumbbells: 0, equipped: null }
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
  tutorialDone: false,
  lockedCells: []
};

// Generate locked cells — only center 3×3 open
function generateLockedCells() {
  const open = [16,17,18,23,24,25,30,31,32];
  const locked = [];
  for (let i = 0; i < 49; i++) {
    if (!open.includes(i)) locked.push(i);
  }
  state.lockedCells = locked;
}

const $ = s => document.querySelector(s);
const image = l => ASSET + 'dumbbell-' + String(l).padStart(2,'0') + '.png';
function getRarity(r) { return RARITIES[r] || RARITIES[0]; }
function getGorillaImg(r) { return ASSET + RARITIES[r].img; }
function buzz() { navigator.vibrate?.(25); }
function haptic(t) { try { if(t==='tap') window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light'); else if(t==='collect') window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success'); else if(t==='error') window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('error'); else if(t==='tab') window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.(); else if(t==='merge') window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('medium'); }catch(e){} }
function formatTime(s) { const h=Math.floor(s/3600); const m=Math.floor((s%3600)/60); const sec=s%60; if(h>0) return h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); return m+':'+String(sec).padStart(2,'0'); }
function getOrCreateUserId() { let uid=localStorage.getItem('gm_uid'); if(!uid){uid='user_'+Math.random().toString(36).slice(2,10);localStorage.setItem('gm_uid',uid)} return uid; }

function item(level, extra = '') {
  if (level === 0) return '';
  return `<img src="${image(level)}" class="dumbbell${extra}" draggable="false" />`;
}

function toast(msg) {
  const t = $('#toast') || (()=>{const e=document.createElement('div');e.id='toast';e.className='toast';document.body.appendChild(e);return e;})();
  t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),1800);
}

function animateValue(el,start,end,duration) {
  if(start===end){el.textContent=end;return;}
  const range=end-start,startTime=performance.now();
  function step(now) {
    const p=Math.min((now-startTime)/duration,1);
    el.textContent=Math.round(start+range*(1-Math.pow(1-p,3)));
    if(p<1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function sync() {
  const b=document.getElementById('bananas'); if(b) animateValue(b,parseInt(b.textContent)||0,state.bananas,400);
  const g=document.getElementById('gems'); if(g) animateValue(g,parseInt(g.textContent)||0,state.gems,400);
}

function gorillas() {
  if(state.gorillas.length===0) return `<div class="gorilla-full"><div class="gorilla-empty"><div class="empty-lock">🔒</div><p>Нет горилл</p></div></div>`;
  const g = state.gorillas[state.gorillaIndex];
  const r = getRarity(g.rarity);
  const feedPct = Math.min(100, g.feed);
  const inTraining = g.trainingEnd > Date.now();
  const trainingLeft = inTraining ? Math.ceil((g.trainingEnd - Date.now()) / 1000) : 0;
  const currentTapCost = Math.floor(r.tapCostBase + g.tapCount * 1.5);
  const canTap = !inTraining && state.bananas >= currentTapCost && g.feed < 100;
  const trainingDone = g.trainingEnd > 0 && g.trainingEnd <= Date.now();

  let content = `
    <div class="gorilla-full">
      <div class="gorilla-full-card rarity-${r.id}" id="gorilla-tap-area">
        <div class="gorilla-top-info">
          <div class="gorilla-rarity-badge" style="background:${r.color}">${r.name}</div>
          <div class="gorilla-level-badge">LVL ${g.level}</div>
        </div>
        <div class="gorilla-tap-img-wrap">
          <img src="${inTraining ? ASSET + 'gorilla-03.png' : getGorillaImg(g.rarity)}" class="gorilla-tap-img" id="gorilla-img" draggable="false" />`;

  if (inTraining) {
    content += `<div class="training-overlay"><div class="training-icon">🏋️</div><div class="training-timer">${formatTime(trainingLeft)}</div><div class="training-label">Тренировка</div></div>`;
  } else if (trainingDone) {
    const earnedCount = 1 + g.level;
    const earnedLevel = Math.max(1, r.dumbbellLevel);
    content += `<div class="training-overlay training-done"><div class="training-icon">✅</div><div class="training-label">Тренировка завершена!</div><button class="btn-collect-training" id="btn-collect-training">ЗАБРАТЬ +${earnedCount} 🏋️</button></div>`;
  }

  content += `</div>
        <div class="gorilla-name-full" style="color:${r.color}">${g.name}</div>
        <div class="gorilla-tap-cost">${g.feed >= 100 ? '✓ Сыт!' : inTraining ? 'Тренируется...' : canTap ? `👆 ${currentTapCost} 🍌` : `Нужно ${currentTapCost} 🍌`}</div>
        <div class="gorilla-feed-bar-wrap">
          <div class="gorilla-feed-bar" style="width:${feedPct}%"></div>
          <span class="gorilla-feed-pct">${feedPct}%</span>
        </div>
        ${g.feed >= 100 && !inTraining && !trainingDone ? `<button class="btn-train" id="btn-send-training">🏋️ ОТПРАВИТЬ НА ТРЕНИРОВКУ</button>` : ''}
        ${!inTraining && !trainingDone && g.feed < 100 ? `<div class="gorilla-tap-hint">Тапни по горилле чтобы покормить</div>` : ''}
      </div>
    </div>`;

  if (state.gorillas.length > 1) {
    content += `
    <div class="gorilla-nav-row">
      <button class="g-arrow-left" data-arrow="left">◀</button>
      <div class="gorilla-dots">${state.gorillas.map((_,i)=>`<div class="g-dot${i===state.gorillaIndex?' active':''}" data-gdot="${i}"></div>`).join('')}</div>
      <button class="g-arrow-right" data-arrow="right">▶</button>
    </div>`;
  }

  content += `
    <div class="gorilla-shop-mini">
      <div class="shop-mini-title">МАГАЗИН ГОРИЛЛ</div>
      <div class="shop-mini-list" id="gorilla-shop">${GORILLA_SHOP.map(s=>{
        const rr=getRarity(s.rarity);
        const owned=state.gorillas.find(o=>o.id===s.id);
        return `<div class="shop-mini-item" data-gid="${s.id}">
          <div class="shop-mini-frame" style="border:2px solid ${rr.color};box-shadow:0 0 12px ${rr.glow};"><img src="${getGorillaImg(s.rarity)}" class="shop-mini-img" /></div>
          <div class="shop-mini-name" style="color:${rr.color}">${s.name}</div>
          <div class="shop-mini-rarity" style="background:${rr.color}">${rr.name}</div>
          <div class="shop-mini-price">${s.price} 🍌</div>
          <button class="shop-mini-btn${owned?' owned':''}" data-buy="${s.id}" ${owned?'disabled':''}>${owned?'✓':'КУПИТЬ'}</button>
        </div>`;
      }).join('')}</div>
    </div>`;

  return content;
}

function inventory() {
  let gridHtml = '';
  for(let i=0;i<49;i++) {
    const lv=state.grid[i]||0;
    const locked=isLocked(i);
    if(locked) gridHtml+=`<div class="cell locked" data-idx="${i}"><span class="locked-buy">🔒 ${(i+1)*5}🍌</span></div>`;
    else gridHtml+=`<div class="cell" data-idx="${i}">${lv?`<span class="level-badge">${lv}</span>${item(lv)}`:''}</div>`;
  }
  let queueHtml=state.queue.map((lv,i)=>`<div class="q-item" data-qidx="${i}">${item(lv)}<span class="q-timer">${i===0?'Готово':'02:'+String(27+i*3).padStart(2,'0')}</span></div>`).join('');
  return `<div class="inventory-head"><div class="inventory-title">INVENTORY</div><span class="tag">7×7</span></div>
    <div class="grid" id="merge-grid">${gridHtml}</div>
    <p class="hint">Перетащи одинаковые гантели чтобы соединить</p>
    <div class="queue-card"><div class="queue-label">СЛЕДУЮЩАЯ ГАНТЕЛЬ · В ОЧЕРЕДИ ЕЩЁ ${state.queue.length}</div>
    <div class="queue-items" id="queue-items">${queueHtml}</div></div>`;
}

function market() {
  const tabs = ['all','uncom','rare','epic','leg','mymarket'];
  const tabLabels = ['Все','Uncom','Rare','Epic','Leg','Мой'];
  let filtered = MARKET_LOTS;
  if(state.marketTab==='uncom') filtered = MARKET_LOTS.filter(l=>l.rarity===1);
  else if(state.marketTab==='rare') filtered = MARKET_LOTS.filter(l=>l.rarity===2);
  else if(state.marketTab==='epic') filtered = MARKET_LOTS.filter(l=>l.rarity===3);
  else if(state.marketTab==='leg') filtered = MARKET_LOTS.filter(l=>l.rarity>=4);
  else if(state.marketTab==='mymarket') filtered = [];

  let lotsHtml = filtered.length ? filtered.map(lot=>{
    const r=getRarity(lot.rarity);
    const sold=lot.timer<=0;
    return `<div class="lot-card${sold?' sold':''}" data-lot="${lot.id}">
      <div class="lot-img-wrap" style="border:2px solid ${r.color};box-shadow:0 0 15px ${r.glow};"><img src="${getGorillaImg(lot.rarity)}" class="lot-img" draggable="false" /></div>
      <div class="lot-info">
        <div class="lot-name" style="color:${r.color}">${lot.name}</div>
        <div class="rarity-badge" style="background:${r.color}">${r.name}</div>
        <div class="lot-level">Ур. ${lot.level}</div>
        <div class="lot-timer">${sold?'ПРОДАНО':formatTime(lot.timer)}</div>
        <div class="lot-bid">${lot.bid} 🍌</div>
      </div>
      <button class="btn-bid${sold?' disabled':''}" data-bid="${lot.id}" ${sold?'disabled':''}>${sold?'—':'СТАВКА'}</button>
    </div>`;
  }).join('') : '<div class="empty-market">Нет лотов</div>';

  let walletSection = state.walletConnected
    ? `<div class="wallet-section"><div class="wallet-addr">${state.walletAddr.slice(0,6)}...${state.walletAddr.slice(-4)}</div><button class="btn-disconnect" id="btn-disconnect">Отключить</button></div>`
    : `<div class="wallet-section"><button class="btn-connect" id="btn-connect">Подключить кошелёк</button></div>`;

  return `<div class="market-tabs">${tabs.map((t,i)=>`<button class="mtab${state.marketTab===t?' active':''}" data-mtab="${t}">${tabLabels[i]}</button>`).join('')}</div>
    <div class="lot-list">${lotsHtml}</div>${walletSection}`;
}

function quests() {
  let html = state.quests.map(q=>{
    const pct=Math.min(100,Math.round((q.progress/q.total)*100));
    const done=q.progress>=q.total;
    const claimable=done&&!q.claimed;
    const rewardLabel=q.rewardType==='gems'?`${q.reward} 💎`:`${q.reward} 🍌`;
    return `<div class="quest-card" data-qid="${q.id}">
      <div class="quest-icon">${q.icon}</div>
      <div class="quest-body">
        <div class="quest-title">${q.title}</div>
        <div class="quest-progress-bar"><div class="quest-fill" style="width:${pct}%"></div></div>
        <div class="quest-count">${q.progress}/${q.total}</div>
      </div>
      <div class="quest-reward">${rewardLabel}</div>
      <button class="btn-quest${claimable?' claimable':''}" data-claim="${q.id}" ${!claimable?'disabled':''}>${claimable?'ЗАБРАТЬ':done?'ЗАБРАНО':'В РАБОТЕ'}</button>
    </div>`;
  }).join('');
  return `<div class="quests-section"><div class="section-title">КВЕСТЫ</div><div class="quest-list">${html}</div></div>`;
}

function clan() {
  return `<div class="clan-panel">
    <div class="clan-crest">🦍</div>
    <div class="clan-name">APE MARVEL</div>
    <div class="clan-stats">
      <div class="clan-stat"><span class="stat-val">12</span><span class="stat-lbl">Участники</span></div>
      <div class="clan-stat"><span class="stat-val">156</span><span class="stat-lbl">Уровень</span></div>
      <div class="clan-stat"><span class="stat-val">42</span><span class="stat-lbl">Ранг</span></div>
    </div>
    <div class="clan-progress-wrap">
      <div class="clan-progress-label">Клановый опыт</div>
      <div class="clan-progress-bar"><div class="clan-progress-fill" style="width:65%"></div></div>
      <div class="clan-progress-text">650 / 1000</div>
    </div>
    <div class="clan-bonus">Бонус клана: +15% к бананам</div>
  </div>`;
}

function createBananaParticle(e) {
  const gorillaImg = document.getElementById('gorilla-img');
  if (!gorillaImg) return;
  const gr = gorillaImg.getBoundingClientRect();
  const cx = gr.left + gr.width / 2;
  const cy = gr.top + gr.height / 2;
  for (let i = 0; i < 5; i++) {
    const p = document.createElement('div');
    p.className = 'banana-particle';
    p.textContent = '🍌';
    const x = e?.clientX || window.innerWidth/2;
    const y = e?.clientY || window.innerHeight/2;
    p.style.left = (x - 10 + (Math.random() - 0.5) * 40) + 'px';
    p.style.top = (y - 10 + (Math.random() - 0.5) * 40) + 'px';
    const dx = cx - x + (Math.random() - 0.5) * 60;
    const dy = cy - y + (Math.random() - 0.5) * 60;
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
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
  g.feed = Math.min(100, g.feed + 2);
  g.tapCount++;
  state.totalTaps++;
  state.totalBananasEarned += cost;

  const img = document.getElementById('gorilla-img');
  if (img) { img.style.transform='scale(1.12)'; setTimeout(()=>img.style.transform='scale(1)',150); }

  createBananaParticle(e);
  haptic('tap');
  buzz();
  updateQuestProgress('tap');
  updateQuestProgress('bananas');
  sync();
  renderGorillaOnly();
}

function renderGorillaOnly() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g) return;
  const r = getRarity(g.rarity);
  const feedPct = Math.min(100, g.feed);
  const cost = Math.floor(r.tapCostBase + g.tapCount * 1.5);
  const inTraining = g.trainingEnd > Date.now();
  const trainingDone = g.trainingEnd > 0 && g.trainingEnd <= Date.now();

  const costEl = document.querySelector('.gorilla-tap-cost');
  const barEl = document.querySelector('.gorilla-feed-bar');
  const pctEl = document.querySelector('.gorilla-feed-pct');
  const hintEl = document.querySelector('.gorilla-tap-hint');
  const overlay = document.querySelector('.training-overlay');

  if (costEl) costEl.textContent = g.feed >= 100 ? '✓ Сыт!' : inTraining ? 'Тренируется...' : `👆 ${cost} 🍌`;
  if (barEl) barEl.style.width = feedPct + '%';
  if (pctEl) pctEl.textContent = feedPct + '%';

  if (g.feed >= 100 && !inTraining && !trainingDone) {
    if (hintEl) hintEl.remove();
    if (!document.querySelector('.btn-train')) {
      const wrap = document.querySelector('.gorilla-full-card');
      if (wrap) {
        const btn = document.createElement('button');
        btn.className = 'btn-train';
        btn.id = 'btn-send-training';
        btn.textContent = '🏋️ ОТПРАВИТЬ НА ТРЕНИРОВКУ';
        wrap.appendChild(btn);
        btn.addEventListener('click', sendToTraining);
      }
    }
  } else {
    const btn = document.querySelector('.btn-train');
    if (btn) btn.remove();
    if (!hintEl && !inTraining && !trainingDone && g.feed < 100) {
      const wrap = document.querySelector('.gorilla-full-card');
      if (wrap) {
        const div = document.createElement('div');
        div.className = 'gorilla-tap-hint';
        div.textContent = 'Тапни по горилле чтобы покормить';
        wrap.appendChild(div);
      }
    }
  }

  if (trainingDone && (!overlay || !overlay.classList.contains('training-done'))) {
    const imgWrap = document.querySelector('.gorilla-tap-img-wrap');
    if (imgWrap && !document.querySelector('.training-done')) {
      const oldOverlay = imgWrap.querySelector('.training-overlay');
      if (oldOverlay) oldOverlay.remove();
      const earnedCount = 1 + g.level;
      const earnedLevel = Math.max(1, r.dumbbellLevel);
      const div = document.createElement('div');
      div.className = 'training-overlay training-done';
      div.innerHTML = `<div class="training-icon">✅</div><div class="training-label">Тренировка завершена!</div><button class="btn-collect-training" id="btn-collect-training">ЗАБРАТЬ +${earnedCount} 🏋️</button>`;
      imgWrap.appendChild(div);
      document.getElementById('btn-collect-training')?.addEventListener('click', collectTraining);
    }
  }
}

function sendToTraining() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g || g.feed < 100 || g.trainingEnd > Date.now()) return;
  const r = getRarity(g.rarity);
  g.trainingEnd = Date.now() + r.trainingHours * 60 * 60 * 1000;
  g.feed = 0;
  g.tapCount = 0;
  state.totalTrainingSends++;
  haptic('collect');
  toast(`Отправлен на ${r.trainingHours}ч тренировку!`);
  updateQuestProgress('training');
  render();
}

function collectTraining() {
  const g = state.gorillas[state.gorillaIndex];
  if (!g || g.trainingEnd > Date.now()) return;
  const r = getRarity(g.rarity);
  const earnedCount = 1 + g.level;
  const earnedLevel = Math.max(1, r.dumbbellLevel);

  for (let i = 0; i < earnedCount; i++) {
    const emptyIdx = state.grid.indexOf(0);
    if (emptyIdx >= 0 && !isLocked(emptyIdx)) {
      state.grid[emptyIdx] = earnedLevel;
    } else {
      state.queue.push(earnedLevel);
    }
  }

  g.earnedDumbbells += earnedCount;
  g.trainingEnd = 0;
  haptic('collect');
  toast(`+${earnedCount} гантелей ${earnedLevel} уровня!`);
  render();
}

function isLocked(idx) {
  return state.lockedCells.includes(idx);
}

function buyGorilla(gid) {
  const shopItem = GORILLA_SHOP.find(g => g.id === gid);
  if (!shopItem) return;
  if (state.gorillas.find(g => g.id === gid)) { toast('Уже есть!'); return; }
  if (state.bananas < shopItem.price) { toast('Недостаточно бананов!'); return; }
  state.bananas -= shopItem.price;
  state.gorillas.push({
    id: shopItem.id, name: shopItem.name, rarity: shopItem.rarity,
    level: 1, feed: 0, tapCount: 0, trainingEnd: 0, earnedDumbbells: 0, equipped: null
  });
  state.gorillaIndex = state.gorillas.length - 1;
  toast('Куплено: '+shopItem.name+'!');
  haptic('collect');
  render();
}

function bindGorillaScreen() {
  document.querySelectorAll('[data-arrow]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.arrow;
      if (dir === 'left') state.gorillaIndex = Math.max(0, state.gorillaIndex-1);
      else state.gorillaIndex = Math.min(state.gorillas.length-1, state.gorillaIndex+1);
      haptic('tap');
      render();
    });
  });
  document.querySelectorAll('[data-gdot]').forEach(d => {
    d.addEventListener('click', () => {
      state.gorillaIndex = parseInt(d.dataset.gdot);
      render();
    });
  });
  document.getElementById('btn-send-training')?.addEventListener('click', sendToTraining);
  document.getElementById('btn-collect-training')?.addEventListener('click', collectTraining);
  document.querySelectorAll('[data-buy]').forEach(btn => {
    btn.addEventListener('click', () => {
      buyGorilla(btn.dataset.buy);
    });
  });
}

function bindGrid() {
  const cells = document.querySelectorAll('#merge-grid .cell:not(.locked)');
  // Buy locked cells
  document.querySelectorAll('#merge-grid .cell.locked').forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.dataset.idx);
      const price = (idx + 1) * 5;
      if (state.bananas < price) { toast(`Нужно ${price} 🍌 чтобы открыть!`); return; }
      state.bananas -= price;
      state.lockedCells = state.lockedCells.filter(l => l !== idx);
      haptic('collect');
      toast(`Ячейка открыта! -${price} 🍌`);
      sync();
      render();
    });
  });
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
        showDumbbellDetail(state.grid[dragIdx], dragIdx);
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

  document.querySelectorAll('#queue-items .q-item').forEach(qi => {
    qi.addEventListener('click', () => {
      const qidx = parseInt(qi.dataset.qidx);
      placeFromQueue(qidx);
    });
  });
}

function tryMerge(a, b) {
  if (isLocked(b)) return;
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

  haptic('merge');
  buzz();
  toast(`+${earned} 🍌`);

  updateQuestProgress('bananas');
  render();

  // Flash animation on merged cell
  setTimeout(() => {
    const mergedCell = document.querySelector(`#merge-grid .cell[data-idx="${b}"]`);
    if (mergedCell) {
      mergedCell.classList.add('merged');
      setTimeout(() => mergedCell.classList.remove('merged'), 400);
    }
  }, 50);
}

function placeFromQueue(qidx) {
  let emptyIdx = -1;
  for (let i = 0; i < 49; i++) {
    if (state.grid[i] === 0 && !isLocked(i)) { emptyIdx = i; break; }
  }
  if (emptyIdx === -1) { toast('Сетка заполнена!'); return; }
  state.grid[emptyIdx] = state.queue[qidx];
  state.queue.splice(qidx, 1);
  generateQueueItem();
  haptic('tap');
  render();
}

function generateQueueItem() {
  const maxLv = Math.min(10, Math.floor(state.totalTrainingSends / 3) + 2);
  state.queue.push(Math.ceil(Math.random() * maxLv));
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
      showLotDetail(card.dataset.lot);
    });
  });
  document.getElementById('btn-connect')?.addEventListener('click', () => connectWallet());
  document.getElementById('btn-disconnect')?.addEventListener('click', () => disconnectWallet());
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

function bindQuests() {
  document.querySelectorAll('[data-claim]').forEach(btn => {
    btn.addEventListener('click', () => {
      claimQuest(btn.dataset.claim);
    });
  });
}

function claimQuest(qid) {
  const q = state.quests.find(q => q.id === qid);
  if (!q || q.claimed || q.progress < q.total) return;
  q.claimed = true;
  if (q.rewardType === 'gems') state.gems += q.reward;
  else state.bananas += q.reward;
  haptic('collect');
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

function updateQuestProgress(type) {
  if (type === 'tap') {
    const q = state.quests.find(q => q.id === 'q1');
    if (q && !q.claimed) q.progress = Math.min(q.total, state.totalTaps);
  }
  if (type === 'training') {
    const q = state.quests.find(q => q.id === 'q2');
    if (q && !q.claimed) q.progress = Math.min(q.total, state.totalTrainingSends);
  }
  if (type === 'bananas') {
    const q = state.quests.find(q => q.id === 'q3');
    if (q && !q.claimed) q.progress = Math.min(q.total, state.totalBananasEarned);
  }
}

function updateBadges() {
  const questBadge = document.querySelector('[data-tab="quests"] .badge');
  if (questBadge) {
    const claimable = state.quests.filter(q => q.progress >= q.total && !q.claimed).length;
    questBadge.textContent = claimable > 0 ? claimable : '';
    questBadge.style.display = claimable > 0 ? '' : 'none';
  }
}

function showBottomSheet(content) {
  let overlay = document.getElementById('sheet-overlay');
  if (overlay) overlay.remove();
  overlay = document.createElement('div');
  overlay.id = 'sheet-overlay';
  overlay.className = 'bottom-sheet-overlay';
  overlay.innerHTML = `<div class="bottom-sheet">${content}</div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  const closeBtn = document.getElementById('sheet-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => { overlay.classList.remove('show'); setTimeout(()=>overlay.remove(),300); });
  }
}

function showDumbbellDetail(level, idx) {
  const nextLevel = level < 10 ? level + 1 : null;
  const name = DUMBBELL_NAMES[level] || `Уровень ${level}`;
  const nextName = nextLevel ? DUMBBELL_NAMES[nextLevel] : null;
  const earn = level * 5;
  const sellPrice = level * 10;

  let pathHtml = '';
  let lv = level;
  while (lv < 10) {
    const n = lv + 1;
    pathHtml += `<div class="path-step"><img src="${image(lv)}" class="path-img" /><span class="path-arrow">→</span><img src="${image(n)}" class="path-img" /></div>`;
    lv = n;
  }

  showBottomSheet(`
    <div class="detail-header">
      <img src="${image(level)}" class="detail-img" />
      <div class="detail-info">
        <div class="detail-name">${name}</div>
        <div class="detail-level">Уровень ${level}</div>
        <div class="detail-earn">+${earn} 🍌 за слияние</div>
        <div class="detail-sell">💰 ${sellPrice} 🍌 за продажу</div>
      </div>
    </div>
    ${nextLevel ? `
      <div class="detail-section">
        <div class="detail-section-title">Путь улучшения</div>
        <div class="detail-path">${pathHtml}</div>
        <div class="detail-note">Соедини 2 одинаковые чтобы получить ${nextName || 'следующий уровень'}</div>
      </div>
    ` : `
      <div class="detail-section">
        <div class="detail-section-title">МАКСИМУМ!</div>
        <div class="detail-note">Это самая сильная гантель! Держи её гордо 💪</div>
      </div>
    `}
    <div class="detail-buttons">
      <button class="btn-sell" id="btn-sell-dumbbell" data-idx="${idx !== undefined ? idx : ''}" data-level="${level}">ПРОДАТЬ за ${sellPrice} 🍌</button>
      <button class="btn-sheet-close" id="sheet-close">ЗАКРЫТЬ</button>
    </div>
  `);

  const sellBtn = document.getElementById('btn-sell-dumbbell');
  if (sellBtn) {
    sellBtn.addEventListener('click', () => {
      const i = parseInt(sellBtn.dataset.idx);
      const lv = parseInt(sellBtn.dataset.level);
      if (!isNaN(i) && state.grid[i] === lv) {
        sellDumbbell(i, lv);
      }
    });
  }
}

function sellDumbbell(idx, level) {
  if (state.grid[idx] !== level) return;
  const price = level * 10;

  state.grid[idx] = 0;
  state.bananas += price;
  state.totalBananasEarned += price;

  const overlay = document.getElementById('sheet-overlay');
  if (overlay) overlay.remove();

  showBananaCounter(price);

  haptic('collect');
  toast(`+${price} 🍌`);
  updateQuestProgress('bananas');
  render();
}

function showBananaCounter(amount) {
  const wallet = document.getElementById('bananas');
  if (!wallet) { const counter = document.createElement('div');
  counter.className = 'banana-sell-counter';
  counter.textContent = `+${amount} 🍌`;
  counter.style.left = (window.innerWidth / 2 - 70) + 'px';
  counter.style.top = (window.innerHeight / 2 - 20) + 'px';
  document.body.appendChild(counter);

  requestAnimationFrame(() => {
    counter.classList.add('flying');
  });

  setTimeout(() => counter.remove(), 1400); return; }
  const wr = wallet.getBoundingClientRect();
  for (let i = 0; i < 3; i++) {
    const p = document.createElement('div');
    p.className = 'banana-particle';
    p.textContent = '🍌';
    p.style.left = (window.innerWidth / 2 - 10 + (Math.random() - 0.5) * 80) + 'px';
    p.style.top = (window.innerHeight / 2 - 10 + (Math.random() - 0.5) * 60) + 'px';
    const dx = wr.left - parseFloat(p.style.left) + (Math.random() - 0.5) * 20;
    const dy = wr.top - parseFloat(p.style.top) + (Math.random() - 0.5) * 20;
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
  const counter = document.createElement('div');
  counter.className = 'banana-sell-counter';
  counter.textContent = `+${amount} 🍌`;
  counter.style.left = (window.innerWidth / 2 - 70) + 'px';
  counter.style.top = (window.innerHeight / 2 - 20) + 'px';
  document.body.appendChild(counter);

  requestAnimationFrame(() => {
    counter.classList.add('flying');
  });

  setTimeout(() => counter.remove(), 1400);
}

function showGorillaDetail(shopItem) {
  const r = getRarity(shopItem.rarity);
  const owned = state.gorillas.find(g => g.id === shopItem.id);
  let statsHtml = '';
  if (owned) {
    statsHtml = `<div class="detail-stats">
      <div class="detail-stat"><span class="stat-val">${owned.level}</span><span class="stat-lbl">Уровень</span></div>
      <div class="detail-stat"><span class="stat-val">${owned.feed}%</span><span class="stat-lbl">Сытость</span></div>
      <div class="detail-stat"><span class="stat-val">${owned.earnedDumbbells}</span><span class="stat-lbl">Гантели</span></div>
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
      <div class="detail-section-title">Характеристики</div>
      <div class="detail-perks">
        <div class="perk">👆 Стоимость тапа: ${r.tapCostBase} 🍌</div>
        <div class="perk">🏋️ Тренировка: ${r.trainingHours}ч</div>
        <div class="perk">💪 Гантели: уровень ${r.dumbbellLevel}</div>
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
}

document.addEventListener('click', e => {
  const navBtn = e.target.closest('.bottom-nav button');
  if (navBtn && navBtn.dataset.tab) {
    state.tab = navBtn.dataset.tab;
    haptic('tab');
    render(); return;
  }
});

document.addEventListener('pointerdown', e => {
  if (state.tab !== 'gorillas') return;
  const tapArea = e.target.closest('#gorilla-tap-area');
  if (!tapArea) return;
  if (e.target.closest('button')) return;
  if (e.target.closest('.training-overlay')) return;
  tapGorilla(e);
});

function getSerializableState() {
  return { bananas: state.bananas, gems: state.gems, grid: state.grid, queue: state.queue,
    gorillas: state.gorillas, totalTaps: state.totalTaps, totalTrainingSends: state.totalTrainingSends,
    totalBananasEarned: state.totalBananasEarned, quests: state.quests, lockedCells: state.lockedCells, tutorialDone: state.tutorialDone };
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
      if (data.totalTaps !== undefined) state.totalTaps = data.totalTaps;
      if (data.totalTrainingSends !== undefined) state.totalTrainingSends = data.totalTrainingSends;
      if (data.totalBananasEarned !== undefined) state.totalBananasEarned = data.totalBananasEarned;
      if (data.quests) state.quests = data.quests;
      if (data.lockedCells) state.lockedCells = data.lockedCells;
    }
  } catch (e) {
    console.warn('Failed to load from Firebase:', e);
  }
}

async function init() {
  state.userId = getOrCreateUserId();
  if (state.lockedCells.length === 0) generateLockedCells();
  initWallet();
  setStatusChangeHandler(addr => { state.walletConnected = !!addr; state.walletAddr = addr||''; if(state.tab==='market') render(); });
  await loadStateFromFirebase(state.userId);
  render();
  if (!state.tutorialDone) setTimeout(startTutorial, 500);
  setInterval(() => saveUserData(state.userId, getSerializableState()), 30000);
  setInterval(() => {
    let changed = false;
    state.gorillas.forEach(g => { if(g.trainingEnd > Date.now()) changed = true; });
    MARKET_LOTS.forEach(lot => { if(lot.timer > 0) { lot.timer--; changed = true; } });
    if(changed && (state.tab==='gorillas' || state.tab==='market')) render();
  }, 1000);
}

// ── TUTORIAL ──
const TUTORIAL_STEPS = [
  {
    target: '#gorilla-tap-area',
    title: '👋 Привет! Это Бруно',
    text: 'Тапай по горилле, чтобы кормить её бананами. Чем больше кормишь — тем сильнее она становится!',
    side: 'bottom'
  },
  {
    target: '#bananas',
    title: '🍌 Бананы',
    text: 'Твой счёт бананов. Бананы нужны чтобы кормить гориллу и открывать клетки.',
    side: 'top'
  },
  {
    target: '.bottom-nav button[data-tab="inventory"]',
    title: '🏋️ Инвентарь',
    text: 'Здесь клетки с гантелями. Перетаскивай одинаковые гантели друг на друга — они сольются в более сильную!',
    side: 'top'
  },
  {
    target: '.bottom-nav button[data-tab="market"]',
    title: '🐒 Магазин',
    text: 'Здесь можно купить новых горилл разной редкости. У каждой свои способности!',
    side: 'top'
  },
  {
    target: '[data-tab="gorillas"]',
    title: '🎯 Тренировка',
    text: 'Отправляй гориллу на тренировку — она будет приносить гантели. Жми кнопку "Тренировать"!',
    side: 'bottom'
  }
];

function startTutorial() {
  state.tutorialDone = true;
  let step = 0;

  function showStep() {
    const s = TUTORIAL_STEPS[step];
    if (!s) { document.getElementById('tutorial-overlay')?.remove(); return; }

    const target = document.querySelector(s.target);
    if (!target) { step++; showStep(); return; }
    const rect = target.getBoundingClientRect();

    // Создаём/обновляем оверлей
    let overlay = document.getElementById('tutorial-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'tutorial-overlay';
      overlay.innerHTML = `
        <div class="tutorial-backdrop" onclick="event.stopPropagation()"></div>
        <div class="tutorial-highlight"></div>
        <div class="tutorial-card">
          <div class="tutorial-gorilla">🦍👉</div>
          <div class="tutorial-title"></div>
          <div class="tutorial-text"></div>
          <div class="tutorial-dots"></div>
          <button class="tutorial-btn">Далее</button>
        </div>`;
      document.body.appendChild(overlay);
    }

    const highlight = overlay.querySelector('.tutorial-highlight');
    highlight.style.cssText = `left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;height:${rect.height}px;`;

    overlay.querySelector('.tutorial-title').textContent = s.title;
    overlay.querySelector('.tutorial-text').textContent = s.text;

    // dots
    const dots = overlay.querySelector('.tutorial-dots');
    dots.innerHTML = TUTORIAL_STEPS.map((_, i) =>
      `<span class="tutorial-dot${i === step ? ' active' : ''}"></span>`
    ).join('');

    const btn = overlay.querySelector('.tutorial-btn');
    btn.textContent = step === TUTORIAL_STEPS.length - 1 ? '❌ Закрыть' : '👉 Далее';
    btn.onclick = () => { step++; showStep(); };

    // Позиционируем карточку
    const card = overlay.querySelector('.tutorial-card');
    card.style.left = '';
    card.style.right = '';
    card.style.top = '';
    card.style.bottom = '';
    if (s.side === 'bottom') {
      card.style.top = (rect.bottom + 12) + 'px';
      card.style.left = Math.max(8, Math.min(rect.left + rect.width/2 - 140, window.innerWidth - 300)) + 'px';
    } else {
      card.style.top = (rect.top - 180) + 'px';
      if (rect.top < 200) card.style.top = (rect.bottom + 12) + 'px';
      card.style.left = Math.max(8, Math.min(rect.left + rect.width/2 - 140, window.innerWidth - 300)) + 'px';
    }
  }

  showStep();
}

init();
