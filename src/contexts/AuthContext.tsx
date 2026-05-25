import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseAuth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  name?: string;
  photoURL?: string | null;
  description?: string;
  isCreator?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfileImage: (dataUrl: string) => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  updateProfileDescription: (description: string) => Promise<void>;
  updateProfileRole: (isCreator: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  updateProfileImage: async () => {},
  updateProfileName: async () => {},
  updateProfileDescription: async () => {},
  updateProfileRole: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        const docPath = `users/${currUser.uid}`;
        try {
          const docRef = doc(db, 'users', currUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
             setProfile(docSnap.data() as UserProfile);
          } else {
             const defaultProfile = { name: currUser.displayName || 'Usuario', photoURL: currUser.photoURL || null };
             setProfile(defaultProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, docPath);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const ensureUserDocExistsAndModify = async (additionalData: any) => {
    if (!user) return;
    const docPath = `users/${user.uid}`;
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const data = {
          email: user.email || '',
          createdAt: serverTimestamp(),
          ...additionalData
        };
        await setDoc(docRef, data);
      } else {
        await updateDoc(docRef, additionalData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  };

  const updateProfileImage = async (dataUrl: string) => {
    if (!user) return;
    setProfile(prev => prev ? { ...prev, photoURL: dataUrl } : { photoURL: dataUrl });
    try {
      await ensureUserDocExistsAndModify({ photoURL: dataUrl });
    } catch (error) {
       console.error("Error updating profile image", error);
    }
  };

  const updateProfileName = async (name: string) => {
    if (!user) return;
    setProfile(prev => prev ? { ...prev, name } : { name });
    try {
      await ensureUserDocExistsAndModify({ name });
    } catch (error) {
       console.error("Error updating profile name", error);
    }
  };

  const updateProfileDescription = async (description: string) => {
    if (!user) return;
    setProfile(prev => prev ? { ...prev, description } : { description });
    try {
      await ensureUserDocExistsAndModify({ description });
    } catch (error) {
       console.error("Error updating profile description", error);
    }
  };

  const updateProfileRole = async (isCreator: boolean) => {
    if (!user) return;
    setProfile(prev => prev ? { ...prev, isCreator } : { isCreator });
    try {
      await ensureUserDocExistsAndModify({ isCreator });
    } catch (error) {
       console.error("Error updating profile role", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfileImage, updateProfileName, updateProfileDescription, updateProfileRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
