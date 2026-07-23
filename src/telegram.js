import { TG_BOT } from './config.js';

let tgUser = null;

export function initTelegram() {
  if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      tgUser = tg.initDataUnsafe.user;
      localStorage.setItem('ape_tg_user', JSON.stringify(tgUser));
      return tgUser;
    }
  }
  window.open(`https://t.me/${TG_BOT}`, '_blank');
  return null;
}

export function getTelegramUser() {
  if (tgUser) return tgUser;
  try {
    const saved = localStorage.getItem('ape_tg_user');
    if (saved) { tgUser = JSON.parse(saved); return tgUser; }
  } catch {}
  if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
      tgUser = tg.initDataUnsafe.user;
      return tgUser;
    }
  }
  return null;
}

export function isInsideTelegram() {
  return typeof window.Telegram !== 'undefined' && window.Telegram.WebApp && window.Telegram.WebApp.initData;
}
