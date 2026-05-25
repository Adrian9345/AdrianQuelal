import React, { useState, useRef } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import RecommendedCard from './RecommendedCard';
import SearchWithSuggestions from './SearchWithSuggestions';
import { usePublications } from '../contexts/PublicationsContext';
import { corregimientoData } from '../data/publications';

export default function CorregimientoDetailScreen({ 
  onNavigate, 
  onEdit,
  corregimientoName, 
  onSelectCorregimiento 
}: { 
  onNavigate: (s: ScreenType) => void, 
  onEdit?: (pub: any) => void,
  corregimientoName: string, 
  onSelectCorregimiento?: (c: string) => void 
}) {
  const { publications: publicationsMap } = usePublications();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
    if (hasMovedRef.current) {
      // Drag occurred, ignore click
      return;
    }
    if (onSelectCorregimiento) {
      onSelectCorregimiento(c);
    }
  };

  const [activeTab, setActiveTab] = useState('Eventos');

  const currentData = corregimientoData[corregimientoName] || corregimientoData['Pasto'];
  const currentPublications = (publicationsMap[corregimientoName] || []).filter(p => {
    if (activeTab === 'Eventos') return p.type === 'Eventos';
    if (activeTab === 'Posts Culturales') return p.type === 'Posts Culturales';
    if (activeTab === 'Experiencias') return p.type === 'Experiencias';
    return true;
  });

  const tabs = ['Eventos', 'Posts Culturales', 'Experiencias'];

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfaf5] pb-32">
      <Header onNavigate={onNavigate} title={corregimientoName} />
      
      <div className="relative z-0">
        <div 
          className="w-full h-[320px] bg-cover bg-center relative"
          style={{ backgroundImage: `url(${currentData.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#fdfaf5]"></div>
          
          <div className="absolute bottom-6 left-0 right-0 text-center px-4">
            <h1 className="text-5xl font-black text-white drop-shadow-lg mb-2 tracking-tight">{corregimientoName}</h1>
            <p className="text-white text-sm font-medium drop-shadow-md mx-auto max-w-[280px] leading-relaxed">
              {currentData.phrase}
            </p>
          </div>
        </div>
      </div>

      {/* Persistent search bar with suggestions */}
      <div className="px-5 mt-4 relative z-10 flex flex-col gap-3">
        <SearchWithSuggestions 
          onSelectCorregimiento={onSelectCorregimiento || (() => {})} 
        />
      </div>

      <div className="mt-6">
        <div className="flex overflow-x-auto scrollbar-hide px-5 gap-6 border-b-2 border-transparent">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap text-sm flex flex-col items-center gap-1.5 transition-colors ${activeTab === tab ? 'text-[#1B1C19] font-black' : 'text-gray-400 font-bold'}`}
            >
              {tab}
              <div className={`w-1.5 h-1.5 rounded-full ${activeTab === tab ? 'bg-[#8c2a38]' : 'bg-transparent'}`}></div>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 flex flex-col gap-5">
        
        {/* If we have publications for the current tab (Eventos or Posts Culturales), show them */}
        {(activeTab === 'Eventos' || activeTab === 'Posts Culturales') && currentPublications.length > 0 ? (
          <div className="flex flex-col gap-6">
            {currentPublications.map((pub, idx) => (
              <RecommendedCard
                key={pub.id || idx}
                id={pub.id}
                corregimiento={pub.corregimiento}
                category={pub.category}
                subTitle={pub.subTitle}
                title={pub.title}
                descriptionTitle={pub.descriptionTitle}
                dateRange={pub.dateRange}
                image={pub.image}
                location={pub.location}
                creatorId={pub.creatorId}
                onNavigate={onNavigate}
                onEdit={onEdit}
              />
            ))}
          </div>
        ) : (
          /* Empty state card if no publications for activeTab */
          <div className="bg-[#f2ece1] rounded-[20px] p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              <span className="material-symbols-outlined text-4xl text-[#f39233] mb-4">auto_awesome</span>
              <h3 className="text-2xl font-black text-[#1B1C19] mb-2 leading-tight">{currentData.welcomeTitle}</h3>
              <p className="text-gray-600 font-medium text-sm mb-6 max-w-[220px] leading-relaxed">
                {currentData.bulletText}
              </p>
              <p className="text-[#f39233] font-bold text-sm">
                 No hay más contenido disponible en {activeTab}
              </p>
          </div>
        )}

        {/* Map card */}
        <div className="bg-gradient-to-b from-[#e8e2d4] to-[#f0ece1] rounded-[20px] p-6 shadow-sm relative overflow-hidden pb-8">
            <h3 className="font-bold text-lg text-[#1B1C19] mb-1">Mapa Interactivo</h3>
            <p className="text-gray-600 text-xs font-medium mb-5">Ubica los puntos de interés en tiempo real.</p>
            <button 
              onClick={() => onNavigate('map')}
              className="w-full py-4 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Explorar {corregimientoName}
            </button>
        </div>
      </div>
    </div>
  );
}
