import React, { useState } from 'react';
import { loginWithEmail, googleSignIn } from '../firebaseAuth';

export default function LoginScreen({ onLogin, onNavigateRegister, onNavigateForgotPassword }: { onLogin: () => void, onNavigateRegister: () => void, onNavigateForgotPassword: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const bgImage = "/Recurso 1.png";
  const logoUrl = "/Recurso 9.png";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await googleSignIn();
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div 
      className="min-h-full flex flex-col items-center justify-center text-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("${bgImage}")` }}
    >
      <div className="relative z-10 w-full max-w-md mx-auto p-8 flex flex-col justify-center h-full min-h-full">
        <div className="text-center mb-8">
          <span className="block text-xl font-bold leading-none text-[#F0EEE9] mb-4">Bienvenido a</span>
          <img src={logoUrl} alt="RAIGAL Logo" className="mx-auto w-[260px] drop-shadow-xl" />
          <p className="text-base text-[#F0EEE9] mt-6 font-medium">Ingresa para continuar explorando nuestra herencia.</p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-4 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Contraseña</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-4 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
                required
              />
              <span 
                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#F0EEE9] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 px-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded border-[#F0EEE9] bg-transparent text-[#f39233] focus:ring-[#f39233]" />
              <span className="text-xs text-[#F0EEE9] font-medium">Recordarme</span>
            </label>
            <button type="button" onClick={onNavigateForgotPassword} className="text-xs text-[#f39233] hover:underline font-bold">¿Olvidaste tu contraseña?</button>
          </div>

          {error && <div className="text-red-400 text-xs font-bold text-center px-1">{error}</div>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-8 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="relative flex py-8 items-center">
          <div className="flex-grow border-t border-[#F0EEE9]/40"></div>
          <span className="flex-shrink mx-4 text-xs text-[#F0EEE9] uppercase tracking-wider font-semibold">o continúa con</span>
          <div className="flex-grow border-t border-[#F0EEE9]/40"></div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full py-3.5 rounded-full text-xs font-bold bg-white/10 text-[#F0EEE9] border border-[#F0EEE9] hover:bg-white/20 transition-colors">
            Google
          </button>
        </div>

        <p className="text-center text-sm text-[#F0EEE9] pt-8 font-medium">
          ¿No tienes una cuenta? <button className="text-[#f39233] hover:underline font-extrabold" onClick={onNavigateRegister}>Regístrate</button>
        </p>

        <div className="mt-8 mb-4 flex justify-center gap-6">
          <span className="material-symbols-outlined text-[#F0EEE9] text-2xl">palette</span>
          <span className="material-symbols-outlined text-[#F0EEE9] text-2xl">celebration</span>
          <span className="material-symbols-outlined text-[#F0EEE9] text-2xl">landscape</span>
        </div>
      </div>
    </div>
  )
}
