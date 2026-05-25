import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type LanguageCode = 'es_LA' | 'es_ES' | 'en_US' | 'en_UK' | 'pt_BR' | 'fr_FR' | 'it_IT' | 'de_DE';

interface Translations {
  [key: string]: {
    [K in LanguageCode]: string;
  };
}

const translations: Translations = {
  // Common UI
  'search_placeholder': {
    'es_LA': 'Buscar experiencias...',
    'es_ES': 'Buscar experiencias...',
    'en_US': 'Search experiences...',
    'en_UK': 'Search experiences...',
    'pt_BR': 'Buscar experiências...',
    'fr_FR': 'Rechercher des expériences...',
    'it_IT': 'Cerca esperienze...',
    'de_DE': 'Erlebnisse suchen...',
  },
  'profile': {
    'es_LA': 'Perfil',
    'es_ES': 'Perfil',
    'en_US': 'Profile',
    'en_UK': 'Profile',
    'pt_BR': 'Perfil',
    'fr_FR': 'Profil',
    'it_IT': 'Profilo',
    'de_DE': 'Profil',
  },
  'saved': {
    'es_LA': 'Guardados',
    'es_ES': 'Guardados',
    'en_US': 'Saved',
    'en_UK': 'Saved',
    'pt_BR': 'Salvos',
    'fr_FR': 'Enregistrés',
    'it_IT': 'Salvati',
    'de_DE': 'Gespeichert',
  },
  'home': {
    'es_LA': 'Inicio',
    'es_ES': 'Inicio',
    'en_US': 'Home',
    'en_UK': 'Home',
    'pt_BR': 'Início',
    'fr_FR': 'Accueil',
    'it_IT': 'Home',
    'de_DE': 'Startseite',
  },
  'calendar': {
    'es_LA': 'Calendario',
    'es_ES': 'Calendario',
    'en_US': 'Calendar',
    'en_UK': 'Calendar',
    'pt_BR': 'Calendário',
    'fr_FR': 'Calendrier',
    'it_IT': 'Calendario',
    'de_DE': 'Kalender',
  },
  'map': {
    'es_LA': 'Mapa',
    'es_ES': 'Mapa',
    'en_US': 'Map',
    'en_UK': 'Map',
    'pt_BR': 'Mapa',
    'fr_FR': 'Carte',
    'it_IT': 'Mappa',
    'de_DE': 'Karte',
  },
  // Profile Stats
  'trips': {
    'es_LA': 'VIAJES',
    'es_ES': 'VIAJES',
    'en_US': 'TRIPS',
    'en_UK': 'TRIPS',
    'pt_BR': 'VIAGENS',
    'fr_FR': 'VOYAGES',
    'it_IT': 'VIAGGI',
    'de_DE': 'REISEN',
  },
  'saved_stat': {
    'es_LA': 'GUARDADOS',
    'es_ES': 'GUARDADOS',
    'en_US': 'SAVED',
    'en_UK': 'SAVED',
    'pt_BR': 'SALVOS',
    'fr_FR': 'ENREGISTRÉS',
    'it_IT': 'SALVATI',
    'de_DE': 'GESPEICHERT',
  },
  'reviews': {
    'es_LA': 'RESEÑAS',
    'es_ES': 'RESEÑAS',
    'en_US': 'REVIEWS',
    'en_UK': 'REVIEWS',
    'pt_BR': 'AVALIAÇÕES',
    'fr_FR': 'AVIS',
    'it_IT': 'RECENSIONI',
    'de_DE': 'BEWERTUNGEN',
  },
  // Settings
  'language_preferences': {
    'es_LA': 'Preferencias de Idioma',
    'es_ES': 'Preferencias de Idioma',
    'en_US': 'Language Preferences',
    'en_UK': 'Language Preferences',
    'pt_BR': 'Preferências de Idioma',
    'fr_FR': 'Préférences linguistiques',
    'it_IT': 'Preferenze lingua',
    'de_DE': 'Spracheinstellungen',
  },
  'confirm_selection': {
    'es_LA': 'Confirmar Selección',
    'es_ES': 'Confirmar Selección',
    'en_US': 'Confirm Selection',
    'en_UK': 'Confirm Selection',
    'pt_BR': 'Confirmar Seleção',
    'fr_FR': 'Confirmer la sélection',
    'it_IT': 'Conferma selezione',
    'de_DE': 'Auswahl bestätigen',
  }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved as LanguageCode) || 'es_LA';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    if (!translations[key]) return key;
    return translations[key][language] || translations[key]['es_LA'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
