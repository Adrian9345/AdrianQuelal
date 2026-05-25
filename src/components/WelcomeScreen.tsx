import React from 'react';
import { ScreenType } from '../types';

interface WelcomeScreenProps {
  onNavigateLogin: () => void;
  onNavigateGuest: () => void;
}

export default function WelcomeScreen({ onNavigateLogin, onNavigateGuest }: WelcomeScreenProps) {
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white overflow-hidden bg-white"
      style={{
        backgroundImage: 'url("/Recurso 1.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full flex flex-col items-center justify-center animate-fade-in mb-12">
        <img 
          src="/Recurso 9.png" 
          alt="Logo" 
          className="w-56 h-auto drop-shadow-2xl" 
        />
      </div>

      <div className="w-full space-y-4 animate-slide-up max-w-sm">
        <button 
          onClick={onNavigateLogin}
          className="w-full py-4 rounded-full text-sm font-black bg-[#f39233] text-[#1B1C19] shadow-[0_4px_20px_rgba(243,146,51,0.3)] hover:bg-orange-400 active:scale-[0.98] transition-all"
          style={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          INICIAR SESIÓN
        </button>

        <button 
          onClick={onNavigateGuest}
          className="w-full py-2 text-sm font-bold text-white/80 hover:text-white active:scale-95 transition-all"
        >
          ENTRAR COMO INVITADO
        </button>

        <p className="text-center text-[11px] text-[#F0EEE9]/40 font-medium pt-4">
          Al continuar, aceptas nuestros <span className="underline">Términos</span> y <span className="underline">Políticas</span>
        </p>
      </div>
    </div>
  );
}
