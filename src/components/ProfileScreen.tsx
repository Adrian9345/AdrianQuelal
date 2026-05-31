import React, { useRef, useState, useEffect } from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { usePublications } from '../contexts/PublicationsContext';
import { Publication } from '../data/publications';
import { corregimientosMapData } from '../data/mapData';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function ProfileScreen({ onNavigate, onEdit, onLogout }: { onNavigate: (s: ScreenType) => void, onEdit?: (pub: Publication) => void, onLogout: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, updateProfileImage, updateProfileName, updateProfileDescription, updateProfileRole, user } = useAuth();
  const { publications: publicationsMap, deletePublication, clearAllPublications } = usePublications();
  const { t } = useLanguage();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [name, setName] = useState('Usuario');
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState(false);

  const [viajesCount, setViajesCount] = useState(0);
  const [guardadosCount, setGuardadosCount] = useState(0);
  const [resenasCount, setResenasCount] = useState(0);
  
  const [userLocation, setUserLocation] = useState('Ubicación');
  
  const [isClearingDb, setIsClearingDb] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearStatusMessage, setClearStatusMessage] = useState<string | null>(null);

  const handleClearAllDb = async () => {
    setIsClearingDb(true);
    setClearStatusMessage(null);
    try {
      await clearAllPublications();
      setClearStatusMessage("✅ Base de datos vaciada con éxito.");
      setTimeout(() => setClearStatusMessage(null), 5000);
    } catch (e) {
      setClearStatusMessage("❌ Error al vaciar la base de datos.");
      setTimeout(() => setClearStatusMessage(null), 5000);
    } finally {
      setIsClearingDb(false);
      setShowClearConfirm(false);
    }
  };

  // Get user's publications
  const myPublications = (Object.values(publicationsMap).flat() as Publication[]).filter(p => p.creatorId === user?.uid);

  useEffect(() => {
    if (profile) {
      if (profile.photoURL) setProfileImage(profile.photoURL);
      if (profile.name) setName(profile.name);
      if (profile.description) setDescription(profile.description);
    }
  }, [profile]);

  useEffect(() => {
    const updateStats = () => {
      const existing = localStorage.getItem('saved_items');
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (Array.isArray(parsed)) {
            setGuardadosCount(parsed.length);
          }
        } catch (e) {
          // ignore
        }
      } else {
        setGuardadosCount(0);
      }
    };

    updateStats();
    
    // In case there are custom events or storage events
    window.addEventListener('storage', updateStats);
    return () => window.removeEventListener('storage', updateStats);
  }, []);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          let closest = corregimientosMapData[0];
          let minDistance = Infinity;

          const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
            const R = 6371; // km
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
          };

          corregimientosMapData.forEach((muni) => {
            const dist = getDistance(lat, lng, muni.position.lat, muni.position.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = muni;
            }
          });

          setUserLocation(`${closest.name}, Nariño`);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setUserLocation('Pasto, Nariño'); // Default fallback
        }
      );
    } else {
      setUserLocation('Pasto, Nariño'); // Default fallback
    }
  }, []);

  const handleLogoutAndSave = async () => {
    if (hasChanges) {
      if (profileImage && profileImage !== profile?.photoURL) {
        await updateProfileImage(profileImage);
      }
      if (name !== (profile?.name || 'Usuario')) {
        await updateProfileName(name);
      }
      if (description !== (profile?.description || '')) {
        await updateProfileDescription(description);
      }
    }
    onLogout();
  };

  const handleEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSwitchToCreator = () => {
    if (profile?.isCreator) {
      // Switch back to personal without code
      updateProfileRole(false);
    } else {
      setShowCodeModal(true);
      setEnteredCode('');
      setCodeError(false);
    }
  };

  const verifyAndSwitch = async () => {
    if (enteredCode === '4523') {
      await updateProfileRole(true);
      setShowCodeModal(false);
      setEnteredCode('');
    } else {
      setCodeError(true);
    }
  };



  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f4] pb-12 w-full">
      <header className="bg-[#f39233] text-white flex items-center justify-between px-4 py-4 sticky top-0 z-50 h-[80px] w-full">
        <button onClick={() => onNavigate('home')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all focus:outline-none">
          <span className="material-symbols-outlined text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold flex-1 text-center">Mi Perfil</h1>
        <div className="flex items-center">
          <button onClick={() => onNavigate('accounts_manager')} className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all focus:outline-none">
            <span className="material-symbols-outlined text-white">switch_account</span>
          </button>
        </div>
      </header>

      {!user ? (
        <main className="flex-1 flex flex-col items-center justify-center px-8 text-center bg-white m-5 rounded-[40px] shadow-sm border border-stone-100 animate-fade-in">
          <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-stone-300">account_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-[#30132e] mb-3">Descubre lo mejor de Pasto</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Inicia sesión para explorar eventos únicos, conocer la cultura de nuestros corregimientos y guardar tus lugares favoritos.
          </p>
          <button 
            onClick={() => onNavigate('login')}
            className="w-full py-4 bg-[#f39233] text-white rounded-full font-bold shadow-lg shadow-orange-200 active:scale-95 transition-all mb-4"
          >
            INICIAR SESIÓN
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="w-full py-4 bg-white text-[#f39233] border-2 border-[#f39233] rounded-full font-bold active:scale-95 transition-all mb-4"
          >
            REGISTRARSE
          </button>
          <button 
            onClick={() => onNavigate('welcome')}
            className="w-full py-4 bg-stone-100 text-stone-500 rounded-full font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            CERRAR SESIÓN
          </button>
        </main>
      ) : (
        <main className="flex-1 px-5 pt-8 flex flex-col items-center overflow-y-auto w-full">
         <div className="relative">
           <div className="w-28 h-28 bg-white rounded-full border-[5px] border-[#fbf9f4] flex items-center justify-center relative z-10 overflow-hidden shadow-sm">
              {profileImage ? (
                <img src={profileImage} alt="Perfil" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="material-symbols-outlined text-stone-400 text-[60px]">person</span>
              )}
           </div>
           <button 
             onClick={handleEditClick}
             className="absolute bottom-1 right-0 w-8 h-8 bg-[#f39233] text-white rounded-full flex items-center justify-center border-2 border-white z-20 shadow-md focus:outline-none hover:bg-[#e27e22] active:scale-95 transition-all"
           >
             <span className="material-symbols-outlined text-sm">edit</span>
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             accept="image/*" 
             className="hidden" 
           />
           {/* decorative ring */}
           <div className="absolute inset-[-6px] border-[3px] border-[#f39233] rounded-full"></div>
         </div>

         <div className="flex items-center gap-2 mt-5 text-[#30132e]">
           <h2 className="text-2xl font-bold">{name}</h2>
         </div>
         <p className="text-gray-500 font-medium text-sm mt-1">{userLocation}</p>

         <div className="flex flex-col items-center mt-3 w-full px-8">
           {isEditingDescription ? (
             <textarea
               value={description}
               onChange={(e) => {
                 setDescription(e.target.value);
                 setHasChanges(true);
               }}
               onBlur={() => setIsEditingDescription(false)}
               autoFocus
               rows={3}
               placeholder="Escribe tu descripción aquí..."
               className="w-full text-center text-gray-700 bg-transparent border-b-2 border-[#f39233] focus:outline-none resize-none"
             />
           ) : (
             <>
               <p className="text-center text-gray-500 font-medium text-sm">
                 {description || 'Agrega una descripción'}
               </p>
               <button 
                 onClick={() => setIsEditingDescription(true)}
                 className="mt-3 text-[#f39233] font-bold text-sm bg-white/60 border border-[#f39233]/30 px-5 py-1.5 rounded-full hover:bg-orange-50 active:scale-95 transition-all flex items-center gap-1.5"
               >
                 <span className="material-symbols-outlined text-[16px]">{description ? 'edit' : 'add'}</span>
                 {description ? 'Editar descripción' : 'Agregar descripción'}
               </button>
             </>
           )}
         </div>

         {hasChanges && (
           <div className="mt-6 w-full max-w-sm px-4 animate-fade-in">
              <button 
                onClick={async () => {
                  if (profileImage && profileImage !== profile?.photoURL) {
                    await updateProfileImage(profileImage);
                  }
                  if (name !== (profile?.name || 'Usuario')) {
                    await updateProfileName(name);
                  }
                  if (description !== (profile?.description || '')) {
                    await updateProfileDescription(description);
                  }
                  setHasChanges(false);
                }}
                className="w-full py-3 px-6 bg-[#1B1C19] text-white rounded-full font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                Guardar cambios
              </button>
           </div>
         )}

         <div className="flex w-full justify-center mt-8 divide-x divide-gray-300 mb-8 max-w-sm">
           <div className="flex flex-col items-center px-6">
             <span className="font-extrabold text-[22px] text-black">{viajesCount}</span>
             <span className="text-[10px] font-bold text-gray-500 tracking-wider">{t('trips')}</span>
           </div>
           <div className="flex flex-col items-center px-6">
             <span className="font-extrabold text-[22px] text-black">{guardadosCount}</span>
             <span className="text-[10px] font-bold text-gray-500 tracking-wider">{t('saved_stat')}</span>
           </div>
           <div className="flex flex-col items-center px-6">
             <span className="font-extrabold text-[22px] text-black">{resenasCount}</span>
             <span className="text-[10px] font-bold text-gray-500 tracking-wider">{t('reviews')}</span>
           </div>
         </div>

         <button 
           onClick={handleSwitchToCreator}
           className={`w-full max-w-sm py-4 px-6 rounded-full font-extrabold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 mb-10 ${
             profile?.isCreator ? 'bg-stone-100 text-[#30132e] border border-gray-200' : 'bg-[#f39233] text-[#1B1C19]'
           }`}
         >
            <span className={`material-symbols-outlined text-[18px] rounded-full p-0.5 ${
              profile?.isCreator ? 'bg-[#f39233] text-white' : 'bg-white text-[#f39233]'
            }`}>
              {profile?.isCreator ? 'person' : 'star'}
            </span>
            {profile?.isCreator ? 'Cambiar a cuenta Personal' : 'Cambiar a cuenta de Creador'}
         </button>

         {profile?.isCreator && (
           <div className="w-full max-w-md mb-8">
             <div className="flex items-center justify-between mb-4 px-1">
               <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px]">MIS PUBLICACIONES</h3>
               <button 
                 onClick={() => onNavigate('manage_publications')}
                 className="text-[10px] font-bold text-[#f39233] hover:underline"
               >
                 Ver todas
               </button>
             </div>
             
             <div className="space-y-3">
               {/* Mocking some of the user's publications */}
               {myPublications.slice(0, 3).map((pub, idx) => (
                 <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
                   <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                     <img src={pub.image} alt={pub.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-xs text-[#30132e] truncate">{pub.title}</h4>
                     <p className="text-[10px] text-gray-500 font-medium truncate mb-1">{pub.corregimiento}</p>
                     <div className="flex items-center gap-2">
                       <span className="text-[9px] bg-orange-50 text-[#f39233] px-2 py-0.5 rounded-full font-bold">ACTIVO</span>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <button 
                        onClick={() => {
                          if (onEdit) onEdit(pub);
                          else onNavigate('manage_publications');
                        }}
                       className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 hover:text-[#f39233] hover:bg-orange-50 transition-colors"
                       title="Editar"
                     >
                       <span className="material-symbols-outlined text-[18px]">edit</span>
                     </button>
                     <button 
                       onClick={() => {}}
                       className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"

                     >
                       <span className="material-symbols-outlined text-[18px]">delete</span>
                     </button>
                   </div>
                 </div>
               ))}

               <button 
                 onClick={() => onNavigate('create_content')}
                 className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-[#f39233]/30 hover:bg-orange-50/20 transition-all group"
               >
                 <span className="material-symbols-outlined text-gray-300 group-hover:text-[#f39233]">add_circle</span>
                 <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#f39233]">Crear nueva publicación</span>
               </button>
             </div>
           </div>
         )}

         <div className="w-full max-w-md">
           <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">AJUSTES DE CUENTA</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <button onClick={() => onNavigate('personal_info')} className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">person</span>
                 <span className="font-medium text-sm">Información Personal</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">chevron_right</span>
             </button>
             <button onClick={() => onNavigate('privacy_settings')} className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">shield</span>
                 <span className="font-medium text-sm">Seguridad y Privacidad</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">chevron_right</span>
             </button>
             <button onClick={() => onNavigate('language_settings')} className="w-full flex items-center justify-between p-4.5 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">language</span>
                 <span className="font-medium text-sm">Preferencias de Idioma</span>
               </div>
               <div className="flex items-center gap-1">
                 <span className="text-xs font-semibold text-gray-500">Español</span>
                 <span className="material-symbols-outlined text-gray-400">chevron_right</span>
               </div>
             </button>
           </div>

           {user?.email === 'adriannoguera93@gmail.com' && (
            <>
              <h3 className="font-extrabold text-red-600 tracking-widest text-[11px] mb-3 px-1">ADMINISTRACIÓN DE SISTEMA</h3>
              <div className="bg-red-50/50 rounded-2xl border border-red-200/60 shadow-sm overflow-hidden mb-8 p-5">
                <p className="text-xs text-red-800 font-semibold mb-3">
                  Zona de peligro: Elimina permanentemente todas las publicaciones creadas en la base de datos de Firebase.
                </p>
                
                {clearStatusMessage && (
                  <div className="mb-4 text-xs font-bold text-center p-2 bg-white rounded-lg border border-red-100 shadow-xs">
                    {clearStatusMessage}
                  </div>
                )}

                {showClearConfirm ? (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-red-700 animate-pulse">
                      ⚠️ ¿Estás absolutamente seguro de que deseas VACIAR todas las publicaciones en Firebase? Esta acción es irreversible.
                    </p>
                    <div className="flex gap-2.5">
                      <button
                        disabled={isClearingDb}
                        onClick={handleClearAllDb}
                        className="flex-1 py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 active:scale-95 transition-all text-center disabled:opacity-50"
                      >
                        {isClearingDb ? 'Borrando...' : 'Sí, borrar todo'}
                      </button>
                      <button
                        disabled={isClearingDb}
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-1 px-3 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-300 active:scale-95 transition-all text-center disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-extrabold rounded-xl text-xs select-none shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                    Vaciar todas las publicaciones (Firebase)
                  </button>
                )}
              </div>
            </>
          )}

          <h3 className="font-extrabold text-[#30132e] tracking-widest text-[11px] mb-3 px-1">SOPORTE</h3>
           <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
             <button onClick={() => onNavigate('help_support')} className="w-full flex items-center justify-between p-4.5 border-b border-gray-50 hover:bg-gray-50">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-teal-700">help</span>
                 <span className="font-medium text-sm">Centro de Ayuda</span>
               </div>
               <span className="material-symbols-outlined text-gray-400">chevron_right</span>
             </button>
             <button onClick={handleLogoutAndSave} className="w-full flex items-center justify-between p-4.5 hover:bg-gray-50 group">
               <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-red-500">logout</span>
                 <span className="font-medium text-sm text-red-500 group-hover:text-red-700">Cerrar Sesión</span>
               </div>
             </button>
           </div>
         </div>
         
         <div className="w-full max-w-sm border-t border-gray-200 mt-2 pt-8 mb-8 flex justify-center gap-6">
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-teal-700 hover:bg-gray-50">
               <span className="material-symbols-outlined text-2xl">military_tech</span>
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-teal-700 hover:bg-gray-50">
               <span className="material-symbols-outlined text-2xl">photo_camera</span>
            </button>
            <button className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-teal-700 hover:bg-gray-50">
               <span className="material-symbols-outlined text-2xl">alternate_email</span>
            </button>
         </div>
      </main>
      )}

      {/* Verification Modal */}
      <AnimatePresence>
        {showCodeModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCodeModal(false)}
              className="fixed inset-0 bg-[#30132e]/60 backdrop-blur-md z-[60]"
            />
            <div className="fixed inset-0 flex items-center justify-center p-6 z-[61] pointer-events-none">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl pointer-events-auto flex flex-col items-center text-center overflow-hidden relative"
              >
                {/* Decorative background circle */}
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
                
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 relative">
                  <span className="material-symbols-outlined text-[#f39233] text-[40px]">shield_person</span>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#f39233] rounded-full flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-outlined text-white text-[12px] font-bold">lock</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-[#30132e] mb-2 tracking-tight">Acceso de Creador</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
                  Para activar las funciones de creador, ingresa el código de autorización especial.
                </p>

                <div className="w-full space-y-4">
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={4}
                      value={enteredCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setEnteredCode(val);
                        if (codeError) setCodeError(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && enteredCode.length === 4) {
                          verifyAndSwitch();
                        }
                      }}
                      placeholder="0000"
                      className={`w-full py-5 bg-stone-50 border-2 rounded-[24px] text-center text-3xl font-black tracking-[12px] text-[#30132e] focus:outline-none transition-all ${
                        codeError ? 'border-red-400 bg-red-50 text-red-500 animate-shake' : 'border-stone-100 focus:border-[#f39233]/30'
                      }`}
                      autoFocus
                    />
                    {codeError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2"
                      >
                        Código incorrecto. Reintente.
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="flex flex-col w-full gap-3 pt-4">
                    <button 
                      onClick={verifyAndSwitch}
                      disabled={enteredCode.length !== 4}
                      className="w-full py-4.5 bg-[#f39233] text-[#1B1C19] rounded-[24px] font-black text-sm tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                    >
                      VERIFICAR Y ACTIVAR
                    </button>
                    <button 
                      onClick={() => setShowCodeModal(false)}
                      className="w-full py-4 bg-transparent text-gray-400 rounded-[24px] font-bold text-[11px] tracking-widest active:scale-95 transition-all"
                    >
                      CANCELAR
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
