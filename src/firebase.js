const DB_URL = 'https://refer-c9d1b-default-rtdb.europe-west1.firebasedatabase.app';

export function generateUserId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function getOrCreateUserId() {
  let uid = localStorage.getItem('mason_user_id');
  if (!uid) {
    uid = generateUserId();
    localStorage.setItem('mason_user_id', uid);
  }
  return uid;
}

async function api(path, method, body) {
  try {
    const url = `${DB_URL}/${path}.json`;
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

export async function saveUserData(userId, data) {
  return api(`players/${userId}`, 'PATCH', { ...data, updatedAt: Date.now() });
}

export async function loadUserData(userId) {
  return api(`players/${userId}`, 'GET');
}

export async function saveLeaderboardEntry(userId, entry) {
  return api(`leaderboard/${userId}`, 'PUT', entry);
}

export async function getLeaderboard(limit = 50) {
  const data = await api('leaderboard', 'GET');
  if (!data) return [];
  return Object.entries(data)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
}
