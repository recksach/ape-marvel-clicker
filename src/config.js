export const TG_BOT = 'Illuminatemasonbot';
export const SUPPORT_URL = 'https://t.me/Superadminist';

export const RARITIES = [
  { id: 'common', name: 'Common', nameRu: 'Обычный', color: '#8b7355', bonus: 1 },
  { id: 'uncommon', name: 'Uncommon', nameRu: 'Необычный', color: '#10b981', bonus: 2 },
  { id: 'rare', name: 'Rare', nameRu: 'Редкий', color: '#3b82f6', bonus: 3 },
  { id: 'epic', name: 'Epic', nameRu: 'Эпический', color: '#a855f7', bonus: 5 },
  { id: 'legendary', name: 'Legendary', nameRu: 'Легендарный', color: '#f7c948', bonus: 10 },
];

export const CATEGORIES = [
  { id: 'weapons', name: 'Weapons', nameRu: 'Оружие', icon: '⚔' },
  { id: 'armor', name: 'Armor', nameRu: 'Броня', icon: '🛡' },
  { id: 'artifacts', name: 'Artifacts', nameRu: 'Артефакты', icon: '△' },
  { id: 'potions', name: 'Potions', nameRu: 'Зелья', icon: '⚗' },
  { id: 'scrolls', name: 'Scrolls', nameRu: 'Свитки', icon: '📜' },
  { id: 'rings', name: 'Rings', nameRu: 'Кольца', icon: '◇' },
  { id: 'crystals', name: 'Crystals', nameRu: 'Кристаллы', icon: '⬡' },
  { id: 'relics', name: 'Relics', nameRu: 'Реликвии', icon: '◎' },
];

