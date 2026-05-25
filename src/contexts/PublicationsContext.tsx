import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Publication, publicationsData } from '../data/publications';
import { db } from '../firebaseAuth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface PublicationsContextType {
  publications: Record<string, Publication[]>;
  deletePublication: (corregimiento: string, title: string, id?: string) => Promise<void>;
  updatePublication: (corregimiento: string, oldTitle: string, updatedPub: Publication, id?: string) => Promise<void>;
  addPublication: (pub: Publication) => Promise<void>;
  loading: boolean;
}

const PublicationsContext = createContext<PublicationsContextType | undefined>(undefined);

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Record<string, Publication[]>>(publicationsData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'publications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Start with empty then fill with Firestore data
      const dbPubs: Record<string, Publication[]> = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const pub: Publication = {
          id: doc.id,
          // Use defaults or data
          corregimiento: data.corregimiento,
          category: data.category,
          subTitle: data.subTitle,
          title: data.title,
          descriptionTitle: data.descriptionTitle,
          dateRange: data.dateRange,
          image: data.image,
          location: data.location,
          creatorId: data.creatorId,
          type: data.type || 'Eventos',
          day: data.day,
          month: data.month,
          year: data.year
        };
        
        if (!dbPubs[pub.corregimiento]) {
          dbPubs[pub.corregimiento] = [];
        }
        
        dbPubs[pub.corregimiento].push(pub);
      });
      
      // If Firestore is empty, we can optionally keep mock data 
      // but the user wants strictly dynamic behavior
      if (snapshot.empty) {
        setPublications(publicationsData);
      } else {
        setPublications(dbPubs);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deletePublication = async (corregimiento: string, title: string, id?: string) => {
    try {
      if (id && !id.startsWith('mock-')) {
        await deleteDoc(doc(db, 'publications', id));
      } else {
        // Fallback for mock or if only title/corregimiento provided
        const q = query(
          collection(db, 'publications'), 
          where('title', '==', title), 
          where('corregimiento', '==', corregimiento)
        );
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletePromises);
        
        // Also update local state for mock data
        setPublications(prev => {
          const newList = (prev[corregimiento] || []).filter(p => p.title !== title && p.id !== id);
          return { ...prev, [corregimiento]: newList };
        });
      }
    } catch (error) {
      console.error("Error deleting publication:", error);
      throw error;
    }
  };

  const updatePublication = async (corregimiento: string, oldTitle: string, updatedPub: Publication, id?: string) => {
    try {
      if (id && !id.startsWith('mock-')) {
        const { id: _, ...data } = updatedPub;
        await updateDoc(doc(db, 'publications', id), data as any);
      } else {
        // Find in Firestore by query if not mock
        const q = query(
          collection(db, 'publications'), 
          where('title', '==', oldTitle), 
          where('corregimiento', '==', corregimiento)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const { id: _, ...data } = updatedPub;
          await updateDoc(snapshot.docs[0].ref, data as any);
        } else {
          // Just update local for mock
          setPublications(prev => {
            const list = prev[corregimiento] || [];
            const newList = list.map(p => p.title === oldTitle ? updatedPub : p);
            return { ...prev, [corregimiento]: newList };
          });
        }
      }
    } catch (error) {
      console.error("Error updating publication:", error);
      throw error;
    }
  };

  const addPublication = async (pub: Publication) => {
    try {
      if (user) {
        await addDoc(collection(db, 'publications'), {
          ...pub,
          creatorId: user.uid,
          createdAt: serverTimestamp()
        });
      } else {
        // Local only for unauthenticated (should not happen if guarded)
        setPublications(prev => {
          const list = prev[pub.corregimiento] || [];
          return { ...prev, [pub.corregimiento]: [{ ...pub, id: `local-${Date.now()}` }, ...list] };
        });
      }
    } catch (error) {
      console.error("Error adding publication:", error);
      throw error;
    }
  };

  return (
    <PublicationsContext.Provider value={{ publications, deletePublication, updatePublication, addPublication, loading }}>
      {children}
    </PublicationsContext.Provider>
  );
}

export function usePublications() {
  const context = useContext(PublicationsContext);
  if (context === undefined) {
    throw new Error('usePublications must be used within a PublicationsProvider');
  }
  return context;
}
