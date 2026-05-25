import React, { useState } from 'react';
import AttendanceConfirmationModal from './AttendanceConfirmationModal';
import { ScreenType } from '../types';
import { Publication } from '../data/publications';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface PublicationDetailModalProps {
  publication: Publication;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (s: ScreenType) => void;
}

export default function PublicationDetailModal({
  publication,
  isOpen,
  onClose,
  onNavigate
}: PublicationDetailModalProps) {
  const [attendanceStatus, setAttendanceStatus] = useState<'idle' | 'registering' | 'registered'>('idle');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const { user } = useAuth();

  // Check if already registered on mount/open
  React.useEffect(() => {
    if (isOpen) {
      const savedItemsStr = localStorage.getItem('saved_items');
      if (savedItemsStr) {
        try {
          const parsed = JSON.parse(savedItemsStr);
          if (Array.isArray(parsed)) {
            const isRegistered = parsed.some(item => 
              (item.title === publication.title && item.location === publication.location) ||
              item.status === 'Asistiré' && item.title === publication.title
            );
            if (isRegistered) setAttendanceStatus('registered');
          }
        } catch(e) {}
      }
    }
  }, [isOpen, publication.title, publication.location]);

  if (!isOpen) return null;

  const finalImage = publication.image || 'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=800&auto=format&fit=crop';
  const rating = 4.8; // default or from publication if added later

  const handleAttendClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

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
      
      const itemId = publication.title + '_' + publication.location;
      const isAlreadySaved = currentSaved.some(item => {
        return (item.title === publication.title && item.location === publication.location) || String(item.id) === String(itemId);
      });
      
      if (!isAlreadySaved) {
        const itemToSave = {
          id: itemId + '_' + Date.now(),
          title: publication.title,
          location: publication.location,
          date: publication.dateRange,
          image: finalImage,
          status: 'Asistiré'
        };
        const updated = [...currentSaved, itemToSave];
        localStorage.setItem('saved_items', JSON.stringify(updated));
      }
      
      // 2. Open confirmation modal and update state
      setAttendanceStatus('registered');
      setIsAttendanceModalOpen(true);
    }, 1200);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-[20px] max-w-md w-full overflow-hidden shadow-2xl relative animate-scale-up border border-orange-100 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
          
          {/* Header image with close button */}
          <div className="relative h-48 bg-stone-100 shrink-0">
            <img src={finalImage} alt={publication.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 active:scale-90 transition-transform focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="absolute bottom-4 left-5 right-5 text-white">
              <span className="px-2.5 py-1 bg-[#f39233] text-[#1B1C19] text-[9.5px] font-black uppercase rounded-full tracking-wider shadow">
                {publication.category}
              </span>
              <h3 className="text-xl font-black mt-2 drop-shadow truncate" style={{ fontFamily: '"Montserrat", sans-serif' }}>{publication.title}</h3>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 text-[#f39233] font-bold text-sm">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>{publication.dateRange}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span>Corregimiento de {publication.location}, Pasto</span>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-extrabold text-gray-800 text-sm mb-2">Sobre esta actividad</h4>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {publication.descriptionTitle}. Disfruta de una de las festividades más hermosas y representativas de nuestra región andina. Esta tradición se celebra con imponentes representaciones artísticas, música autóctona y de viento, y una hospitalidad que caracteriza a la comunidad de {publication.location}.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium mt-3">
                Te invitamos a recorrer las calles mágicas, degustar de los abundantes platos típicos y participar en los tradicionales encuentros organizados localmente.
              </p>
            </div>

            {/* Travel recommendation block */}
            <div className="bg-orange-50/50 rounded-[20px] p-4 border border-orange-100 mt-2 flex gap-3 items-center">
              <span className="material-symbols-outlined text-[#f39233] text-[28px]">info</span>
              <div className="text-xs">
                <p className="font-extrabold text-[#d57723]">Información útil</p>
                <p className="text-gray-600 mt-0.5 font-medium">Calificación de la zona: ⭐ {rating} / 5.0. No olvides llevar abrigo para clima andino y cámara para increíbles paisajes.</p>
              </div>
            </div>
          </div>

          {/* Footer with action */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
            <button 
              onClick={handleAttendClick}
              disabled={attendanceStatus === 'registering'}
              className="flex-1 py-3.5 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-md hover:bg-orange-400 disabled:bg-orange-300 disabled:cursor-not-allowed active:scale-95 transition-all text-center focus:outline-none flex items-center justify-center gap-2"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
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

      {/* Celebration Attendance Confirm Modal */}
      <AttendanceConfirmationModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onNavigate={onNavigate}
        eventDetail={{
          id: publication.title + '_' + publication.location,
          title: publication.title,
          location: publication.location,
          date: publication.dateRange,
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
                
                <h3 className="text-xl font-black text-[#30132e] mb-2 tracking-tight">¡Vive la experiencia!</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                  Para registrar tu asistencia y guardar favoritos, por favor accede a tu perfil de usuario.
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
                    MÁS TARDE
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
