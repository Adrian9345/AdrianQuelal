import { useState, useEffect } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import RecommendedCard from './RecommendedCard';

interface SavedItem {
  id: string | number;
  title: string;
  location: string;
  date: string;
  image: string;
}

export default function SavedScreen({ 
  onNavigate,
  onEdit
}: { 
  onNavigate: (s: ScreenType) => void,
  onEdit?: (pub: any) => void
}) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Load and initialize saved items statefully
  useEffect(() => {
    const existing = localStorage.getItem('saved_items');
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) {
          setSavedItems(parsed);
        }
      } catch (e) {
        console.error("Error reading saved items", e);
      }
    } else {
      const initialMock: SavedItem[] = [];
      localStorage.setItem('saved_items', JSON.stringify(initialMock));
      setSavedItems(initialMock);
    }
  }, []);

  const handleRemoveItem = (id: string | number) => {
    const updated = savedItems.filter(item => String(item.id) !== String(id));
    localStorage.setItem('saved_items', JSON.stringify(updated));
    setSavedItems(updated);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <Header onNavigate={onNavigate} title="Guardados" />
      
      <main className="flex-1 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1B1C19]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            Tus Favoritos
          </h2>
          {savedItems.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('¿Estás seguro de que quieres quitar todos tus guardados?')) {
                  localStorage.removeItem('saved_items');
                  setSavedItems([]);
                }
              }}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
              BORRAR TODO
            </button>
          )}
        </div>
        
        {savedItems.length > 0 ? (
          <div className="space-y-4">
            {savedItems.map(item => (
              <RecommendedCard
                key={item.id}
                id={String(item.id)}
                category="GUARDADO"
                subTitle={item.date}
                title={item.title}
                descriptionTitle={item.title}
                dateRange={item.date}
                image={item.image}
                location={item.location}
                onNavigate={onNavigate}
                onEdit={onEdit}
                onRemove={() => handleRemoveItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full aspect-square bg-gray-50 rounded-[20px] overflow-hidden border border-gray-100 shadow-inner relative flex flex-col items-center justify-center p-8 text-center mt-6">
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <span className="material-symbols-outlined text-[64px] mb-4 text-[#f39233] relative z-10" style={{ fontVariationSettings: "'FILL' 0" }}>bookmark_border</span>
            <h3 className="font-bold text-xl mb-3 relative z-10 text-gray-800" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Aún no hay guardados
            </h3>
            <p className="text-sm text-gray-500 relative z-10 font-medium leading-relaxed">
               Explora la ciudad y guarda los eventos, rutas o lugares que más te interesen.
            </p>
            <button 
              onClick={() => onNavigate('home')}
              className="mt-8 px-8 py-3.5 bg-[#f39233] text-[#1B1C19] rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform relative z-10"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
               Explorar App
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
