import { store } from './store.js';
import { WORLDS, TAP_UPGRADES, GLOBAL_UPGRADES, SUPPORT_URL, TG_BOT, ILLUMINEUS, COSTUMES, AD_BOOSTS, STAR_REQUIREMENTS, CLONE_PORTRAITS, SECTION_SPRITES, STAR_SPRITES, TUTORIAL_STEPS, ICONS, ANIMATIONS, MASON_CONFIG, STARS_SHOP, PORTAL_CHARACTERS, WORLD_BACKGROUNDS } from './config.js';
import { initTelegram, getTelegramUser } from './telegram.js';
import { initWallet, connectWallet, buyApe, sellApe } from './wallet.js';
import { t, initLang, setLang, getLang } from './i18n.js';
import { playTap, playBuy, playWin, playJackpot, playLose, playClick, playRouletteSpin, playPortal, playStar, playDailyBonus } from './sounds.js';

let currentScreen = 'loading';
const $ = (s) => document.querySelector(s);

const NAV_ICONS = {
  empire: '/assets/illuminati/sprites/Icon_Eye_2.png',
  clones: '/assets/illuminati/sprites/Section_Clones_Common.png',
  boosts: '/assets/illuminati/sprites/video_ads_icon.png',
  masons: '/assets/illuminati/sprites/goldStar.png',
  wallet: '/assets/illuminati/sprites/diamond.png',
};

function fmt(n) {
  if (n >= 1e30) return (n/1e30).toFixed(1)+'No';
  if (n >= 1e27) return (n/1e27).toFixed(1)+'Oc';
  if (n >= 1e24) return (n/1e24).toFixed(1)+'Sp';
  if (n >= 1e21) return (n/1e21).toFixed(1)+'Sx';
  if (n >= 1e18) return (n/1e18).toFixed(1)+'Qi';
  if (n >= 1e15) return (n/1e15).toFixed(1)+'Qa';
  if (n >= 1e12) return (n/1e12).toFixed(1)+'T';
  if (n >= 1e9) return (n/1e9).toFixed(1)+'B';
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(1)+'K';
  return String(Math.floor(n));
}

function getCostumeSprite() {
  const s = store.state;
  const world = WORLDS[s.currentWorld];
  const id = s.activeCostume;
  if (id === 'default') return world.tapSprite || ILLUMINEUS.baseSprite;
  const costume = COSTUMES.find(c => c.id === id);
  return costume ? costume.sprite : world.tapSprite || ILLUMINEUS.baseSprite;
}

function getTapSprite() {
  const s = store.state;
  const world = WORLDS[s.currentWorld];
  const id = s.activeCostume;
  if (id === 'default') return world.tapSprite || ILLUMINEUS.baseSprite;
  const costume = COSTUMES.find(c => c.id === id);
  return costume ? costume.sprite : world.tapSprite || ILLUMINEUS.baseSprite;
}

function getStarDisplay(cloneId) {
  const totalStars = store.state.cloneUpgrades[cloneId] || 0;
  const starType = store.getCloneStarType(cloneId);
  const starSprite = (STAR_SPRITES && STAR_SPRITES[starType]) || ICONS[starType + 'Star'] || '';
  const count = Math.min(Math.floor(totalStars / (starType === 'gold' ? 1500 : starType === 'silver' ? 350 : 25)), 5);
  if (count === 0) return '';
  return `<div class="star-display">${'<img src="' + starSprite + '" class="star-img">'.repeat(count)}</div>`;
}

function navHTML(active) {
  const items = [
    { key: 'empire', label: t('navEmpire'), screen: 'game' },
    { key: 'clones', label: t('navClones'), screen: 'clones' },
    { key: 'boosts', label: t('navBoosts'), screen: 'ads' },
    { key: 'masons', label: t('navMasons'), screen: 'masons' },
    { key: 'wallet', label: t('navWallet'), screen: 'wallet' },
  ];
  return `<div class="bottomnav">
    ${items.map(it => {
      const isActive = it.screen === active;
      const targetId = it.key === 'clones' ? 'navClones' : it.key === 'boosts' ? 'navBoosts' : it.key === 'masons' ? 'navMasons' : '';
      return `<button class="navitem ${isActive ? 'active' : ''}" ${targetId ? `id="${targetId}"` : ''} onclick="W._nav('${it.screen}')">
        <img src="${NAV_ICONS[it.key]}" class="ico-img" alt="">
        <span class="nav-label">${it.label}</span>
      </button>`;
    }).join('')}
  </div>`;
}

function topbarHTML(screenTitle, worldColor) {
  const s = store.state;
  const income = store.calcIncomePerSec();
  const langBtn = getLang() === 'en' ? 'EN' : 'RU';
  return `<div class="topbar">
    <div class="topbar-left">
      <span class="hero-name" style="color:${worldColor || '#f7c948'}">${screenTitle}</span>
    </div>
    <div class="topbar-right">
      <button class="lang-toggle" onclick="W._toggleLang()">${langBtn}</button>
      <div class="diamond-badge">
        <img src="${ICONS.diamond}" class="ico-img" style="width:18px;height:18px;" alt="">
        <span class="diamond-amount">${s.diamonds}</span>
      </div>
      <div class="ape-badge">
        <div class="ape-icon">A</div>
        <div class="ape-col">
          <span class="ape-amount" id="topBal">${fmt(s.apeBalance)}</span>
          <span class="ape-ps">${fmt(income)}/s</span>
        </div>
      </div>
    </div>
  </div>`;
}

