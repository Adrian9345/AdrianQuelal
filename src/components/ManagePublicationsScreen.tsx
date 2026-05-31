import React, { useState } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import { Publication } from '../data/publications';
import { usePublications } from '../contexts/PublicationsContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ManagePublicationsScreen({ onNavigate, onEdit }: { onNavigate: (s: ScreenType) => void, onEdit: (p: Publication) => void }) {
  const { publications: publicationsMap, deletePublication } = usePublications();
  const { user } = useAuth();
  const [confirmingDelete, setConfirmingDelete] = useState<Publication | null>(null);
  
  // Flatten all publications for display
  const allPublications = Object.values(publicationsMap).flat() as Publication[];

  const confirmDeleteAction = async () => {
    if (!confirmingDelete) return;
    try {
      await deletePublication(confirmingDelete.corregimiento, confirmingDelete.title, confirmingDelete.id);
      setConfirmingDelete(null);
      sessionStorage.setItem('reloadTargetScreen', 'home');
      window.location.reload();
    } catch (error) {
      alert('Error al eliminar la publicación');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-24 w-full text-left relative overflow-x-hidden">
      <Header 
        onNavigate={onNavigate} 
        onProfileClick={() => onNavigate('profile')} 
        showGreeting={false} 
        customTitle="Gestionar Publicaciones" 
      />

      <main className="flex-1 px-5 pt-6 flex flex-col w-full">
        <div className="mb-6 text-center">
          <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
            Aquí puedes gestionar todo el contenido de la plataforma. Edita o elimina cualquier card de corregimiento.
          </p>
        </div>

        <div className="space-y-4">
          {allPublications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
              <span className="material-symbols-outlined text-6xl mb-2">post_add</span>
              <p className="font-bold">No hay publicaciones disponibles</p>
            </div>
          ) : (
            allPublications.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all active:scale-[0.99]"
              >
                <div className="flex p-4 gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-gray-50 relative">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {item.type && (
                      <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-lg">
                        <span className="text-[7px] font-black text-white uppercase tracking-tighter">
                          {item.type === 'Eventos' ? 'Evento' : item.type === 'Posts Culturales' ? 'Post' : 'Exp'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-[10px] font-black text-[#f39233] uppercase tracking-wider">
                        {item.corregimiento}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {item.day ? `${item.day}/${(item.month || 0) + 1}` : 'Publicado'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-[#30132e] text-sm leading-tight mb-1 truncate tracking-tight">
                      {item.title}
                    </h3>
                  </div>
                </div>
                
                <div className="flex border-t border-gray-50">
                  <button 
                    onClick={() => onEdit(item)}
                    className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[11px] font-black text-[#30132e] hover:bg-gray-50 transition-colors border-r border-gray-50 tracking-widest"
                  >
                    <span className="material-symbols-outlined text-[18px] text-[#f39233]">edit_note</span>
                    EDITAR
                  </button>
                  <button 
                    onClick={() => setConfirmingDelete(item)}
                    className="flex-1 py-3.5 flex items-center justify-center gap-2 text-[11px] font-black text-red-500 hover:bg-red-50 transition-colors tracking-widest"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    ELIMINAR
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          onClick={() => onNavigate('create_content')}
          className="mt-8 w-full py-5 bg-white border-2 border-dashed border-[#f39233]/30 rounded-[32px] flex items-center justify-center gap-3 text-[#f39233] hover:bg-orange-50 transition-all active:scale-95 group"
        >
          <span className="material-symbols-outlined font-black text-[24px] group-hover:rotate-90 transition-transform duration-300">add_circle</span>
          <span className="font-black text-[13px] tracking-widest">CREAR NUEVA PUBLICACIÓN</span>
        </button>
      </main>

      {/* CUSTOM ADVERTENCIA MODAL */}
      <AnimatePresence>
        {confirmingDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingDelete(null)}
              className="fixed inset-0 bg-[#30132e]/40 backdrop-blur-sm z-[100]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-6 z-[101] pointer-events-none">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl pointer-events-auto flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
                </div>
                
                <h3 className="text-xl font-black text-[#30132e] mb-2 tracking-tight">¿Estás seguro?</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                  Estás a punto de eliminar <span className="text-[#30132e] font-black">"{confirmingDelete.title}"</span>. Esta acción no se puede deshacer.
                </p>

                <div className="flex flex-col w-full gap-3">
                  <button 
                    onClick={confirmDeleteAction}
                    className="w-full py-4 bg-red-500 text-white rounded-[24px] font-black text-sm tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                  >
                    SÍ, ELIMINAR AHORA
                  </button>
                  <button 
                    onClick={() => setConfirmingDelete(null)}
                    className="w-full py-4 bg-gray-100 text-gray-500 rounded-[24px] font-black text-sm tracking-widest active:scale-95 transition-transform"
                  >
                    NO, CANCELAR
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
