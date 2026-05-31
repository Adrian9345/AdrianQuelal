import React, { useRef } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import FeaturedCarousel from './FeaturedCarousel';
import SearchWithSuggestions from './SearchWithSuggestions';
import { usePublications } from '../contexts/PublicationsContext';
import RecommendedCard from './RecommendedCard';
import PublicationDetailModal from './PublicationDetailModal';
import { Publication, corregimientosList } from '../data/publications';

export default function HomeScreen({ 
  onNavigate, 
  onEdit,
  onSelectCorregimiento 
}: { 
  onNavigate: (s: ScreenType) => void, 
  onEdit?: (pub: Publication) => void,
  onSelectCorregimiento: (c: string) => void 
}) {
  const { publications } = usePublications();
  const [selectedPublication, setSelectedPublication] = React.useState<Publication | null>(null);
  const [filterCorregimiento, setFilterCorregimiento] = React.useState<string | null>(null);
  
  const corregimientos = ['Todos', ...corregimientosList];
  
  // Get all unique publications
  const allPubsRaw = React.useMemo(() => Object.values(publications).flat() as Publication[], [publications]);
  
  // Shuffled and filtered publications for the feed
  const recommendedPublications = React.useMemo(() => {
    let filtered = [...allPubsRaw];
    
    if (filterCorregimiento && filterCorregimiento !== 'Todos') {
      filtered = filtered.filter(pub => pub.corregimiento === filterCorregimiento);
    }

    // Simple shuffle
    return filtered.sort(() => Math.random() - 0.5);
  }, [allPubsRaw, filterCorregimiento]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  // Drag to scroll refs
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Drag to scroll Mouse & Touch Handlers
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
    const walk = (x - startXRef.current) * 1.5; // Drag speed multiplier
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - walk;
  };

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

  const handleChipClick = (c: string) => {
    if (hasMovedRef.current) return;
    setFilterCorregimiento(c);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white pb-32">
      <Header onNavigate={onNavigate} />
      <main className="flex-1">
        
        {/* Top Featured Slider Section inspired by "Recommended" design */}
        <section className="py-2 overflow-hidden">
          <FeaturedCarousel 
            onSelectCorregimiento={onSelectCorregimiento} 
            onNavigate={onNavigate} 
            onSelectPublication={(pub) => setSelectedPublication(pub)}
          />
        </section>

        {/* Global Detail Modal for Featured/Search links */}
        {selectedPublication && (
          <PublicationDetailModal 
            publication={selectedPublication}
            isOpen={!!selectedPublication}
            onClose={() => setSelectedPublication(null)}
            onNavigate={onNavigate}
          />
        )}

        {/* Search Bar with real-time feedback and keyword suggestions */}
        <section className="px-4 mb-4 mt-2">
          <SearchWithSuggestions onSelectCorregimiento={onSelectCorregimiento} />
        </section>

        {/* Category Chips - Filter discovery feed */}
        <section className="px-4 mb-6 relative">
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            className={`flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {corregimientos.map(c => {
              const isActive = (c === 'Todos' && !filterCorregimiento) || (c === filterCorregimiento);
              return (
                <button 
                  key={c}
                  type="button"
                  onClick={() => handleChipClick(c)}
                  className={`flex-shrink-0 px-6 py-2 rounded-full font-bold text-[13px] transition-all shadow-sm select-none border border-transparent ${
                    isActive 
                      ? 'bg-[#30132e] text-white' 
                      : 'bg-[#fbf9f4] border-[#f5ebdb] text-gray-700 hover:bg-[#fff9f0] hover:border-[#f39233]/40'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        {/* Para ti Section with filtered discovery feed */}
        <section className="px-5 relative mb-12">
          <div className="flex justify-between items-end mb-5">
            <div>
              <h2 className="text-[20px] font-bold text-[#1B1C19]" style={{ fontFamily: '"Montserrat", sans-serif' }}>Recomendado Para Ti</h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">Basado en tus preferencias y tendencias locales</p>
            </div>
            {filterCorregimiento && filterCorregimiento !== 'Todos' && (
              <button 
                onClick={() => onSelectCorregimiento(filterCorregimiento)}
                className="text-xs font-bold text-[#f39233] hover:underline"
              >
                Ver Corregimiento
              </button>
            )}
          </div>

          {recommendedPublications.length > 0 ? (
            <div className="flex flex-col gap-4">
              {recommendedPublications.map((pub, idx) => (
                <RecommendedCard 
                  key={pub.id || `${pub.title}-${idx}`}
                  id={pub.id}
                  corregimiento={pub.corregimiento}
                  category={pub.category}
                  subTitle={pub.subTitle}
                  title={pub.title}
                  descriptionTitle={pub.descriptionTitle}
                  dateRange={pub.dateRange}
                  image={pub.image}
                  location={pub.location}
                  rating={idx % 2 === 0 ? 4.9 : 4.7}
                  creatorId={pub.creatorId}
                  onNavigate={onNavigate}
                  onEdit={onEdit}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center bg-stone-50 rounded-[30px] border border-dashed border-stone-200">
              <span className="material-symbols-outlined text-stone-300 text-[48px] mb-2">explore</span>
              <p className="text-stone-400 font-bold text-sm">No hay publicaciones para esta categoría aún</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