function showAuth() {
  const tg = getTelegramUser();
  if (tg) { store.setTgUser(tg); currentScreen = 'game'; show(); return; }
  currentScreen = 'auth';
  const langBtn = getLang() === 'en' ? 'EN' : 'RU';
  document.getElementById('app').innerHTML = `
    <div class="screen active auth-screen">
      <div class="auth-particles" id="authParticles"></div>
      <div class="topbar" style="background:transparent;position:absolute;top:0;right:0;z-index:10;">
        <div class="topbar-right">
          <button class="lang-toggle" onclick="W._toggleLang()">${langBtn}</button>
        </div>
      </div>
      <div class="auth-illuminati">
        <div class="auth-eye">
          <div class="eye-outer">
            <div class="eye-inner"></div>
          </div>
          <div class="eye-rays"></div>
        </div>
        <div class="eye-ring ring-1"></div>
        <div class="eye-ring ring-2"></div>
        <div class="eye-ring ring-3"></div>
      </div>
      <div class="auth-title">${t('welcome')}</div>
      <div class="auth-sub">${t('authSub')}</div>
      <button class="auth-btn auth-wallet" onclick="W._authWallet()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
        ${t('connectWallet')}
      </button>
      <button class="auth-btn auth-tg" onclick="W._tg()">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
        ${t('openTg')}
      </button>
      <button class="auth-btn auth-skip" onclick="W._skip()">${t('skip')}</button>
      <div class="auth-link"><a href="${SUPPORT_URL}" target="_blank">${t('help')}</a></div>
    </div>`;
  initAuthParticles();
}

function showGame() {
  const s = store.state;
  const world = WORLDS[s.currentWorld];
  const income = store.calcIncomePerSec();
  const twActive = s.timeWarpActive && Date.now() < s.timeWarpEnd;
  const twLeft = twActive ? Math.ceil((s.timeWarpEnd - Date.now()) / 1000) : 0;
  const ownedClones = world.clones.filter(c => (s.cloneCounts[c.id] || 0) > 0);

  const adActive2x = store.isAdBoostActive('ad_2x_income');
  const adActive3x = store.isAdBoostActive('ad_3x_income');
  const adActiveSpeed = store.isAdBoostActive('ad_speed');

  const costumeSprite = getCostumeSprite();
  const xpNeeded = store.getIllumineusXpNeeded();
  const xpPercent = Math.floor((s.illuminatiXp / xpNeeded) * 100);

  document.getElementById('app').innerHTML = `
    <div class="screen active">
      ${topbarHTML(world.name, world.color)}

      <div class="game-scene" id="gameScene">
        <div class="scene-bg" style="background:radial-gradient(ellipse at 50% 60%, ${world.color}22 0%, #060610 70%)"></div>
        <div class="scene-overlay" style="--wc:${world.color}"></div>

        <div class="illuminati-level">
          <span class="ili-level">Lvl ${s.illuminatiLevel}</span>
          <div class="ili-xp-bar"><div class="ili-xp-fill" style="width:${xpPercent}%"></div></div>
        </div>

        <div class="illuminatus-container" id="illuminatusTap">
          <img src="${costumeSprite}" class="illuminatus-sprite" alt="Illumineus">
          <div class="illuminatus-glow" style="--wc:${world.color}"></div>
          <div class="tap-ring"></div>
          ${adActive2x ? '<div class="boost-badge">2x</div>' : ''}
          ${adActive3x ? '<div class="boost-badge boost-3x">3x</div>' : ''}
          ${adActiveSpeed ? '<div class="boost-badge boost-speed">⚡</div>' : ''}
        </div>

        <div class="scene-clones" id="sceneClones">
          ${ownedClones.slice(0, 8).map((c, i) => {
            const count = s.cloneCounts[c.id] || 0;
            const portrait = '/assets/illuminati/sprites/' + c.portrait + '.png';
            const positions = [
              {left:'5%',bottom:'8%'}, {left:'18%',bottom:'12%'}, {left:'32%',bottom:'6%'},
              {left:'46%',bottom:'10%'}, {left:'60%',bottom:'5%'}, {left:'74%',bottom:'11%'},
              {left:'12%',bottom:'22%'}, {left:'38%',bottom:'25%'}
            ];
            const pos = positions[i] || positions[0];
            return `<div class="scene-clone" style="left:${pos.left};bottom:${pos.bottom};animation-delay:${i*0.2}s">
              <img src="${portrait}" class="clone-portrait" alt="${getLang()==='ru'?c.nameRu:c.name}">
              <div class="clone-count-badge">x${count}</div>
              <div class="clone-name-tag">${getLang()==='ru'?c.nameRu:c.name}</div>
            </div>`;
          }).join('')}
        </div>

        ${twActive ? `<div class="time-warp-bar">⏰ TIME WARP x2 — ${twLeft}s</div>` : ''}

        <div class="scene-stats">
          <div class="stat-pill"><span class="stat-label">${t('income')}</span><span class="stat-val">${fmt(income)}/s</span></div>
          <div class="stat-pill"><span class="stat-label">${t('total')}</span><span class="stat-val">${fmt(s.totalApeEarned)}</span></div>
          <div class="stat-pill"><span class="stat-label">${t('clones')}</span><span class="stat-val">${ownedClones.length}/${world.clones.length}</span></div>
        </div>

        <div class="roulette-fab" id="rouletteFab" onclick="W._openRoulette()">
          <span class="roulette-fab-icon">🎰</span>
        </div>
      </div>

      <div class="world-tabs" id="worldTabs">
        ${WORLDS.map((w, i) => {
          const unlocked = s.unlockedWorlds.includes(i);
          const active = s.currentWorld === i;
          const wName = getLang() === 'ru' ? (w.nameRu || w.name) : w.name;
          return `<button class="world-tab ${active?'active':''} ${!unlocked?'locked':''}"
            style="--wc:${w.color}"
            onclick="${unlocked ? `W._switchWorld(${i})` : `W._unlockWorld(${i})`}"
            ${!unlocked && s.apeBalance < w.unlockCost ? 'disabled' : ''}>
            <span class="wt-name">${wName}</span>
            ${!unlocked ? `<span class="wt-cost">${fmt(w.unlockCost)} A</span>` : ''}
          </button>`;
        }).join('')}
      </div>

      ${navHTML('game')}
    </div>`;

  document.getElementById('illuminatusTap').addEventListener('pointerdown', onTap, { passive: false });
  initSwipe();
}

