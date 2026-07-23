import { WORLDS, TAP_UPGRADES, GLOBAL_UPGRADES, COSTUMES, AD_BOOSTS, STAR_REQUIREMENTS, MASON_CONFIG, STARS_SHOP, PORTAL_CHARACTERS } from './config.js';
import { getOrCreateUserId, saveUserData, loadUserData } from './firebase.js';
import { getLang } from './i18n.js';

const SAVE_KEY = 'ape_illuminati_v4';
const SAVE_INTERVAL = 5000;
const DAILY_BONUS_INTERVAL = 24 * 60 * 60 * 1000;
const COMBO_WINDOW = 2000;

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

const defaultState = () => ({
  apeBalance: 0,
  diamonds: 0,
  totalApeEarned: 0,
  currentWorld: 0,
  tapCount: 0,
  lastOnline: Date.now(),
  lastIncomeTick: Date.now(),
  unlockedWorlds: [0],
  cloneCounts: {},
  managerOwned: {},
  upgradeLevels: {},
  tgUser: null,
  walletAddress: null,
  timeWarpActive: false,
  timeWarpEnd: 0,
  activeCostume: 'default',
  unlockedCostumes: ['default'],
  costumeLevel: { default: 1 },
  adBoosts: {},
  adCooldowns: {},
  cloneUpgrades: {},
  totalClonesBought: 0,
  totalManagersBought: 0,
  totalUpgradesBought: 0,
  illuminatiLevel: 1,
  illuminatiXp: 0,
  lastAdWatch: {},
  masonCount: 0,
  masonApeCost: MASON_CONFIG.apeCostBase,
  totalStars: 0,
  starBoosts: {},
  lastPortalEvent: 0,
  portalCooldown: 120000,
  tutorialStep: 0,
  tutorialComplete: false,
  lang: null,
  rouletteSpins: 0,
  userId: null,
  isDemo: false,
  lastDailyBonus: 0,
  dailyBonusStreak: 0,
  comboCount: 0,
  comboLastTap: 0,
  bestCombo: 0,
  totalTaps: 0,
});

class Store {
  constructor() {
    this._state = this.load();
    this._saveTimer = null;
    this._firebaseUnsub = null;
    this.startAutoSave();
    this.processOfflineEarnings();
  }

  get state() { return this._state; }

  load() {
    try {
      const r = localStorage.getItem(SAVE_KEY);
      if (r) return { ...defaultState(), ...JSON.parse(r) };
    } catch {}
    return defaultState();
  }

  save() {
    this._state.lastOnline = Date.now();
    localStorage.setItem(SAVE_KEY, JSON.stringify(this._state));
    if (this._state.userId && !this._state.isDemo) {
      saveUserData(this._state.userId, this._state);
    }
  }

  startAutoSave() {
    this._saveTimer = setInterval(() => this.save(), SAVE_INTERVAL);
  }

  async initFirebaseUser() {
    const uid = getOrCreateUserId();
    this._state.userId = uid;
    const remote = await loadUserData(uid);
    if (remote) {
      Object.assign(this._state, { ...defaultState(), ...remote });
    }
    this.save();
  }

  setDemoMode() {
    this._state.isDemo = true;
    this._state.userId = 'demo_' + Date.now().toString(36);
    this.save();
  }

  /* ─── Daily Bonus ─── */
  canClaimDaily() {
    return Date.now() - this._state.lastDailyBonus >= DAILY_BONUS_INTERVAL;
  }

  getDailyBonusAmount() {
    const streak = this._state.dailyBonusStreak;
    const base = 500;
    return Math.floor(base * Math.pow(1.5, Math.min(streak, 7)));
  }

  claimDailyBonus() {
    if (!this.canClaimDaily()) return null;
    const amount = this.getDailyBonusAmount();
    const now = Date.now();
    const lastClaim = this._state.lastDailyBonus;
    if (now - lastClaim < DAILY_BONUS_INTERVAL * 2) {
      this._state.dailyBonusStreak = Math.min(this._state.dailyBonusStreak + 1, 7);
    } else {
      this._state.dailyBonusStreak = 0;
    }
    this._state.lastDailyBonus = now;
    this._state.apeBalance += amount;
    this._state.totalApeEarned += amount;
    this.addIllumineusXp(5);
    return { amount, streak: this._state.dailyBonusStreak };
  }

