import React, { useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function PersonalInfoScreen({ onNavigate }: { onNavigate: (s: ScreenType) => void }) {
  const { user, profile, updateProfileName } = useAuth();
  const [name, setName] = useState('Usuario');
  const [username, setUsername] = useState('@usuario');
  const [email, setEmail] = useState('usuario@ejemplo.com');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    if (user?.email) setEmail(user.email);
  }, [profile, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (name !== profile?.name) {
        await updateProfileName(name);
      }
      onNavigate('profile');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-12 w-full">
      <header className="bg-[#f39233] text-white flex items-center justify-between px-4 py-4 sticky top-0 z-50 h-[80px] w-full">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all focus:outline-none">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Información Personal</h1>
        <div className="w-10 h-10"></div>
      </header>
      
      <main className="flex-1 px-5 pt-8 flex flex-col items-center w-full">
         <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Nombre completo</label>
             <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#f39233] focus:ring-1 focus:ring-[#f39233] transition-all" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Nombre de usuario</label>
             <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#f39233] focus:ring-1 focus:ring-[#f39233] transition-all" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Correo electrónico</label>
             <input type="email" value={email} disabled className="w-full bg-gray-200 border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none text-gray-500 cursor-not-allowed" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-gray-500 mb-1 block">Ubicación</label>
             <input type="text" defaultValue="Ubicación" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-[#f39233] focus:ring-1 focus:ring-[#f39233] transition-all" />
           </div>
           
           <button onClick={handleSave} disabled={loading} className="mt-4 w-full py-4 px-6 bg-[#f39233] text-white rounded-full font-extrabold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50">
             {loading ? 'Guardando...' : 'Guardar cambios'}
           </button>
         </div>
      </main>
    </div>
  );
}
