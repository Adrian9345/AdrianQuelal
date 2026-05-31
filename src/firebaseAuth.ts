import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send'); 

const facebookProvider = new FacebookAuthProvider();

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const registerWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    isSigningIn = true;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const loginWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    isSigningIn = true;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    // Create user profile in Firestore if it doesn't exist
    const user = result.user;
    try {
      const { doc, setDoc, serverTimestamp, getDoc } = await import('firebase/firestore');
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || 'Usuario Google',
          createdAt: serverTimestamp(),
          photoURL: user.photoURL
        });
      }
    } catch (firestoreErr) {
      console.error("Error checking/creating user profile with Google:", firestoreErr);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const facebookSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, facebookProvider);
    const credential = FacebookAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    // Create user profile in Firestore if it doesn't exist
    const user = result.user;
    try {
      const { doc, setDoc, serverTimestamp, getDoc } = await import('firebase/firestore');
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || 'Usuario Facebook',
          createdAt: serverTimestamp(),
          photoURL: user.photoURL
        });
      }
    } catch (firestoreErr) {
      console.error("Error checking/creating user profile with Facebook:", firestoreErr);
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Facebook sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
