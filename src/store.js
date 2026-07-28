import { RARITIES, ITEM_CATEGORIES, generateItems, NPCS, LOCATIONS, MERGE_COST, MERGE_MATRIX, QUEST_DURATION, QUEST_REWARD_BASE } from './config.js';

const ALL_ITEMS = generateItems();

class Store {
  constructor() {
    const saved = localStorage.getItem('mason_mini_app');
    if (saved) {
      try { this._state = JSON.parse(saved); } catch { this._state = this.defaultState(); }
    } else {
      this._state = this.defaultState();
    }
    // Ensure item count matches
    if (Object.keys(this._state.collection).length === 0) {
      for (const item of ALL_ITEMS) this._state.collection[item.id] = 0;
    }
  }

  defaultState() {
    const coll = {};
    for (const item of ALL_ITEMS) coll[item.id] = 0;
    return {
      tgUser: null,
      currentLocation: 'temple',
      knowledge: 0,
      gold: 0,
      crystals: 0,
      energy: 0,
      reputation: 0,
      keys: 0,
      level: 1,
      xp: 0,
      xpNeeded: 100,
      collection: coll,
      totalCollected: 0,
      inventory: [],
      mergeSlots: new Array(9).fill(null),
      mergeSlotsUnlocked: [0, 1, 2],
      questActive: false,
      questEnd: 0,
      questNPC: null,
      tutorialStep: 0,
      tutorialDone: false,
      completedQuests: 0,
      npcLevels: {},
      seenItems: [],
      lastDaily: 0,
      streak: 0,
    };
  }

  get state() { return this._state; }

  save() {
    localStorage.setItem('mason_mini_app', JSON.stringify(this._state));
  }

