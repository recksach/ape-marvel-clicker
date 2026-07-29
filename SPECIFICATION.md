# Mason Mini App — ТОЛЬКО КОНФИГУРАЦИЯ

## 1. GITHUB

**Repository**: `https://github.com/recksach/ape-marvel-clicker`
**Pages URL**: `https://recksach.github.io/ape-marvel-clicker/`
**Как залить**: 
- Создать репозиторий `ape-marvel-clicker`
- Добавить файлы: `index.html`, `package.json`, `vite.config.js`, `.github/workflows/pages.yml`, все из `src/`
- Включить GitHub Pages: Settings → Pages → Source: GitHub Actions
- Вставить `index.html` с `<base href="./">` или в `vite.config.js` поставить `base: './'`

**Pages Workflow** (`.github/workflows/pages.yml`):
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: "pages"
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx vite build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

---

## 2. TELEGRAM BOT

**Bot username**: `@Illuminatemasonbot`
**Mini App URL**: `https://recksach.github.io/ape-marvel-clicker/`

**Настройка в BotFather**:
1. `/setname` → `Illuminatemasonbot`
2. `/setdescription` → Mason Mini App — collect artifacts, merge, earn APE
3. `/setabouttext` → Masonic collection game with TON integration
4. `/setmenubutton` → URL: `https://recksach.github.io/ape-marvel-clicker/`
5. `/mybots` → выбрать бота → Bot Settings → Menu Button → установить URL выше

**В `index.html` обязательно**:
```html
<script src="https://telegram.org/js/telegram-web-app.js"></script>
```

---

## 3. TON CONNECT / $APE TOKEN

**Контракт $APE (Jetton)**: `EQBjoywW-EZyePew5wwnwFtjWsW1OAySB-3Pt71huH20bzUD`
**Admin кошелёк (куда уходят TON)**: `UQAGpJWn-FJd3wjB-aiChuiYH-9tdXAOhqu887uBtS1Ce4_7`
**Курс**: 1 TON = 15674 $APE

**Пакеты для покупки**:
| TON | $APE |
|-----|------|
| 0.1 | 1,567 |
| 0.5 | 7,837 |
| 1.0 | 15,674 |
| 5.0 | 78,370 |
| 10.0 | 156,740 |

**TON Connect Manifest** (файл `tonconnect-manifest.json`):
```json
{
  "url": "https://recksach.github.io/chronogram-infinity/",
  "name": "$MASON / $APE Pre-Market",
  "iconUrl": "https://i.postimg.cc/P5WdHpbh/file-000000007db8720a83a00abbd6e8e608.png",
  "termsUrl": "https://recksach.github.io/chronogram-infinity/",
  "privacyPolicyUrl": "https://recksach.github.io/chronogram-infinity/"
}
```
Manifest залить на GitHub Pages (или любой хостинг) и указать URL в коде:
```
manifestUrl: 'https://raw.githubusercontent.com/recksach/chronogram-infinity/main/tonconnect-manifest.json'
```

**Логика покупки**:
- Пользователь подключает TON кошелёк через TON Connect UI
- Выбирает пакет (0.1/0.5/1/5/10 TON)
- Отправляется транзакция на admin кошелёк
- После подтверждения начисляется $APE внутри игры (balance в localStorage/Firebase)
- Реальная выдача $APE токенов происходит вручную администратором

**NPM пакет**: `"@tonconnect/ui": "^2.0.0"`

---

## 4. FIREBASE REALTIME DATABASE

**Project ID**: `refer-c9d1b`
**Database URL**: `https://refer-c9d1b-default-rtdb.europe-west1.firebasedatabase.app`
**Создать**: Firebase Console → Add project → Realtime Database (europe-west1)

**Правила безопасности** (для разработки):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Структура данных в Firebase**:
```
/players/{userId}/
├── tgUser: { id, username, first_name }
├── apeBalance: number
├── gold: number
├── crystals: number
├── knowledge: number
├── energy: number
├── reputation: number
├── keys: number
├── level: number
├── xp: number
├── xpNeeded: number
├── totalCollected: number
├── totalTaps: number
├── tapMultiplier: number
├── completedQuests: number
├── walletAddress: string
├── statPoints: number
├── stats: { strength, wisdom, agility, luck }
├── collection: { "0": 0, "1": 0, ... }
├── inventory: [item objects]
├── mergeSlots: [9 items or null]
├── mergeSlotsUnlocked: [0, 1, 2]
├── questActive: boolean
├── questEnd: timestamp
├── questNPC: string
├── tutorialStep: number
├── tutorialDone: boolean
├── npcLevels: {}
├── seenItems: []
├── lastDaily: timestamp
├── streak: number
├── unlockedNPCs: ["librarian", "alchemist", "merchant"]
├── activeNPCs: [{ id, x, y, vx, vy, scale, outfit, lastTap, happiness }]
└── updatedAt: timestamp

/leaderboard/{userId}/
├── score: number
└── name: string
```

**API запросы** (без SDK, через fetch):
- `GET https://refer-c9d1b-default-rtdb.europe-west1.firebasedatabase.app/players/{userId}.json` — загрузить
- `PATCH https://refer-c9d1b-default-rtdb.europe-west1.firebasedatabase.app/players/{userId}.json` — сохранить

---

## 5. ЗАВИСИМОСТИ (package.json)

```json
{
  "name": "ape-marvel-clicker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tonconnect/ui": "^2.0.0",
    "firebase": "^12.16.0"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

**Опционально** (`vite.config.js`):
```js
import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: { host: '0.0.0.0', port: 8090 },
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
```

---

## 6. ЦВЕТА И ТЕМА

- Фон: `#060610`
- Текст: `#e0dcc0`
- Золото: `#f7c948`
- Изумруд: `#10b981`
- Пурпур: `#a855f7`
- Редкости: common `#8b7355`, uncommon `#10b981`, rare `#3b82f6`, epic `#a855f7`, legendary `#f7c948`, mythic `#ef4444`, ancient `#8b7355`, divine `#e0dcc0`, secret `#10b981`

---

## 7. TELEGRAM WEB APP API

В коде используемые методы:
```js
Telegram.WebApp.ready();
Telegram.WebApp.expand();
Telegram.WebApp.initDataUnsafe?.user  // { id, first_name, username, ... }
Telegram.WebApp.close();
```