function showClones() {
  const s = store.state;
  const world = WORLDS[s.currentWorld];
  const wName = getLang() === 'ru' ? (world.nameRu || world.name) : world.name;

  let html = `<div class="screen active">
    ${topbarHTML(t('cloneTitle') + ' — ' + wName, world.color)}
    <div class="scroll">
      <div class="section-header-img">
        <img src="${ICONS.clonesCommon}" class="section-header-icon" alt="">
        <span>${t('cloneSubtitle')}</span>
      </div>
      ${world.clones.map(c => {
        const count = s.cloneCounts[c.id] || 0;
        const cost = store.getCloneCost(c);
        const canBuy = s.apeBalance >= cost;
        const hasMgr = s.managerOwned[c.id + '_mgr'];
        const portrait = '/assets/illuminati/sprites/' + c.portrait + '.png';
        const upgradeCost = store.getCloneUpgradeCost(c.id);
        const canUpgrade = s.apeBalance >= upgradeCost;
        const cName = getLang() === 'ru' ? (c.nameRu || c.name) : c.name;
        return `<div class="clone-card ${canBuy ? 'affordable' : ''}">
          <img src="${portrait}" class="clone-icon-portrait" alt="${cName}">
          <div class="clone-info">
            <h4>${cName} ${hasMgr ? '<span class="mgr-badge">' + t('auto') + '</span>' : ''}</h4>
            <p class="clone-rate">${fmt(c.baseRate)} $APE/s</p>
            <p class="clone-owned">${t('owned')}: ${count}</p>
            ${getStarDisplay(c.id)}
          </div>
          <div class="clone-actions">
            <button class="btn-buy btn-sm ${canBuy?'':'btn-disabled'}" onclick="W._buyClone('${c.id}')" ${canBuy?'':'disabled'}>
              <img src="${ICONS.buttonGreenMoney}" class="btn-icon" alt=""> ${fmt(cost)} A
            </button>
            ${count > 0 ? `<button class="btn-upgrade btn-sm ${canUpgrade?'':'btn-disabled'}" onclick="W._upgradeClone('${c.id}')" ${canUpgrade?'':'disabled'}>
              <img src="${ICONS.buttonGreen}" class="btn-icon" alt=""> ${fmt(upgradeCost)} A
            </button>` : ''}
          </div>
        </div>`;
      }).join('')}

      <div class="section-header-img" style="margin-top:16px">
        <img src="${ICONS.managers}" class="section-header-icon" alt="">
        <span>${t('managersTitle')}</span>
      </div>
      ${world.managers.map(m => {
        const owned = s.managerOwned[m.id];
        const portrait = '/assets/illuminati/sprites/' + m.portrait + '.png';
        const mName = getLang() === 'ru' ? (m.nameRu || m.name) : m.name;
        return `<div class="manager-card ${owned ? 'owned' : ''}">
          <img src="${portrait}" class="mgr-portrait" alt="${mName}">
          <div class="mgr-info">
            <h4>${mName}</h4>
            <p>${fmt(m.baseCost)} $APE</p>
          </div>
          <button class="${owned?'btn-owned':'btn-buy'}" onclick="W._buyManager('${m.id}')" ${owned?'disabled':''}>
            ${owned?t('hired'):t('hire')}
          </button>
        </div>`;
      }).join('')}
    </div>
    ${navHTML('clones')}
  </div>`;
  document.getElementById('app').innerHTML = html;
}