  getItem(id) { return ALL_ITEMS.find(i => i.id === id); }
  getAllItems() { return ALL_ITEMS; }
  getItemsByCategory(cat) { return ALL_ITEMS.filter(i => i.category === cat); }
  getItemsByRarity(rar) { return ALL_ITEMS.filter(i => i.rarity === rar); }

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
    this._state.collectItem(id);
    this.save();
    return true;
  }

  removeFromInventory(uid) {
    this._state.inventory = this._state.inventory.filter(i => i.uid !== uid);
    this.save();
  }

  addXP(amount) {
    this._state.xp += amount;
    while (this._state.xp >= this._state.xpNeeded) {
      this._state.xp -= this._state.xpNeeded;
      this._state.level++;
      this._state.xpNeeded = Math.floor(this._state.xpNeeded * 1.4);
    }
    this.save();
  }

  getCollectedCount() {
    return Object.values(this._state.collection).reduce((a, b) => a + b, 0);
  }

  getTotalUnique() {
    return Object.values(this._state.collection).filter(c => c > 0).length;
  }

  getCategoryProgress(cat) {
    const items = ALL_ITEMS.filter(i => i.category === cat);
    const owned = items.filter(i => this._state.collection[i.id] > 0).length;
    return { total: items.length, owned };
  }

  getRarityProgress(rar) {
    const items = ALL_ITEMS.filter(i => i.rarity === rar);
    const owned = items.filter(i => this._state.collection[i.id] > 0).length;
    return { total: items.length, owned };
  }

  // Merge system
  canMergeSlot(idx) {
    return idx >= 0 && idx < 9 && this._state.mergeSlotsUnlocked.includes(idx);
  }

  isSlotEmpty(idx) {
    return !this._state.mergeSlots[idx];
  }

  placeInMergeSlot(idx, inventoryUid) {
    if (!this.canMergeSlot(idx)) return false;
    if (!this.isSlotEmpty(idx)) return false;
    const item = this._state.inventory.find(i => i.uid === inventoryUid);
    if (!item) return false;
    this._state.mergeSlots[idx] = item;
    this._state.inventory = this._state.inventory.filter(i => i.uid !== inventoryUid);
    this.save();
    return true;
  }

  removeFromMergeSlot(idx) {
    if (!this._state.mergeSlots[idx]) return false;
    if (this._state.inventory.length >= 50) return false;
    this._state.inventory.push(this._state.mergeSlots[idx]);
    this._state.mergeSlots[idx] = null;
    this.save();
    return true;
  }

  tryMerge() {
    const filled = this._state.mergeSlots.filter(s => s !== null);
    if (filled.length < 2) return null;
    // Check all same type
    const first = filled[0];
    const same = filled.every(s => s.rarity === first.rarity);
    if (!same) return null;
    const nextRarity = MERGE_MATRIX[first.rarity];
    if (!nextRarity) return { result: null, messageKey: 'merge_max' };
    // Cost
    const cost = MERGE_COST[first.rarity] || 50;
    if (this._state.gold < cost) return { result: null, messageKey: 'merge_no_gold' };
    this._state.gold -= cost;
    // Remove used items
    const used = [];
    for (let i = 0; i < 9; i++) {
      if (this._state.mergeSlots[i]) {
        const uid = this._state.mergeSlots[i].uid;
        used.push(uid);
        this._state.mergeSlots[i] = null;
      }
    }
    // Find resulting item
    const candidates = ALL_ITEMS.filter(i => i.rarity === nextRarity);
    if (candidates.length === 0) return null;
    const result = candidates[Math.floor(Math.random() * candidates.length)];
    this._state.inventory.push({ ...result, uid: Date.now() + Math.random() });
    this.addXP(RARITIES.find(r => r.id === nextRarity)?.bonus || 5);
    this.save();
    return { result, used, cost, nextRarity };
  }

  unlockMergeSlot() {
    const nextIdx = this._state.mergeSlotsUnlocked.length;
    if (nextIdx >= 9) return false;
    const cost = MERGE_COST.common * (nextIdx + 1);
    if (this._state.gold < cost) return false;
    this._state.gold -= cost;
    this._state.mergeSlotsUnlocked.push(nextIdx);
    this.save();
    return true;
  }

  // Quests
  startQuest(npcId) {
    if (this._state.questActive) return false;
    const npc = NPCS.find(n => n.id === npcId);
    if (!npc) return false;
    this._state.questActive = true;
    this._state.questEnd = Date.now() + QUEST_DURATION;
    this._state.questNPC = npcId;
    this.save();
    return true;
  }

  tickQuest() {
    if (!this._state.questActive) return false;
    if (Date.now() >= this._state.questEnd) {
      // Complete
      const reward = QUEST_REWARD_BASE * (1 + this._state.completedQuests * 0.1);
      this._state.gold += Math.floor(reward);
      this._state.knowledge += Math.floor(reward / 2);
      this._state.completedQuests++;
      this._state.questActive = false;
      this._state.questNPC = null;
      this.addXP(20);
      this.save();
      return true;
    }
    return false;
  }

  getQuestProgress() {
    if (!this._state.questActive) return 0;
    const elapsed = Date.now() - (this._state.questEnd - QUEST_DURATION);
    return Math.min(1, elapsed / QUEST_DURATION);
  }

  // Economy
  addCurrency(type, amount) {
    if (this._state[type] !== undefined) {
      this._state[type] += amount;
      this.save();
      return true;
    }
    return false;
  }

  spendCurrency(type, amount) {
    if ((this._state[type] || 0) >= amount) {
      this._state[type] -= amount;
      this.save();
      return true;
    }
    return false;
  }

  // Daily
  canClaimDaily() {
    const now = Date.now();
    const last = this._state.lastDaily;
    if (!last) return true;
    return (now - last) >= 86400000;
  }

  claimDaily() {
    if (!this.canClaimDaily()) return null;
    const now = Date.now();
    const last = this._state.lastDaily;
    if (last && (now - last) < 86400000 * 2) this._state.streak++;
    else this._state.streak = 1;
    this._state.lastDaily = now;
    const bonus = this._state.streak * 10;
    this._state.gold += bonus;
    this._state.crystals += Math.floor(this._state.streak / 2);
    this.save();
    return { gold: bonus, crystals: Math.floor(this._state.streak / 2), streak: this._state.streak };
  }

  // Tutorial
  advanceTutorial() {
    if (this._state.tutorialStep < INITIAL_TUTORIAL.length - 1) {
      this._state.tutorialStep++;
    } else {
      this._state.tutorialDone = true;
    }
    this.save();
  }

  completeTutorial() {
    this._state.tutorialDone = true;
    this.save();
  }
}

export const store = new Store();
window.store = store;
