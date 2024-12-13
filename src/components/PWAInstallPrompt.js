import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, BanIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PWAInstallPrompt = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  
  // Detectar plataforma
  const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 
                  /Android/.test(navigator.userAgent) ? 'android' : 'other';

  const benefits = [
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Acceso Instantáneo",
      description: "Accede a la aplicación directamente desde tu pantalla de inicio sin necesidad de abrir el navegador"
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Modo Sin Conexión",
      description: "Continúa usando la aplicación incluso cuando no tengas conexión a internet"
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Notificaciones Nativas",
      description: "Recibe notificaciones importantes directamente en tu dispositivo como una app nativa"
    },
    {
      icon: (
        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Mayor Rendimiento",
      description: "Disfruta de una experiencia más fluida y rápida que la versión web tradicional"
    }
  ];

  useEffect(() => {
    // Verificar si ya se mostró y el usuario eligió no ver más
    const dontShow = localStorage.getItem('pwaPromptDontShow');
    if (dontShow === 'true') return;

    // Verificar si se está mostrando después de "Ver más tarde"
    const remindLater = localStorage.getItem('pwaPromptRemindLater');
    if (remindLater && Date.now() < parseInt(remindLater)) return;

    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isInstalled) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsVisible(true);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', () => {});
    };
  }, []);

  // Carousel auto-play
  useEffect(() => {
    if (!isPaused && isVisible) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % benefits.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isPaused, isVisible, benefits.length]);

  const handleInstall = async () => {
    if (platform === 'ios') {
      navigate('/installIOS');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  const handleRemindLater = () => {
    const remindTime = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
    localStorage.setItem('pwaPromptRemindLater', remindTime.toString());
    setIsVisible(false);
  };

  const handleDontShow = () => {
    localStorage.setItem('pwaPromptDontShow', 'true');
    setIsVisible(false);
  };

  const navigateSlide = useCallback((direction) => {
    setCurrentSlide((prev) => {
      if (direction === 'next') return (prev + 1) % benefits.length;
      if (direction === 'prev') return prev === 0 ? benefits.length - 1 : prev - 1;
      return prev;
    });
  }, [benefits.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex justify-end mb-2">
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Carousel */}
        <div 
          className="relative mb-8 h-48"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center transform transition-all duration-500 ease-out">
              <div className="text-primary mb-4 flex align-center justify-center">
                {benefits[currentSlide].icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {benefits[currentSlide].title}
              </h3>
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                {benefits[currentSlide].description}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigateSlide('prev')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => navigateSlide('next')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
            {benefits.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-primary w-4' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Install Button */}
        <button
          onClick={handleInstall}
          className="w-full mb-3 bg-primary text-white py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          {platform === 'ios' ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.4-2.03 4.3-3.74 4.25z"/>
            </svg>
          ) : platform === 'android' ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M17.523 15.354l1.404-2.432a.5.5 0 00-.866-.5l-1.42 2.46A9.042 9.042 0 0112 13.5c-1.717 0-3.3.484-4.641 1.382l-1.42-2.46a.5.5 0 00-.866.5l1.404 2.432A9.033 9.033 0 013 21.5h18a9.033 9.033 0 01-3.477-6.146zM6.5 18a.5.5 0 110-1 .5.5 0 010 1zm11 0a.5.5 0 110-1 .5.5 0 010 1zM15.668 3.753L17.086 1.5a.5.5 0 10-.866-.5L14.8 3.447a9.018 9.018 0 00-5.6 0L7.78 1a.5.5 0 10-.866.5l1.418 2.253A8.976 8.976 0 003 12.5h18a8.976 8.976 0 00-5.332-8.747z"/>
            </svg>
          ) : null}
          {platform === 'ios' ? 'Instalar en iPhone' : 
           platform === 'android' ? 'Instalar en Android' : 
           'Instalar aplicación'}
        </button>

        {/* Secondary Buttons */}
        <button
          onClick={handleRemindLater}
          className="w-full mb-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Recordar más tarde
        </button>

        <button
          onClick={handleDontShow}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <BanIcon className="w-4 h-4" />
          No mostrar más
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;