function showAds() {
  const s = store.state;

  let html = `<div class="screen active">
    ${topbarHTML(t('boostTitle'), '#f7c948')}
    <div class="scroll">
      <div class="section-header-img">
        <img src="${ICONS.videoAd}" class="section-header-icon" alt="">
        <span>${t('boostSub')}</span>
      </div>
      ${AD_BOOSTS.map(b => {
        const canWatch = store.canWatchAd(b.id);
        const isActive = store.isAdBoostActive(b.id);
        const cooldownLeft = store.getAdCooldownLeft(b.id);
        const cooldownMin = Math.ceil(cooldownLeft / 60000);
        const bName = getLang() === 'ru' ? (b.nameRu || b.name) : b.name;
        const bDesc = getLang() === 'ru'
          ? (b.id === 'ad_2x_income' ? 'Двойной доход на 60с' : b.id === 'ad_3x_income' ? 'Тройной доход на 30с' : b.id === 'ad_speed' ? 'Менеджеры x2 на 60с' : b.id === 'ad_free_clone' ? 'Получи случайного клона бесплатно' : b.id === 'ad_diamonds' ? 'Получи 5 алмазов' : 'x2 всё на 120с')
          : b.desc;
        return `<div class="ad-card ${isActive ? 'active' : ''}">
          <img src="${b.icon}" class="ad-icon" alt="${bName}">
          <div class="ad-info">
            <h4>${bName}</h4>
            <p>${bDesc}</p>
            ${isActive ? '<p class="ad-active-text">' + t('active') + '</p>' : ''}
            ${!canWatch && !isActive ? `<p class="ad-cooldown">${t('readyIn')} ${cooldownMin}m</p>` : ''}
          </div>
          <button class="btn-ad ${canWatch && !isActive ? '' : 'btn-disabled'}" onclick="W._watchAd('${b.id}')" ${canWatch && !isActive ? '' : 'disabled'}>
            <img src="${ICONS.videoAd}" class="btn-icon" alt=""> ${t('watch')}
          </button>
        </div>`;
      }).join('')}

      <div class="section-header-img" style="margin-top:16px">
        <img src="${ICONS.clonesEpic}" class="section-header-icon" alt="">
        <span>${t('costumeTitle')}</span>
      </div>
      <div class="costume-grid">
        ${COSTUMES.map(c => {
          const unlocked = s.unlockedCostumes.includes(c.id);
          const equipped = s.activeCostume === c.id;
          const level = s.costumeLevel[c.id] || 1;
          const cName = getLang() === 'ru' ? (c.nameRu || c.name) : c.name;
          return `<div class="costume-card ${equipped ? 'equipped' : ''} ${!unlocked ? 'locked' : ''}">
            <img src="${c.sprite}" class="costume-thumb" alt="${cName}">
            <div class="costume-name">${cName}</div>
            <div class="costume-bonus">x${c.bonus} + ${(level-1)*5}%</div>
            ${unlocked ? `
              <div class="costume-level">${t('level')} ${level}</div>
              ${equipped ? '<div class="costume-equipped">' + t('equipped') + '</div>' : `<button class="btn-sm btn-buy" onclick="W._equipCostume('${c.id}')"><img src="${ICONS.buttonGreen}" class="btn-icon" alt=""> ${t('equip')}</button>`}
              ${level < 10 ? `<button class="btn-sm btn-upgrade" onclick="W._upgradeCostume('${c.id}')">⬆ ${fmt(Math.floor(100 * Math.pow(2, level)))} <img src="${ICONS.diamond}" class="btn-icon" alt=""></button>` : ''}
            ` : `<button class="btn-sm btn-buy" onclick="W._buyCostume('${c.id}')"><img src="${ICONS.diamond}" class="btn-icon" alt=""> ${c.cost}</button>`}
          </div>`;
        }).join('')}
      </div>
    </div>
    ${navHTML('ads')}
  </div>`;
  document.getElementById('app').innerHTML = html;
}

function showUpgrades() {
  const s = store.state;
  const world = WORLDS[s.currentWorld];
  const wName = getLang() === 'ru' ? (world.nameRu || world.name) : world.name;

  function renderUpgradeCard(u) {
    const lv = s.upgradeLevels[u.id] || 0;
    const cost = u.oneTime ? u.baseCost : store.getUpgradeCost(u);
    const canBuy = s.apeBalance >= cost && (u.maxLevel === 0 || lv < u.maxLevel);
    const uName = getLang() === 'ru' ? (u.nameRu || u.name) : u.name;
    const uDesc = getLang() === 'ru'
      ? (u.id.includes('w1u') ? (u.desc.replace('x2','x2').replace('+50%','+50%').replace('All W1','Все W1')) : u.desc)
      : u.desc;
    const iconSrc = u.icon || ICONS.upgrades;
    return `<div class="up-card">
      <img src="${iconSrc}" class="up-icon-img" alt="">
      <div class="up-info"><h4>${uName}</h4><p>${uDesc}</p></div>
      <div class="up-meta">
        <span class="up-level">${u.oneTime ? (lv > 0 ? t('activeLabel') : t('once')) : lv + '/' + u.maxLevel}</span>
        <button class="btn-sm ${canBuy?'btn-buy':'btn-disabled'}" onclick="W._buyWorldUp('${u.id}')" ${canBuy?'':'disabled'}>
          ${u.maxLevel > 0 && lv >= u.maxLevel ? t('max') : fmt(cost)+' A'}
        </button>
      </div>
    </div>`;
  }

  let html = `<div class="screen active">
    ${topbarHTML(t('upgradeTitle') + ' — ' + wName, world.color)}
    <div class="scroll">
      <div class="section-header-img">
        <img src="${ICONS.upgrades}" class="section-header-icon" alt="">
        <span>${t('worldUpgrades')}</span>
      </div>
      ${world.upgrades.map(renderUpgradeCard).join('')}

      <div class="section-header-img" style="margin-top:16px">
        <img src="${ICONS.eye2}" class="section-header-icon" alt="">
        <span>${t('tapUpgrades')}</span>
      </div>
      ${TAP_UPGRADES.map(u => {
        const lv = s.upgradeLevels[u.id] || 0;
        const cost = u.oneTime ? u.baseCost : store.getUpgradeCost(u);
        const canBuy = s.apeBalance >= cost && (u.maxLevel === 0 || lv < u.maxLevel);
        const uName = getLang() === 'ru' ? (u.nameRu || u.name) : u.name;
        const uDesc = u.desc;
        return `<div class="up-card">
          <img src="${u.icon}" class="up-icon-img" alt="">
          <div class="up-info"><h4>${uName}</h4><p>${uDesc}</p></div>
          <div class="up-meta">
            <span class="up-level">${u.oneTime ? (lv > 0 ? t('activeLabel') : t('once')) : lv + '/' + u.maxLevel}</span>
            <button class="btn-sm ${canBuy?'btn-buy':'btn-disabled'}" onclick="W._buyTapUp('${u.id}')" ${canBuy?'':'disabled'}>
              ${u.maxLevel > 0 && lv >= u.maxLevel ? t('max') : fmt(cost)+' A'}
            </button>
          </div>
        </div>`;
      }).join('')}

      <div class="section-header-img" style="margin-top:16px">
        <img src="${ICONS.eye3}" class="section-header-icon" alt="">
        <span>${t('globalUpgrades')}</span>
      </div>
      ${GLOBAL_UPGRADES.map(u => {
        const lv = s.upgradeLevels[u.id] || 0;
        const cost = u.oneTime ? u.baseCost : store.getUpgradeCost(u);
        const canBuy = s.apeBalance >= cost && (u.maxLevel === 0 || lv < u.maxLevel);
        const uName = getLang() === 'ru' ? (u.nameRu || u.name) : u.name;
        return `<div class="up-card">
          <img src="${u.icon}" class="up-icon-img" alt="">
          <div class="up-info"><h4>${uName}</h4><p>${u.desc}</p></div>
          <div class="up-meta">
            <span class="up-level">${u.oneTime ? (lv > 0 ? t('activeLabel') : t('once')) : lv + '/' + u.maxLevel}</span>
            <button class="btn-sm ${canBuy?'btn-buy':'btn-disabled'}" onclick="W._buyGlobalUp('${u.id}')" ${canBuy?'':'disabled'}>
              ${u.maxLevel > 0 && lv >= u.maxLevel ? t('max') : fmt(cost)+' A'}
            </button>
          </div>
        </div>`;
      }).join('')}
    </div>
    ${navHTML('upgrades')}
  </div>`;
  document.getElementById('app').innerHTML = html;
}

