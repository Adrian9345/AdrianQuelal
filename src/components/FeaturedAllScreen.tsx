import React, { useState, useEffect } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import RecommendedCard from './RecommendedCard';
import { usePublications } from '../contexts/PublicationsContext';

interface FeaturedItem {
  id: string;
  category: string;
  title: string;
  location: string;
  distance: string;
  tagline: string;
  priceTag: string;
  rating: string;
  image: string;
  corregimiento: string;
}

export default function FeaturedAllScreen({ 
  onNavigate, 
  onEdit,
  onSelectCorregimiento 
}: { 
  onNavigate: (s: ScreenType) => void, 
  onEdit?: (pub: any) => void,
  onSelectCorregimiento: (c: string) => void 
}) {
  const { publications: publicationsMap } = usePublications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Derive all featured items from dynamic context
  const featuredItems: FeaturedItem[] = React.useMemo(() => {
    const allPubs = Object.values(publicationsMap).flat() as any[];
    // We filter for items that look like events or high-quality posts
    return allPubs
      .filter(p => p.image && p.category)
      .reverse() // Most recent first
      .map(pub => ({
        id: pub.id || pub.title,
        category: pub.category,
        title: pub.title,
        location: pub.location,
        distance: 'Destacado',
        tagline: pub.descriptionTitle || 'Actividad local',
        priceTag: 'Entrada Libre',
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        image: pub.image,
        corregimiento: pub.corregimiento
      }));
  }, [publicationsMap]);

  const categories = ['Todos', 'NATURALEZA', 'GASTRONOMÍA', 'CULTURA', 'AGROTURISMO'];

  // Sync saved list on load
  useEffect(() => {
    const saved = localStorage.getItem('saved_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSavedIds(parsed.map((item: any) => String(item.id)));
        }
      } catch (e) {
        console.error("Error reading saved items", e);
      }
    }
  }, []);

  const toggleSave = (e: React.MouseEvent, item: FeaturedItem) => {
    e.stopPropagation();
    const saved = localStorage.getItem('saved_items');
    let currentSaved: any[] = [];
    if (saved) {
      try {
        currentSaved = JSON.parse(saved);
        if (!Array.isArray(currentSaved)) currentSaved = [];
      } catch (err) {
        currentSaved = [];
      }
    }

    const isCurrentlySaved = currentSaved.some((s: any) => String(s.id) === String(item.id));
    let updatedSaved = [];

    if (isCurrentlySaved) {
      updatedSaved = currentSaved.filter((s: any) => String(s.id) !== String(item.id));
    } else {
      const newSave = {
        id: item.id,
        title: item.title,
        location: item.location,
        date: "Feria Destacada",
        image: item.image,
        corregimiento: item.corregimiento
      };
      updatedSaved = [...currentSaved, newSave];
    }

    localStorage.setItem('saved_items', JSON.stringify(updatedSaved));
    setSavedIds(updatedSaved.map((s: any) => String(s.id)));
  };

  const filteredItems = featuredItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <Header onNavigate={onNavigate} />

      <main className="flex-1 px-5 pt-4">
        {/* Back and Title bar */}
        <div className="flex items-center gap-2 mb-4">
          <button 
            onClick={() => onNavigate('home')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 text-stone-700 hover:text-[#f39233] hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f39233]/40"
            aria-label="Volver"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-[#1B1C19]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              Eventos Destacados
            </h2>
            <p className="text-stone-500 text-xs font-medium">Descubre toda la magia tradicional de Pasto</p>
          </div>
        </div>



        {/* Featured Items Grid */}
        <div className="flex flex-col gap-5 mt-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const list = publicationsMap[item.corregimiento] || [];
              const livePub = list.find(p => p.title.toLowerCase() === item.title.toLowerCase());
              const isSaved = savedIds.includes(String(item.id));
              
              return (
                <RecommendedCard
                  key={item.id}
                  id={livePub?.id}
                  corregimiento={item.corregimiento}
                  category={item.category}
                  subTitle={item.tagline}
                  title={item.title}
                  descriptionTitle={item.title}
                  dateRange={item.distance}
                  image={item.image}
                  location={item.location}
                  rating={parseFloat(item.rating) || 4.5}
                  creatorId={livePub?.creatorId}
                  onNavigate={onNavigate}
                  onEdit={onEdit}
                />
              );
            })
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-[20px] border border-dashed border-stone-200">
              <span className="material-symbols-outlined text-stone-300 text-5xl mb-2">search_off</span>
              <p className="text-stone-600 font-bold text-sm">No se encontraron eventos</p>
              <p className="text-stone-400 text-xs mt-1">Prueba con otra palabra clave o categoría</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
