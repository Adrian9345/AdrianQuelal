import React, { useState } from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePublications } from '../contexts/PublicationsContext';
import PublicationDetailModal from './PublicationDetailModal';
import { Publication } from '../data/publications';

interface RecommendedCardProps {
  key?: string | number;
  id?: string;
  corregimiento?: string;
  category: string;
  subTitle: string;
  title: string;
  descriptionTitle: string;
  dateRange: string;
  image: string;
  location: string;
  rating?: number;
  creatorId?: string;
  onNavigate?: (s: ScreenType) => void;
  onEdit?: (pub: any) => void;
  onRemove?: () => void;
}

export default function RecommendedCard({
  id,
  corregimiento,
  category,
  subTitle,
  title,
  descriptionTitle,
  dateRange,
  image,
  location,
  rating = 4.8,
  creatorId,
  onNavigate,
  onEdit,
  onRemove
}: RecommendedCardProps) {
  const { profile, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fallback image handling
  const finalImage = image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop';

  const getContainerStyles = () => {
    const c = category.toLowerCase();
    if (c.includes('cultura')) return 'bg-purple-50/40 hover:bg-purple-50 border-purple-100/60';
    if (c.includes('tradic')) return 'bg-orange-50/40 hover:bg-orange-50 border-orange-100/60';
    if (c.includes('gastronom')) return 'bg-red-50/40 hover:bg-red-50 border-red-100/60';
    if (c.includes('cosmo')) return 'bg-teal-50/30 hover:bg-teal-50/60 border-teal-100/60';
    if (c.includes('deporte')) return 'bg-stone-50 hover:bg-stone-100 border-stone-200/60';
    return 'bg-[#f9f9fb] hover:bg-[#fffcf7] border-[#f0ecdf]/60';
  };

  const handleOpenDetails = () => {
    setIsModalOpen(true);
  };

  const pubForModal: Publication = {
    id,
    corregimiento: corregimiento || '',
    category,
    subTitle,
    title,
    descriptionTitle,
    dateRange,
    image: finalImage,
    location,
    creatorId,
    type: 'Eventos' // default as we don't have it in props easy
  };

  return (
    <>
      {/* Draggable-safe / Clickable Horizontal Card Container precisely matching reference image */}
      <div 
        onClick={handleOpenDetails}
        className={`w-full rounded-[20px] p-3 border flex items-center gap-4 cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-sm ${getContainerStyles()}`}
      >
        {/* Left Side: Thumbnail Image with rounded corners */}
        <div className="w-28 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm bg-stone-100 relative">
          <img 
            src={finalImage} 
            alt={title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Side: Information Panel */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <h3 
              className="text-sm font-bold text-gray-900 truncate leading-snug tracking-tight"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              {title}
            </h3>
            
            {/* "By Author" style subtitle */}
            <p 
              className="text-[11px] font-semibold text-[#0a7e93] mt-0.5"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              Por {location}
            </p>

            {/* Rating Section with golden star */}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-600 font-extrabold select-none">
              <span className="material-symbols-outlined text-[14px] text-amber-500 fill-amber-500">star</span>
              <span className="font-mono text-[11px]">{rating.toFixed(1)}</span>
              <span className="text-[9.5px] text-gray-400 font-normal ml-1">({category})</span>
            </div>
          </div>

          {/* Dark Pill-shape Action Button with edit action next to it */}
          <div className="mt-2 flex items-center gap-2">
            <span 
              className="px-3.5 py-1 bg-[#0b2b40] hover:bg-[#071f30] text-white text-[10.5px] font-medium rounded-lg transition-colors inline-block text-center shadow-sm"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              Ver evento
            </span>

            {profile?.isCreator && (user?.uid === creatorId || profile?.isCreator) && onNavigate && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) {
                    onEdit({
                      id,
                      corregimiento,
                      category,
                      subTitle,
                      title,
                      descriptionTitle,
                      dateRange,
                      image,
                      location,
                      creatorId
                    });
                  } else if (onNavigate) {
                    onNavigate('create_content');
                  }
                }}
                className="w-7 h-7 bg-[#f39233] text-white rounded-lg flex items-center justify-center shadow-sm hover:bg-orange-600 transition-all active:scale-90"
                title="Editar"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
            )}

            {onRemove && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="w-7 h-7 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shadow-sm hover:bg-red-100 transition-all active:scale-90 ml-auto"
                title="Quitar"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <PublicationDetailModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        publication={pubForModal}
        onNavigate={onNavigate}
      />
    </>
  );
}