function showWallet() {
  const s = store.state;
  const addr = s.walletAddress;
  let html = `<div class="screen active">
    ${topbarHTML(t('walletTitle'), '#f7c948')}
    <div class="scroll">
      <div class="section-header-img">
        <img src="${ICONS.diamond}" class="section-header-icon" alt="">
        <span>$APE Token</span>
      </div>
      <div class="wallet-card">
        <div class="wallet-balance">${fmt(s.apeBalance)}</div>
        <div class="wallet-sub">${t('totalEarned')}: ${fmt(s.totalApeEarned)} $APE</div>
      </div>
      ${addr ? `
        <div class="wallet-info"><p>${t('connected')}: <span>${addr.slice(0,8)}...${addr.slice(-6)}</span></p></div>
        <button class="btn-lg btn-primary" onclick="W._buyApe()"><img src="${ICONS.buttonBigGreen}" class="btn-icon" alt=""> ${t('buyApe')}</button>
        <button class="btn-lg btn-ghost" onclick="W._sellApe()"><img src="${ICONS.buttonBigPurple}" class="btn-icon" alt=""> ${t('sellApe')}</button>
      ` : `
        <div class="wallet-info" style="text-align:center;padding:24px">
          <p style="margin-bottom:14px">${t('walletSub')}</p>
          <button class="auth-btn auth-ton" onclick="W._connect()" style="margin:0 auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.18 8 12 11.82 4.82 8 12 4.18zM4 9.64l7 3.5V19.5l-7-3.5V9.64zm9 9.86v-6.36l7-3.5v6.36l-7 3.5z"/></svg>
            ${t('connect')}
          </button>
        </div>
      `}
      <div class="wallet-info">
        <p>🔗 ${t('contract')}: <span>EQBjoywW...zUD</span></p>
        <p>💱 ${t('rate')}: <span>1 GRAM = 15,674 $APE</span></p>
        <p>💬 ${t('support')}: <span><a href="${SUPPORT_URL}" style="color:#f7c948" target="_blank">@Superadminist</a></span></p>
      </div>
    </div>
    ${navHTML('wallet')}
  </div>`;
  document.getElementById('app').innerHTML = html;
}

function showMasons() {
  const s = store.state;
  const masonCost = store.getMasonCost();
  const canBuyMason = store.canBuyMason() && s.apeBalance >= masonCost;
  const masonUnlocked = store.canBuyMason();
  const masonBonus = store.getMasonBonus();
  const remaining = MASON_CONFIG.totalSupply - s.masonCount;
  const starsBalance = s.totalStars;

  let html = `<div class="screen active">
    ${topbarHTML(t('masonsTitle'), '#f7c948')}
    <div class="scroll">
      <div class="mason-counter">
        <div class="mason-supply">${remaining}</div>
        <div class="mason-total">${t('remaining')} / ${MASON_CONFIG.totalSupply} ${t('legendary')}</div>
        <div class="mason-bonus">${t('masonBonus')}: x${masonBonus.toFixed(1)}</div>
        <div class="mason-tokens">
          ${Array.from({length: Math.min(s.masonCount, 200)}, () => '<div class="mason-token owned"></div>').join('')}
          ${Array.from({length: Math.min(remaining, 200 - s.masonCount)}, () => '<div class="mason-token"></div>').join('')}
        </div>
      </div>

      ${masonUnlocked ? `
        <button class="btn-lg btn-primary" onclick="W._buyMason()" ${canBuyMason ? '' : 'disabled'} style="${canBuyMason ? '' : 'opacity:0.4;cursor:not-allowed;'}">
          ${t('masonBuy')} — ${fmt(masonCost)} $APE
        </button>
      ` : `
        <div class="mason-presale">
          <h4>${t('masonLocked')}</h4>
          <p>${t('masonUnlock')}: ${WORLDS[MASON_CONFIG.unlockWorld]?.name || 'World ' + (MASON_CONFIG.unlockWorld+1)}</p>
        </div>
      `}

      <div class="section-header-img" style="margin-top:16px">
        <img src="${ICONS.goldStar}" class="section-header-icon" alt="">
        <span>${t('starsShop')} (${starsBalance} ⭐)</span>
      </div>
      ${STARS_SHOP.map(item => {
        const canAfford = starsBalance >= item.cost;
        const isActive = store.isStarBoostActive(item.id);
        const name = getLang() === 'ru' ? (item.nameRu || item.name) : item.name;
        const desc = getLang() === 'ru' ? (item.descRu || item.desc) : item.desc;
        return `<div class="star-shop-card ${isActive ? 'active' : ''}">
          <img src="${item.icon}" class="star-shop-icon" alt="">
          <div class="star-shop-info">
            <h4>${name}</h4>
            <p>${desc}</p>
            ${isActive ? '<p class="ad-active-text">' + t('active') + '</p>' : ''}
          </div>
          <button class="btn-buy btn-sm ${canAfford && !isActive ? '' : 'btn-disabled'}"
            onclick="W._buyStarBoost('${item.id}')" ${canAfford && !isActive ? '' : 'disabled'}>
            ⭐ ${item.cost}
          </button>
        </div>`;
      }).join('')}
    </div>
    ${navHTML('masons')}
  </div>`;
  document.getElementById('app').innerHTML = html;
}