  /* ─── Combo Tap System ─── */
  tap(clientX, clientY) {
    const now = Date.now();
    if (now - this._state.comboLastTap < COMBO_WINDOW) {
      this._state.comboCount++;
    } else {
      this._state.comboCount = 1;
    }
    this._state.comboLastTap = now;
    if (this._state.comboCount > this._state.bestCombo) {
      this._state.bestCombo = this._state.comboCount;
    }

    const base = 1;
    const worldBonus = this.getWorldBonus();
    const costumeBonus = this.getCostumeBonus();
    const masonBonus = this.getMasonBonus();
    const starBoost = this.getStarBoostMultiplier('star_10x_tap');
    const ad2x = this.getAdBoostMultiplier('ad_2x_income');
    const ad3x = this.getAdBoostMultiplier('ad_3x_income');
    const tw = (this._state.timeWarpActive && Date.now() < this._state.timeWarpEnd) ? 2 : 1;
    const comboMult = 1 + Math.min(this._state.comboCount - 1, 20) * 0.05;
    const income = Math.floor(base * worldBonus * costumeBonus * masonBonus * starBoost * ad2x * ad3x * tw * comboMult);
    this._state.apeBalance += income;
    this._state.totalApeEarned += income;
    this._state.tapCount++;
    this._state.totalTaps++;
    this.addIllumineusXp(1);
    return { income, isCrit: this._state.comboCount >= 10 && this._state.comboCount % 10 === 0, x: clientX, y: clientY, id: now + Math.random(), combo: this._state.comboCount };
  }

  processOfflineEarnings() {
    const now = Date.now();
    const offlineMs = now - this._state.lastOnline;
    const offlineSec = offlineMs / 1000;
    if (offlineSec < 10) return;
    const maxOfflineSec = 2 * 60 * 60;
    const cappedSec = Math.min(offlineSec, maxOfflineSec);
    const earnings = this.calcIncomePerSec() * cappedSec * this.getOfflineMult();
    if (earnings > 0) {
      const maxEarnings = this.calcIncomePerSec() * cappedSec * 0.1;
      const actualEarnings = Math.min(earnings, maxEarnings);
      this._state.apeBalance += actualEarnings;
      this._state.totalApeEarned += actualEarnings;
    }
  }

  getOfflineMult() {
    const lv = this._state.upgradeLevels.offline_earn || 0;
    return 0.1 + lv * 0.1;
  }

  /* ─── Mason System ─── */
  canBuyMason() {
    const worlds = this._state.unlockedWorlds.length;
    if (worlds < MASON_CONFIG.unlockWorld + 1) return false;
    if (this._state.masonCount >= MASON_CONFIG.totalSupply) return false;
    return true;
  }

  getMasonCost() {
    return Math.floor(MASON_CONFIG.apeCostBase * Math.pow(MASON_CONFIG.apeCostMult, this._state.masonCount));
  }

  buyMason() {
    if (!this.canBuyMason()) return false;
    const cost = this.getMasonCost();
    if (this._state.apeBalance < cost) return false;
    this._state.apeBalance -= cost;
    this._state.masonCount++;
    this._state.masonApeCost = this.getMasonCost();
    return true;
  }

  getMasonBonus() {
    return 1 + this._state.masonCount * MASON_CONFIG.bonusPerMason;
  }

  /* ─── Stars System ─── */
  addStars(amount) { this._state.totalStars += amount; }
  spendStars(amount) { if (this._state.totalStars < amount) return false; this._state.totalStars -= amount; return true; }

  getStarBoostMultiplier(boostId) {
    const end = this._state.starBoosts[boostId];
    if (!end || Date.now() >= end) return 1;
    return STARS_SHOP.find(b => b.id === boostId)?.multiplier || 1;
  }

  buyStarBoost(boostId) {
    const shop = STARS_SHOP.find(b => b.id === boostId);
    if (!shop) return false;
    if (!this.spendStars(shop.cost)) return false;
    if (shop.duration > 0) {
      this._state.starBoosts[boostId] = Date.now() + shop.duration;
    }
    if (shop.id === 'star_diamonds') this._state.diamonds += 10;
    return true;
  }

  isStarBoostActive(boostId) {
    const end = this._state.starBoosts[boostId];
    return end && Date.now() < end;
  }

  /* ─── Portal System ─── */
  canTriggerPortal() {
    return Date.now() - this._state.lastPortalEvent > this._state.portalCooldown;
  }

