import React from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function BottomNav({ currentScreen, onNavigate }: { currentScreen: ScreenType, onNavigate: (s: ScreenType) => void }) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navItems = [
    { id: 'home', icon: 'home', label: t('home') },
    { id: 'calendar', icon: 'calendar_month', label: t('calendar') },
    { id: 'corregimientos', icon: 'terrain', label: 'Corregimientos' },
    { id: 'map', icon: 'explore', label: t('map') },
  ] as const;

  const isAccountsManager = currentScreen === 'accounts_manager';
  const showCreatorAdd = profile?.isCreator;

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex justify-center w-full max-w-[390px] px-4 pb-4">
      <nav className="bg-[#30132e] text-white px-2 py-3 shadow-2xl w-full rounded-2xl pointer-events-auto">
        <div className="flex items-center justify-around w-full h-full">
          {isAccountsManager ? (
            <button 
              onClick={() => onNavigate('register')} 
              className="flex flex-col items-center gap-1 group py-1 justify-center focus:outline-none w-full"
            >
              <span className="material-symbols-outlined text-2xl text-[#f39233]">
                person_add
              </span>
              <span className="text-[10px] font-semibold text-[#f39233]">
                Agregar
              </span>
            </button>
          ) : (
            <>
              {navItems.map((item, idx) => {
                const isActive = currentScreen === item.id || (item.id === 'corregimientos' && currentScreen === 'corregimiento_detail');
                const isAfterSecond = idx === 2;
                
                return (
                  <React.Fragment key={item.id}>
                    {showCreatorAdd && isAfterSecond && (
                      <button 
                        onClick={() => onNavigate('create_content')} 
                        className="flex flex-col items-center gap-0.5 group justify-center focus:outline-none w-full"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform -translate-y-4 border-4 border-[#30132e] transition-all ${currentScreen === 'create_content' ? 'bg-white scale-110' : 'bg-[#f39233]'}`}>
                          <span className={`material-symbols-outlined text-2xl font-bold ${currentScreen === 'create_content' ? 'text-[#f39233]' : 'text-[#30132e]'}`}>
                            add
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold -mt-3 transition-colors ${currentScreen === 'create_content' ? 'text-white' : 'text-[#f39233]'}`}>
                          Crear
                        </span>
                      </button>
                    )}
                    <button 
                      onClick={() => onNavigate(item.id)} 
                      className="flex flex-col items-center gap-1 group py-1 justify-center focus:outline-none w-full"
                    >
                      <span className={`material-symbols-outlined text-2xl transition-colors ${isActive ? 'text-[#f39233] opacity-100' : 'text-white opacity-80 group-hover:opacity-100'}`}>
                        {item.icon}
                      </span>
                      <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-[#f39233]' : 'text-white opacity-80 group-hover:opacity-100'}`}>
                        {item.label}
                      </span>
                    </button>
                  </React.Fragment>
                )
              })}
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
