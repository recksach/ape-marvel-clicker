export const TG_BOT = 'Illuminatemasonbot';
export const SUPPORT_URL = 'https://t.me/Superadminist';

export const RARITIES = [
  { id: 'common', name: 'Common', nameRu: 'Обычный', color: '#8b7355', bonus: 1, frame: 'frame_common' },
  { id: 'uncommon', name: 'Uncommon', nameRu: 'Необычный', color: '#10b981', bonus: 2, frame: 'frame_uncommon' },
  { id: 'rare', name: 'Rare', nameRu: 'Редкий', color: '#3b82f6', bonus: 3, frame: 'frame_rare' },
  { id: 'epic', name: 'Epic', nameRu: 'Эпический', color: '#a855f7', bonus: 5, frame: 'frame_epic' },
  { id: 'legendary', name: 'Legendary', nameRu: 'Легендарный', color: '#f7c948', bonus: 10, frame: 'frame_legendary' },
  { id: 'mythic', name: 'Mythic', nameRu: 'Мифический', color: '#ef4444', bonus: 20, frame: 'frame_mythic' },
  { id: 'ancient', name: 'Ancient', nameRu: 'Древний', color: '#8b7355', bonus: 30, frame: 'frame_ancient' },
  { id: 'divine', name: 'Divine', nameRu: 'Божественный', color: '#e0dcc0', bonus: 50, frame: 'frame_divine' },
  { id: 'secret', name: 'Secret', nameRu: 'Секретный', color: '#10b981', bonus: 100, frame: 'frame_secret' },
];

