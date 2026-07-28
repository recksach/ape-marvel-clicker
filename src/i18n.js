const LANGS = {
  en: {
    // General
    appName: 'Mason Mini App',
    loading: 'INITIALIZING...',
    // Nav
    nav_temple: 'Temple',
    nav_library: 'Library',
    nav_alchemy: 'Alchemy',
    nav_vault: 'Vault',
    nav_market: 'Market',
    nav_collection: 'Collection',
    nav_merge: 'Merge',
    nav_profile: 'Profile',
    // Currencies
    knowledge: 'Knowledge',
    gold: 'Gold',
    crystals: 'Crystals',
    energy: 'Energy',
    reputation: 'Reputation',
    keys: 'Keys',
    // Collection
    collection_title: 'Collection',
    collection_sub: 'Collect all artifacts of the secret order',
    total: 'Total',
    unique: 'Unique',
    progress: 'Progress',
    category: 'Category',
    rarity: 'Rarity',
    owned: 'Owned',
    locked: 'Locked',
    // Merge
    merge_title: 'Alchemy Lab',
    merge_sub: 'Combine 2+ items of same rarity to upgrade them',
    merge_btn: 'Merge',
    merge_cost: 'Cost',
    merge_no_gold: 'Not enough gold',
    merge_max: 'Already at max rarity',
    merge_success: 'Created',
    merge_select: 'Place items from inventory',
    merge_empty: 'No items in merge slots',
    merge_unlock: 'Unlock slot',
    // Inventory
    inventory_title: 'Inventory',
    inventory_empty: 'Empty. Collect items from quests and NPCs.',
    // NPC
    npc_title: 'Sages of the Order',
    npc_talk: 'Speak',
    npc_quest: 'Quest',
    npc_collect: 'Collect',
    // Quest
    quest_start: 'Start Quest',
    quest_progress: 'Quest in progress...',
    quest_complete: 'Complete!',
    quest_reward: 'Reward',
    quest_time: 'Time',
    // Tutorial
    tut_welcome: 'Welcome, initiate. I am the Grand Master of the Masonic Order. You have been chosen.',
    tut_location: 'This is the Great Temple — your headquarters. Navigate to different halls using the bottom bar.',
    tut_collect: 'Collect all 135+ artifacts across 9 categories and 9 rarities to become a true Master.',
    tut_npc: 'Speak with the NPCs in each hall. They offer quests and rewards.',
    tut_merge: 'In the Alchemy Lab, merge 2+ identical-rarity items to create higher-tier artifacts.',
    tut_done: 'Your collection journey begins. The Order watches over you.',
    tut_next: 'Next',
    tut_skip: 'Skip',
    // Daily
    daily_title: 'Daily Reward',
    daily_claim: 'Claim',
    daily_streak: 'Streak',
    daily_gold: 'Gold',
    daily_crystals: 'Crystals',
    // Misc
    level: 'Level',
    xp: 'XP',
    quests_completed: 'Quests',
    tap: 'Tap',
    coming_soon: 'Coming Soon',
    // NPC Dialogs
    npc_librarian: 'Knowledge is power. Bring me ancient books and I shall reward you.',
    npc_alchemist: 'The secret of transmutation is known only to us. Bring elixirs.',
    npc_merchant: 'I trade in rare goods. Gold opens many doors, initiate.',
    npc_banker: 'Coin brings coin. The treasury grows when the Order prospers.',
    npc_blacksmith: 'I forge artifacts of immense power. Bring me rare materials.',
    npc_archivist: 'Every artifact tells a story. Complete your collection.',
    npc_oracle: 'I see the path ahead. The seals must be gathered.',
    npc_guard: 'The temple must be protected. Prove your worth through quests.',
    npc_grandmaster: 'You have come far. Complete your collection to unlock the final secrets.',
    npc_collector: 'I seek crystals of pure energy. Bring them to me.',
    npc_engraver: 'Runes hold the language of creation. Help me decode them.',
    npc_miner: 'Deep beneath the temple, crystals grow. I need more.',
    npc_dealer: 'Potions for every purpose. Brew, drink, collect.',
    npc_keeper: 'The vault holds treasures beyond imagination. Earn my trust.',
    npc_monk: 'Silence and masks — the path of shadows. Collect them all.',
  },
  ru: {
    // General
    appName: 'Mason Mini App',
    loading: 'ИНИЦИАЛИЗАЦИЯ...',
    // Nav
    nav_temple: 'Храм',
    nav_library: 'Библиотека',
    nav_alchemy: 'Алхимия',
    nav_vault: 'Хранилище',
    nav_market: 'Рынок',
    nav_collection: 'Коллекция',
    nav_merge: 'Слияние',
    nav_profile: 'Профиль',
    // Currencies
    knowledge: 'Знания',
    gold: 'Золото',
    crystals: 'Кристаллы',
    energy: 'Энергия',
    reputation: 'Репутация',
    keys: 'Ключи',
    // Collection
    collection_title: 'Коллекция',
    collection_sub: 'Собери все артефакты тайного ордена',
    total: 'Всего',
    unique: 'Уникальных',
    progress: 'Прогресс',
    category: 'Категория',
    rarity: 'Редкость',
    owned: 'Есть',
    locked: 'Заблокировано',
    // Merge
    merge_title: 'Алхимическая Лаборатория',
    merge_sub: 'Объедини 2+ предмета одинаковой редкости для улучшения',
    merge_btn: 'Объединить',
    merge_cost: 'Цена',
    merge_no_gold: 'Недостаточно золота',
    merge_max: 'Максимальная редкость',
    merge_success: 'Создано',
    merge_select: 'Размести предметы из инвентаря',
    merge_empty: 'Нет предметов в слотах слияния',
    merge_unlock: 'Открыть слот',
    // Inventory
    inventory_title: 'Инвентарь',
    inventory_empty: 'Пусто. Собирай предметы из квестов и NPC.',
    // NPC
    npc_title: 'Мудрецы Ордена',
    npc_talk: 'Говорить',
    npc_quest: 'Квест',
    npc_collect: 'Собрать',
    // Quest
    quest_start: 'Начать Квест',
    quest_progress: 'Квест выполняется...',
    quest_complete: 'Завершён!',
    quest_reward: 'Награда',
    quest_time: 'Время',
    // Tutorial
    tut_welcome: 'Добро пожаловать, посвящённый. Я — Великий Мастер Масонского Ордена. Ты избран.',
    tut_location: 'Это Великий Храм — твоя штаб-квартира. Перемещайся между залами через нижнюю панель.',
    tut_collect: 'Собери все 135+ артефактов из 9 категорий и 9 редкостей, чтобы стать истинным Мастером.',
    tut_npc: 'Общайся с NPC в каждом зале. Они дают квесты и награды.',
    tut_merge: 'В Алхимической Лаборатории объединяй 2+ предмета одинаковой редкости для создания высших артефактов.',
    tut_done: 'Твой путь коллекционера начинается. Орден наблюдает за тобой.',
    tut_next: 'Далее',
    tut_skip: 'Пропустить',
    // Daily
    daily_title: 'Ежедневная Награда',
    daily_claim: 'Получить',
    daily_streak: 'Серия',
    daily_gold: 'Золото',
    daily_crystals: 'Кристаллы',
    // Misc
    level: 'Уровень',
    xp: 'Опыт',
    quests_completed: 'Квесты',
    tap: 'Тап',
    coming_soon: 'Скоро',
    // NPC Dialogs
    npc_librarian: 'Знания — сила. Приноси мне древние книги, и я вознагражу тебя.',
    npc_alchemist: 'Секрет трансмутации известен только нам. Приноси эликсиры.',
    npc_merchant: 'Я торгую редкими товарами. Золото открывает многие двери, посвящённый.',
    npc_banker: 'Монета к монете. Казна растёт, когда Орден процветает.',
    npc_blacksmith: 'Я создаю артефакты огромной силы. Приноси мне редкие материалы.',
    npc_archivist: 'Каждый артефакт хранит историю. Заверши свою коллекцию.',
    npc_oracle: 'Я вижу путь впереди. Печати должны быть собраны.',
    npc_guard: 'Храм нужно защищать. Докажи свою ценность через квесты.',
    npc_grandmaster: 'Ты далеко продвинулся. Заверши коллекцию, чтобы открыть финальные секреты.',
    npc_collector: 'Я ищу кристаллы чистой энергии. Принеси их мне.',
    npc_engraver: 'Руны содержат язык творения. Помоги мне расшифровать их.',
    npc_miner: 'Глубоко под храмом растут кристаллы. Мне нужно больше.',
    npc_dealer: 'Зелья для любых целей. Вари, пей, собирай.',
    npc_keeper: 'Хранилище хранит сокровища за гранью воображения. Заслужи моё доверие.',
    npc_monk: 'Тишина и маски — путь теней. Собери их все.',
  },
};

let currentLang = 'en';

export function setLang(l) {
  if (LANGS[l]) currentLang = l;
  localStorage.setItem('mason_lang', currentLang);
}

export function getLang() { return currentLang; }

export function initLang() {
  const saved = localStorage.getItem('mason_lang');
  if (saved && LANGS[saved]) currentLang = saved;
  else if ((navigator.language || '').startsWith('ru')) currentLang = 'ru';
}

export function t(key) {
  return LANGS[currentLang][key] || LANGS.en[key] || key;
}
