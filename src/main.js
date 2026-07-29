const ASSET = 'assets/';
window.Telegram?.WebApp?.ready();
window.Telegram?.WebApp?.expand();

import { loadUserData, saveUserData } from './firebase.js';
import { initWallet, connectWallet, disconnectWallet, isWalletConnected, getWalletAddress, setStatusChangeHandler } from './wallet.js';

function getOrCreateUserId() {
  let uid = localStorage.getItem('ape_user_id');
  if (!uid) {
    uid = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    localStorage.setItem('ape_user_id', uid);
  }
  return uid;
}

const state = {
  tab: 'inventory',
  bananas: 1280,
  gems: 42,
  grid: [1,1,2,2,3,3,4,4,0,1,0,2,0,3,0,0,4,0,0,1,0,2,0,0,3,0,0,4,0,0,1,0,0,2,0,0,3,0,0,4,0,0,1,0,0,2,0,0,3],
  queue: [1,1,2,1],
  feed: 62,
  walletConnected: false,
  walletAddr: ''
};

const $ = s => document.querySelector(s);
const image = l => `${ASSET}dumbbell-${String(l).padStart(2, '0')}.png`;

function sync() {
  $('#bananas').textContent = state.bananas.toLocaleString('ru-RU');
  $('#gems').textContent = state.gems;
}

function toast(t) {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 1800);
}

function buzz() { navigator.vibrate?.(25); }

function item(level, extra = '') {
  return `<img ${extra} draggable="true" class="dumbbell" src="${image(level)}" alt="Гантель уровня ${level}">`;
}

function inventory() {
  return `<div class="inventory-head"><div><h1>Инвентарь</h1><p class="sub">Соединяй одинаковые гантели</p></div><span class="tag">7 × 7</span></div><div id="grid" class="grid">${state.grid.map((l, i) => `<div class="slot ${l ? '' : 'empty'}" data-index="${i}" ${l ? `data-level="${l}"` : ''}>${l ? item(l, `data-index="${i}"`) : ''}</div>`).join('')}</div><p class="hint">Зажми гантель и перетащи её в свободную ячейку или на такую же.</p><section class="queue-card"><div class="queue-title">СЛЕДУЮЩАЯ ГАНТЕЛЬ · В ОЧЕРЕДИ ЕЩЁ ${state.queue.length}</div><div class="queue">${state.queue.map((l, i) => `<div class="queue-item">${item(l)}<button aria-label="Поставить гантель" data-queue="${i}"></button><time>${i ? '02:27:01' : 'Готово'}</time></div>`).join('')}</div></section>`;
}

function gorillas() {
  return `<h1>Гориллы</h1><p class="sub">Корми бойца — повышай его уровень.</p><section class="gorilla-card"><div class="rarity">● RARE · LVL 7</div><h2>БРУНО</h2><img src="${ASSET}gorilla-03.png" alt="Горилла Бруно"><div class="progress"><b style="width:${state.feed}%"></b></div><button id="feed" class="feed">ЖМИ И КОРМИ 🍌 75</button></section>`;
}

function market() {
  let levels = [4, 6, 8, 10];
  return `<h1>Рынок</h1><p class="sub">Аукционы стаи · обновляются в реальном времени</p><div class="cards">${levels.map((l, i) => `<article class="lot"><img src="${image(l)}" alt="Лот"><div><b>Гантель LVL ${l}</b><small>Закончится через 0${i + 1}:1${i}:2${i}</small><br><small>Ставка: ${300 * (i + 1)} 🍌</small></div><button data-buy="${300 * (i + 1)}">СТАВКА</button></article>`).join('')}</div><div class="wallet-section"><h3>TON Wallet</h3>${state.walletConnected ? `<span class="wallet-addr">${(state.walletAddr || '').slice(0, 6)}...${(state.walletAddr || '').slice(-4)}</span><button class="btn-disconnect" id="disconnectWallet">Отключить</button>` : `<button class="btn-connect" id="connectWallet">Подключить кошелёк</button>`}</div>`;
}

function quests() {
  let q = [
    ['🔗', 'Соедини гантели 50 раз', '30 / 50', 60],
    ['🍌', 'Накорми горилл 10 раз', '4 / 10', 40],
    ['⚡', 'Собери 500 бананов', '500 / 500', 100]
  ];
  return `<h1>Задания</h1><p class="sub">Ежедневные награды</p><div class="cards">${q.map(([ico, title, v, p], i) => `<article class="quest"><span class="icon">${ico}</span><div><b>${title}</b><small>${v}</small><div class="mini-progress"><span style="width:${p}%"></span></div></div>${i === 2 ? '<button class="claim">ЗАБРАТЬ</button>' : '<small>В РАБОТЕ</small>'}</article>`).join('')}</div>`;
}

function clan() {
  return `<section class="panel clan"><div class="crest">♜</div><h1>СТАЯ «ГОРИЛЛЫ»</h1><p class="sub">12 участников · общий уровень 214</p><div class="progress"><b style="width:74%"></b></div><p class="hint">До следующего уровня стаи: 2 600 силы</p></section>`;
}

