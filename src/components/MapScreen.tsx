import React, { useEffect, useState, useRef, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import { ScreenType } from '../types';
import { corregimientosMapData } from '../data/mapData';
import { publicationsData, corregimientoData } from '../data/publications';
import { mapStyles } from '../data/mapStyles';
import { usePublications } from '../contexts/PublicationsContext';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && !['YOUR_API_KEY', 'INSERT_YOUR_API_KEY', '""', "''"].includes(API_KEY);

function RouteDisplay({ origin, destination }: {
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map) return;
    polylinesRef.current.forEach(p => p.setMap(null));
    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => p.setMap(map));
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    });
    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);
  return null;
}

export default function MapScreen({ onNavigate, onSelectCorregimiento }: { onNavigate: (s: ScreenType) => void, onSelectCorregimiento: (c: string) => void }) {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [selectedCorrId, setSelectedCorrId] = useState<string | null>(null);
  const [activeRouteDest, setActiveRouteDest] = useState<google.maps.LatLngLiteral | null>(null);
  
  const defaultCenter = { lat: 1.2136, lng: -77.2811 }; // Pasto center

  useEffect(() => {
    let watchId: number;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location", error);
          setLoadingLocation(false);
          setLocationError(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLoadingLocation(false);
      setLocationError(true);
    }

    return () => {
      if (watchId !== undefined && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  if (!hasValidKey) {
    return (
      <div className="flex flex-col h-full bg-white">
        <Header onNavigate={onNavigate} title="Mapa Interactivo" />
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',flex:1,fontFamily:'sans-serif', padding: '20px'}}>
          <div style={{textAlign:'center',maxWidth:520}}>
            <h2 className="text-xl font-bold mb-4">Google Maps API Key Required</h2>
            <p className="text-sm text-gray-600 mb-2"><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener" className="text-blue-500 underline">Get an API Key</a></p>
            <p className="text-sm text-gray-600 mb-2"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
            <ul className="text-sm text-left leading-relaxed text-gray-600 list-disc list-inside">
              <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
              <li>Select <strong>Secrets</strong></li>
              <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
              <li>Paste your API key as the value, press <strong>Enter</strong></li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const { publications: publicationsMap } = usePublications();

  const selectedCorregimiento = useMemo(() => 
    selectedCorrId ? corregimientosMapData.find(c => c.id === selectedCorrId) : null
  , [selectedCorrId]);

  const publications = selectedCorregimiento ? publicationsMap[selectedCorregimiento.name] || [] : [];
  const info = selectedCorregimiento ? corregimientoData[selectedCorregimiento.name] : null;

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <Header onNavigate={onNavigate} title="Mapa" />
      
      <div className="flex-1 w-full relative">
        {(loadingLocation || userLocation) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2">
            {loadingLocation ? (
              <>
                <div className="w-4 h-4 border-2 border-[#f39233] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-stone-700">📍 Detectando tu ubicación...</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span className="text-sm font-medium text-stone-700">📍 Actualizando ubicación en tiempo real...</span>
              </>
            )}
           </div>
        )}
        
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={12}
            center={userLocation && !selectedCorrId ? userLocation : undefined}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            disableDefaultUI={true}
            gestureHandling="greedy"
            styles={mapStyles.retro}
          >
            {userLocation && (
              <AdvancedMarker position={userLocation} title="Tu ubicación" zIndex={100}>
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-75" />
                  <div className="relative w-4 h-4 bg-white border-4 border-blue-600 rounded-full shadow-lg" />
                </div>
              </AdvancedMarker>
            )}

            {corregimientosMapData.map(corr => (
              <AdvancedMarker 
                key={corr.id} 
                position={corr.position}
                onClick={() => {
                  setSelectedCorrId(corr.id);
                  setActiveRouteDest(null);
                }}
                zIndex={selectedCorrId === corr.id ? 50 : 1}
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center cursor-pointer transition-all ${selectedCorrId === corr.id ? 'scale-110' : 'opacity-90'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center p-1 relative" style={{ border: `3px solid ${corr.color}` }}>
                     {/* Inner icon */}
                     <span className="material-symbols-outlined text-[18px]" style={{ color: corr.color }}>festival</span>
                     {selectedCorrId === corr.id && (
                       <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />
                     )}
                  </div>
                  <div className="mt-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full text-[10px] font-bold text-white whitespace-nowrap shadow-sm">
                    {corr.name}
                  </div>
                </motion.div>
              </AdvancedMarker>
            ))}

            {activeRouteDest && userLocation && (
              <RouteDisplay origin={userLocation} destination={activeRouteDest} />
            )}
          </Map>

          {/* Interactive Bottom Sheet overlay */}
          <AnimatePresence>
            {selectedCorregimiento && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40 overflow-hidden flex flex-col z-20"
              >
                <div className="flex-none p-4 sticky top-0 bg-white/50 backdrop-blur-md border-b border-stone-200/50 z-10">
                  <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-3" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCorregimiento.color }} />
                        {selectedCorregimiento.name}
                      </h2>
                      {info && <p className="text-sm font-medium text-stone-500 mt-1">{info.phrase}</p>}
                    </div>
                    <button 
                      onClick={() => { setSelectedCorrId(null); setActiveRouteDest(null); }}
                      className="w-8 h-8 bg-stone-100 hover:bg-stone-200 rounded-full flex items-center justify-center text-stone-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => onSelectCorregimiento(selectedCorregimiento.name)}
                      className="flex-1 bg-stone-900 text-white font-bold py-2.5 rounded-xl text-sm shadow-md active:scale-[0.98] transition-transform"
                    >
                      Explorar Eventos
                    </button>
                    {userLocation && (
                      <button 
                        onClick={() => setActiveRouteDest(selectedCorregimiento.position)}
                        className="flex-1 bg-[#f39233] text-white font-bold py-2.5 rounded-xl text-sm flex justify-center items-center gap-1 shadow-md active:scale-[0.98] transition-transform"
                      >
                        <span className="material-symbols-outlined text-[18px]">directions</span>
                        Cómo llegar
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide pb-20">
                  {info?.image && (
                    <img src={info.image} alt={selectedCorregimiento.name} className="w-full h-32 object-cover rounded-2xl shadow-sm" />
                  )}
                  
                  <div>
                    <h3 className="font-bold text-stone-800 text-sm mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#f39233] text-lg">celebration</span>
                      Eventos Activos ({publications.length})
                    </h3>
                    
                    {publications.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {publications.map((pub, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-2.5 shadow-sm border border-stone-100 flex gap-3 hover:border-stone-300 transition-colors">
                            <img src={pub.image} alt={pub.title} className="w-16 h-16 rounded-lg object-cover bg-stone-100" />
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <span className="text-[10px] font-bold text-[#f39233] uppercase tracking-wider">{pub.category}</span>
                              <h4 className="font-bold text-sm text-stone-800 truncate">{pub.title}</h4>
                              <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">{pub.dateRange}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-stone-50 rounded-xl p-4 text-center border text-sm text-stone-500">
                        No hay eventos actuales registrados aquí.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </APIProvider>
      </div>
    </div>
  );
}