function show() {
  switch(currentScreen) {
    case 'auth': showAuth(); break;
    case 'game': showGame(); break;
    case 'clones': showClones(); break;
    case 'ads': showAds(); break;
    case 'upgrades': showUpgrades(); break;
    case 'masons': showMasons(); break;
    case 'wallet': showWallet(); break;
    default: showAuth();
  }
  if (currentScreen !== 'auth' && currentScreen !== 'loading') {
    renderTutorial();
  }
}

/* ─── Tap Logic ─── */
function onTap(e) {
  e.preventDefault();
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX || (rect.left + rect.width/2);
  const y = e.clientY || (rect.top + rect.height/2);
  const popup = store.tap(x, y);
  spawnPopup(popup);
  spawnFlash(x, y);
  playTapEffect(x, y);
  playTap();
  animateIllumineus();
  updateTopBar();
  updateComboDisplay();
}

function spawnPopup({ income, isCrit, x, y }) {
  const el = document.createElement('div');
  el.className = 'dmg-float ' + (isCrit ? 'dmg-crit' : 'dmg-normal');
  el.textContent = '+' + fmt(income) + (isCrit ? ' CRIT!' : '');
  el.style.left = (x + (Math.random()*40-20)) + 'px';
  el.style.top = (y - 10) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function spawnFlash(x, y) {
  const world = WORLDS[store.state.currentWorld];
  const el = document.createElement('div');
  el.className = 'tap-flash';
  el.style.background = `radial-gradient(circle, ${world.color}44 0%, transparent 70%)`;
  el.style.left = (x - 40) + 'px';
  el.style.top = (y - 40) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 250);
}

function animateIllumineus() {
  const sprite = document.querySelector('.illuminatus-sprite');
  if (sprite) {
    sprite.classList.add('tapped');
    setTimeout(() => sprite.classList.remove('tapped'), 150);
  }
}

function updateTopBar() {
  const s = store.state;
  const bal = document.getElementById('topBal');
  if (bal) bal.textContent = fmt(s.apeBalance);
}

/* ─── Swipe Logic ─── */
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

function initSwipe() {
  const scene = document.getElementById('gameScene');
  if (!scene) return;

  scene.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
  }, { passive: true });

  scene.addEventListener('touchmove', (e) => {
    if (!touchStartX) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
      isSwiping = true;
    }
  }, { passive: true });

  scene.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const s = store.state;
    if (dx < -50 && s.currentWorld < WORLDS.length - 1) {
      const nextWorld = s.currentWorld + 1;
      if (s.unlockedWorlds.includes(nextWorld)) {
        store.switchWorld(nextWorld);
        show();
      }
    } else if (dx > 50 && s.currentWorld > 0) {
      const prevWorld = s.currentWorld - 1;
      if (s.unlockedWorlds.includes(prevWorld)) {
        store.switchWorld(prevWorld);
        show();
      }
    }
    touchStartX = 0;
    isSwiping = false;
  }, { passive: true });
}

/* ─── Tutorial ─── */
function renderTutorial() {
  if (store.state.tutorialComplete) return;
  const step = TUTORIAL_STEPS[store.state.tutorialStep];
  if (!step) { store.completeTutorial(); return; }

  const spriteMap = {
    welcome: ILLUMINEUS.welcomeSprite,
    base: ILLUMINEUS.warningSprite,
    warning: ILLUMINEUS.warningSprite,
    bright: ILLUMINEUS.endBrightSprite,
  };
  const sprite = spriteMap[step.sprite] || ILLUMINEUS.warningSprite;

  let overlay = document.getElementById('tutorialOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    document.body.appendChild(overlay);
  }

  const isLastStep = step.textKey === 'tutDone';

  overlay.innerHTML = `
    <div class="tut-backdrop">
      <div class="tut-content">
        <img src="${sprite}" class="tut-illuminatus" alt="Illumineus">
        <div class="tut-speech">${t(step.textKey)}</div>
        <div class="tut-actions">
          <button class="tut-skip" onclick="W._tutSkip()">${t('tutSkip')}</button>
          <button class="tut-next" onclick="W._tutNext()">${isLastStep ? '✨' : t('tutNext')}</button>
        </div>
      </div>
      ${step.highlight ? `<div class="tut-highlight" data-target="${step.highlight}"></div>` : ''}
    </div>
  `;

  if (step.highlight) {
    requestAnimationFrame(() => {
      const target = document.querySelector(step.highlight);
      const highlight = overlay.querySelector('.tut-highlight');
      if (target && highlight) {
        const rect = target.getBoundingClientRect();
        highlight.style.top = rect.top - 4 + 'px';
        highlight.style.left = rect.left - 4 + 'px';
        highlight.style.width = rect.width + 8 + 'px';
        highlight.style.height = rect.height + 8 + 'px';
        if (step.textKey === 'tutTap') {
          let hand = overlay.querySelector('.hand-cursor');
          if (!hand) {
            hand = document.createElement('div');
            hand.className = 'hand-cursor';
            hand.innerHTML = '<div class="hand-icon">👆</div><div class="hand-msg">' + t('handTap') + '</div>';
            overlay.appendChild(hand);
          }
          hand.style.left = (rect.left + rect.width / 2 - 16) + 'px';
          hand.style.top = (rect.top + rect.height + 10) + 'px';
        } else {
          const existingHand = overlay.querySelector('.hand-cursor');
          if (existingHand) existingHand.remove();
        }
      }
    });
  }
}