  triggerPortal() {
    if (!this.canTriggerPortal()) return null;
    this._state.lastPortalEvent = Date.now();
    const char = PORTAL_CHARACTERS[Math.floor(Math.random() * PORTAL_CHARACTERS.length)];
    switch (char.gift) {
      case 'diamonds': this._state.diamonds += char.amount; break;
      case 'ape': this._state.apeBalance += char.amount; this._state.totalApeEarned += char.amount; break;
      case 'stars': this.addStars(char.amount); break;
      case 'masonChance':
        if (Math.random() < 0.05) {
          if (this._state.masonCount < MASON_CONFIG.totalSupply) this._state.masonCount++;
        }
        break;
    }
    return char;
  }

  /* ─── Costume System ─── */
  getCostumeBonus() {
    const id = this._state.activeCostume;
    const costume = COSTUMES.find(c => c.id === id);
    const level = this._state.costumeLevel[id] || 1;
    return costume ? costume.bonus * (1 + (level - 1) * 0.05) : 1;
  }

  equipCostume(costumeId) {
    if (!this._state.unlockedCostumes.includes(costumeId)) return false;
    this._state.activeCostume = costumeId;
    return true;
  }

  buyCostume(costumeId) {
    const costume = COSTUMES.find(c => c.id === costumeId);
    if (!costume) return false;
    if (this._state.unlockedCostumes.includes(costumeId)) return false;
    if (this._state.diamonds < costume.cost) return false;
    this._state.diamonds -= costume.cost;
    this._state.unlockedCostumes.push(costumeId);
    this._state.costumeLevel[costumeId] = 1;
    this._state.activeCostume = costumeId;
    return true;
  }

  upgradeCostume(costumeId) {
    if (!this._state.unlockedCostumes.includes(costumeId)) return false;
    const level = this._state.costumeLevel[costumeId] || 1;
    if (level >= 10) return false;
    const cost = Math.floor(100 * Math.pow(2, level));
    if (this._state.diamonds < cost) return false;
    this._state.diamonds -= cost;
    this._state.costumeLevel[costumeId] = level + 1;
    return true;
  }

  /* ─── Ad Boost System ─── */
  canWatchAd(boostId) {
    const boost = AD_BOOSTS.find(b => b.id === boostId);
    if (!boost) return false;
    const lastWatch = this._state.lastAdWatch[boostId] || 0;
    return Date.now() - lastWatch >= boost.cooldown;
  }

  watchAd(boostId) {
    const boost = AD_BOOSTS.find(b => b.id === boostId);
    if (!boost || !this.canWatchAd(boostId)) return false;
    this._state.lastAdWatch[boostId] = Date.now();
    if (boost.duration > 0) {
      this._state.adBoosts[boostId] = Date.now() + boost.duration;
    }
    if (boostId === 'ad_free_clone') {
      this._state.diamonds += 5;
    } else if (boostId === 'ad_diamonds') {
      this._state.diamonds += 5;
    }
    return true;
  }

  isAdBoostActive(boostId) {
    const end = this._state.adBoosts[boostId];
    return end && Date.now() < end;
  }

  getAdBoostMultiplier(boostId) {
    if (!this.isAdBoostActive(boostId)) return 1;
    const boost = AD_BOOSTS.find(b => b.id === boostId);
    return boost ? boost.multiplier : 1;
  }

  getAdCooldownLeft(boostId) {
    const lastWatch = this._state.lastAdWatch[boostId] || 0;
    const boost = AD_BOOSTS.find(b => b.id === boostId);
    if (!boost) return 0;
    const remaining = boost.cooldown - (Date.now() - lastWatch);
    return remaining > 0 ? remaining : 0;
  }

  /* ─── Star Rating System ─── */
  getCloneStars(cloneId) {
    const upgrades = this._state.cloneUpgrades[cloneId] || 0;
    let stars = 0;
    for (const req of STAR_REQUIREMENTS) {
      if (upgrades >= req.requirement) {
        stars = stars + 1;
      }
    }
    return Math.min(stars, 15);
  }

  getCloneStarType(cloneId) {
    const totalStars = this._state.cloneUpgrades[cloneId] || 0;
    if (totalStars >= 7500) return 'gold';
    if (totalStars >= 350) return 'silver';
    return 'bronze';
  }

  upgradeClone(cloneId) {
    const cost = this.getCloneUpgradeCost(cloneId);
    if (this._state.apeBalance < cost) return false;
    this._state.apeBalance -= cost;
    this._state.cloneUpgrades[cloneId] = (this._state.cloneUpgrades[cloneId] || 0) + 1;
    const level = this._state.cloneUpgrades[cloneId];
    if (level % 10 === 0) this.addStars(1);
    return true;
  }

