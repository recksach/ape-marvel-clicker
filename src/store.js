import { MERGE_COST, MERGE_MATRIX, QUEST_DURATION, QUEST_REWARD_BASE, INITIAL_TUTORIAL } from './config.js';

// Inline item generation to avoid circular
const itemNames = {
  books: { en: ['Forbidden Grimoire','Emerald Codex','Golden Scroll','Obsidian Tome','Rune Folio','Ancient Manuscript','Crystal Lexicon','Shadow Chronicle','Divine Scripture','Void Record','Temple Archives','Mason Diary','Illuminated Page','Secret Treatise','Mythos Collection','Arcane Primer','Astral Codex','Eternal Vellum','Ritual Script','Thousand Leaves'], ru: ['Запретный Гримуар','Изумрудный Кодекс','Золотой Свиток','Обсидиановый Том','Руническое Фолио','Древняя Рукопись','Кристальный Лексикон','Теневая Хроника','Божественное Писание','Запись Бездны','Храмовые Архивы','Дневник Масона','Иллюминированная Страница','Секретный Трактат','Коллекция Мифов','Арканный Букварь','Астральный Кодекс','Вечный Пергамент','Ритуальный Сценарий','Тысяча Листьев'] },
  elixirs: { en: ['Emerald Tincture','Golden Nectar','Crystal Solvent','Black Philosopher','Vitality Draught','Mana Infusion','Alkahest','Lapis Elixir','Aether Essence','Phoenix Tear','Dragon Breath','Moonwater','Sun Drop','Void Extract','Chaos Brew','Starlight Potion','Shadow Essence','Divine Ambrosia','Rune Oil','Crimson Flask'], ru: ['Изумрудная Настойка','Золотой Нектар','Кристальный Растворитель','Чёрный Философ','Эликсир Жизни','Вливание Маны','Алкагест','Лазурный Эликсир','Эссенция Эфира','Слеза Феникса','Драконье Дыхание','Лунная Вода','Солнечная Капля','Экстракт Бездны','Зелье Хаоса','Звёздное Зелье','Теневая Эссенция','Божественная Амброзия','Руническое Масло','Багровая Колба'] },
  coins: { en: ['Bronze Mark','Silver Shekel','Gold Talent','Emerald Drachma','Black Stater','Crystal Denarius','Obsidian Sestertius','Imperial Solidus','Mason Sovereign','Temple Aureus','Ancient Obol','Royal Ducat','Shadow Gulden','Divine Florin','Secret Bezant','Dragon Dinar','Phoenix Penny','Rune Crown','Void Ducat','Star Tael'], ru: ['Бронзовая Марка','Серебряный Шекель','Золотой Талант','Изумрудная Драхма','Чёрный Статер','Кристальный Денарий','Обсидиановый Сестерций','Имперский Солид','Масонский Суверен','Храмовый Аурей','Древний Обол','Королевский Дукат','Теневой Гульден','Божественный Флорин','Секретный Безант','Драконий Динар','Пенни Феникса','Руническая Корона','Дукат Бездны','Звёздный Таэль'] },
  artifacts: { en: ['Eye of Providence','Emerald Ankh','Golden Pyramid','Obsidian Obelisk','Crystal Skull','Rune Tablet','Masonic Compass','Ancient Seal','Void Prism','Divine Sundial','Chronometer','Shadow Lantern','Temple Key','Philosopher Stone','Aether Lens','Dragon Scale','Phoenix Feather','Moon Dial','Star Chart','Void Compass'], ru: ['Глас Провидения','Изумрудный Анх','Золотая Пирамида','Обсидиановый Обелиск','Хрустальный Череп','Руническая Табличка','Масонский Циркуль','Древняя Печать','Призма Бездны','Божественные Часы','Хронометр','Теневой Фонарь','Храмовый Ключ','Философский Камень','Линза Эфира','Драконья Чешуя','Перо Феникса','Лунный Циферблат','Звёздная Карта','Компас Бездны'] },
  seals: { en: ['Wax Seal of Order','Emerald Signet','Golden Stamp','Black Imprint','Crystal Seal','Rune Brand','Mason Emblem','Temple Mark','Ancient Crest','Void Sigil','Divine Brand','Shadow Seal','Royal Stamp','Secret Sign','Dragon Brand','Phoenix Crest','Star Sigil','Moon Brand','Sun Stamp','Eternal Seal'], ru: ['Печать Порядка','Изумрудный Перстень','Золотая Марка','Чёрный Оттиск','Хрустальная Печать','Руническое Клеймо','Эмблема Масона','Храмовая Метка','Древний Герб','Сигилла Бездны','Божественное Клеймо','Теневая Печать','Королевская Марка','Тайный Знак','Драконье Клеймо','Герб Феникса','Звёздная Сигилла','Лунная Марка','Солнечная Печать','Вечная Печать'] },
  amulets: { en: ['Bronze Pendant','Silver Charm','Gold Talisman','Emerald Amulet','Obsidian Necklace','Crystal Pendant','Rune Charm','Mason Brooch','Temple Amulet','Ancient Talisman','Void Pendant','Divine Charm','Shadow Necklace','Royal Amulet','Secret Talisman','Dragon Amulet','Phoenix Pendant','Star Charm','Moon Talisman','Sun Pendant'], ru: ['Бронзовая Подвеска','Серебряный Оберег','Золотой Талисман','Изумрудный Амулет','Обсидиановое Ожерелье','Кристальная Подвеска','Рунический Оберег','Брошь Масона','Храмовой Амулет','Древний Талисман','Подвеска Бездны','Божественный Оберег','Теневое Ожерелье','Королевский Амулет','Тайный Талисман','Амулет Дракона','Подвеска Феникса','Звёздный Оберег','Лунный Талисман','Солнечная Подвеска'] },
  crystals: { en: ['Emerald Shard','Golden Crystal','Black Diamond','Sapphire Gem','Ruby Heart','Amethyst Cluster','Topaz Prism','Onyx Stone','Crystal Core','Void Crystal','Divine Gem','Shadow Crystal','Rune Stone','Star Fragment','Moon Crystal','Sun Gem','Dragon Eye','Phoenix Stone','Eternal Ice','Chaos Shard'], ru: ['Осколок Изумруда','Золотой Кристалл','Чёрный Алмаз','Сапфировая Глыба','Рубиновое Сердце','Гроздь Аметиста','Топазная Призма','Ониксовый Камень','Кристальное Ядро','Кристалл Бездны','Божественный Самоцвет','Теневой Кристалл','Рунический Камень','Осколок Звезды','Лунный Кристалл','Солнечный Самоцвет','Драконий Глаз','Камень Феникса','Вечный Лёд','Осколок Хаоса'] },
  masks: { en: ['Ceremonial Mask','Emerald Visage','Golden Face','Black Veil','Crystal Mask','Rune Visor','Obsidian Face','Mason Hood','Temple Visage','Ancient Mask','Void Face','Divine Veil','Shadow Mask','Royal Visage','Secret Mask','Dragon Face','Phoenix Veil','Star Mask','Moon Visor','Sun Face'], ru: ['Церемониальная Маска','Изумрудный Лик','Золотое Лицо','Чёрная Вуаль','Хрустальная Маска','Руническое Забрало','Обсидиановый Лик','Капюшон Масона','Храмовой Лик','Древняя Маска','Лик Бездны','Божественная Вуаль','Теневая Маска','Королевский Лик','Секретная Маска','Драконий Лик','Вуаль Феникса','Звёздная Маска','Лунное Забрало','Солнечный Лик'] },
  collectibles: { en: ['Miniature Temple','Emerald Globe','Golden Pyramid','Obsidian Idol','Crystal Orb','Rune Totem','Mason Trophy','Temple Relic','Ancient Doll','Void Figurine','Divine Statue','Shadow Effigy','Royal Bust','Secret Idol','Dragon Miniature','Phoenix Replica','Star Globe','Moon Statue','Sun Idol','Eternal Shrine'], ru: ['Миниатюрный Храм','Изумрудный Глобус','Золотая Пирамида','Обсидиановый Идол','Хрустальная Сфера','Рунический ТотеМ','Трофей Масона','Храмовая Реликвия','Древняя Кукла','Фигурка Бездны','Божественная Статуя','Теневой Истукан','Королевский Бюст','Тайный Идол','Миниатюра Дракона','Копия Феникса','Звёздный Глобус','Лунная Статуя','Солнечный Идол','Вечное Святилище'] },
};
const RARITY_LIST = [
  { id: 'common', name: 'Common', nameRu: 'Обычный', color: '#8b7355', bonus: 1 },
  { id: 'uncommon', name: 'Uncommon', nameRu: 'Необычный', color: '#10b981', bonus: 2 },
  { id: 'rare', name: 'Rare', nameRu: 'Редкий', color: '#3b82f6', bonus: 3 },
  { id: 'epic', name: 'Epic', nameRu: 'Эпический', color: '#a855f7', bonus: 5 },
  { id: 'legendary', name: 'Legendary', nameRu: 'Легендарный', color: '#f7c948', bonus: 10 },
  { id: 'mythic', name: 'Mythic', nameRu: 'Мифический', color: '#ef4444', bonus: 20 },
  { id: 'ancient', name: 'Ancient', nameRu: 'Древний', color: '#8b7355', bonus: 30 },
  { id: 'divine', name: 'Divine', nameRu: 'Божественный', color: '#e0dcc0', bonus: 50 },
  { id: 'secret', name: 'Secret', nameRu: 'Секретный', color: '#10b981', bonus: 100 },
];
const CATEGORIES = [
  { id: 'books', name: 'Books', nameRu: 'Книги', icon: '📖' },
  { id: 'elixirs', name: 'Elixirs', nameRu: 'Эликсиры', icon: '⚗' },
  { id: 'coins', name: 'Coins', nameRu: 'Монеты', icon: '●' },
  { id: 'artifacts', name: 'Artifacts', nameRu: 'Артефакты', icon: '△' },
  { id: 'seals', name: 'Seals', nameRu: 'Печати', icon: '◎' },
  { id: 'amulets', name: 'Amulets', nameRu: 'Амулеты', icon: '◇' },
  { id: 'crystals', name: 'Crystals', nameRu: 'Кристаллы', icon: '⬡' },
  { id: 'masks', name: 'Masks', nameRu: 'Маски', icon: '◉' },
  { id: 'collectibles', name: 'Collectibles', nameRu: 'Коллекции', icon: '☰' },
];

