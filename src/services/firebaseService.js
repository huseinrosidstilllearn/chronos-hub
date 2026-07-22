import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, onValue } from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  updateProfile
} from 'firebase/auth';

let firebaseApp = null;
let db = null;
let auth = null;

// Real Firebase Config extracted from user's google-services.json file
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDvObGbBD4WRHURZwWtHddezW5FZy_Ig4M",
  authDomain: "chronos-hub-by-huseinrosid.firebaseapp.com",
  projectId: "chronos-hub-by-huseinrosid",
  storageBucket: "chronos-hub-by-huseinrosid.firebasestorage.app",
  messagingSenderId: "1010580527327",
  appId: "1:1010580527327:android:f740808390479e19ec716a",
  databaseURL: "https://chronos-hub-by-huseinrosid-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Get saved Firebase Config from LocalStorage or fallback to Real Default Config
export function getSavedFirebaseConfig() {
  const saved = localStorage.getItem('chronos_firebase_config');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.apiKey.startsWith('AIza')) return parsed;
    } catch (e) {}
  }
  return DEFAULT_FIREBASE_CONFIG;
}

// Auto-initialize Firebase if not already active
function ensureFirebaseInitialized() {
  if (auth && db) return { app: firebaseApp, db, auth };
  const config = getSavedFirebaseConfig();
  return initFirebase(config);
}

export function initFirebase(config) {
  const targetConfig = config || DEFAULT_FIREBASE_CONFIG;
  if (!targetConfig || !targetConfig.apiKey || !targetConfig.projectId) return null;
  
  try {
    const databaseURL = targetConfig.databaseURL || `https://${targetConfig.projectId}-default-rtdb.firebaseio.com`;
    const fullConfig = { ...targetConfig, databaseURL };

    if (!getApps().length) {
      firebaseApp = initializeApp(fullConfig);
    } else {
      firebaseApp = getApp();
    }
    db = getDatabase(firebaseApp);
    auth = getAuth(firebaseApp);
    return { app: firebaseApp, db, auth };
  } catch (err) {
    console.error('Firebase Initialization Error:', err);
    return null;
  }
}

export function saveFirebaseConfig(config) {
  localStorage.setItem('chronos_firebase_config', JSON.stringify(config));
  return initFirebase(config);
}

// Authentication Functions (Always Auto-initialized!)
export async function loginWithEmail(email, password) {
  ensureFirebaseInitialized();
  if (!auth) throw new Error('Gagal menghubungkan ke Firebase Auth.');
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email, password, displayName) {
  ensureFirebaseInitialized();
  if (!auth) throw new Error('Gagal menghubungkan ke Firebase Auth.');
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCred.user) {
    await updateProfile(userCred.user, { displayName });
  }
  return userCred;
}

export async function loginWithGoogle() {
  ensureFirebaseInitialized();
  if (!auth) throw new Error('Gagal menghubungkan ke Firebase Auth.');
  const provider = new GoogleAuthProvider();
  try {
    return await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment') {
      return await signInWithRedirect(auth, provider);
    }
    throw err;
  }
}

export async function logoutUser() {
  ensureFirebaseInitialized();
  if (!auth) return;
  return await firebaseSignOut(auth);
}

export function onAuthUserChanged(callback) {
  ensureFirebaseInitialized();
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
}

// Multi-user Realtime Database Sync (Scoped strictly by User UID)
export async function syncDataToRealtimeDB(uid, data) {
  ensureFirebaseInitialized();
  if (!db || !uid) return false;

  try {
    const userRef = ref(db, `user_dashboards/${uid}`);
    await set(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error('Realtime DB Sync Error:', err);
    return false;
  }
}

export function subscribeToRealtimeDB(uid, callback) {
  ensureFirebaseInitialized();
  if (!db || !uid) return null;

  try {
    const userRef = ref(db, `user_dashboards/${uid}`);
    return onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      }
    });
  } catch (err) {
    console.error('Realtime DB Subscription Error:', err);
    return null;
  }
}
