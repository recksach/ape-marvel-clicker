import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDemo_Replace_With_Your_Key",
  authDomain: "mason-token-ape.firebaseapp.com",
  projectId: "mason-token-ape",
  storageBucket: "mason-token-ape.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000"
};

let app = null;
let db = null;
let firebaseReady = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseReady = true;
} catch (e) {
  console.warn('Firebase init failed, using local-only mode:', e.message);
}

export function generateUserId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function getOrCreateUserId() {
  let uid = localStorage.getItem('ape_user_id');
  if (!uid) {
    uid = generateUserId();
    localStorage.setItem('ape_user_id', uid);
  }
  return uid;
}

export async function saveUserData(userId, data) {
  if (!firebaseReady || !db) return false;
  try {
    await setDoc(doc(db, 'players', userId), { ...data, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (e) {
    console.warn('Save failed:', e.message);
    return false;
  }
}

export async function loadUserData(userId) {
  if (!firebaseReady || !db) return null;
  try {
    const snap = await getDoc(doc(db, 'players', userId));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn('Load failed:', e.message);
    return null;
  }
}

export function subscribeUserData(userId, callback) {
  if (!firebaseReady || !db) return () => {};
  try {
    return onSnapshot(doc(db, 'players', userId), (snap) => {
      if (snap.exists()) callback(snap.data());
    });
  } catch (e) {
    return () => {};
  }
}

export { db, firebaseReady };