function genItems() {
  const items = [];
  let _id = 0;
  for (const cat of CATEGORIES) {
    for (let ri = 0; ri < RARITY_LIST.length; ri++) {
      const rarity = RARITY_LIST[ri];
      const count = Math.max(3, 20 - ri * 2);
      for (let i = 0; i < count; i++) {
        const names = itemNames[cat.id];
        const idx = (ri * 3 + i) % names.en.length;
        items.push({
          id: _id++,
          category: cat.id,
          rarity: rarity.id,
          name: names.en[idx] + (i >= names.en.length ? ` #${i+1}` : ''),
          nameRu: names.ru[idx] + (i >= names.ru.length ? ` #${i+1}` : ''),
          value: (ri + 1) * 10,
        });
      }
    }
  }
  return items;
}
const ALL_ITEMS = genItems();

const NPC_LIST = [
  { id: 'librarian', name: 'Librarian', nameRu: 'Библиотекарь', color: '#8b7355', descKey: 'npc_librarian' },
  { id: 'alchemist', name: 'Master Alchemist', nameRu: 'Мастер Алхимик', color: '#10b981', descKey: 'npc_alchemist' },
  { id: 'merchant', name: 'Temple Merchant', nameRu: 'Храмовой Торговец', color: '#f7c948', descKey: 'npc_merchant' },
  { id: 'banker', name: 'Coin Banker', nameRu: 'Монетный Банкир', color: '#f7c948', descKey: 'npc_banker' },
  { id: 'blacksmith', name: 'Arcane Blacksmith', nameRu: 'Мистический Кузнец', color: '#06b6d4', descKey: 'npc_blacksmith' },
  { id: 'archivist', name: 'Chief Archivist', nameRu: 'Главный Архивариус', color: '#8b7355', descKey: 'npc_archivist' },
  { id: 'oracle', name: 'The Oracle', nameRu: 'Оракул', color: '#10b981', descKey: 'npc_oracle' },
  { id: 'guard', name: 'Temple Guard', nameRu: 'Храмовой Страж', color: '#f7c948', descKey: 'npc_guard' },
  { id: 'grandmaster', name: 'Grand Master', nameRu: 'Великий Мастер', color: '#f7c948', descKey: 'npc_grandmaster' },
  { id: 'collector', name: 'Secret Collector', nameRu: 'Тайный Коллекционер', color: '#a855f7', descKey: 'npc_collector' },
  { id: 'engraver', name: 'Rune Engraver', nameRu: 'Рунический Гравёр', color: '#06b6d4', descKey: 'npc_engraver' },
  { id: 'miner', name: 'Crystal Miner', nameRu: 'Кристальный Шахтёр', color: '#10b981', descKey: 'npc_miner' },
  { id: 'dealer', name: 'Potion Dealer', nameRu: 'Торговец Зельями', color: '#f7c948', descKey: 'npc_dealer' },
  { id: 'keeper', name: 'Treasure Keeper', nameRu: 'Хранитель Сокровищ', color: '#f7c948', descKey: 'npc_keeper' },
  { id: 'monk', name: 'Shadow Monk', nameRu: 'Теневой Монах', color: '#10b981', descKey: 'npc_monk' },
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
      knowledge: 0,
      energy: 100,
      reputation: 0,
      keys: 0,
      level: 1,
      xp: 0,
      xpNeeded: 100,
      collection: {},
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
      // New
      walletAddress: null,
      totalTaps: 0,
      tapMultiplier: 1,
      activeNPCs: NPC_LIST.map((n, i) => ({
        id: n.id,
        x: 10 + Math.random() * 80,
        y: 20 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        scale: 0.8 + Math.random() * 0.4,
        outfit: { head: null, body: null, accessory: null },
        lastTap: 0,
        happiness: 50 + Math.random() * 50,
      })),
      unlockedNPCs: NPC_LIST.slice(0, 3).map(n => n.id),
      selectedOutfitNPC: null,
      stats: { strength: 1, wisdom: 1, agility: 1, luck: 1 },
      statPoints: 0,
    };
  }

  get state() { return this._state; }
  save() { localStorage.setItem('mason_mini_app', JSON.stringify(this._state)); }

  getItem(id) { return ALL_ITEMS.find(i => i.id === id); }
  getAllItems() { return ALL_ITEMS; }
  getAllNPCs() { return NPC_LIST; }
  getRarities() { return RARITY_LIST; }
  getCategories() { return CATEGORIES; }

  // ─── Tap NPC ───
  tapNPC(npcId) {
    const npcState = this._state.activeNPCs.find(n => n.id === npcId);
    if (!npcState) return null;
    const now = Date.now();
    if (now - npcState.lastTap < 200) return null;
    npcState.lastTap = now;
    npcState.happiness = Math.min(100, npcState.happiness + 2);
    this._state.totalTaps++;
    const baseGold = this._state.tapMultiplier * (1 + Math.floor(npcState.happiness / 20));
    const bonus = this._state.stats.luck * 0.1;
    const gold = Math.floor(baseGold * (1 + bonus));
    const xp = Math.floor(baseGold / 2);
    this._state.gold += gold;
    this.addXP(xp);
    this.save();
    return { gold, xp, happiness: npcState.happiness, npcId };
  }

  // ─── Outfit ───
  equipOutfit(npcId, slot, itemUid) {
    const npcState = this._state.activeNPCs.find(n => n.id === npcId);
    if (!npcState) return false;
    const item = this._state.inventory.find(i => i.uid === itemUid);
    if (!item) return false;
    if (npcState.outfit[slot]) {
      this._state.inventory.push(npcState.outfit[slot]);
    }
    npcState.outfit[slot] = item;
    this._state.inventory = this._state.inventory.filter(i => i.uid !== itemUid);
    this.save();
    return true;
  }

  unequipOutfit(npcId, slot) {
    const npcState = this._state.activeNPCs.find(n => n.id === npcId);
    if (!npcState || !npcState.outfit[slot]) return false;
    if (this._state.inventory.length >= 50) return false;
    this._state.inventory.push(npcState.outfit[slot]);
    npcState.outfit[slot] = null;
    this.save();
    return true;
  }

  // ─── Stats ───
  upgradeStat(stat) {
    if (this._state.statPoints <= 0) return false;
    if (!this._state.stats[stat]) return false;
    if (this._state.stats[stat] >= 100) return false;
    this._state.stats[stat]++;
    this._state.statPoints--;
    this.save();
    return true;
  }

  // ─── Level / XP ───
  addXP(amount) {
    this._state.xp += amount;
    while (this._state.xp >= this._state.xpNeeded) {
      this._state.xp -= this._state.xpNeeded;
      this._state.level++;
      this._state.xpNeeded = Math.floor(this._state.xpNeeded * 1.4);
      this._state.statPoints += 2;
    }
    this.save();
  }

  // ─── Collection ───
  collectItem(id) {
    if (this._state.collection[id] === undefined) return false;
    this._state.collection[id]++;
    this._state.totalCollected++;
    const item = this.getItem(id);
    if (item) {
      const rar = RARITY_LIST.find(r => r.id === item.rarity);
      this.addXP(rar ? rar.bonus : 1);
    }
    this.save();
    return true;
  }

  // ─── Inventory ───
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

  // ─── Merge ───
  canMergeSlot(idx) { return idx >= 0 && idx < 9 && this._state.mergeSlotsUnlocked.includes(idx); }
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
    const used = [];
    for (let i = 0; i < 9; i++) {
      if (this._state.mergeSlots[i]) {
        used.push(this._state.mergeSlots[i].uid);
        this._state.mergeSlots[i] = null;
      }
    }
    const candidates = ALL_ITEMS.filter(i => i.rarity === nextRarity);
    if (!candidates.length) return null;
    const result = candidates[Math.floor(Math.random() * candidates.length)];
    this._state.inventory.push({ ...result, uid: Date.now() + Math.random() });
    this.addXP(RARITY_LIST.find(r => r.id === nextRarity)?.bonus || 5);
    this.save();
    return { result, used, cost };
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

  // ─── Economy ───
  addCurrency(type, amount) {
    if (this._state[type] !== undefined) { this._state[type] += amount; this.save(); return true; }
    return false;
  }
  spendCurrency(type, amount) {
    if ((this._state[type] || 0) >= amount) { this._state[type] -= amount; this.save(); return true; }
    return false;
  }

  // ─── Daily ───
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

  // ─── Quests ───
  startQuest(npcId) {
    if (this._state.questActive) return false;
    this._state.questActive = true;
    this._state.questEnd = Date.now() + QUEST_DURATION;
    this._state.questNPC = npcId;
    this.save();
    return true;
  }
  tickQuest() {
    if (!this._state.questActive) return false;
    if (Date.now() >= this._state.questEnd) {
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
    return Math.min(1, (Date.now() - (this._state.questEnd - QUEST_DURATION)) / QUEST_DURATION);
  }

  // ─── Tutorial ───
  advanceTutorial() {
    if (this._state.tutorialStep < INITIAL_TUTORIAL.length - 1) this._state.tutorialStep++;
    else this._state.tutorialDone = true;
    this.save();
  }
  completeTutorial() { this._state.tutorialDone = true; this.save(); }

  // ─── NPC unlock ───
  unlockNPC(npcId) {
    if (this._state.unlockedNPCs.includes(npcId)) return false;
    if (this._state.knowledge < 50) return false;
    this._state.knowledge -= 50;
    this._state.unlockedNPCs.push(npcId);
    this.save();
    return true;
  }
}

export const store = new Store();
window.store = store;