  getCloneUpgradeCost(cloneId) {
    const level = this._state.cloneUpgrades[cloneId] || 0;
    return Math.floor(100 * Math.pow(1.5, level));
  }

  /* ─── Illumineus Level System ─── */
  addIllumineusXp(amount) {
    this._state.illuminatiXp += amount;
    const xpNeeded = this.getIllumineusXpNeeded();
    if (this._state.illuminatiXp >= xpNeeded) {
      this._state.illuminatiXp -= xpNeeded;
      this._state.illuminatiLevel++;
      return true;
    }
    return false;
  }

  getIllumineusXpNeeded() {
    return Math.floor(100 * Math.pow(2.0, this._state.illuminatiLevel - 1));
  }

  /* ─── Income ─── */
  calcIncomePerSec() {
    let total = 0;
    const mgrSpeed = 1 + (this._state.upgradeLevels.manager_speed || 0) * 0.2;
    const speedAd = this.getAdBoostMultiplier('ad_speed');
    const masonBonus = this.getMasonBonus();
    const starBoost = this.getStarBoostMultiplier('star_10x_tap');
    for (const world of WORLDS) {
      for (const clone of world.clones) {
        const count = this._state.cloneCounts[clone.id] || 0;
        if (count <= 0) continue;
        let rate = clone.baseRate * count;
        const hasManager = this._state.managerOwned[clone.id + '_mgr'];
        if (hasManager) rate *= mgrSpeed * speedAd;
        const cloneBonus = this.getCloneBonus(clone.id, world.id);
        rate *= cloneBonus;
        const worldUpgrade = this.getWorldUpgradeBonus(world.id);
        rate *= worldUpgrade;
        const starBonus = this.getStarBonus(clone.id);
        rate *= starBonus;
        total += rate;
      }
    }
    total *= this.getWorldBonus();
    total *= this.getCostumeBonus();
    total *= masonBonus;
    total *= starBoost;
    total *= this.getAdBoostMultiplier('ad_2x_income');
    total *= this.getAdBoostMultiplier('ad_3x_income');
    if (this._state.timeWarpActive && Date.now() < this._state.timeWarpEnd) total *= 2;
    total *= this.getAdBoostMultiplier('ad_time_warp');
    return total;
  }

  getStarBonus(cloneId) {
    const stars = this.getCloneStars(cloneId);
    return 1 + stars * 0.1;
  }

  getCloneBonus(cloneId, worldId) {
    let mult = 1;
    for (const world of WORLDS) {
      if (world.id !== worldId) continue;
      for (const up of world.upgrades) {
        if (up.cloneId === cloneId) {
          const lv = this._state.upgradeLevels[up.id] || 0;
          mult *= Math.pow(1 + up.effect, lv);
        }
      }
    }
    return mult;
  }

  getWorldUpgradeBonus(worldId) {
    let mult = 1;
    for (const world of WORLDS) {
      if (world.id !== worldId) continue;
      for (const up of world.upgrades) {
        if (up.cloneId) continue;
        const lv = this._state.upgradeLevels[up.id] || 0;
        mult *= Math.pow(1 + up.effect, lv);
      }
    }
    return mult;
  }

  getWorldBonus() {
    const base = 1 + (this._state.unlockedWorlds.length - 1) * 0.1;
    const lv = this._state.upgradeLevels.world_bonus || 0;
    return base * (1 + lv * 0.1);
  }

  /* ─── Clone purchase ─── */
  getCloneCost(clone) {
    const count = this._state.cloneCounts[clone.id] || 0;
    return Math.floor(clone.baseCost * Math.pow(clone.costMult, count));
  }

  buyClone(cloneId) {
    for (const world of WORLDS) {
      const clone = world.clones.find(c => c.id === cloneId);
      if (!clone) continue;
      const cost = this.getCloneCost(clone);
      if (this._state.apeBalance < cost) return false;
      this._state.apeBalance -= cost;
      this._state.cloneCounts[clone.id] = (this._state.cloneCounts[clone.id] || 0) + 1;
      this._state.totalClonesBought++;
      this.addIllumineusXp(5);
      return true;
    }
    return false;
  }

  /* ─── Manager purchase ─── */
  getManagerCost(manager) {
    const owned = this._state.managerOwned[manager.id];
    if (owned) return Infinity;
    return manager.baseCost;
  }

