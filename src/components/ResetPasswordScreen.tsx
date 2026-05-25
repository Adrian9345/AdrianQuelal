import React, { useState } from 'react';

export default function ResetPasswordScreen({ onResetSuccess, onCancel }: { onResetSuccess: () => void, onCancel: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const bgImage = "/Recurso 1.png";

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirmPassword) {
      setError("La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación.");
      return;
    }
    setError('');
    alert("Contraseña restablecida exitosamente.");
    onResetSuccess();
  };

  return (
    <div 
      className="min-h-full flex flex-col items-center justify-center text-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("${bgImage}")` }}
    >
      <div className="relative z-10 w-full max-w-md mx-auto p-6 flex flex-col justify-center">
        <div className="text-center mb-6 px-2">
          <h1 className="block text-xl font-bold leading-none text-[#F0EEE9] mb-4 whitespace-nowrap">Crea una nueva contraseña</h1>
          <p className="text-sm text-[#F0EEE9] mt-6 font-medium">Por favor, introduce tu nueva contraseña segura.</p>
        </div>

        <form className="space-y-4" onSubmit={handleReset}>
          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Nueva Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-3 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
                required
              />
              <span 
                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EEE9] cursor-pointer text-xl"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-6 py-3 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
                required
              />
              <span 
                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EEE9] cursor-pointer text-xl"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-xs font-bold text-center px-2">
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 px-8 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-xl active:scale-95 transition-transform mt-2"
          >
            Restablecer Contraseña
          </button>
        </form>

        <p className="text-center text-sm text-[#F0EEE9] mt-6 font-medium">
          <button className="text-[#f39233] hover:underline font-extrabold" onClick={onCancel} type="button">Cancelar</button>
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
