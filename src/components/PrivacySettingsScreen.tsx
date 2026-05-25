import React, { useState } from 'react';
import { ScreenType } from '../types';

export default function PrivacySettingsScreen({ onNavigate }: { onNavigate: (s: ScreenType) => void }) {
  const [isPrivateProfile, setIsPrivateProfile] = useState(true);
  const [showLocation, setShowLocation] = useState(false);

  const handleChangePassword = () => {
    alert('Función de cambiar contraseña: Se ha enviado un correo de recuperación a tu cuenta vinculada.');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('¿ESTÁS SEGURO? Esta acción eliminará permanentemente tu cuenta y todos tus datos (perfil, publicaciones, guardados). Esta acción es irreversible.')) {
      alert('Tu cuenta ha sido eliminada. Redirigiendo a la pantalla de inicio...');
      onNavigate('welcome');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-12 w-full">
      <header className="bg-[#f39233] text-white flex items-center justify-between px-4 py-4 sticky top-0 z-50 h-[80px] w-full">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all focus:outline-none">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Seguridad y Privacidad</h1>
        <div className="w-10 h-10"></div>
      </header>
      
      <main className="flex-1 px-5 pt-8 flex flex-col items-center w-full">
         <div className="w-full max-w-md">
           <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">CONTRASEÑA</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <button 
               onClick={handleChangePassword}
               className="w-full flex items-center justify-between p-4.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">lock_reset</span>
                 <span className="font-medium text-sm">Cambiar contraseña</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">chevron_right</span>
             </button>
           </div>

           <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">PRIVACIDAD DE LA CUENTA</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <div className="w-full flex items-center justify-between p-4.5 border-b border-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">visibility_off</span>
                 <div className="flex flex-col items-start overflow-hidden text-left">
                   <span className="font-medium text-sm">Perfil Privado</span>
                   <span className="text-xs text-gray-500">Solo tus seguidores podrán ver tus reseñas</span>
                 </div>
               </div>
               <div 
                 onClick={() => setIsPrivateProfile(!isPrivateProfile)}
                 className={`relative inline-block w-10 h-5 mr-2 align-middle select-none transition duration-200 ease-in cursor-pointer rounded-full p-0.5 ${isPrivateProfile ? 'bg-[#f39233]' : 'bg-gray-300'}`}
               >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${isPrivateProfile ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
             </div>
             
             <div className="w-full flex items-center justify-between p-4.5 border-b border-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">location_on</span>
                 <div className="flex flex-col items-start overflow-hidden text-left">
                   <span className="font-medium text-sm">Mostrar ubicación</span>
                   <span className="text-xs text-gray-500">Compartir ubicación en publicaciones</span>
                 </div>
               </div>
               <div 
                  onClick={() => setShowLocation(!showLocation)}
                  className={`relative inline-block w-10 h-5 mr-2 align-middle select-none transition duration-200 ease-in cursor-pointer rounded-full p-0.5 ${showLocation ? 'bg-[#f39233]' : 'bg-gray-300'}`}
               >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${showLocation ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
             </div>
           </div>
           
           <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">DATOS Y PERMISOS</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <button 
               onClick={handleDeleteAccount}
               className="w-full flex items-center justify-between p-4.5 hover:bg-red-50 active:bg-red-100 transition-colors"
             >
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-red-500">delete_forever</span>
                 <span className="font-medium text-sm text-red-500">Eliminar cuenta</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">chevron_right</span>
             </button>
           </div>
         </div>
      </main>
    </div>
  );
}
