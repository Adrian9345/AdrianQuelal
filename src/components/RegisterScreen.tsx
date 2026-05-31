import React, { useState } from 'react';
import { registerWithEmail, googleSignIn, db } from '../firebaseAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export default function RegisterScreen({ onRegister, onNavigateLogin }: { onRegister: () => void, onNavigateLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDomainHelper, setShowDomainHelper] = useState(false);
  const [showAuthHelper, setShowAuthHelper] = useState(false);
  const [showPopupHelper, setShowPopupHelper] = useState(false);
  const [showBlockedHelper, setShowBlockedHelper] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'adrian-quelal.vercel.app';
  const projectId = firebaseConfig?.projectId || 'reliable-granite-k5xj8';

  const bgImage = "/Recurso 1.png";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirmPassword) {
      setError("La contraseña debe tener al menos 8 caracteres y coincidir con la confirmación.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await registerWithEmail(email, password);
      
      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(user, { displayName: name });
      } catch (updateErr) {
        console.error("Error updating display name on auth profile:", updateErr);
      }
      
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          createdAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.error("Error creating user profile in firestore:", firestoreErr);
      }

      onRegister();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('auth/operation-not-allowed')) {
        setError('El registro con Correo/Contraseña no está habilitado en tu proyecto de Firebase.');
        setShowAuthHelper(true);
      } else if (msg.includes('unauthorized-domain') || msg.includes('dominio no autorizado')) {
        setError('Este dominio no cuenta con autorización en tu consola de Firebase.');
        setShowDomainHelper(true);
      } else {
        setError(msg || 'Error al registrarse');
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
      onRegister();
    } catch (err: any) {
      console.error("Google register/signin error details:", err);
      const msg = err?.message || '';
      const code = err?.code || '';
      if (msg.includes('unauthorized-domain') || code.includes('unauthorized-domain') || msg.includes('dominio no autorizado')) {
        setError('Este dominio no cuenta con autorización en tu consola de Firebase.');
        setShowDomainHelper(true);
      } else if (msg.includes('popup-closed-by-user') || code.includes('popup-closed-by-user')) {
        setError('El navegador bloqueó la ventana de Google debido a que la aplicación está incrustada en la vista previa.');
        setShowPopupHelper(true);
      } else {
        setError(msg || 'Error al registrarse con Google');
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
        <div className="text-center mb-8 px-2">
          <h1 className="text-xl font-medium leading-relaxed text-[#F0EEE9] font-sans">
            Crea tu cuenta<br />
            para descubrir y explorar toda la riqueza cultural de nuestra región.
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Nombre Completo</label>
            <input 
              type="text" 
              placeholder="Tu nombre"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-5 py-3.5 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-3.5 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
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
                className="w-full px-5 py-3.5 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
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
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Confirmar</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3.5 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
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
            <div className="text-red-400 text-xs font-bold text-center px-2 space-y-2">
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
              {(error.includes('bloqueó') || error.includes('popup-closed-by-user') || showPopupHelper) && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowPopupHelper(true)}
                    className="text-[#f39233] underline text-xs font-extrabold hover:text-[#f39233]/80 block mx-auto py-1 animate-pulse"
                  >
                    🌐 Ver cómo poder usar Google Sign-In en esta vista previa
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBlockedHelper(true)}
                    className="text-yellow-400 underline text-xs font-extrabold hover:text-yellow-300 block mx-auto py-1 animate-pulse"
                  >
                    ⚠️ Ver cómo solucionar "Acceso bloqueado (Error 403)" de Google
                  </button>
                </>
              )}
            </div>
          )}

          <div className="py-2"></div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-8 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-xl active:scale-95 transition-transform disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <div className="relative flex py-8 items-center">
          <div className="flex-grow border-t border-[#F0EEE9]/40"></div>
          <span className="flex-shrink mx-4 text-xs text-[#F0EEE9] uppercase tracking-wider font-semibold">o continúa con</span>
          <div className="flex-grow border-t border-[#F0EEE9]/40"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          className="w-full py-3.5 rounded-full text-xs font-bold bg-white/10 text-[#F0EEE9] border border-[#F0EEE9] hover:bg-white/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">mail</span>
          Gmail / Google
        </button>

        <p className="text-center text-sm text-[#F0EEE9] pt-6 font-medium">
          ¿Ya tienes una cuenta? <button className="text-[#f39233] hover:underline font-extrabold" onClick={onNavigateLogin}>Inicia Sesión</button>
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
              El inicio de sesión y registro mediante Correo/Contraseña no están habilitados en tu consola de Firebase. Actívalos para permitir que los usuarios se registren.
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

      {showPopupHelper && (
        <div className="fixed inset-0 bg-[#1B1C19]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#2D2E2A] text-[#F0EEE9] border border-[#f39233]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-[#f39233] mb-4">
              <span className="material-symbols-outlined text-3xl">open_in_new</span>
              <h3 className="text-lg font-extrabold font-sans">Bloqueo de ventana de Google</h3>
            </div>
            
            <p className="text-xs text-[#F0EEE9]/90 mb-4 font-medium leading-relaxed">
              Estás viendo la aplicación dentro del marco o iframe de vista previa de <strong>AI Studio</strong>. Por motivos de seguridad y políticas de "origen cruzado", el navegador bloquea las ventanas emergentes (popups) de inicio de sesión de Google dentro de marcos incrustados.
            </p>

            <div className="space-y-4 mb-6 text-xs text-[#F0EEE9]/80 font-medium">
              <span className="font-extrabold text-[#f39233] text-[11px] uppercase tracking-wider block">Cómo solucionarlo de inmediato:</span>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">1</span>
                <div>
                  <p className="font-bold text-white">Opción recomendada (Abrir en pestaña nueva):</p>
                  <p className="mt-1">Haz clic en el botón de <strong>Abrir en pestaña nueva</strong> en la esquina superior derecha del navegador de vista de AI Studio (o abre directamente la URL de desarrollo compartida).</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <span className="bg-[#f39233]/20 text-[#f39233] font-black h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0">2</span>
                <div>
                  <p className="font-bold text-white">Opción alternativa (Correo y Contraseña):</p>
                  <p className="mt-1">Si activaste el proveedor de Correo/Contraseña en tu Firebase, puedes usar el registro tradicional mediante correo electrónico, el cual funciona perfectamente dentro del iframe.</p>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowPopupHelper(false)}
              className="w-full py-3 bg-[#f39233] hover:bg-[#f39233]/90 text-[#1B1C19] rounded-full text-xs font-bold transition-all outline-none"
            >
              Entendido, continuar
            </button>
          </div>
        </div>
      )}

      {showBlockedHelper && (
        <div className="fixed inset-0 bg-[#1B1C19]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto w-full">
          <div className="bg-[#2D2E2A] text-[#F0EEE9] border border-[#f39233] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <div className="flex items-center gap-3 text-yellow-400 mb-4">
              <span className="material-symbols-outlined text-3xl">g_mobiledata</span>
              <h3 className="text-base font-extrabold font-sans">Cómo solucionar "Acceso Bloqueado (Error 403)"</h3>
            </div>
            
            <p className="text-xs text-[#F0EEE9]/90 mb-4 font-medium leading-relaxed">
              El error <strong>"Acceso bloqueado: raigal-app no completó el proceso de verificación de Google"</strong> ocurre porque tu proyecto de Firebase <span className="text-yellow-400 font-bold">raigal-app</span> tiene su pantalla de consentimiento OAuth en modo de <strong>"Prueba" (Testing)</strong> y solicita permisos sensibles.
            </p>

            <div className="space-y-4 mb-6 text-xs text-[#F0EEE9]/90 font-medium">
              <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <span className="font-extrabold text-yellow-400 text-[10px] uppercase tracking-wider block">Solución Rápida: Agregar Usuarios de Prueba</span>
                <p className="leading-relaxed">Cualquier persona que intente registrarse o iniciar sesión con Google (como <strong className="text-white">blackmc4523@gmail.com</strong> o tu propio correo) debe estar registrada como usuario de prueba en tu consola.</p>
                
                <div className="space-y-1.5 pl-3 border-l-2 border-yellow-400/40 mt-2">
                  <p>1. Ve a la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-yellow-400 font-bold underline">Consola de Google Cloud</a> e ingresa con tu cuenta del proyecto.</p>
                  <p>2. Selecciona tu proyecto <span className="font-mono text-white bg-black/44 px-1 py-0.5 rounded text-[10px] font-bold">raigal-app</span> desde el selector superior.</p>
                  <p>3. En el menú de la izquierda, busca y haz clic en <strong>"Pantalla de consentimiento de OAuth"</strong> (OAuth consent screen).</p>
                  <p>4. Desplázate hacia abajo hasta la sección de <strong>"Usuarios de prueba"</strong> (Test users).</p>
                  <p>5. Haz clic en el botón de <strong className="text-yellow-400">+ ADD USERS</strong> (+ AGREGAR USUARIOS).</p>
                  <p>6. Escribe los correos electrónicos correspondientes (por ejemplo: <strong className="text-white">blackmc4523@gmail.com</strong>) y haz clic en <strong>Guardar</strong>.</p>
                </div>
              </div>

              <div className="bg-black/20 p-3.5 rounded-2xl border border-white/5 space-y-2">
                <span className="font-extrabold text-yellow-400 text-[10px] uppercase tracking-wider block font-sans">Solución Permanente: Publicar la Aplicación</span>
                <p className="leading-relaxed">Al publicar la aplicación, cualquier usuario con una cuenta de Google podrá iniciar sesión inmediatamente.</p>
                
                <div className="space-y-1.5 pl-3 border-l-2 border-yellow-400/40 mt-2">
                  <p>1. En la misma sección de <strong>"Pantalla de consentimiento de OAuth"</strong> (consola de Google Cloud).</p>
                  <p>2. En la parte superior verás el estado <strong>"Pruebas" (Testing)</strong>.</p>
                  <p>3. Haz clic en el botón que dice <strong>"PUBLICAR APLICACIÓN"</strong> (Publish app) y confirma la acción para pasar a <strong className="text-white">"Producción"</strong>.</p>
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowBlockedHelper(false)}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-[#1B1C19] rounded-full text-xs font-bold transition-all outline-none"
            >
              ¡Entendido, ya sé cómo arreglarlo!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
