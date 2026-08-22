import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'demo-api-key',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'demo.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'demo-project',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:000000000000:web:0000000000000000000000',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const storage = getStorage(app)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

// ── Google Sign-In ────────────────────────────────────────────────────────────
export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider)
}

// ── Email Auth ────────────────────────────────────────────────────────────────
export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function registerWithEmail(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName })
  return cred
}

export async function logout() {
  return signOut(auth)
}

export { onAuthStateChanged, updateProfile }
