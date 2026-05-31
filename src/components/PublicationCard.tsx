import React, { useState } from 'react';
import AttendanceConfirmationModal from './AttendanceConfirmationModal';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface PublicationCardProps {
  key?: string | number;
  category?: string;
  subTitle?: string;
  title?: string;
  descriptionTitle?: string;
  dateRange?: string;
  image?: string;
  location?: string;
  onActionClick?: () => void;
  onNavigate?: (s: ScreenType) => void;
}

export default function PublicationCard({
  category = 'CULTURAL',
  subTitle = 'CARNAVAL DE NEGROS Y BLANCOS',
  title = 'DESFILE MAGNO',
  descriptionTitle = 'Patrimonio inmaterial imperdible',
  dateRange = '2 - 7 de enero',
  image = 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop',
  location = 'Pasto',
  onActionClick,
  onNavigate
}: PublicationCardProps) {
  const { profile, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'registering' | 'registered'>('idle');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  // Default beautiful images for fallback or specific locations
  const finalImage = image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop';

  const getCategoryStyles = () => {
    const c = category.toLowerCase();
    if (c.includes('cultura')) return { 
      bg: 'bg-[#30132e]', text: 'text-white', subtitle: 'text-orange-200/90', buttonBg: 'bg-[#f39233]', buttonText: 'text-[#1B1C19]', badgeText: 'text-orange-100', patternColor: 'white' 
    };
    if (c.includes('tradic')) return { 
      bg: 'bg-[#f39233]', text: 'text-white', subtitle: 'text-orange-100/90', buttonBg: 'bg-white', buttonText: 'text-[#f39233]', badgeText: 'text-orange-50', patternColor: 'white' 
    };
    if (c.includes('gastronom')) return { 
      bg: 'bg-[#d32f2f]', text: 'text-white', subtitle: 'text-red-100/90', buttonBg: 'bg-white', buttonText: 'text-[#d32f2f]', badgeText: 'text-red-50', patternColor: 'white' 
    };
    if (c.includes('cosmo')) return { 
      bg: 'bg-[#0f4c5c]', text: 'text-white', subtitle: 'text-teal-100/90', buttonBg: 'bg-[#f39233]', buttonText: 'text-[#1B1C19]', badgeText: 'text-teal-50', patternColor: 'white' 
    };
    if (c.includes('deporte')) return { 
      bg: 'bg-white', text: 'text-[#30132e]', subtitle: 'text-gray-500', buttonBg: 'bg-[#f39233]', buttonText: 'text-[#1B1C19]', badgeText: 'text-gray-600', patternColor: '#30132e' 
    };
    return { 
      bg: 'bg-[#30132e]', text: 'text-white', subtitle: 'text-orange-200/90', buttonBg: 'bg-[#f39233]', buttonText: 'text-[#1B1C19]', badgeText: 'text-orange-100', patternColor: 'white' 
    };
  };

  const styles = getCategoryStyles();

  const handleAttendClick = () => {
    if (!user || user.isAnonymous) {
      setShowGuestWarning(true);
      return;
    }

    setAttendanceStatus('registering');
    
    setTimeout(() => {
      // 1. Auto-save to localStorage 'saved_items'
      let currentSaved: any[] = [];
      const savedItemsStr = localStorage.getItem('saved_items');
      if (savedItemsStr) {
        try {
          const parsed = JSON.parse(savedItemsStr);
          if (Array.isArray(parsed)) currentSaved = parsed;
        } catch(e) {
          console.error("Error reading saved items", e);
        }
      }
      
      const itemId = title + '_' + location;
      const isAlreadySaved = currentSaved.some(item => {
        return (item.title === title && item.location === location) || String(item.id) === String(itemId);
      });
      
      if (!isAlreadySaved) {
        const itemToSave = {
          id: itemId + '_' + Date.now(),
          title: title,
          location: location,
          date: dateRange,
          image: finalImage,
          status: 'Asistiré'
        };
        const updated = [...currentSaved, itemToSave];
        localStorage.setItem('saved_items', JSON.stringify(updated));
      }
      
      // 2. Open confirmation modal and update state
      setAttendanceStatus('registered');
      setIsAttendanceModalOpen(true);
      
      // Trigger callback if defined
      if (onActionClick) onActionClick();
    }, 1200);
  };

  const handleOpenDetails = () => {
    // Check if already registered
    const savedItemsStr = localStorage.getItem('saved_items');
    if (savedItemsStr) {
      try {
        const parsed = JSON.parse(savedItemsStr);
        if (Array.isArray(parsed)) {
          const isRegistered = parsed.some(item => 
            (item.title === title && item.location === location) ||
            item.status === 'Asistiré' && item.title === title
          );
          if (isRegistered) {
            setAttendanceStatus('registered');
          } else {
            setAttendanceStatus('idle');
          }
        }
      } catch(e) {
        setAttendanceStatus('idle');
      }
    } else {
      setAttendanceStatus('idle');
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto bg-white rounded-[20px] overflow-hidden shadow-2xl border border-gray-150 relative flex flex-col hover:shadow-orange-200/20 hover:scale-[1.01] transition-all duration-300">
        
        {/* Top Image Section */}
        <div className="relative w-full aspect-[8/9] overflow-hidden" style={{ aspectRatio: '8/9' }}>
          <img 
            src={finalImage} 
            alt={title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {/* Subtle dark gradient on top */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent"></div>

          {/* Pasto logo sticker (Top Right) */}
          <div className="absolute top-4 right-4 flex h-9 rounded-md overflow-hidden shadow-md text-[8px] sm:text-[9px] font-black tracking-wider uppercase">
            <div className="bg-[#f39233] px-2.5 flex items-center justify-center text-white" style={{ fontFamily: 'Georgia, serif' }}>
              <span className="italic transform -rotate-6 font-extrabold text-xs lowercase leading-none">Pasto</span>
            </div>
            <div className="bg-[#1e3c72] px-2 flex flex-col justify-center text-white leading-[1.1] text-[7px] max-w-[70px]">
              <span className="font-extrabold text-[8px] text-sky-300">Capital</span>
              <span className="opacity-90">Turística del sur</span>
            </div>
          </div>

          {/* Creator Actions - Removed and moved next to 'Ver más' */}
          {profile?.isCreator && onNavigate && (
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
              {/* Optional: Add other creator actions here if needed */}
            </div>
          )}

          {/* Bottom fade & text block inside the image */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white/80 to-transparent pt-16 pb-4 px-5 text-center flex flex-col justify-end items-center">
            <p className="text-[10px] font-extrabold text-gray-500 tracking-widest uppercase mb-1.5 leading-tight max-w-[90%]">
              {subTitle}
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#d57723] tracking-tight drop-shadow-sm leading-none uppercase" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {title}
            </h3>
          </div>
        </div>

        {/* Bottom Slate-Purple Section */}
        <div className={`${styles.bg} ${styles.text} py-6 px-6 relative flex flex-col items-center text-center overflow-hidden min-h-[170px] justify-between`}>
          
          {/* Pre-Columbian/Tribal Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <pattern id={`tribal-pattern-${title}`} width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 0 30 L 30 0 L 60 30 L 30 60 Z M 15 30 L 30 15 L 45 30 L 30 45 Z" fill="none" stroke={styles.patternColor} strokeWidth="1.5" />
                <path d="M 30 0 L 30 60 M 0 30 L 60 30" fill="none" stroke={styles.patternColor} strokeWidth="1" strokeDasharray="2,2" />
                <circle cx="30" cy="30" r="3" fill={styles.patternColor} />
              </pattern>
              <rect width="100%" height="100%" fill={`url(#tribal-pattern-${title})`} />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full mb-3">
            <h4 className="text-xl font-bold tracking-tight mb-1.5 px-2 line-clamp-2 leading-snug">
              {descriptionTitle}
            </h4>
            <p className={`text-sm font-semibold ${styles.subtitle} tracking-wide`}>
              {dateRange}
            </p>
          </div>

          <div className="relative z-10 w-full flex items-center justify-center gap-3 px-4 mb-2">
            <button
              onClick={() => {
                handleOpenDetails();
                if (onActionClick) onActionClick();
              }}
              className={`flex-1 py-3 ${styles.buttonBg} ${styles.buttonText} hover:opacity-90 rounded-full font-medium text-sm shadow-lg active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2`}
            >
              Ver más
            </button>

            {profile?.isCreator && onNavigate && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('manage_publications');
                }}
                className="w-11 h-11 bg-white/20 backdrop-blur shadow-lg rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#f39233] transition-all active:scale-90 border border-white/30"
                title="Editar"
              >
                <span className="material-symbols-outlined text-[22px]">edit</span>
              </button>
            )}
          </div>

          {/* Bottom trapezoid / badge for Category */}
          <div className="absolute bottom-0 inset-x-0 flex justify-center h-7 pointer-events-none">
            <div className="bg-black/80 border-t border-x border-[#f39233]/30 px-6 rounded-t-xl flex items-center justify-center relative shadow-inner">
              <span className={`text-[10px] font-black tracking-[0.2em] ${styles.badgeText} uppercase translate-y-[1px]`}>
                {category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[20px] max-w-md w-full overflow-hidden shadow-2xl relative animate-scale-up border border-orange-100 flex flex-col max-h-[90vh]">
            
            {/* Header image with close button */}
            <div className="relative h-48 bg-stone-100">
              <img src={finalImage} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition-transform focus:outline-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="px-2.5 py-1 bg-[#f39233] text-[#1B1C19] text-[9.5px] font-black uppercase rounded-full tracking-wider shadow">
                  {category}
                </span>
                <h3 className="text-xl font-bold mt-2 drop-shadow">{descriptionTitle}</h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2 text-[#f39233] font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                <span>{dateRange}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                <span>Corregimiento de {location}, Pasto</span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-extrabold text-gray-800 text-sm mb-2">Sobre esta actividad</h4>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Disfruta de una de las festividades más representativas de nuestra región andina. Esta tradición se celebra con impresionantes representaciones artísticas, música de viento andino y las deliciosas «guaguas de pan», esculturas artesanales comestibles que reflejan la gran abundancia agrícola y la rica herencia indígena de {location}.
                </p>
                <p className="text-sm text-gray-600 leading-relaxed font-medium mt-3">
                  Te invitamos a recorrer las calles decoradas, conocer a los maestros artesanos, degustar de los platos típicos y participar en los tradicionales bailes ancestrales organizados por la comunidad de este hermoso corregimiento.
                </p>
              </div>

              <div className="bg-orange-50/50 rounded-[20px] p-4 border border-orange-100 mt-2 flex gap-3 items-center">
                <span className="material-symbols-outlined text-[#f39233] text-[28px]">info</span>
                <div className="text-xs">
                  <p className="font-extrabold text-[#d57723]">Recomendación de viaje</p>
                  <p className="text-gray-600 mt-0.5 font-medium">Llevar ropa abrigada y calzado cómodo. El transporte público sale periódicamente desde el centro de Pasto.</p>
                </div>
              </div>
            </div>

            {/* Footer with action */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button 
                onClick={handleAttendClick}
                disabled={attendanceStatus === 'registering'}
                className="flex-1 py-3.5 bg-[#f39233] text-[#1B1C19] rounded-full font-medium text-sm shadow-md hover:bg-orange-400 disabled:bg-orange-300 disabled:cursor-not-allowed active:scale-95 transition-all text-center focus:outline-none flex items-center justify-center gap-2"
              >
                {attendanceStatus === 'registering' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-[#1B1C19]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Registrando...</span>
                  </>
                ) : attendanceStatus === 'registered' ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    <span>¡Asistiré!</span>
                  </>
                ) : (
                  '¡Quiero Asistir!'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Attendance Confirm Modal */}
      <AttendanceConfirmationModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onNavigate={onNavigate}
        eventDetail={{
          id: title + '_' + location,
          title: title,
          location: location,
          date: dateRange,
          image: finalImage
        }}
      />
      
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
                
                <h3 className="text-xl font-black text-[#30132e] mb-2 tracking-tight">¡Bienvenido!</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                  Para registrar tu asistencia y guardar tus eventos favoritos, por favor dirígete a tu perfil e inicia sesión.
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
                    CONTINUAR EXPLORANDO
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}