/* ─── Sprite Animation System ─── */
const spriteAnimations = {};

function startSpriteAnimation(elementId, frames, fps) {
  stopSpriteAnimation(elementId);
  let frame = 0;
  const el = document.getElementById(elementId);
  if (!el || !frames || frames.length === 0) return;
  el.src = frames[0];
  spriteAnimations[elementId] = setInterval(() => {
    frame = (frame + 1) % frames.length;
    if (el) el.src = frames[frame];
  }, 1000 / fps);
}

function stopSpriteAnimation(elementId) {
  if (spriteAnimations[elementId]) {
    clearInterval(spriteAnimations[elementId]);
    delete spriteAnimations[elementId];
  }
}

function playTapEffect(x, y) {
  const frames = ANIMATIONS?.effects || [];
  if (frames.length === 0) return;
  const img = document.createElement('img');
  img.className = 'tap-effect-sprite';
  img.src = frames[0];
  img.style.left = (x - 40) + 'px';
  img.style.top = (y - 40) + 'px';
  document.body.appendChild(img);
  let f = 0;
  const iv = setInterval(() => {
    f++;
    if (f >= frames.length) { clearInterval(iv); img.remove(); return; }
    img.src = frames[f];
  }, 80);
}

/* ─── Game loop ─── */
let tickTimer = null;
let autoTimer = null;
let renderTimer = null;

function startGameLoop() {
  stopGameLoop();
  tickTimer = setInterval(() => { store.tick(); }, 500);
  autoTimer = setInterval(() => {
    if (currentScreen !== 'game') return;
    const d = store.autoClick();
    if (d > 0) updateTopBar();
  }, 1000);
  renderTimer = setInterval(() => {
    if (currentScreen === 'game') showGame();
  }, 5000);
}

function stopGameLoop() {
  if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  if (renderTimer) { clearInterval(renderTimer); renderTimer = null; }
}

/* ─── Global Handlers ─── */
window.W = {};
window.W._nav = (s) => { currentScreen = s; show(); if (s === 'game') startGameLoop(); else stopGameLoop(); };
window.W._tg = () => { const u = initTelegram(); if (u) { store.setTgUser(u); currentScreen='game'; show(); startGameLoop(); playClick(); } };
window.W._skip = () => { store.setDemoMode(); currentScreen = 'game'; show(); startGameLoop(); playClick(); showDailyBonus(); };
window.W._authWallet = async () => { await store.initFirebaseUser(); currentScreen = 'game'; show(); startGameLoop(); playClick(); showDailyBonus(); };
window.W._switchWorld = (i) => { store.switchWorld(i); show(); playClick(); };
window.W._unlockWorld = (i) => { if (store.unlockWorld(i)) { show(); playBuy(); } };
window.W._buyClone = (id) => { if (store.buyClone(id)) { showClones(); playBuy(); } };
window.W._upgradeClone = (id) => { if (store.upgradeClone(id)) { showClones(); playBuy(); } };
window.W._buyManager = (id) => { if (store.buyManager(id)) { showClones(); playBuy(); } };
window.W._buyWorldUp = (id) => { if (store.buyWorldUpgrade(id)) { showUpgrades(); playBuy(); } };
window.W._buyTapUp = (id) => { if (store.buyTapUpgrade(id)) { showUpgrades(); playBuy(); } };
window.W._buyGlobalUp = (id) => { if (store.buyGlobalUpgrade(id)) { showUpgrades(); playBuy(); } };
window.W._watchAd = (id) => { if (store.watchAd(id)) { showAds(); playWin(); } };
window.W._buyCostume = (id) => { if (store.buyCostume(id)) { showAds(); playBuy(); } };
window.W._equipCostume = (id) => { if (store.equipCostume(id)) { showAds(); playClick(); } };
window.W._upgradeCostume = (id) => { if (store.upgradeCostume(id)) { showAds(); playBuy(); } };
window.W._buyMason = () => { if (store.buyMason()) { showMasons(); playBuy(); } };
window.W._buyStarBoost = (id) => { if (store.buyStarBoost(id)) { showMasons(); playStar(); } };
window.W._connect = async () => { const a = await connectWallet(); if(a) { store.setWallet(a); playBuy(); showWallet(); } };
window.W._buyApe = async () => { const amt = prompt(t('enterTon')); if(amt) { await buyApe(parseFloat(amt)); showWallet(); playBuy(); } };
window.W._sellApe = async () => { const amt = prompt(t('enterApe')); if(amt) { await sellApe(parseInt(amt)); showWallet(); playWin(); } };
window.W._tutNext = () => { store.advanceTutorial(); if (store.state.tutorialStep >= TUTORIAL_STEPS.length) { store.completeTutorial(); document.getElementById('tutorialOverlay')?.remove(); } else { renderTutorial(); } };
window.W._tutSkip = () => { store.completeTutorial(); document.getElementById('tutorialOverlay')?.remove(); };
window.W._toggleLang = () => { const next = getLang() === 'en' ? 'ru' : 'en'; setLang(next); show(); };
window.W._openRoulette = () => { showRouletteOverlay(); playClick(); };
window.W._closeRoulette = () => { const el = document.getElementById('rouletteOverlay'); if (el) el.remove(); };
window.W._spinRoulette = () => { playRouletteSpin(); spinRoulette(); };
window.W._claimDaily = () => { const r = store.claimDailyBonus(); if (r) { playDailyBonus(); W._closeDaily(); show(); } };
window.W._closeDaily = () => { const el = document.getElementById('dailyOverlay'); if (el) el.remove(); };

