import React, { useState } from 'react';

export default function EnterCodeScreen({ onNavigateLogin, onVerifySuccess }: { onNavigateLogin: () => void, onVerifySuccess: () => void }) {
  const [code, setCode] = useState('');
  const bgImage = "/Recurso 1.png";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onVerifySuccess();
    } else {
      alert("Por favor ingresa un código válido de 6 dígitos.");
    }
  };

  return (
    <div 
      className="min-h-full flex flex-col items-center justify-center text-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("${bgImage}")` }}
    >
      <div className="relative z-10 w-full max-w-md mx-auto p-6 flex flex-col justify-center">
        <div className="text-center mb-6 px-2">
          <h1 className="block text-2xl font-bold leading-none text-[#F0EEE9] mb-4 whitespace-nowrap">Verifica tu correo</h1>
          <p className="text-sm text-[#F0EEE9] mt-6 font-medium">Ingresa el código de 6 dígitos que enviamos a tu correo electrónico.</p>
        </div>

        <form className="space-y-4" onSubmit={handleVerify}>
          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Código de Seguridad</label>
            <input 
              type="text" 
              placeholder="123456"
              value={code}
              onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="w-full px-6 py-3 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-center text-xl font-bold tracking-[0.5em]"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 px-8 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-xl active:scale-95 transition-transform mt-2"
          >
            Verificar Código
          </button>
        </form>

        <p className="text-center text-sm text-[#F0EEE9] mt-6 font-medium">
          <button className="text-[#f39233] hover:underline font-extrabold" onClick={onNavigateLogin} type="button">Cancelar</button>
        </p>

        <div className="mt-6 mb-4 flex justify-center gap-6">
          <span className="material-symbols-outlined text-[#F0EEE9] text-2xl">palette</span>
          <span className="material-symbols-outlined text-[#F0EEE9] text-2xl">celebration</span>
          <span className="material-symbols-outlined text-[#F0EEE9] text-2xl">landscape</span>
        </div>
      </div>
    </div>
  )
}
