import { MERGE_COST, MERGE_MATRIX, generateItems, CATEGORIES, RARITIES, INITIAL_TUTORIAL } from './config.js';

const ALL_ITEMS = generateItems();
const RANKS = [
  { id: 'initiate', name: 'Initiate', nameRu: 'Инициат', minLevel: 1 },
  { id: 'member', name: 'Member', nameRu: 'Член', minLevel: 5 },
  { id: 'elder', name: 'Elder', nameRu: 'Старейшина', minLevel: 15 },
  { id: 'master', name: 'Master', nameRu: 'Мастер', minLevel: 30 },
  { id: 'grandmaster', name: 'Grand Master', nameRu: 'Великий Мастер', minLevel: 50 },
];

class Store {
  constructor() {
    this._state = this.defaultState();
    const saved = localStorage.getItem('mason_mini_app');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this._state, parsed);
        if (!this._state.collection || Object.keys(this._state.collection).length === 0) {
          this._state.collection = {};
          for (const item of ALL_ITEMS) this._state.collection[item.id] = 0;
        }
      } catch {}
    } else {
      for (const item of ALL_ITEMS) this._state.collection[item.id] = 0;
    }
  }

  defaultState() {
    return {
      userId: null,
      tgUser: null,
      apeBalance: 0,
      gold: 0,
      crystals: 0,
      level: 1,
      xp: 0,
      xpNeeded: 50,
      collection: {},
      totalCollected: 0,
      inventory: [],
      mergeSlots: new Array(4).fill(null),
      tutorialStep: 0,
      tutorialDone: false,
      totalTaps: 0,
      tapMultiplier: 1,
      outfit: { head: null, body: null, accessory: null },
      lastDaily: 0,
      streak: 0,
      walletAddress: null,
      stats: { strength: 1, wisdom: 1, agility: 1, luck: 1 },
      statPoints: 0,
    };
  }

  get state() { return this._state; }
  save() { localStorage.setItem('mason_mini_app', JSON.stringify(this._state)); }

  getItem(id) { return ALL_ITEMS.find(i => i.id === id); }
  getAllItems() { return ALL_ITEMS; }
  getRarities() { return RARITIES; }
  getCategories() { return CATEGORIES; }

  getRank() {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (this._state.level >= r.minLevel) rank = r;
    }
    return rank;
  }

  tapMason() {
    const now = Date.now();
    this._state.totalTaps++;
    const base = this._state.tapMultiplier;
    const bonus = this._state.stats.luck * 0.05;
    const gold = Math.floor(base * (1 + bonus));
    const xp = Math.max(1, Math.floor(gold / 2));
    this._state.gold += gold;
    this.addXP(xp);
    this.save();
    return { gold, xp };
  }

  equipOutfit(slot, itemUid) {
    const item = this._state.inventory.find(i => i.uid === itemUid);
    if (!item) return false;
    if (this._state.outfit[slot]) {
      this._state.inventory.push(this._state.outfit[slot]);
    }
    this._state.outfit[slot] = item;
    this._state.inventory = this._state.inventory.filter(i => i.uid !== itemUid);
    this.save();
    return true;
  }

  unequipOutfit(slot) {
    if (!this._state.outfit[slot]) return false;
    if (this._state.inventory.length >= 50) return false;
    this._state.inventory.push(this._state.outfit[slot]);
    this._state.outfit[slot] = null;
    this.save();
    return true;
  }

  upgradeStat(stat) {
    if (this._state.statPoints <= 0 || !this._state.stats[stat] || this._state.stats[stat] >= 100) return false;
    this._state.stats[stat]++;
    this._state.statPoints--;
    this.save();
    return true;
  }

  addXP(amount) {
    this._state.xp += amount;
    while (this._state.xp >= this._state.xpNeeded) {
      this._state.xp -= this._state.xpNeeded;
      this._state.level++;
      this._state.xpNeeded = Math.floor(this._state.xpNeeded * 1.3);
      this._state.statPoints += 2;
    }
    this.save();
  }

  collectItem(id) {
    if (this._state.collection[id] === undefined) return false;
    this._state.collection[id]++;
    this._state.totalCollected++;
    const item = this.getItem(id);
    if (item) {
      const rar = RARITIES.find(r => r.id === item.rarity);
      this.addXP(rar ? rar.bonus : 1);
    }
    this.save();
    return true;
  }

  addItemToInventory(id) {
    const item = this.getItem(id);
    if (!item) return false;
    if (this._state.inventory.length >= 50) return false;
    this._state.inventory.push({ ...item, uid: Date.now() + Math.random() });
    this.collectItem(id);
    this.save();
    return true;
  }

  removeFromInventory(uid) {
    this._state.inventory = this._state.inventory.filter(i => i.uid !== uid);
    this.save();
  }

  canMergeSlot(idx) { return idx >= 0 && idx < 4; }
  isSlotEmpty(idx) { return !this._state.mergeSlots[idx]; }

  placeInMergeSlot(idx, inventoryUid) {
    if (!this.canMergeSlot(idx) || !this.isSlotEmpty(idx)) return false;
    const item = this._state.inventory.find(i => i.uid === inventoryUid);
    if (!item) return false;
    this._state.mergeSlots[idx] = item;
    this._state.inventory = this._state.inventory.filter(i => i.uid !== inventoryUid);
    this.save();
    return true;
  }

  removeFromMergeSlot(idx) {
    if (!this._state.mergeSlots[idx] || this._state.inventory.length >= 50) return false;
    this._state.inventory.push(this._state.mergeSlots[idx]);
    this._state.mergeSlots[idx] = null;
    this.save();
    return true;
  }

  tryMerge() {
    const filled = this._state.mergeSlots.filter(s => s !== null);
    if (filled.length < 2) return null;
    const first = filled[0];
    if (!filled.every(s => s.rarity === first.rarity)) return null;
    const nextRarity = MERGE_MATRIX[first.rarity];
    if (!nextRarity) return { result: null, messageKey: 'merge_max' };
    const cost = MERGE_COST[first.rarity] || 50;
    if (this._state.gold < cost) return { result: null, messageKey: 'merge_no_gold' };
    this._state.gold -= cost;
    for (let i = 0; i < 4; i++) {
      this._state.mergeSlots[i] = null;
    }
    const candidates = ALL_ITEMS.filter(i => i.rarity === nextRarity);
    if (!candidates.length) return null;
    const result = candidates[Math.floor(Math.random() * candidates.length)];
    this._state.inventory.push({ ...result, uid: Date.now() + Math.random() });
    this.addXP(RARITIES.find(r => r.id === nextRarity)?.bonus || 5);
    this.save();
    return { result, nextRarity, cost };
  }

  addCurrency(type, amount) {
    if (this._state[type] !== undefined) { this._state[type] += amount; this.save(); return true; }
    return false;
  }

  spendCurrency(type, amount) {
    if ((this._state[type] || 0) >= amount) { this._state[type] -= amount; this.save(); return true; }
    return false;
  }

  canClaimDaily() {
    if (!this._state.lastDaily) return true;
    return (Date.now() - this._state.lastDaily) >= 86400000;
  }

  claimDaily() {
    if (!this.canClaimDaily()) return null;
    const now = Date.now();
    if (this._state.lastDaily && (now - this._state.lastDaily) < 86400000 * 2) this._state.streak++;
    else this._state.streak = 1;
    this._state.lastDaily = now;
    const bonus = this._state.streak * 10;
    this._state.gold += bonus;
    this._state.crystals += Math.floor(this._state.streak / 2);
    this.save();
    return { gold: bonus, crystals: Math.floor(this._state.streak / 2), streak: this._state.streak };
  }

  advanceTutorial() {
    if (this._state.tutorialStep < INITIAL_TUTORIAL.length - 1) this._state.tutorialStep++;
    else this._state.tutorialDone = true;
    this.save();
  }

  completeTutorial() { this._state.tutorialDone = true; this.save(); }
}

export const store = new Store();
window.store = store;
