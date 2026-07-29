import { MERGE_COST, MERGE_MATRIX, ITEMS, CATEGORIES, RARITIES } from './config.js';

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
    const saved = localStorage.getItem('ape_clicker');
    if (saved) { try { Object.assign(this._state, JSON.parse(saved)); } catch {} }
  }

  defaultState() {
    return {
      userId: null, tgUser: null, apeBalance: 0, bananas: 0, gold: 0,
      level: 1, xp: 0, xpNeeded: 50, totalTaps: 0, tapMultiplier: 1,
      mergeSlots: [null, null, null, null],
      inventory: [], collection: {},
      tutorialStep: 0, tutorialDone: false,
      lastDaily: 0, streak: 0, walletAddress: null,
      stats: { strength: 1, stamina: 1, speed: 1, luck: 1 },
      statPoints: 0, outfit: { head: null, body: null, accessory: null },
    };
  }

  get state() { return this._state; }
  save() { localStorage.setItem('ape_clicker', JSON.stringify(this._state)); }
  getItem(id) { return ITEMS.find(i => i.id === id); }
  getAllItems() { return ITEMS; }
  getRarities() { return RARITIES; }
  getCategories() { return CATEGORIES; }
  getRank() {
    let rank = RANKS[0];
    for (const r of RANKS) { if (this._state.level >= r.minLevel) rank = r; }
    return rank;
  }

  tapGorilla() {
    this._state.totalTaps++;
    const bananas = Math.floor(this._state.tapMultiplier * (1 + this._state.stats.luck * 0.05));
    this._state.bananas += bananas;
    this.addXP(Math.max(1, Math.floor(bananas / 2)));
    this.save();
    return { bananas, xp: Math.max(1, Math.floor(bananas / 2)) };
  }

  addXP(amount) {
    this._state.xp += amount;
    while (this._state.xp >= this._state.xpNeeded) {
      this._state.xp -= this._state.xpNeeded;
      this._state.level++;
      this._state.xpNeeded = Math.floor(this._state.xpNeeded * 1.3);
      this._state.statPoints += 2;
    }
  }

  buyItem(itemId) {
    const item = this.getItem(itemId);
    if (!item) return false;
    const rIdx = RARITIES.findIndex(r => r.id === item.rarity);
    const cost = Math.floor(10 * Math.pow(3, rIdx));
    if (this._state.bananas < cost || this._state.inventory.length >= 50) return false;
    this._state.bananas -= cost;
    this._state.inventory.push({ ...item, uid: Date.now() + Math.random() });
    if (!this._state.collection[item.id]) this._state.collection[item.id] = 0;
    this._state.collection[item.id]++;
    this.addXP(RARITIES[rIdx]?.bonus || 1);
    this.save();
    return true;
  }

  getBuyCost(item) {
    const rIdx = RARITIES.findIndex(r => r.id === item.rarity);
    return Math.floor(10 * Math.pow(3, rIdx));
  }

  equipOutfit(slot, itemUid) {
    const item = this._state.inventory.find(i => i.uid === itemUid);
    if (!item) return false;
    if (this._state.outfit[slot]) this._state.inventory.push(this._state.outfit[slot]);
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

  placeInMergeSlot(idx, inventoryUid) {
    if (idx < 0 || idx > 3 || this._state.mergeSlots[idx]) return false;
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
    if (!filled.every(s => s.rarity === first.rarity && s.category === first.category)) return null;
    const nextRarity = MERGE_MATRIX[first.rarity];
    if (!nextRarity) return { result: null, messageKey: 'merge_max' };
    const cost = MERGE_COST[first.rarity] || 50;
    if (this._state.gold < cost) return { result: null, messageKey: 'merge_no_gold' };
    this._state.gold -= cost;
    for (let i = 0; i < 4; i++) this._state.mergeSlots[i] = null;
    const candidates = ITEMS.filter(i => i.rarity === nextRarity && i.category === first.category);
    if (!candidates.length) return null;
    const result = candidates[Math.floor(Math.random() * candidates.length)];
    this._state.inventory.push({ ...result, uid: Date.now() + Math.random() });
    const rIdx = RARITIES.findIndex(r => r.id === nextRarity);
    this.addXP(RARITIES[rIdx]?.bonus || 5);
    this.save();
    return { result, nextRarity, cost };
  }

  canClaimDaily() { return !this._state.lastDaily || (Date.now() - this._state.lastDaily) >= 86400000; }
  claimDaily() {
    if (!this.canClaimDaily()) return null;
    const now = Date.now();
    if (this._state.lastDaily && (now - this._state.lastDaily) < 86400000 * 2) this._state.streak++;
    else this._state.streak = 1;
    this._state.lastDaily = now;
    const bonus = this._state.streak * 10;
    this._state.bananas += bonus;
    this._state.gold += Math.floor(this._state.streak / 2);
    this.save();
    return { bananas: bonus, gold: Math.floor(this._state.streak / 2), streak: this._state.streak };
  }

  advanceTutorial() {
    if (this._state.tutorialStep < 4) this._state.tutorialStep++;
    else this._state.tutorialDone = true;
    this.save();
  }
  completeTutorial() { this._state.tutorialDone = true; this.save(); }
}

export const store = new Store();
window.store = store;