/* ─── Roulette ─── */
function showRouletteOverlay() {
  const cost = store.getRouletteCost();
  const canSpin = store.state.apeBalance >= cost;

  let overlay = document.getElementById('rouletteOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'rouletteOverlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="roulette-overlay" onclick="if(event.target===this)W._closeRoulette()">
      <div class="roulette-panel" style="position:relative">
        <button class="roulette-close" onclick="W._closeRoulette()">&times;</button>
        <div class="roulette-title">${t('rouletteTitle')}</div>
        <div class="roulette-pointer"></div>
        <div class="roulette-wheel" id="rouletteWheel"></div>
        <div class="roulette-result" id="rouletteResult"></div>
        <div class="roulette-cost-label">${t('rouletteCost')}: <span>${fmt(cost)} $APE</span></div>
        <button class="roulette-spin-btn" id="rouletteSpinBtn" onclick="W._spinRoulette()" ${canSpin ? '' : 'disabled'}>
          🎰 ${t('rouletteSpin')}
        </button>
      </div>
    </div>
  `;
}

let rouletteSpinning = false;

function spinRoulette() {
  if (rouletteSpinning) return;
  const result = store.spinRoulette();
  if (!result) return;

  rouletteSpinning = true;
  const wheel = document.getElementById('rouletteWheel');
  const btn = document.getElementById('rouletteSpinBtn');
  const resultEl = document.getElementById('rouletteResult');
  if (btn) btn.disabled = true;
  if (resultEl) resultEl.innerHTML = '';

  const typeAngles = { jackpot: 0, bigwin: 45, clone: 90, diamonds: 135, medium: 180, small: 225, lose: 270 };
  const baseAngle = typeAngles[result.type] || 270;
  const extraSpins = 360 * (4 + Math.floor(Math.random() * 3));
  const finalAngle = extraSpins + baseAngle + Math.random() * 30 - 15;

  if (wheel) {
    wheel.style.transition = 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
    wheel.style.transform = `rotate(${finalAngle}deg)`;
  }

  setTimeout(() => {
    rouletteSpinning = false;
    if (btn) btn.disabled = false;

    const cls = result.type === 'jackpot' ? 'result-jackpot' : result.type === 'bigwin' ? 'result-bigwin' : result.type === 'medium' ? 'result-medium' : result.type === 'small' ? 'result-small' : result.type === 'diamonds' ? 'result-diamonds' : result.type === 'clone' ? 'result-clone' : 'result-lose';
    if (resultEl) resultEl.innerHTML = `<div class="roulette-result-text ${cls}">${result.label}</div>`;

    if (result.type === 'jackpot') playJackpot();
    else if (result.type === 'lose') playLose();
    else playWin();

    showRouletteOverlay();

    setTimeout(() => {
      if (wheel) {
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';
      }
    }, 100);
  }, 3700);
}

/* ─── Auth Particles ─── */
function initAuthParticles() {
  const container = document.getElementById('authParticles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'auth-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 6 + 's';
    p.style.animationDuration = (3 + Math.random() * 4) + 's';
    p.style.width = p.style.height = (1 + Math.random() * 3) + 'px';
    container.appendChild(p);
  }
}

/* ─── Daily Bonus ─── */
function showDailyBonus() {
  if (!store.canClaimDaily()) return;
  const amount = store.getDailyBonusAmount();
  const overlay = document.createElement('div');
  overlay.id = 'dailyOverlay';
  overlay.innerHTML = `
    <div class="roulette-overlay" onclick="if(event.target===this)W._closeDaily()">
      <div class="daily-panel">
        <div class="daily-glow"></div>
        <div class="daily-title">${t('dailyTitle')}</div>
        <div class="daily-streak">${t('dailyStreak')}: ${store.state.dailyBonusStreak}/7</div>
        <div class="daily-amount">+${fmt(amount)} $APE</div>
        <div class="daily-sub">${t('dailySub')}</div>
        <button class="roulette-spin-btn" onclick="W._claimDaily()" style="margin-top:12px">
          🎁 ${t('dailyClaim')}
        </button>
        <button class="roulette-close" onclick="W._closeDaily()">&times;</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

/* ─── Combo Display ─── */
function updateComboDisplay() {
  const combo = store.state.comboCount;
  if (combo < 3) return;
  let el = document.getElementById('comboBadge');
  if (!el) {
    el = document.createElement('div');
    el.id = 'comboBadge';
    el.className = 'combo-badge';
    const scene = document.getElementById('gameScene');
    if (scene) scene.appendChild(el);
  }
  const mult = 1 + Math.min(combo - 1, 20) * 0.05;
  el.textContent = `COMBO x${combo} (${mult.toFixed(1)}x)`;
  el.style.opacity = '1';
  el.style.transform = 'scale(1.2)';
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => { el.style.opacity = '0'; }, 1500);
}

/* ─── Init ─── */
initLang();
document.getElementById('app').innerHTML = `<div class="loading"><div class="loading-ring"></div><p>${t('loading')}</p></div>`;
setTimeout(() => {
  const tg = getTelegramUser();
  if (tg) { store.setTgUser(tg); currentScreen = 'game'; } else { currentScreen = 'auth'; }
  show();
  if (currentScreen === 'game') { startGameLoop(); setTimeout(() => showDailyBonus(), 1500); }
}, 600);