export const ITEM_CATEGORIES = [
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

// Generate 135+ items across categories and rarities
const ITEM_NAMES = {
  books: { en: ['Forbidden Grimoire','Emerald Codex','Golden Scroll','Obsidian Tome','Rune Folio','Ancient Manuscript','Crystal Lexicon','Shadow Chronicle','Divine Scripture','Void Record','Temple Archives','Mason Diary','Illuminated Page','Secret Treatise','Mythos Collection','Arcane Primer','Astral Codex','Eternal Vellum','Ritual Script','Thousand Leaves'], ru: ['Запретный Гримуар','Изумрудный Кодекс','Золотой Свиток','Обсидиановый Том','Руническое Фолио','Древняя Рукопись','Кристальный Лексикон','Теневая Хроника','Божественное Писание','Запись Бездны','Храмовые Архивы','Дневник Маcона','Иллюминированная Страница','Секретный Трактат','Коллекция Мифов','Арканный Букварь','Астральный Кодекс','Вечный Пергамент','Ритуальный Сценарий','Тысяча Листьев'] },
  elixirs: { en: ['Emerald Tincture','Golden Nectar','Crystal Solvent','Black Philosopher','Vitality Draught','Mana Infusion','Alkahest','Lapis Elixir','Aether Essence','Phoenix Tear','Dragon Breath','Moonwater','Sun Drop','Void Extract','Chaos Brew','Starlight Potion','Shadow Essence','Divine Ambrosia','Rune Oil','Crimson Flask'], ru: ['Изумрудная Настойка','Золотой Нектар','Кристальный Растворитель','Чёрный Философ','Эликсир Жизни','Вливание Маны','Алкагест','Лазурный Эликсир','Эссенция Эфира','Слеза Феникса','Драконье Дыхание','Лунная Вода','Солнечная Капля','Экстракт Бездны','Зелье Хаоса','Звёздное Зелье','Теневая Эссенция','Божественная Амброзия','Руническое Масло','Багровая Колба'] },
  coins: { en: ['Bronze Mark','Silver Shekel','Gold Talent','Emerald Drachma','Black Stater','Crystal Denarius','Obsidian Sestertius','Imperial Solidus','Mason Sovereign','Temple Aureus','Ancient Obol','Royal Ducat','Shadow Gulden','Divine Florin','Secret Bezant','Dragon Dinar','Phoenix Penny','Rune Crown','Void Ducat','Star Tael'], ru: ['Бронзовая Марка','Серебряный Шекель','Золотой Талант','Изумрудная Драхма','Чёрный Статер','Кристальный Денарий','Обсидиановый Сестерций','Имперский Солид','Масонский Суверен','Храмовый Аурей','Древний Обол','Королевский Дукат','Теневой Гульден','Божественный Флорин','Секретный Безант','Драконий Динар','Пенни Феникса','Руническая Корона','Дукат Бездны','Звёздный Таэль'] },
  artifacts: { en: ['Eye of Providence','Emerald Ankh','Golden Pyramid','Obsidian Obelisk','Crystal Skull','Rune Tablet','Masonic Compass','Ancient Seal','Void Prism','Divine Sundial','Chronometer','Shadow Lantern','Temple Key','Philosopher Stone','Aether Lens','Dragon Scale','Phoenix Feather','Moon Dial','Star Chart','Void Compass'], ru: ['Глас Провидения','Изумрудный Анх','Золотая Пирамида','Обсидиановый Обелиск','Хрустальный Череп','Руническая Табличка','Масонский Циркуль','Древняя Печать','Призма Бездны','Божественные Часы','Хронометр','Теневой Фонарь','Храмовый Ключ','Философский Камень','Линза Эфира','Драконья Чешуя','Перо Феникса','Лунный Циферблат','Звёздная Карта','Компас Бездны'] },
  seals: { en: ['Wax Seal of Order','Emerald Signet','Golden Stamp','Black Imprint','Crystal Seal','Rune Brand','Mason Emblem','Temple Mark','Ancient Crest','Void Sigil','Divine Brand','Shadow Seal','Royal Stamp','Secret Sign','Dragon Brand','Phoenix Crest','Star Sigil','Moon Brand','Sun Stamp','Eternal Seal'], ru: ['Печать Порядка','Изумрудный Перстень','Золотая Марка','Чёрный Оттиск','Хрустальная Печать','Руническое Клеймо','Эмблема Масона','Храмовая Метка','Древний Герб','Сигилла Бездны','Божественное Клеймо','Теневая Печать','Королевская Марка','Тайный Знак','Драконье Клеймо','Герб Феникса','Звёздная Сигилла','Лунная Марка','Солнечная Печать','Вечная Печать'] },
  amulets: { en: ['Bronze Pendant','Silver Charm','Gold Talisman','Emerald Amulet','Obsidian Necklace','Crystal Pendant','Rune Charm','Mason Brooch','Temple Amulet','Ancient Talisman','Void Pendant','Divine Charm','Shadow Necklace','Royal Amulet','Secret Talisman','Dragon Amulet','Phoenix Pendant','Star Charm','Moon Talisman','Sun Pendant'], ru: ['Бронзовая Подвеска','Серебряный Оберег','Золотой Талисман','Изумрудный Амулет','Обсидиановое Ожерелье','Кристальная Подвеска','Рунический Оберег','Брошь Масона','Храмовой Амулет','Древний Талисман','Подвеска Бездны','Божественный Оберег','Теневое Ожерелье','Королевский Амулет','Тайный Талисман','Амулет Дракона','Подвеска Феникса','Звёздный Оберег','Лунный Талисман','Солнечная Подвеска'] },
  crystals: { en: ['Emerald Shard','Golden Crystal','Black Diamond','Sapphire Gem','Ruby Heart','Amethyst Cluster','Topaz Prism','Onyx Stone','Crystal Core','Void Crystal','Divine Gem','Shadow Crystal','Rune Stone','Star Fragment','Moon Crystal','Sun Gem','Dragon Eye','Phoenix Stone','Eternal Ice','Chaos Shard'], ru: ['Осколок Изумруда','Золотой Кристалл','Чёрный Алмаз','Сапфировая Глыба','Рубиновое Сердце','Гроздь Аметиста','Топазная Призма','Ониксовый Камень','Кристальное Ядро','Кристалл Бездны','Божественный Самоцвет','Теневой Кристалл','Рунический Камень','Осколок Звезды','Лунный Кристалл','Солнечный Самоцвет','Драконий Глаз','Камень Феникса','Вечный Лёд','Осколок Хаоса'] },
  masks: { en: ['Ceremonial Mask','Emerald Visage','Golden Face','Black Veil','Crystal Mask','Rune Visor','Obsidian Face','Mason Hood','Temple Visage','Ancient Mask','Void Face','Divine Veil','Shadow Mask','Royal Visage','Secret Mask','Dragon Face','Phoenix Veil','Star Mask','Moon Visor','Sun Face'], ru: ['Церемониальная Маска','Изумрудный Лик','Золотое Лицо','Чёрная Вуаль','Хрустальная Маска','Руническое Забрало','Обсидиановый Лик','Капюшон Масона','Храмовой Лик','Древняя Маска','Лик Бездны','Божественная Вуаль','Теневая Маска','Королевский Лик','Секретная Маска','Драконий Лик','Вуаль Феникса','Звёздная Маска','Лунное Забрало','Солнечный Лик'] },
  collectibles: { en: ['Miniature Temple','Emerald Globe','Golden Pyramid','Obsidian Idol','Crystal Orb','Rune Totem','Mason Trophy','Temple Relic','Ancient Doll','Void Figurine','Divine Statue','Shadow Effigy','Royal Bust','Secret Idol','Dragon Miniature','Phoenix Replica','Star Globe','Moon Statue','Sun Idol','Eternal Shrine'], ru: ['Миниатюрный Храм','Изумрудный Глобус','Золотая Пирамида','Обсидиановый Идол','Хрустальная Сфера','Рунический ТотеМ','Трофей Масона','Храмовая Реликвия','Древняя Кукла','Фигурка Бездны','Божественная Статуя','Теневой Истукан','Королевский Бюст','Тайный Идол','Миниатюра Дракона','Копия Феникса','Звёздный Глобус','Лунная Статуя','Солнечный Идол','Вечное Святилище'] },
};

let _id = 0;
export function generateItems() {
  const items = [];
  for (const cat of ITEM_CATEGORIES) {
    for (let ri = 0; ri < RARITIES.length; ri++) {
      const rarity = RARITIES[ri];
      const count = Math.max(3, 20 - ri * 2);
      for (let i = 0; i < count; i++) {
        const names = ITEM_NAMES[cat.id];
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

// NPCs
export const NPCS = [
  { id: 'librarian', name: 'Librarian', nameRu: 'Библиотекарь', role: 'books', dialogKey: 'npc_librarian', color: '#8b7355' },
  { id: 'alchemist', name: 'Master Alchemist', nameRu: 'Мастер Алхимик', role: 'elixirs', dialogKey: 'npc_alchemist', color: '#10b981' },
  { id: 'merchant', name: 'Temple Merchant', nameRu: 'Храмовой Торговец', role: 'general', dialogKey: 'npc_merchant', color: '#f7c948' },
  { id: 'banker', name: 'Coin Banker', nameRu: 'Монетный Банкир', role: 'coins', dialogKey: 'npc_banker', color: '#f7c948' },
  { id: 'blacksmith', name: 'Arcane Blacksmith', nameRu: 'Мистический Кузнец', role: 'artifacts', dialogKey: 'npc_blacksmith', color: '#06b6d4' },
  { id: 'archivist', name: 'Chief Archivist', nameRu: 'Главный Архивариус', role: 'collectibles', dialogKey: 'npc_archivist', color: '#8b7355' },
  { id: 'oracle', name: 'The Oracle', nameRu: 'Оракул', role: 'seals', dialogKey: 'npc_oracle', color: '#10b981' },
  { id: 'guard', name: 'Temple Guard', nameRu: 'Храмовой Страж', role: 'quest', dialogKey: 'npc_guard', color: '#f7c948' },
  { id: 'grandmaster', name: 'Grand Master', nameRu: 'Великий Мастер', role: 'master', dialogKey: 'npc_grandmaster', color: '#f7c948' },
  { id: 'collector', name: 'Secret Collector', nameRu: 'Тайный Коллекционер', role: 'crystals', dialogKey: 'npc_collector', color: '#a855f7' },
  { id: 'engraver', name: 'Rune Engraver', nameRu: 'Рунический Гравёр', role: 'amulets', dialogKey: 'npc_engraver', color: '#06b6d4' },
  { id: 'miner', name: 'Crystal Miner', nameRu: 'Кристальный Шахтёр', role: 'crystals', dialogKey: 'npc_miner', color: '#10b981' },
  { id: 'dealer', name: 'Potion Dealer', nameRu: 'Торговец Зельями', role: 'elixirs', dialogKey: 'npc_dealer', color: '#f7c948' },
  { id: 'keeper', name: 'Treasure Keeper', nameRu: 'Хранитель Сокровищ', role: 'vault', dialogKey: 'npc_keeper', color: '#f7c948' },
  { id: 'monk', name: 'Shadow Monk', nameRu: 'Теневой Монах', role: 'masks', dialogKey: 'npc_monk', color: '#10b981' },
];

// Locations
export const LOCATIONS = [
  { id: 'temple', name: 'The Great Temple', nameRu: 'Великий Храм', nav: true },
  { id: 'library', name: 'Secret Library', nameRu: 'Тайная Библиотека', nav: true },
  { id: 'alchemy', name: 'Alchemy Lab', nameRu: 'Алхимическая Лаборатория', nav: true },
  { id: 'vault', name: 'The Vault', nameRu: 'Хранилище', nav: true },
  { id: 'hall', name: 'Hall of Masters', nameRu: 'Зал Мастеров', nav: false },
  { id: 'market', name: 'Black Market', nameRu: 'Чёрный Рынок', nav: true },
  { id: 'initiation', name: 'Initiation Room', nameRu: 'Зал Посвящения', nav: false },
  { id: 'observatory', name: 'Observatory', nameRu: 'Обсерватория', nav: false },
  { id: 'archive', name: 'Underground Archive', nameRu: 'Подземный Архив', nav: false },
  { id: 'garden', name: 'Temple Garden', nameRu: 'Храмовой Сад', nav: false },
];

// Merge recipe costs
export const MERGE_COST = {
  common: 10, uncommon: 25, rare: 50, epic: 100,
  legendary: 250, mythic: 500, ancient: 1000, divine: 2500, secret: 5000,
};

export const MERGE_MATRIX = {
  common: 'uncommon', uncommon: 'rare', rare: 'epic', epic: 'legendary',
  legendary: 'mythic', mythic: 'ancient', ancient: 'divine', divine: 'secret', secret: null,
};

export const QUEST_DURATION = 60000; // 60s base
export const QUEST_REWARD_BASE = 10;

export const INITIAL_TUTORIAL = [
  'tut_welcome',
  'tut_location',
  'tut_collect',
  'tut_npc',
  'tut_merge',
  'tut_done',
];
