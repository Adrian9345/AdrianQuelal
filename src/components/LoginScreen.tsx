import React, { useState, useEffect } from 'react';
import { loginWithEmail, googleSignIn } from '../firebaseAuth';
import firebaseConfig from '../../firebase-applet-config.json';

export default function LoginScreen({ onLogin, onNavigateRegister, onNavigateForgotPassword }: { onLogin: () => void, onNavigateRegister: () => void, onNavigateForgotPassword: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDomainHelper, setShowDomainHelper] = useState(false);
  const [showAuthHelper, setShowAuthHelper] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'adrian-quelal.vercel.app';
  const projectId = firebaseConfig?.projectId || 'reliable-granite-k5xj8';

  useEffect(() => {
    const prefEmail = localStorage.getItem('raigal_switch_pref_email');
    if (prefEmail) {
      setEmail(prefEmail);
      localStorage.removeItem('raigal_switch_pref_email');
    }
  }, []);

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
      const msg = err?.message || '';
      if (msg.includes('auth/operation-not-allowed')) {
        setError('El inicio de sesión con Correo/Contraseña no está habilitado en tu proyecto de Firebase.');
        setShowAuthHelper(true);
      } else if (msg.includes('unauthorized-domain') || msg.includes('dominio no autorizado')) {
        setError('Este dominio no cuenta con autorización en tu consola de Firebase.');
        setShowDomainHelper(true);
      } else {
        setError(msg || 'Error al iniciar sesión');
      }
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
      console.error("Google sign in error details:", err);
      const msg = err?.message || '';
      const code = err?.code || '';
      if (msg.includes('unauthorized-domain') || code.includes('unauthorized-domain') || msg.includes('dominio no autorizado')) {
        setError('Este dominio no está autorizado en tu consola de Firebase.');
        setShowDomainHelper(true);
      } else {
        setError(msg || 'Error al iniciar sesión con Google');
      }
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

          {error && (
            <div className="text-red-400 text-xs font-bold text-center px-1 space-y-2">
              <div>{error}</div>
              {(error.includes('dominio no autorizado') || error.includes('unauthorized-domain') || showDomainHelper) && (
                <button
                  type="button"
                  onClick={() => setShowDomainHelper(true)}
                  className="text-[#f39233] underline text-xs font-extrabold hover:text-[#f39233]/80 block mx-auto py-1 animate-pulse"
                >
                  ⚙️ Ver cómo resolver este error en Firebase
                </button>
              )}
              {(error.includes('no está habilitado') || error.includes('operation-not-allowed') || showAuthHelper) && (
                <button
                  type="button"
                  onClick={() => setShowAuthHelper(true)}
                  className="text-[#f39233] underline text-xs font-extrabold hover:text-[#f39233]/80 block mx-auto py-1 animate-pulse"
                >
                  🔑 Ver cómo activar Correo/Contraseña en tu Firebase
                </button>
              )}
            </div>
          )}

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

      {showDomainHelper && (
        <div className="fixed inset-0 bg-[#1B1C19]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#2D2E2A] text-[#F0EEE9] border border-[#f39233]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-[#f39233] mb-4">
              <span className="material-symbols-outlined text-3xl">domain_disabled</span>
              <h3 className="text-lg font-extrabold font-sans">Dominio no autorizado</h3>
            </div>
            
            <p className="text-xs text-[#F0EEE9]/90 mb-4 font-medium leading-relaxed">
              Google e inicio de sesión de Firebase necesitan que autorices el dominio actual para que funcione la autenticación.
            </p>

            <div className="bg-black/30 p-3.5 rounded-2xl mb-4 border border-[#F0EEE9]/10">
              <span className="text-[10px] uppercase font-bold text-[#f39233] block mb-1">Tu dominio actual:</span>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono font-bold bg-[#1B1C19] px-2.5 py-1.5 rounded-lg flex-1 overflow-x-auto select-all">{currentHost}</code>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentHost);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3.5 py-1.5 bg-[#f39233] text-[#1B1C19] rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  {copied ? '¡Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-xs text-[#F0EEE9]/80 font-medium">
              <span className="font-extrabold text-[#f39233] text-[11px] uppercase tracking-wider block">Pasos para solucionarlo:</span>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
                <p>Ve a tu <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#f39233] underline hover:text-[#f39233]/80 font-bold">Consola de Firebase</a>.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                <p>Selecciona tu proyecto <span className="font-mono text-white bg-black/20 px-1.5 py-0.5 rounded font-bold">{projectId}</span>.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">3</span>
                <p>Ve a: <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; pestaña de <strong>Settings</strong>.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">4</span>
                <p>Entra en <strong>Authorized domains</strong>, haz clic en <strong>Add domain</strong> y pega <span className="text-white font-mono bg-black/20 px-1.5 py-0.5 rounded font-bold">{currentHost}</span>.</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowDomainHelper(false)}
              className="w-full py-3 bg-[#F0EEE9]/10 hover:bg-[#F0EEE9]/20 text-[#F0EEE9] rounded-full text-xs font-bold transition-colors outline-none border border-[#F0EEE9]/20"
            >
              Entendido, cerrar
            </button>
          </div>
        </div>
      )}

      {showAuthHelper && (
        <div className="fixed inset-0 bg-[#1B1C19]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#2D2E2A] text-[#F0EEE9] border border-[#f39233]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-[#f39233] mb-4">
              <span className="material-symbols-outlined text-3xl">key_off</span>
              <h3 className="text-lg font-extrabold font-sans">Proveedor deshabilitado</h3>
            </div>
            
            <p className="text-xs text-[#F0EEE9]/90 mb-4 font-medium leading-relaxed">
              El inicio de sesión y registro mediante Correo/Contraseña no están habilitados en tu consola de Firebase. Actívalos para permitir que los usuarios ingresen.
            </p>

            <div className="space-y-3 mb-6 text-xs text-[#F0EEE9]/80 font-medium">
              <span className="font-extrabold text-[#f39233] text-[11px] uppercase tracking-wider block">Pasos para solucionarlo:</span>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
                <p>Abre la <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#f39233] underline hover:text-[#f39233]/80 font-bold">Consola de Firebase</a>.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                <p>Selecciona tu proyecto: <span className="font-mono text-white bg-black/20 px-1.5 py-0.5 rounded font-bold">{projectId}</span>.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">3</span>
                <p>Ve a: <strong>Build</strong> &gt; <strong>Authentication</strong> y abre la pestaña <strong>Sign-in method</strong>.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">4</span>
                <p>Haz clic en <strong>Add new provider</strong> (Añadir nuevo proveedor) y selecciona <strong>Email/Password</strong> (Correo electrónico/contraseña).</p>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">5</span>
                <p>Activa el primer interruptor (<strong>Enable</strong>) y haz clic en <strong>Save</strong> (Guardar).</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowAuthHelper(false)}
              className="w-full py-3 bg-[#f39233] hover:bg-[#f39233]/90 text-[#1B1C19] rounded-full text-xs font-bold transition-all outline-none"
            >
              ¡Entendido! Ya lo activé
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
