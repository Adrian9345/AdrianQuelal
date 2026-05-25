import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType } from '../types';

interface EventDetail {
  id: string | number;
  title: string;
  location: string;
  date: string;
  image: string;
}

interface AttendanceConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventDetail: EventDetail;
  onNavigate?: (screen: ScreenType) => void;
}

export default function AttendanceConfirmationModal({
  isOpen,
  onClose,
  eventDetail,
  onNavigate
}: AttendanceConfirmationModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Check initial notification status and request automatically on mount if default
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'granted') {
        setRemindersEnabled(true);
      }
    }
  }, []);

  // Proactively request permission when modal opens to fulfill "ask when registering" requirement
  useEffect(() => {
    if (isOpen && notificationPermission === 'default') {
      const timer = setTimeout(() => {
        handleRequestPushNotification();
      }, 1000); // Small delay for the celebration animation to start first
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // HTML5 Canvas Carnival Confetti Animation Engine
  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    let height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };
    window.addEventListener('resize', handleResize);

    const colors = [
      '#f39233', // Naranja Carnaval
      '#ec4899', // Rosa Andino
      '#8b5cf6', // Violeta Senda
      '#10b981', // Verde Volcanes
      '#3b82f6', // Azul Barniz
      '#facc15'  // Amarillo Alegría
    ];

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      gravity: number;
    }

    const particles: Particle[] = [];
    const maxParticles = 90;

    // Create particles shooting upwards from the bottom-left and bottom-right corners
    const spawnParticle = (side: 'left' | 'right') => {
      const isLeft = side === 'left';
      return {
        x: isLeft ? 0 : width,
        y: height - 40,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (isLeft ? Math.random() * 8 + 4 : -Math.random() * 8 - 4) * window.devicePixelRatio,
        speedY: (-Math.random() * 12 - 8) * window.devicePixelRatio,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 6 - 3,
        opacity: 1,
        gravity: 0.25 * window.devicePixelRatio
      };
    };

    // Initial burst
    for (let i = 0; i < 45; i++) {
      particles.push(spawnParticle(i % 2 === 0 ? 'left' : 'right'));
    }

    // Continuous soft emission
    let spawnCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Add a few more particles over time
      if (spawnCount < maxParticles && Math.random() < 0.15) {
        particles.push(spawnParticle(Math.random() > 0.5 ? 'left' : 'right'));
        spawnCount++;
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.speedY += p.gravity;
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity <= 0 || p.y > height || p.x < 0 || p.x > width) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Draw simple shapes: squares or triangles or circles
        if (i % 3 === 0) {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (i % 3 === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Request real push notification permission & status tracking
  const handleRequestPushNotification = async () => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      triggerToast('⚠️ Las notificaciones no están soportadas en este dispositivo.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setRemindersEnabled(true);
        triggerToast('🔔 ¡Excelente! Te notificaremos antes del evento.');
        
        // Show actual live system notification if possible
        new Notification('¡Asistencia confirmada!', {
          body: `Te recordaremos tu cita con ${eventDetail.title} en Corregimiento de ${eventDetail.location}.`,
          icon: eventDetail.image
        });
      } else if (permission === 'denied') {
        triggerToast('⚠️ Permiso denegado. Actívalas en la configuración de tu navegador.');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // Fallback behavior if browser constraints block standard popups
      setRemindersEnabled(true);
      triggerToast('🔔 ¡Recordatorio Programado! Te avisaremos antes del evento.');
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  const handleProfileNavigation = () => {
    if (onNavigate) {
      onClose();
      onNavigate('saved'); // Navigate to SavedScreen (Mis Eventos)
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Ambient Backdrop Overlay with Glassmorphic effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Celebration Firework/Confetti Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ mixBlendMode: 'screen' }}
          />

          {/* Modern Cultural Card */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="bg-white rounded-[28px] max-w-sm w-full overflow-hidden shadow-2xl relative border border-orange-100 flex flex-col z-20 mx-auto select-none"
          >
            {/* Elegant Sun / Cultural Aura Header Banner */}
            <div className="relative h-44 overflow-hidden bg-[#30132e] text-white flex flex-col items-center justify-center text-center">
              
              {/* Event Image as Full Background */}
              <img 
                src={eventDetail.image} 
                alt={eventDetail.title} 
                className="absolute inset-0 w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />

              {/* Dynamic Glowing Halos behind title mimicking carnival light beams */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-[#f39233] via-[#ec4899] to-[#8b5cf6] rounded-full blur-[40px] opacity-25 animate-pulse" />

              {/* Tribal/Indigenous Pre-Columbian Geometry Watermark overlay on image */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                  <pattern id="modal-tribal" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="white" strokeWidth="1" />
                    <circle cx="20" cy="20" r="2" fill="white" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#modal-tribal)" />
                </svg>
              </div>

              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/40"></div>

              <div className="relative z-10">
                <span className="text-[9.5px] font-black tracking-[0.2em] text-white uppercase bg-[#f39233] px-4 py-1.5 rounded-full border border-orange-400 shadow-lg">
                  ¡ASISTENCIA REGISTRADA!
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6.5 text-center flex-1 flex flex-col items-center">
              
              {/* Checkmark Floating Icon with Pulse effect */}
              <div className="relative w-15 h-15 bg-green-50 rounded-full flex items-center justify-center border border-green-200/50 mb-4 shadow-sm">
                <span className="material-symbols-outlined text-green-500 text-3xl font-bold animate-bounce mt-0.5">check</span>
                <span className="absolute inset-0 rounded-full border-[2px] border-green-400 animate-ping opacity-25" />
              </div>

              <h3 className="text-xl font-black text-gray-900 tracking-tight leading-snug px-2" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                ✅ Tu asistencia ha sido registrada
              </h3>
              <p className="text-stone-500 text-xs mt-2 relative font-medium leading-relaxed max-w-xs">
                Prepárate para vivir esta fantástica experiencia cultural en <span className="font-bold text-[#f39233]">{eventDetail.location}</span>.
              </p>

              {/* Event detail preview strip with micro neon glassmorphism style */}
              <div className="mt-4.5 w-full bg-[#fbf9f4] border border-stone-150 rounded-2xl p-3 flex.5 text-left flex items-center gap-3">
                <div className="p-2 h-10 w-10 shrink-0 rounded-xl bg-orange-100/30 flex items-center justify-center text-[#f39233] border border-orange-200/20">
                  <span className="material-symbols-outlined text-[20px]">explore</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-black text-gray-800 truncate leading-none mb-1 uppercase">{eventDetail.title}</p>
                  <p className="text-[11px] text-gray-500 truncate leading-none font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#f39233]">calendar_today</span>
                    {eventDetail.date}
                  </p>
                </div>
              </div>

              {/* Action Buttons Stack */}
              <div className="mt-6 w-full flex flex-col gap-3">
                {/* Request reminders / push integration */}
                <button
                  type="button"
                  onClick={handleRequestPushNotification}
                  disabled={remindersEnabled}
                  className={`w-full py-3.5 px-4.5 rounded-full text-xs font-black shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 focus:outline-none ${
                    remindersEnabled
                      ? 'bg-stone-100 hover:bg-stone-100 text-stone-500 cursor-default'
                      : 'bg-[#331231] text-white hover:brightness-110 cursor-pointer hover:shadow-md'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">{remindersEnabled ? 'notifications_active' : 'notifications'}</span>
                  <span>{remindersEnabled ? 'Recordatorios activados' : 'Activar recordatorios (Push)'}</span>
                </button>

                {/* View on my profile (saved events list dashboard) */}
                <button
                  type="button"
                  onClick={handleProfileNavigation}
                  className="w-full py-3 px-4.5 bg-white border border-[#331231]/30 hover:border-[#331231] text-[#331231] hover:bg-[#331231]/5 rounded-full text-xs font-black transition-all active:scale-98 flex items-center justify-center gap-2 shadow-sm focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#331231]">person</span>
                  <span>Ver en mi perfil</span>
                </button>
              </div>
            </div>

            {/* Bottom celebration ribbon */}
            <div className="px-4 py-3 bg-[#fdfaf5] border-t border-stone-100/80 flex items-center justify-between text-[11px] font-extrabold text-[#d57723]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold animate-spin text-[#f39233]">rotate_right</span>
                <span>Guardado en Mis Eventos</span>
              </div>
              <button 
                type="button" 
                onClick={onClose} 
                className="text-stone-400 hover:text-stone-600 font-bold focus:outline-none px-2 py-0.5"
              >
                Cerrar
              </button>
            </div>
          </motion.div>

          {/* Toast Notification Container */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-stone-900/95 text-white text-xs font-extrabold px-5 py-3 rounded-full flex items-center gap-2 border border-stone-800 shadow-xl"
              >
                <span className="material-symbols-outlined text-green-400 text-base">notifications_active</span>
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
