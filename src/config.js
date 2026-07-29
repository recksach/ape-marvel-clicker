export const TG_BOT = 'Illuminatemasonbot';
export const SUPPORT_URL = 'https://t.me/Superadminist';

export const RARITIES = [
  { id: 'common', name: 'Common', nameRu: 'Обычный', color: '#8b8b8b', bonus: 1 },
  { id: 'uncommon', name: 'Uncommon', nameRu: 'Необычный', color: '#10b981', bonus: 2 },
  { id: 'rare', name: 'Rare', nameRu: 'Редкий', color: '#3b82f6', bonus: 3 },
  { id: 'epic', name: 'Epic', nameRu: 'Эпический', color: '#f7c948', bonus: 5 },
  { id: 'legendary', name: 'Legendary', nameRu: 'Легендарный', color: '#f59e0b', bonus: 10 },
  { id: 'mythic', name: 'Mythic', nameRu: 'Мифический', color: '#3b82f6', bonus: 20 },
  { id: 'ancient', name: 'Ancient', nameRu: 'Древний', color: '#10b981', bonus: 50 },
  { id: 'divine', name: 'Divine', nameRu: 'Божественный', color: '#ef4444', bonus: 100 },
  { id: 'secret', name: 'Secret', nameRu: 'Секретный', color: '#e0dcc0', bonus: 250 },
  { id: 'cosmic', name: 'Cosmic', nameRu: 'Космический', color: '#a855f7', bonus: 500 },
];

export const CATEGORIES = [
  { id: 'bananas', name: 'Bananas', nameRu: 'Бананы', icon: '🍌' },
  { id: 'dumbbells', name: 'Dumbbells', nameRu: 'Гантели', icon: '🏋' },
];

// Items matching EXACTLY what's in the screenshots
export const ITEMS = [
  // Bananas (3 tiers)
  { id: 0, name: 'Banana Bunch', nameRu: 'Гроздь бананов', category: 'bananas', rarity: 'common', value: 1, image: './src/assets/banana-common.png' },
  { id: 1, name: 'Silver Bananas', nameRu: 'Серебряные бананы', category: 'bananas', rarity: 'uncommon', value: 3, image: './src/assets/banana-uncommon.png' },
  { id: 2, name: 'Banana Barrel', nameRu: 'Бочка бананов', category: 'bananas', rarity: 'rare', value: 10, image: './src/assets/banana-rare.png' },

  // Dumbbells (10 tiers matching screenshots exactly)
  { id: 3, name: 'Iron Dumbbell', nameRu: 'Железная гантель', category: 'dumbbells', rarity: 'common', value: 1, image: './src/assets/dumbbell-common.png' },
  { id: 4, name: 'Steel Dumbbell', nameRu: 'Стальная гантель', category: 'dumbbells', rarity: 'uncommon', value: 3, image: './src/assets/dumbbell-uncommon.png' },
  { id: 5, name: 'Engraved Dumbbell', nameRu: 'Гравированная гантель', category: 'dumbbells', rarity: 'rare', value: 8, image: './src/assets/dumbbell-rare.png' },
  { id: 6, name: 'Gold Dumbbell', nameRu: 'Золотая гантель', category: 'dumbbells', rarity: 'epic', value: 20, image: './src/assets/dumbbell-epic.png' },
  { id: 7, name: 'Royal Dumbbell', nameRu: 'Королевская гантель', category: 'dumbbells', rarity: 'legendary', value: 50, image: './src/assets/dumbbell-legendary.png' },
  { id: 8, name: 'Sapphire Dumbbell', nameRu: 'Сапфировая гантель', category: 'dumbbells', rarity: 'mythic', value: 120, image: './src/assets/dumbbell-mythic.png' },
  { id: 9, name: 'Emerald Dumbbell', nameRu: 'Изумрудная гантель', category: 'dumbbells', rarity: 'ancient', value: 300, image: './src/assets/dumbbell-ancient.png' },
  { id: 10, name: 'Ruby Dumbbell', nameRu: 'Рубиновая гантель', category: 'dumbbells', rarity: 'divine', value: 750, image: './src/assets/dumbbell-divine.png' },
  { id: 11, name: 'Crystal Dumbbell', nameRu: 'Хрустальная гантель', category: 'dumbbells', rarity: 'secret', value: 2000, image: './src/assets/dumbbell-secret.png' },
  { id: 12, name: 'Cosmic Dumbbell', nameRu: 'Космическая гантель', category: 'dumbbells', rarity: 'cosmic', value: 5000, image: './src/assets/dumbbell-cosmic.png' },
];

export const MERGE_COST = {
  common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 250,
  mythic: 500, ancient: 1000, divine: 2500, secret: 5000, cosmic: 0,
};

// Merge chain: 2 same rarity → 1 next rarity (same category)
export const MERGE_MATRIX = {
  common: 'uncommon', uncommon: 'rare', rare: 'epic', epic: 'legendary',
  legendary: 'mythic', mythic: 'ancient', ancient: 'divine',
  divine: 'secret', secret: 'cosmic', cosmic: null,
};

export const GORILLA_IMAGES = {
  angry: './src/assets/gorilla-angry.png',
  happy: './src/assets/gorilla-happy.png',
  arms: './src/assets/gorilla-arms.png',
};

export const INITIAL_TUTORIAL = [
  'tut_welcome',
  'tut_tap',
  'tut_bananas',
  'tut_merge',
  'tut_done',
];
