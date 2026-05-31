import React, { useRef, useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

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

interface FeaturedCarouselProps {
  onSelectCorregimiento: (c: string) => void;
  onNavigate?: (screen: ScreenType) => void;
  onSelectPublication?: (pub: any) => void;
}

import { usePublications } from '../contexts/PublicationsContext';

export default function FeaturedCarousel({ 
  onSelectCorregimiento, 
  onNavigate, 
  onSelectPublication
}: FeaturedCarouselProps) {
  const { profile, user } = useAuth();
  const { publications: publicationsMap } = usePublications();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  
  // Drag to scroll refs
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Derive dynamic featured items from context
  const liveFeaturedItems: FeaturedItem[] = React.useMemo(() => {
    const allPubs = Object.values(publicationsMap).flat() as any[];
    // Take the most recent (last added or those with assigned dates)
    // We prioritize those with images and categories
    return allPubs
      .filter(p => p.image && p.category)
      .slice(-6) // Take the last 6 added
      .reverse() // Newest first
      .map(pub => ({
        id: pub.id || pub.title,
        category: pub.category,
        title: pub.title,
        location: pub.location,
        distance: 'Destacado',
        tagline: pub.descriptionTitle || 'Actividad local',
        priceTag: 'Entrada Libre',
        rating: (4.5 + Math.random() * 0.5).toFixed(1), // Mock rating for aesthetic
        image: pub.image,
        corregimiento: pub.corregimiento
      }));
  }, [publicationsMap]);

  // Set initial active item
  useEffect(() => {
    if (liveFeaturedItems.length > 0) {
      setActiveId(liveFeaturedItems[0].id);
    }
  }, [liveFeaturedItems.length]);

  // Center detecting on scroll
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestId = liveFeaturedItems[0]?.id || '';
    let minDistance = Infinity;

    const children = container.querySelectorAll('[data-card-id]');
    children.forEach((child) => {
      const htmlChild = child as HTMLElement;
      const cardId = htmlChild.getAttribute('data-card-id') || '';
      const childCenter = htmlChild.offsetLeft + htmlChild.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestId = cardId;
      }
    });

    if (closestId && closestId !== activeId) {
      setActiveId(closestId);
    }
  };

  // Drag to scroll Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.6; // Speed boost
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  // Touch handlers for mobile smooth drag
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    hasMovedRef.current = false;
    startXRef.current = e.touches[0].pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const x = e.touches[0].pageX - container.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
  };

  const handleCardClick = (item: FeaturedItem) => {
    if (hasMovedRef.current) {
      // It was a drag, don't trigger navigate click
      return;
    }
    
    // Find the actual publication and possibly open it or navigate to details
    const pub = (publicationsMap[item.corregimiento] || []).find(
      p => p.title.toLowerCase() === item.title.toLowerCase()
    );

    if (pub && onSelectPublication) {
      onSelectPublication(pub);
    } else {
      // Fallback: Select corregimiento as before
      onSelectCorregimiento(item.corregimiento);
    }
  };

  // Save/Bookmark logic with localStorage persistency
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    // Sync with localStorage
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
    
    if (!user || user.isAnonymous) {
      setShowGuestWarning(true);
      return;
    }

    // Get latest from localStorage
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
      // Remove it
      updatedSaved = currentSaved.filter((s: any) => String(s.id) !== String(item.id));
    } else {
      // Add it under mapped format compatible with SavedScreen
      const newSave = {
        id: item.id,
        title: item.title,
        location: item.location,
        date: "28 - 30 de junio", // default or custom
        image: item.image,
        corregimiento: item.corregimiento
      };
      updatedSaved = [...currentSaved, newSave];
    }

    localStorage.setItem('saved_items', JSON.stringify(updatedSaved));
    setSavedIds(updatedSaved.map((s: any) => String(s.id)));
  };

  return (
    <div className="w-full select-none">
      
      {/* Title Header with elegant recommended-style typography */}
      <div className="flex justify-between items-center px-5 mb-5 mt-1">
        <h2 className="text-[20px] font-bold tracking-tight text-[#1b1a17] leading-none" style={{ fontFamily: '"Montserrat", sans-serif' }}>
          Destacados
        </h2>
        <span 
          onClick={() => onNavigate && onNavigate('featured_all')}
          className="text-[13px] font-medium text-[#f39233] hover:text-orange-600 cursor-pointer transition-colors leading-none" 
          style={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          Ver todo
        </span>
      </div>

      {/* Outer Slider Section */}
      <div className="relative overflow-hidden pl-4 pr-4">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onScroll={handleScroll}
          className={`flex gap-6 overflow-x-auto py-8 scrollbar-hide scroll-smooth snap-x snap-mandatory ${
            isDragging ? 'cursor-grabbing active:scale-[0.995]' : 'cursor-grab'
          }`}
          style={{
            scrollPaddingLeft: '24px',
            scrollPaddingRight: '24px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Pad leftmost area for elegant centered experience */}
          <div className="flex-shrink-0 w-2" />

          {liveFeaturedItems.map((item) => {
            const isCentered = item.id === activeId;
            const isSaved = savedIds.includes(String(item.id));

            return (
              <div
                key={item.id}
                data-card-id={item.id}
                onClick={() => handleCardClick(item)}
                className={`flex-shrink-0 w-[275px] sm:w-[310px] bg-white rounded-[20px] p-4 pb-5 shadow-2xl border border-[#eee8df]/70 snap-center transition-all duration-500 ease-out transform ${
                  isCentered 
                    ? 'scale-[1.05] ring-4 ring-[#f39233]/15 shadow-orange-950/10 z-10' 
                    : 'scale-[0.96] opacity-80 filter saturate-75'
                }`}
              >
                {/* Beautiful custom curved image container */}
                <div className="relative aspect-[4/3] w-full rounded-[20px] overflow-hidden mb-4 bg-stone-100 shadow-sm group" style={{ aspectRatio: '4/3' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                      isCentered ? 'scale-105' : 'scale-100'
                    }`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />

                  {/* Top-Right Bookmark/Save Badge / Button modeled from recommended mockup */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleSave(e, item)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                        isSaved 
                          ? 'bg-[#30132e] text-white scale-110' 
                          : 'bg-white/90 text-gray-400 hover:text-[#f39233] hover:bg-white active:scale-90'
                      }`}
                    >
                      <span 
                        className="material-symbols-outlined text-[20px] font-bold"
                        style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        bookmark
                      </span>
                    </button>


                  </div>


                  {/* Play badge mockup from the Recommended asset */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="material-symbols-outlined text-[48px] drop-shadow-lg text-white/90">play_circle</span>
                  </div>

                  {/* Small category indicator in top-left */}
                  <div className="absolute top-4 left-4 bg-[#30132e]/85 backdrop-blur-sm px-3 py-1 rounded-full border border-orange-300/25">
                    <span className="text-[8.5px] font-black text-orange-200 tracking-widest uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Info layout inspired strictly by Recommended schema */}
                <div className="px-2 pb-2">
                  <h3 className="text-lg font-bold text-[#1b1a17] leading-tight mb-1 tracking-tight" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold mb-3">
                    <span className="material-symbols-outlined text-xs text-[#f39233]">location_on</span>
                    <span>{item.location}</span>
                    <span className="text-[10px] text-gray-300 font-normal">|</span>
                    <span className="text-gray-400 font-semibold">{item.distance}</span>
                  </div>

                  {/* Card bottom styled nicely */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-none">Desde</span>
                      <span className="text-[17px] font-medium text-[#30132e] tracking-tight mt-0.5">
                        {item.priceTag}
                      </span>
                    </div>

                    {/* Rating badge like the 4.9 pill */}
                    <div className="flex items-center gap-1 bg-[#4f38cd] text-white py-1.5 px-3 rounded-2xl shadow-sm">
                      <span className="material-symbols-outlined text-[13px] text-orange-200 fill-current">star</span>
                      <span className="text-[11px] font-black tracking-wide">{item.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pad rightmost area for elegant centered experience */}
          <div className="flex-shrink-0 w-2" />
        </div>
      </div>
      
      {/* GUEST WARNING MODAL */}
      <AnimatePresence>
        {showGuestWarning && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuestWarning(false)}
              className="fixed inset-0 bg-[#30132e]/40 backdrop-blur-sm z-[200]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-6 z-[201] pointer-events-none">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl pointer-events-auto flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#f39233] text-4xl">account_circle</span>
                </div>
                
                <h3 className="text-xl font-black text-[#30132e] mb-2 tracking-tight">¡Casi listo!</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                  Para guardar este evento en tus favoritos, por favor inicia sesión desde tu perfil.
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={() => {
                      setShowGuestWarning(false);
                      if (onNavigate) onNavigate('profile');
                    }}
                    className="w-full py-4 bg-[#f39233] text-white rounded-[24px] font-black text-sm tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-transform"
                  >
                    IR A MI PERFIL
                  </button>
                  <button 
                    onClick={() => setShowGuestWarning(false)}
                    className="w-full py-4 bg-transparent text-gray-400 font-bold text-xs tracking-widest"
                  >
                    CERRAR
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
