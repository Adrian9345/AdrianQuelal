import React, { useState, useEffect, useRef } from 'react';
import { ScreenType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (s: ScreenType) => void;
  title?: string;
  onProfileClick?: () => void;
  showGreeting?: boolean;
  customTitle?: string;
}

let globalCachedLocationText = '';
let globalLastLat = 0;
let globalLastLng = 0;

export default function Header({ onNavigate, title = 'Usuario', onProfileClick, showGreeting = true, customTitle }: HeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const lastScrollY = useRef(0);
  const { profile } = useAuth();
  const displayTitle = customTitle || profile?.name || title;

  const [locationText, setLocationText] = useState(globalCachedLocationText || 'Ubicación');
  const [isLocating, setIsLocating] = useState(!globalCachedLocationText);

  useEffect(() => {
    let watchId: number;
    
    if ('geolocation' in navigator) {
      if (!globalCachedLocationText) {
        setIsLocating(true);
        setLocationText('Detectando...');
      }
      
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
           const lat = position.coords.latitude;
           const lng = position.coords.longitude;
           
           // Update distance check to avoid repeated checks (approx. 100 meters)
           const dist = Math.abs(lat - globalLastLat) + Math.abs(lng - globalLastLng);
           
           if (dist > 0.001 || !globalCachedLocationText) {
             globalLastLat = lat;
             globalLastLng = lng;
             
             try {
               // Dynamic import to avoid breaking initialization order
               const mapData = await import('../data/mapData');
               const corregimientosMapData = mapData.corregimientosMapData;
               
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

               if (corregimientosMapData && corregimientosMapData.length > 0) {
                 corregimientosMapData.forEach((muni: any) => {
                   const mDist = getDistance(lat, lng, muni.position.lat, muni.position.lng);
                   if (mDist < minDistance) {
                     minDistance = mDist;
                     closest = muni;
                   }
                 });
                 const newLoc = `${closest.name}, Nariño`;
                 globalCachedLocationText = newLoc;
                 setLocationText(newLoc);
               } else {
                 throw new Error("No map data");
               }
             } catch (e) {
               console.error("Localizing failed", e);
               // Fallback if anything fails
               globalCachedLocationText = "Pasto, Nariño";
               setLocationText(globalCachedLocationText);
             }
           } else {
             setLocationText(globalCachedLocationText);
           }
           setIsLocating(false);
        },
        (error) => {
          console.warn("Header location error", error);
          if (!globalCachedLocationText) {
            setLocationText('Pasto, Nariño');
          }
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLocationText('Pasto, Nariño');
      setIsLocating(false);
    }

    return () => {
      if (watchId !== undefined && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (!container) return;

    lastScrollY.current = container.scrollTop;

    const handleScroll = () => {
      const currentScrollY = container.scrollTop;

      if (currentScrollY <= 10) {
        setIsCollapsed(false);
      } else if (currentScrollY > lastScrollY.current) {
        setIsCollapsed(true);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsCollapsed(false);
      }

      lastScrollY.current = currentScrollY;
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className="text-white sticky top-0 left-0 right-0 z-50 flex flex-col justify-center px-5 py-2.5 w-full mx-auto transition-all duration-300 ease-in-out border-b border-orange-400/20" 
      style={{ 
        height: '70px', 
        backgroundColor: '#f39233',
        boxShadow: isCollapsed ? '0 4px 12px rgba(243, 146, 51, 0.15)' : 'none'
      }}
    >
      <div className="flex items-center justify-between mb-0 w-full h-full">
        {/* Left Side: Profile Picture & User Text */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onProfileClick || (() => onNavigate('profile'))}>
          <button aria-label="Perfil de usuario" className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all focus:outline-none shrink-0">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-stone-400 text-2xl">person</span>
            )}
          </button>
          
          <div 
            className="transition-all duration-300 ease-in-out origin-left flex flex-col"
            style={{
              opacity: isCollapsed ? 0 : 1,
              maxWidth: isCollapsed ? '0px' : '250px',
              transform: isCollapsed ? 'scaleX(0.9) translateX(-10px)' : 'scaleX(1) translateX(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
              overflow: 'hidden'
            }}
          >
                        <h1 className="text-xl font-bold leading-tight truncate">{displayTitle}</h1>
          </div>
        </div>

        {/* Right Side: Saved Button */}
        <button 
          onClick={() => onNavigate('saved')}
          className="bg-white/20 hover:bg-white/30 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors focus:outline-none shrink-0"
        >
          <span className="material-symbols-outlined text-white text-xl">bookmark</span>
        </button>
      </div>

      {/* Floating Ubicación Badge (Visible everywhere) */}
      <div 
        className="flex justify-center items-center gap-[4px] absolute bottom-2 left-0 right-0 pointer-events-none transition-all duration-300 ease-in-out"
        style={{
          opacity: (isCollapsed || customTitle) ? 0 : 0.9,
          transform: isCollapsed ? 'translateY(12px) scale(0.9)' : 'translateY(0) scale(1)',
          pointerEvents: 'none'
        }}
      >
        <span className="text-xs font-semibold leading-none">{locationText}</span>
        {isLocating && (
          <div className="w-2.5 h-2.5 ml-1 border-[1.5px] border-white border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </header>
  );
}