  buyManager(managerId) {
    for (const world of WORLDS) {
      const mgr = world.managers.find(m => m.id === managerId);
      if (!mgr) continue;
      const cost = this.getManagerCost(mgr);
      if (this._state.apeBalance < cost) return false;
      this._state.apeBalance -= cost;
      this._state.managerOwned[mgr.id] = true;
      if (mgr.cloneId) this._state.managerOwned[mgr.cloneId + '_mgr'] = true;
      this._state.totalManagersBought++;
      this.addIllumineusXp(10);
      return true;
    }
    return false;
  }

  /* ─── Upgrade purchase ─── */
  getUpgradeCost(upgrade) {
    const lv = this._state.upgradeLevels[upgrade.id] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, lv));
  }

  buyWorldUpgrade(upgradeId) {
    for (const world of WORLDS) {
      const up = world.upgrades.find(u => u.id === upgradeId);
      if (!up) continue;
      if (up.oneTime) {
        if (this._state.apeBalance < up.baseCost) return false;
        this._state.apeBalance -= up.baseCost;
        this._state.timeWarpActive = true;
        this._state.timeWarpEnd = Date.now() + 60000;
        return true;
      }
      const cost = this.getUpgradeCost(up);
      const lv = this._state.upgradeLevels[up.id] || 0;
      if (this._state.apeBalance < cost || lv >= up.maxLevel) return false;
      this._state.apeBalance -= cost;
      this._state.upgradeLevels[up.id] = lv + 1;
      this._state.totalUpgradesBought++;
      this.addIllumineusXp(3);
      return true;
    }
    return false;
  }

  buyTapUpgrade(upgradeId) {
    const up = TAP_UPGRADES.find(u => u.id === upgradeId);
    if (!up) return false;
    if (up.oneTime) {
      if (this._state.apeBalance < up.baseCost) return false;
      this._state.apeBalance -= up.baseCost;
      this._state.timeWarpActive = true;
      this._state.timeWarpEnd = Date.now() + 60000;
      return true;
    }
    const cost = this.getUpgradeCost(up);
    const lv = this._state.upgradeLevels[up.id] || 0;
    if (this._state.apeBalance < cost || lv >= up.maxLevel) return false;
    this._state.apeBalance -= cost;
    this._state.upgradeLevels[up.id] = lv + 1;
    this._state.totalUpgradesBought++;
    this.addIllumineusXp(2);
    return true;
  }

  buyGlobalUpgrade(upgradeId) {
    const up = GLOBAL_UPGRADES.find(u => u.id === upgradeId);
    if (!up) return false;
    if (up.oneTime) {
      if (this._state.apeBalance < up.baseCost) return false;
      this._state.apeBalance -= up.baseCost;
      this._state.timeWarpActive = true;
      this._state.timeWarpEnd = Date.now() + 60000;
      return true;
    }
    const cost = this.getUpgradeCost(up);
    const lv = this._state.upgradeLevels[up.id] || 0;
    if (this._state.apeBalance < cost || lv >= up.maxLevel) return false;
    this._state.apeBalance -= cost;
    this._state.upgradeLevels[up.id] = lv + 1;
    this._state.totalUpgradesBought++;
    this.addIllumineusXp(2);
    return true;
  }

  /* ─── World unlock ─── */
  unlockWorld(worldIndex) {
    const world = WORLDS[worldIndex];
    if (!world) return false;
    if (this._state.unlockedWorlds.includes(worldIndex)) return false;
    if (this._state.apeBalance < world.unlockCost) return false;
    this._state.apeBalance -= world.unlockCost;
    this._state.unlockedWorlds.push(worldIndex);
    this._state.currentWorld = worldIndex;
    this.addIllumineusXp(20);
    return true;
  }

  switchWorld(idx) {
    if (!this._state.unlockedWorlds.includes(idx)) return false;
    this._state.currentWorld = idx;
    return true;
  }

  /* ─── Auto click ─── */
  autoClick() {
    const lv = this._state.upgradeLevels.auto_click || 0;
    if (lv <= 0) return 0;
    const base = 1;
    const worldBonus = this.getWorldBonus();
    const costumeBonus = this.getCostumeBonus();
    const masonBonus = this.getMasonBonus();
    const income = Math.floor(base * worldBonus * costumeBonus * masonBonus * lv * 0.3);
    this._state.apeBalance += income;
    this._state.totalApeEarned += income;
    return income;
  }

  /* ─── Idle tick ─── */
  tick() {
    const now = Date.now();
    const dt = (now - this._state.lastIncomeTick) / 1000;
    this._state.lastIncomeTick = now;
    const income = this.calcIncomePerSec() * dt;
    if (income > 0) {
      this._state.apeBalance += income;
      this._state.totalApeEarned += income;
    }
    if (this._state.timeWarpActive && now >= this._state.timeWarpEnd) {
      this._state.timeWarpActive = false;
    }
    for (const [id, end] of Object.entries(this._state.adBoosts)) {
      if (now >= end) delete this._state.adBoosts[id];
    }
    for (const [id, end] of Object.entries(this._state.starBoosts)) {
      if (now >= end) delete this._state.starBoosts[id];
    }
    return income;
  }

  /* ─── Tutorial ─── */
  completeTutorial() { this._state.tutorialComplete = true; this.save(); }
  advanceTutorial() { this._state.tutorialStep++; this.save(); }
  setLang(lang) { this._state.lang = lang; this.save(); }

  /* ─── Roulette ─── */
  spinRoulette() {
    const cost = this.getRouletteCost();
    if (this._state.apeBalance < cost) return null;
    this._state.apeBalance -= cost;
    this._state.rouletteSpins = (this._state.rouletteSpins || 0) + 1;

    const roll = Math.random() * 100;
    const world = WORLDS[this._state.currentWorld];
    let result;

    if (roll < 2) {
      // Jackpot: 50x cost
      const win = cost * 50;
      this._state.apeBalance += win;
      this._state.totalApeEarned += win;
      result = { type: 'jackpot', amount: win, label: 'JACKPOT!' };
    } else if (roll < 8) {
      // Free clone
      const unlocked = world.clones.filter(c => (this._state.cloneCounts[c.id] || 0) > 0);
      const available = world.clones.filter(c => (this._state.cloneCounts[c.id] || 0) === 0 && this._state.apeBalance >= 0);
      if (available.length > 0) {
        const clone = available[Math.floor(Math.random() * available.length)];
        this._state.cloneCounts[clone.id] = 1;
        this._state.totalClonesBought++;
        result = { type: 'clone', clone: clone, label: (getLang() === 'ru' ? clone.nameRu : clone.name) + ' unlocked!' };
      } else {
        const win = cost * 10;
        this._state.apeBalance += win;
        this._state.totalApeEarned += win;
        result = { type: 'bigwin', amount: win, label: '+' + win + ' $APE!' };
      }
    } else if (roll < 15) {
      // Diamonds
      const diamonds = Math.floor(Math.random() * 5) + 3;
      this._state.diamonds += diamonds;
      result = { type: 'diamonds', amount: diamonds, label: '+' + diamonds + ' Diamonds!' };
    } else if (roll < 30) {
      // Big win: 10x cost
      const win = cost * 10;
      this._state.apeBalance += win;
      this._state.totalApeEarned += win;
      result = { type: 'bigwin', amount: win, label: '+' + fmt(win) + ' $APE!' };
    } else if (roll < 50) {
      // Medium win: 5x cost
      const win = cost * 5;
      this._state.apeBalance += win;
      this._state.totalApeEarned += win;
      result = { type: 'medium', amount: win, label: '+' + fmt(win) + ' $APE!' };
    } else if (roll < 70) {
      // Small win: 2x cost
      const win = cost * 2;
      this._state.apeBalance += win;
      this._state.totalApeEarned += win;
      result = { type: 'small', amount: win, label: '+' + fmt(win) + ' $APE!' };
    } else {
      // Lose
      result = { type: 'lose', amount: 0, label: 'Nothing...' };
    }
    this.addIllumineusXp(2);
    return result;
  }

  getRouletteCost() {
    const spins = this._state.rouletteSpins || 0;
    return Math.floor(500 * Math.pow(1.05, Math.min(spins, 50)));
  }

  /* ─── Utils ─── */
  setTgUser(u) { this._state.tgUser = u; this.save(); }
  setWallet(a) { this._state.walletAddress = a; this.save(); }
  addApe(n) { this._state.apeBalance += n; this._state.totalApeEarned += n; }
  spendApe(n) { if (this._state.apeBalance < n) return false; this._state.apeBalance -= n; return true; }
  addDiamonds(n) { this._state.diamonds += n; }
  spendDiamonds(n) { if (this._state.diamonds < n) return false; this._state.diamonds -= n; return true; }
  resetAll() { Object.assign(this._state, defaultState()); this.save(); }
}

export const store = new Store();
