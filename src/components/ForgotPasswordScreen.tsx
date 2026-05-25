import React, { useState, useEffect } from 'react';
import { googleSignIn, getAccessToken, initAuth } from '../firebaseAuth';

export default function ForgotPasswordScreen({ onNavigateLogin, onNavigateEnterCode }: { onNavigateLogin: () => void, onNavigateEnterCode: () => void }) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bgImage = "/Recurso 1.png";

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const confirmed = window.confirm(`¿Quieres enviar un código de recuperación a ${email} usando tu cuenta de Gmail?`);
    if (!confirmed) return;

    setIsSending(true);
    try {
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        if (result) token = result.accessToken;
      }
      
      if (!token) {
        throw new Error("No se pudo obtener el acceso a Gmail.");
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const rawEmail = `To: ${email}\r\n` +
        `Subject: Código de recuperación de contraseña - RAIGAL\r\n\r\n` +
        `Hola,\n\nHas solicitado recuperar tu contraseña en RAIGAL.\n\nTu código de verificación de 6 dígitos es: ${verificationCode}\n\nPor favor, ingresa este código en la aplicación para restablecer tu contraseña.\n\nSi no fuiste tú, por favor ignora este correo.`;

      const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: encodedEmail
        })
      });

      if (res.ok) {
        alert("Código enviado correctamente a la bandeja de entrada.");
        onNavigateEnterCode();
      } else {
        const err = await res.json();
        throw new Error(err.error?.message || "Hubo un problema al enviar el correo.");
      }
    } catch (err: any) {
      console.error("Error enviando correo:", err);
      alert("Error al intentar enviar correo: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div 
      className="min-h-full flex flex-col items-center justify-center text-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url("${bgImage}")` }}
    >
      <div className="relative z-10 w-full max-w-md mx-auto p-6 flex flex-col justify-center">
        <div className="text-center mb-6 px-2">
          <h1 className="block text-2xl font-bold leading-none text-[#F0EEE9] mb-4 whitespace-nowrap">Recupera tu contraseña</h1>
          <p className="text-sm text-[#F0EEE9] mt-6 font-medium">Ingresa tu correo para enviarte las instrucciones.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSendEmail}>
          <div className="space-y-1">
            <label className="text-sm text-[#F0EEE9] ml-1 font-bold">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-3 border border-[#F0EEE9] bg-white/20 text-[#F0EEE9] placeholder-[#F0EEE9]/70 focus:outline-none focus:ring-2 focus:ring-[#f39233] transition-all rounded-full text-sm font-medium"
              required
              disabled={isSending}
            />
          </div>

          <button 
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-8 bg-[#f39233] text-[#1B1C19] rounded-full font-extrabold text-sm shadow-xl active:scale-95 transition-transform flex justify-center items-center gap-2 disabled:opacity-75 disabled:active:scale-100 mt-2"
          >
            {isSending ? "Enviando..." : "Enviar código"}
          </button>
        </form>

        <p className="text-center text-sm text-[#F0EEE9] mt-6 font-medium">
          <button className="text-[#f39233] hover:underline font-extrabold" onClick={onNavigateLogin} type="button">Regresar</button>
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
