import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Language {
  id: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { id: 'es_LA', name: 'Español (Latinoamérica)', nativeName: 'Español' },
  { id: 'es_ES', name: 'Español (España)', nativeName: 'Español' },
  { id: 'en_US', name: 'English (US)', nativeName: 'English' },
  { id: 'en_UK', name: 'English (UK)', nativeName: 'English' },
  { id: 'pt_BR', name: 'Português (Brasil)', nativeName: 'Português' },
  { id: 'fr_FR', name: 'Français', nativeName: 'Français' },
  { id: 'it_IT', name: 'Italiano', nativeName: 'Italiano' },
  { id: 'de_DE', name: 'Deutsch', nativeName: 'Deutsch' },
];

export default function LanguageSettingsScreen({ onNavigate }: { onNavigate: (s: ScreenType) => void }) {
  const { language: currentLang, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLang);

  useEffect(() => {
    setSelectedLanguage(currentLang);
  }, [currentLang]);

  const handleSelect = (id: string) => {
    setSelectedLanguage(id as any);
  };

  const handleConfirm = () => {
    setLanguage(selectedLanguage as any);
    onNavigate('profile');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-24 w-full relative">
      <header className="bg-[#f39233] text-white flex items-center justify-between px-4 py-4 sticky top-0 z-50 h-[80px] w-full">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all focus:outline-none">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">{t('language_preferences')}</h1>
        <div className="w-10 h-10"></div>
      </header>
      
      <main className="flex-1 px-5 pt-8 flex flex-col items-center w-full pb-10">
         <div className="w-full max-w-md">
           <div className="flex items-center justify-between mb-3 px-1">
             <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] uppercase">SELECCIONAR IDIOMA</h3>
             <span className="text-[10px] font-bold text-[#f39233] bg-[#f39233]/10 px-2 py-0.5 rounded-full">AUTO</span>
           </div>
           
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             {languages.map((lang, index) => (
               <button 
                 key={lang.id}
                 onClick={() => handleSelect(lang.id)}
                 className={`w-full flex items-center justify-between p-4.5 border-b border-gray-50 last:border-0 transition-colors ${
                   selectedLanguage === lang.id ? 'bg-[#f39233]/5' : 'hover:bg-gray-50'
                 }`}
               >
                 <div className="flex flex-col items-start">
                   <span className={`font-medium text-sm ${selectedLanguage === lang.id ? 'text-[#f39233] font-bold' : 'text-[#30132e]'}`}>
                     {lang.name}
                   </span>
                   <span className="text-[10px] text-gray-400 font-medium">{lang.nativeName}</span>
                 </div>
                 {selectedLanguage === lang.id && (
                   <span className="material-symbols-outlined text-[#f39233]">check_circle</span>
                 )}
               </button>
             ))}
           </div>

           <div className="bg-[#fbf9f4] p-4 rounded-2xl border border-dashed border-gray-300">
             <p className="text-xs text-gray-500 text-center italic">
               * El idioma seleccionado se aplicará a la interfaz de usuario y las notificaciones. El contenido de las publicaciones se mantendrá en su idioma original.
             </p>
           </div>
         </div>
      </main>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#fbf9f4]/80 backdrop-blur-md border-t border-gray-100 flex justify-center z-40">
        <button 
          onClick={handleConfirm}
          className="w-full max-w-md bg-[#f39233] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#f39233]/20 active:scale-[0.98] transition-all"
        >
          {t('confirm_selection')}
        </button>
      </div>
    </div>
  );
}
