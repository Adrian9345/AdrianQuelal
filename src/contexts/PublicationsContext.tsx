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
  getDocs,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface PublicationsContextType {
  publications: Record<string, Publication[]>;
  deletePublication: (corregimiento: string, title: string, id?: string) => Promise<void>;
  updatePublication: (corregimiento: string, oldTitle: string, updatedPub: Publication, id?: string) => Promise<void>;
  addPublication: (pub: Publication) => Promise<void>;
  clearAllPublications: () => Promise<void>;
  loading: boolean;
}

const PublicationsContext = createContext<PublicationsContextType | undefined>(undefined);

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Record<string, Publication[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const seedPublications = async () => {
      try {
        const q = query(collection(db, 'publications'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          console.log("No publications found in Firestore. Seeding default publications...");
          const keys = Object.keys(publicationsData);
          for (const corregimiento of keys) {
            const list = publicationsData[corregimiento] || [];
            for (const pub of list) {
              const { id: _, ...cleanedPub } = pub;
              await addDoc(collection(db, 'publications'), {
                ...cleanedPub,
                createdAt: serverTimestamp(),
                creatorId: 'static-seed'
              });
            }
          }
          console.log("Default publications successfully seeded on Firestore.");
        }
      } catch (err) {
        console.error("Error seeding default publications:", err);
      }
    };
    seedPublications();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'publications'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Get deleted list from localStorage
      const deletedList = JSON.parse(localStorage.getItem('app_deleted_publications') || '[]');
      const merged: Record<string, Publication[]> = {};

      if (snapshot.empty) {
        // Fallback to static defaults only if Firestore contains absolutely nothing
        Object.keys(publicationsData).forEach((corregimiento) => {
          merged[corregimiento] = (publicationsData[corregimiento] || []).filter(p => {
            const titleKey = `${p.corregimiento}::${p.title}`;
            return !deletedList.includes(p.id) && !deletedList.includes(titleKey);
          });
        });
      } else {
        // If Firestore has documents, use them exclusively! This ensures that deletes in any environment
        // are instantly synchronized across all other clients and deployments.
        snapshot.forEach((doc) => {
          const data = doc.data();
          const pub: Publication = {
            id: doc.id,
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
          
          // Filter out locally if deleted on this client
          const titleKey = `${pub.corregimiento}::${pub.title}`;
          if (deletedList.includes(pub.id) || deletedList.includes(titleKey)) {
            return;
          }

          if (!merged[pub.corregimiento]) {
            merged[pub.corregimiento] = [];
          }
          
          merged[pub.corregimiento].push(pub);
        });
      }
      
      // Filter here for Vercel if environment is Vercel
      const isVercel = typeof window !== 'undefined' && (
        window.location.hostname.includes('vercel') || 
        window.location.hostname === 'adrian-quelal.vercel.app'
      );
      
      if (isVercel) {
        const filteredMerged: Record<string, Publication[]> = {};
        Object.keys(merged).forEach((corregimiento) => {
          const filteredList = merged[corregimiento].filter(pub => {
            const t = pub.title.toLowerCase();
            const isSeeded = pub.creatorId === 'static-seed';
            return !isSeeded || t.includes('guaguas de pan') || t.includes('guguas de pan') || t.includes('guagua');
          });
          if (filteredList.length > 0) {
            filteredMerged[corregimiento] = filteredList;
          }
        });
        setPublications(filteredMerged);
      } else {
        setPublications(merged);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore publications stream error, falling back to local defaults:", error);
      const deletedList = JSON.parse(localStorage.getItem('app_deleted_publications') || '[]');
      const filteredDefaults: Record<string, Publication[]> = {};
      Object.keys(publicationsData).forEach((corregimiento) => {
        filteredDefaults[corregimiento] = (publicationsData[corregimiento] || []).filter(p => {
          const titleKey = `${p.corregimiento}::${p.title}`;
          return !deletedList.includes(p.id) && !deletedList.includes(titleKey);
        });
      });
      
      const isVercel = typeof window !== 'undefined' && (
        window.location.hostname.includes('vercel') || 
        window.location.hostname === 'adrian-quelal.vercel.app'
      );
      
      if (isVercel) {
        const filteredMerged: Record<string, Publication[]> = {};
        Object.keys(filteredDefaults).forEach((corregimiento) => {
          const filteredList = filteredDefaults[corregimiento].filter(pub => {
            const t = pub.title.toLowerCase();
            const isSeeded = pub.creatorId === 'static-seed';
            return !isSeeded || t.includes('guaguas de pan') || t.includes('guguas de pan') || t.includes('guagua');
          });
          if (filteredList.length > 0) {
            filteredMerged[corregimiento] = filteredList;
          }
        });
        setPublications(filteredMerged);
      } else {
        setPublications(filteredDefaults);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const deletePublication = async (corregimiento: string, title: string, id?: string) => {
    try {
      // Guard the deleted publication in localStorage so it stays deleted
      const deletedList = JSON.parse(localStorage.getItem('app_deleted_publications') || '[]');
      if (id && !deletedList.includes(id)) {
        deletedList.push(id);
      }
      const titleKey = `${corregimiento}::${title}`;
      if (!deletedList.includes(titleKey)) {
        deletedList.push(titleKey);
      }
      localStorage.setItem('app_deleted_publications', JSON.stringify(deletedList));

      // 1. Delete by direct Firestore Document ID if valid
      if (id && !id.startsWith('mock-')) {
        await deleteDoc(doc(db, 'publications', id));
      }
      
      // 2. Always also query and delete from Firestore by matching title + corregimiento 
      //    to keep the database completely synchronized in all cases (including mock seeding cases)
      const q = query(
        collection(db, 'publications'), 
        where('title', '==', title), 
        where('corregimiento', '==', corregimiento)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      // Explicitly filter local state immediately
      setPublications(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = (updated[key] || []).filter(p => p.id !== id && p.title !== title);
        });
        return updated;
      });
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

  const clearAllPublications = async () => {
    try {
      const q = query(collection(db, 'publications'));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setPublications({});
    } catch (error) {
      console.error("Error clearing all publications:", error);
      throw error;
    }
  };

  return (
    <PublicationsContext.Provider value={{ publications, deletePublication, updatePublication, addPublication, clearAllPublications, loading }}>
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
