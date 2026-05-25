import React from 'react';
import { ScreenType } from '../types';

export default function HelpSupportScreen({ onNavigate }: { onNavigate: (s: ScreenType) => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-12 w-full">
      <header className="bg-[#f39233] text-white flex items-center justify-between px-4 py-4 sticky top-0 z-50 h-[80px] w-full">
        <button onClick={() => onNavigate('profile')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all focus:outline-none">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Centro de Ayuda</h1>
        <div className="w-10 h-10"></div>
      </header>
      
      <main className="flex-1 px-5 pt-8 flex flex-col items-center w-full">
         <div className="w-full max-w-md">
           
           <div className="mb-6">
             <div className="relative flex items-center rounded-full px-5 py-3 bg-white border border-gray-200 shadow-sm focus-within:border-[#f39233] transition-all">
               <span className="material-symbols-outlined text-gray-500 mr-2">search</span>
               <input 
                 type="text" 
                 placeholder="¿En qué podemos ayudarte?" 
                 className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-full font-medium"
               />
             </div>
           </div>

           <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">PREGUNTAS FRECUENTES (FAQ)</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <button className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">article</span>
                 <span className="font-medium text-sm text-left">¿Cómo guardo un corregimiento?</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">add</span>
             </button>
             <button className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">article</span>
                 <span className="font-medium text-sm text-left">¿Cómo funciona el calendario de eventos?</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">add</span>
             </button>
             <button className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">article</span>
                 <span className="font-medium text-sm text-left">Quiero ser creador de contenido</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">add</span>
             </button>
           </div>
           
           <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">CONTACTO</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <button className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">mail</span>
                 <span className="font-medium text-sm">Enviar un correo electrónico</span>
               </div>
             </button>
             <button className="w-full flex items-center justify-between p-4.5 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">chat</span>
                 <span className="font-medium text-sm">Chatear con soporte</span>
               </div>
             </button>
           </div>
           
         </div>
      </main>
    </div>
  );
}
