import React, { useState, useEffect } from 'react';
import Header from './Header';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseAuth';
import { collection, query, getDocs } from 'firebase/firestore';

interface UserAccount {
  id: string;
  name: string;
  photoURL: string | null;
  email: string;
  active: boolean;
}

export default function AccountsManagerScreen({ onNavigate }: { onNavigate: (s: ScreenType) => void }) {
  const { user, profile } = useAuth();
  // Mock accounts for multi-profile feel as we don't have real multi-auth state storage yet
  // Usually this would be managed by local storage or a more complex auth wrapper
  const [accounts, setAccounts] = useState<UserAccount[]>([
    { 
      id: user?.uid || '1', 
      name: profile?.name || user?.email?.split('@')[0] || 'Usuario Actual', 
      photoURL: profile?.photoURL || null, 
      email: user?.email || '', 
      active: true 
    },
    { 
      id: '2', 
      name: 'Maria Clara', 
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', 
      email: 'mclara@example.com', 
      active: false 
    }
  ]);

  const handleSwitchAccount = (id: string) => {
    setAccounts(prev => prev.map(acc => ({ ...acc, active: acc.id === id })));
    // In a real app, this would trigger a token switch or re-auth
    setTimeout(() => {
      onNavigate('home');
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-24 w-full">
      <Header 
        onNavigate={onNavigate} 
        onProfileClick={() => onNavigate('profile')} 
        showGreeting={false} 
        customTitle="Cuentas" 
      />

      <main className="flex-1 px-5 pt-6 flex flex-col w-full">
        <button 
          onClick={() => onNavigate('profile')}
          className="self-start mb-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#30132e] shadow-sm border border-stone-100 hover:bg-stone-50 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-xl font-bold text-[#30132e] mb-4">Gestionar perfiles</h2>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Cambia entre tus cuentas guardadas o añade una nueva para descubrir más experiencias.
          </p>

          <div className="space-y-4">
            {accounts.map(account => (
              <div 
                key={account.id}
                onClick={() => handleSwitchAccount(account.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  account.active 
                    ? 'border-[#f39233] bg-orange-50/50 shadow-sm' 
                    : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                    {account.photoURL ? (
                      <img src={account.photoURL} alt={account.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-stone-400">person</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`font-bold text-sm truncate ${account.active ? 'text-[#30132e]' : 'text-gray-700'}`}>
                      {account.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate tracking-wide">
                      {account.email}
                    </span>
                  </div>
                </div>
                {account.active ? (
                  <div className="w-6 h-6 bg-[#f39233] rounded-full flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1"></div>

        <div className="bg-orange-100/40 rounded-3xl p-5 border border-orange-200/50 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-[#f39233] rounded-full flex items-center justify-center text-white mb-3 shadow-md">
            <span className="material-symbols-outlined text-2xl">person_add</span>
          </div>
          <h3 className="font-bold text-[#30132e] text-sm mb-1">Añadir cuenta</h3>
          <p className="text-[11px] text-orange-800/70 font-medium px-4">
            Comparte tu dispositivo con amigos o familiares sin mezclar tus descubrimientos.
          </p>
          <button 
            onClick={() => onNavigate('register')}
            className="mt-4 px-6 py-2 bg-white text-[#f39233] border border-[#f39233]/30 rounded-full font-bold text-xs hover:bg-[#f39233] hover:text-white transition-all active:scale-95 shadow-sm"
          >
            Empezar ahora
          </button>
        </div>
      </main>
    </div>
  );
}
