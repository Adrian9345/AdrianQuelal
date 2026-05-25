import React, { useState } from 'react';
import { registerWithEmail, googleSignIn, db } from '../firebaseAuth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function RegisterScreen({ onRegister, onNavigateLogin }: { onRegister: () => void, onNavigateLogin: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          name: name,
          createdAt: serverTimestamp()
        });
      } catch (firestoreErr) {
        console.error("Error creating user profile:", firestoreErr);
      }

      onRegister();
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
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
      setError(err.message || 'Error al registrarse con Google');
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
            <div className="text-red-400 text-xs font-bold text-center px-2">
              {error}
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
          onClick={handleGoogleSignIn} 
          disabled={loading} 
          className="w-full py-3.5 rounded-full text-xs font-bold bg-white/10 text-[#F0EEE9] border border-[#F0EEE9] hover:bg-white/20 transition-colors"
        >
          Google
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
    </div>
  )
}