function render() {
  const v = { inventory, gorillas, market, quests, clan }[state.tab];
  $('#screen').innerHTML = v();
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === state.tab));
  sync();
  if (state.tab === 'inventory') bindGrid();
  if (state.tab === 'market') bindMarket();
}

function bindGrid() {
  let from = null;
  const move = to => {
    if (from === null || from === to) return;
    const a = state.grid[from], b = state.grid[to];
    if (!b) {
      state.grid[to] = a;
      state.grid[from] = 0;
      toast('Гантель перемещена');
    } else if (a === b && a < 10) {
      state.grid[to] = a + 1;
      state.grid[from] = 0;
      state.bananas += a * 20;
      toast(`MERGE! +${a * 20} 🍌`);
      buzz();
    } else {
      [state.grid[to], state.grid[from]] = [a, b];
      toast('Поменяли местами');
    }
    render();
  };
  document.querySelectorAll('.dumbbell').forEach(el => {
    el.addEventListener('dragstart', e => { from = +el.dataset.index; e.dataTransfer.effectAllowed = 'move'; });
    el.addEventListener('dragend', () => from = null);
    el.addEventListener('pointerdown', e => {
      if (el.dataset.index === undefined) return;
      from = +el.dataset.index;
      el.setPointerCapture?.(e.pointerId);
      el.classList.add('touching');
    });
    el.addEventListener('pointerup', e => {
      const slot = document.elementFromPoint(e.clientX, e.clientY)?.closest('.slot');
      el.classList.remove('touching');
      if (slot) move(+slot.dataset.index);
      from = null;
    });
    el.addEventListener('pointercancel', () => { from = null; el.classList.remove('touching'); });
  });
  document.querySelectorAll('.slot').forEach(s => {
    s.addEventListener('dragover', e => { e.preventDefault(); s.classList.add('drag-over'); });
    s.addEventListener('dragleave', () => s.classList.remove('drag-over'));
    s.addEventListener('drop', e => { e.preventDefault(); s.classList.remove('drag-over'); move(+s.dataset.index); });
  });
  document.querySelectorAll('[data-queue]').forEach(b => b.addEventListener('click', () => {
    let idx = state.grid.indexOf(0);
    if (idx < 0) return toast('Нет свободных ячеек');
    state.grid[idx] = state.queue.shift();
    state.queue.push(1);
    toast('Гантель на поле');
    buzz();
    render();
  }));
}

function bindMarket() {
  const connectBtn = document.getElementById('connectWallet');
  const disconnectBtn = document.getElementById('disconnectWallet');
  if (connectBtn) {
    connectBtn.addEventListener('click', async () => {
      const addr = await connectWallet();
      if (addr) {
        state.walletConnected = true;
        state.walletAddr = addr;
        toast('Кошелёк подключён');
      } else {
        toast('Не удалось подключить');
      }
      render();
    });
  }
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      disconnectWallet();
      state.walletConnected = false;
      state.walletAddr = '';
      toast('Кошелёк отключён');
      render();
    });
  }
}

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) {
    state.tab = tab.dataset.tab;
    render();
  }
  const buy = e.target.closest('[data-buy]');
  if (buy) {
    let n = +buy.dataset.buy;
    if (state.bananas < n) return toast('Недостаточно бананов');
    state.bananas -= n;
    toast('Ставка принята');
    buzz();
    sync();
  }
  if (e.target.id === 'feed') {
    if (state.bananas < 75) return toast('Недостаточно бананов');
    state.bananas -= 75;
    state.feed = Math.min(100, state.feed + 10);
    toast('Бруно стал сильнее!');
    buzz();
    render();
  }
  if (e.target.closest('.claim')) {
    state.gems += 5;
    toast('+5 ✦ получено');
    buzz();
    render();
  }
});

async function loadStateFromFirebase(userId) {
  const data = await loadUserData(userId);
  if (data) {
    if (typeof data.bananas === 'number') state.bananas = data.bananas;
    if (typeof data.gems === 'number') state.gems = data.gems;
    if (Array.isArray(data.grid) && data.grid.length === 49) state.grid = data.grid;
    if (Array.isArray(data.queue)) state.queue = data.queue;
    if (typeof data.feed === 'number') state.feed = data.feed;
  }
}

function getSerializableState() {
  return {
    bananas: state.bananas,
    gems: state.gems,
    grid: state.grid,
    queue: state.queue,
    feed: state.feed
  };
}

async function init() {
  const userId = getOrCreateUserId();
  initWallet();
  setStatusChangeHandler(addr => {
    state.walletConnected = !!addr;
    state.walletAddr = addr || '';
    if (state.tab === 'market') render();
  });
  await loadStateFromFirebase(userId);
  render();
  setInterval(() => saveUserData(userId, getSerializableState()), 30000);
}

init();