const ITEM_NAMES = {
  weapons: {
    en: ['Iron Sword','Steel Blade','Shadow Dagger','Phoenix Blade','Void Axe','Dragon Spear','Rune Staff','Crystal Wand','Obsidian Katana','Emerald Halberd','Golden Mace','Moon sickle','Star Bow','Sun Hammer','Chaos Flail','Rune Sword','Ancient Spear','Divine Blade','Mythic Edge','Eternal Sword'],
    ru: ['Железный Меч','Стальной Клинок','Тенный Кинжал','Клинок Феникса','Топор Бездны','Копьё Дракона','Рунический Посох','Кристальная Палочка','Обсидиановая Катана','Изумрудная Альбарда','Золотая Дубина','Лунный Серп','Звёздный Лук','Молот Солнца','Флэйг Хаоса','Рунический Меч','Древнее Копьё','Божественный Клинок','Мифический Остроконечник','Вечный Меч']
  },
  armor: {
    en: ['Leather Vest','Chain Mail','Shadow Robe','Phoenix Plate','Void Guard','Dragon Scale','Rune Plate','Crystal Armor','Obsidian Mail','Emerald Shield','Golden Helm','Moon Cloak','Star Vest','Sun Armor','Chaos Plate','Rune Vest','Ancient Mail','Divine Plate','Mythic Guard','Eternal Plate'],
    ru: ['Кожаный Жилет','Кольчуга','Тенный Одеянье','Пластина Феникса','Страж Бездны','Чешуя Дракона','Руническая Пластина','Кристальная Броня','Обсидиановая Кольчуга','Изумрудный Щит','Золотой Шлем','Лунный Плащ','Звёздный Жилет','Солнечная Броня','Пластина Хаоса','Рунический Жилет','Древняя Кольчуга','Божественная Пластина','Мифическая Стража','Вечная Пластина']
  },
  artifacts: {
    en: ['Eye of Providence','Emerald Ankh','Golden Pyramid','Crystal Skull','Void Prism','Divine Sundial','Shadow Lantern','Ancient Seal','Rune Tablet','Masonic Compass','Dragon Scale','Phoenix Feather','Moon Dial','Star Chart','Chaos Shard','Rune Stone','Eternal Vellum','Mythic Idol','Divine Lens','Secret Codex'],
    ru: ['Глаз Провидения','Изумрудный Анх','Золотая Пирамида','Хрустальный Череп','Призма Бездны','Божественные Часы','Теневой Фонарь','Древняя Печать','Руническая Табличка','Масонский Циркуль','Чешуя Дракона','Перо Феникса','Лунный Циферблат','Звёздная Карта','Осколок Хаоса','Рунический Камень','Вечный Пергамент','Мифический Идол','Божественная Линза','Тайный Кодекс']
  },
  potions: {
    en: ['Healing Brew','Mana Elixir','Shadow Tincture','Phoenix Tear','Void Extract','Dragon Breath','Rune Oil','Crystal Serum','Obsidian Draught','Emerald Nectar','Golden Mead','Moon Water','Sun Drop','Chaos Brew','Rune Potion','Ancient Vitality','Divine Ambrosia','Mythic Tonic','Eternal Elixir','Secret Formula'],
    ru: ['Зелье Исцеления','Эликсир Маны','Тенная Настойка','Слеза Феникса','Экстракт Бездны','Дыхание Дракона','Руническое Масло','Кристальная Сыворотка','Обсидиановый Напиток','Изумрудный Нектар','Золотой Мед','Лунная Вода','Солнечная Капля','Зелье Хаоса','Руническое Зелье','Древняя Жизненная Сила','Божественная Амброзия','Мифический Тоник','Вечный Эликсир','Секретная Формула']
  },
  scrolls: {
    en: ['Scroll of Fire','Scroll of Ice','Shadow Tome','Phoenix Script','Void Rune','Dragon Lore','Rune Folio','Crystal Lexicon','Obsidian Codex','Emerald Manuscript','Golden Scroll','Moon Lore','Star Scripture','Chaos Script','Rune Tome','Ancient Scroll','Divine Scripture','Mythic Codex','Eternal Book','Secret Page'],
    ru: ['Свиток Огня','Свиток Льда','Тенный Том','Писание Феникса','Руна Бездны','Знание Дракона','Руническое Фолио','Кристальный Лексикон','Обсидиановый Кодекс','Изумрудная Рукопись','Золотой Свиток','Лунное Знание','Звёздное Писание','Скрипт Хаоса','Рунический Том','Древний Свиток','Божественное Писание','Мифический Кодекс','Вечная Книга','Тайная Страница']
  },
  rings: {
    en: ['Silver Ring','Gold Band','Shadow Signet','Phoenix Loop','Void Circle','Dragon Ring','Rune Band','Crystal Ring','Obsidian Loop','Emerald Ring','Golden Seal','Moon Circle','Star Ring','Chaos Band','Rune Signet','Ancient Ring','Divine Band','Mythic Ring','Eternal Loop','Secret Signet'],
    ru: ['Серебряное Кольцо','Золотая Повязка','Теневой Перстень','Петля Феникса','Круг Бездны','Кольцо Дракона','Руническая Повязка','Кристальное Кольцо','Обсидиановая Петля','Изумрудное Кольцо','Золотая Печать','Лунный Круг','Звёздное Кольцо','Повязка Хаоса','Рунический Перстень','Древнее Кольцо','Божественная Повязка','Мифическое Кольцо','Вечная Петля','Тайный Перстень']
  },
  crystals: {
    en: ['Emerald Shard','Golden Crystal','Black Diamond','Sapphire Gem','Ruby Heart','Amethyst Cluster','Topaz Prism','Onyx Stone','Crystal Core','Void Crystal','Divine Gem','Shadow Crystal','Rune Stone','Star Fragment','Moon Crystal','Sun Gem','Dragon Eye','Phoenix Stone','Eternal Ice','Chaos Shard'],
    ru: ['Осколок Изумруда','Золотой Кристалл','Чёрный Алмаз','Сапфировая Глыба','Рубиновое Сердце','Гроздь Аметиста','Топазная Призма','Ониксовый Камень','Кристальное Ядро','Кристалл Бездны','Божественный Самоцвет','Теневой Кристалл','Рунический Камень','Осколок Звезды','Лунный Кристалл','Солнечный Самоцвет','Драконий Глаз','Камень Феникса','Вечный Лёд','Осколок Хаоса']
  },
  relics: {
    en: ['Ancient Idol','Mason Trophy','Temple Relic','Void Figurine','Divine Statue','Shadow Effigy','Royal Bust','Dragon Miniature','Phoenix Replica','Star Globe','Moon Statue','Sun Idol','Eternal Shrine','Rune Totem','Crystal Orb','Obsidian Idol','Emerald Globe','Golden Pyramid','Chaos Effigy','Secret Relic'],
    ru: ['Древний Идол','Трофей Масона','Храмовая Реликвия','Фигурка Бездны','Божественная Статуя','Теневой Истукан','Королевский Бюст','Миниатюра Дракона','Копия Феникса','Звёздный Глобус','Лунная Статуя','Солнечный Идол','Вечное Святилище','Рунический Тотем','Хрустальная Сфера','Обсидиановый Идол','Изумрудный Глобус','Золотая Пирамида','Истукан Хаоса','Тайная Реликвия']
  },
};

export const MERGE_COST = { common: 50, uncommon: 100, rare: 200, epic: 500, legendary: 1000 };
export const MERGE_MATRIX = { common: 'uncommon', uncommon: 'rare', rare: 'epic', epic: 'legendary', legendary: null };

let _id = 0;
export function generateItems() {
  const items = [];
  for (const cat of CATEGORIES) {
    for (let ri = 0; ri < RARITIES.length; ri++) {
      const rarity = RARITIES[ri];
      const count = Math.max(2, 8 - ri);
      for (let i = 0; i < count; i++) {
        const names = ITEM_NAMES[cat.id];
        const idx = (ri * 2 + i) % names.en.length;
        items.push({
          id: _id++,
          category: cat.id,
          rarity: rarity.id,
          name: names.en[idx],
          nameRu: names.ru[idx],
          value: (ri + 1) * 10,
        });
      }
    }
  }
  return items;
}

export const INITIAL_TUTORIAL = [
  'tut_welcome',
  'tut_tap',
  'tut_merge',
  'tut_collect',
  'tut_done',
];
