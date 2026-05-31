import { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import EnterCodeScreen from './components/EnterCodeScreen';
import ResetPasswordScreen from './components/ResetPasswordScreen';
import HomeScreen from './components/HomeScreen';
import CalendarScreen from './components/CalendarScreen';
import MapScreen from './components/MapScreen';
import ProfileScreen from './components/ProfileScreen';
import PersonalInfoScreen from './components/PersonalInfoScreen';
import PrivacySettingsScreen from './components/PrivacySettingsScreen';
import LanguageSettingsScreen from './components/LanguageSettingsScreen';
import HelpSupportScreen from './components/HelpSupportScreen';
import CorregimientosScreen from './components/CorregimientosScreen';
import CorregimientoDetailScreen from './components/CorregimientoDetailScreen';
import SavedScreen from './components/SavedScreen';
import FeaturedAllScreen from './components/FeaturedAllScreen';
import AccountsManagerScreen from './components/AccountsManagerScreen';
import CreateContentScreen from './components/CreateContentScreen';
import ManagePublicationsScreen from './components/ManagePublicationsScreen';
import BottomNav from './components/BottomNav';
import { ScreenType } from './types';
import { initAuth, logout } from './firebaseAuth';
import { Publication } from './data/publications';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [selectedCorregimiento, setSelectedCorregimiento] = useState<string | null>(null);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const target = sessionStorage.getItem('reloadTargetScreen');
    const unsubscribe = initAuth((user) => {
      if (target) {
        setCurrentScreen(target as ScreenType);
        sessionStorage.removeItem('reloadTargetScreen');
      } else {
        // Always start the application on the initial login/welcome screen when loaded
        setCurrentScreen('welcome');
      }
      setIsAuthChecking(false);
    }, () => {
      if (target) {
        setCurrentScreen(target as ScreenType);
        sessionStorage.removeItem('reloadTargetScreen');
      } else {
        setCurrentScreen('welcome');
      }
      setIsAuthChecking(false);
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (screen: ScreenType) => {
    if (screen !== 'create_content') {
      setEditingPublication(null);
    }
    setCurrentScreen(screen);
    const container = document.getElementById('app-scroll-container');
    if (container) {
      container.scrollTop = 0;
    }
  };

  const handleEditPublication = (pub: Publication) => {
    setEditingPublication(pub);
    setCurrentScreen('create_content');
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#f39233] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-stone-100 flex flex-col items-center justify-center overflow-hidden">
      <div 
        className="fixed sm:relative inset-0 sm:inset-auto bg-white flex flex-col w-full sm:max-w-[412px] h-full sm:h-[880px] sm:max-h-[92vh] overflow-hidden sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-stone-200/50 transition-all"
      >
        <div id="app-scroll-container" className="flex-1 overflow-x-hidden overflow-y-auto relative scrollbar-hide scroll-smooth w-full h-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          {currentScreen === 'welcome' && <WelcomeScreen onNavigateLogin={() => handleNavigate('login')} onNavigateGuest={() => handleNavigate('home')} />}
          {currentScreen === 'login' && <LoginScreen onLogin={() => handleNavigate('home')} onNavigateRegister={() => handleNavigate('register')} onNavigateForgotPassword={() => handleNavigate('forgot_password')} />}
          {currentScreen === 'register' && <RegisterScreen onRegister={() => handleNavigate('home')} onNavigateLogin={() => handleNavigate('login')} />}
          {currentScreen === 'forgot_password' && <ForgotPasswordScreen onNavigateLogin={() => handleNavigate('login')} onNavigateEnterCode={() => handleNavigate('enter_code')} />}
          {currentScreen === 'enter_code' && <EnterCodeScreen onNavigateLogin={() => handleNavigate('login')} onVerifySuccess={() => handleNavigate('reset_password')} />}
          {currentScreen === 'reset_password' && <ResetPasswordScreen onResetSuccess={() => handleNavigate('login')} onCancel={() => handleNavigate('login')} />}
          {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} onEdit={handleEditPublication} onSelectCorregimiento={(c) => { setSelectedCorregimiento(c); handleNavigate('corregimiento_detail'); }} />}
          {currentScreen === 'calendar' && <CalendarScreen onNavigate={handleNavigate} onEdit={handleEditPublication} />}
          {currentScreen === 'corregimientos' && <CorregimientosScreen onNavigate={handleNavigate} onSelectCorregimiento={(c) => { setSelectedCorregimiento(c); handleNavigate('corregimiento_detail'); }} />}
          {currentScreen === 'corregimiento_detail' && <CorregimientoDetailScreen onNavigate={handleNavigate} onEdit={handleEditPublication} corregimientoName={selectedCorregimiento || 'Gualmatán'} onSelectCorregimiento={(c) => setSelectedCorregimiento(c)} />}
          {currentScreen === 'map' && <MapScreen onNavigate={handleNavigate} onSelectCorregimiento={(c) => { setSelectedCorregimiento(c); handleNavigate('corregimiento_detail'); }} />}
          {currentScreen === 'saved' && <SavedScreen onNavigate={handleNavigate} onEdit={handleEditPublication} />}
          {currentScreen === 'featured_all' && <FeaturedAllScreen onNavigate={handleNavigate} onEdit={handleEditPublication} onSelectCorregimiento={(c) => { setSelectedCorregimiento(c); handleNavigate('corregimiento_detail'); }} />}
          {currentScreen === 'profile' && <ProfileScreen onNavigate={handleNavigate} onEdit={handleEditPublication} onLogout={async () => {
            await logout();
            handleNavigate('welcome');
          }} />}
          {currentScreen === 'personal_info' && <PersonalInfoScreen onNavigate={handleNavigate} />}
          {currentScreen === 'privacy_settings' && <PrivacySettingsScreen onNavigate={handleNavigate} />}
          {currentScreen === 'language_settings' && <LanguageSettingsScreen onNavigate={handleNavigate} />}
          {currentScreen === 'help_support' && <HelpSupportScreen onNavigate={handleNavigate} />}
          {currentScreen === 'accounts_manager' && <AccountsManagerScreen onNavigate={handleNavigate} />}
          {currentScreen === 'create_content' && <CreateContentScreen onNavigate={handleNavigate} editingPublication={editingPublication} />}
          {currentScreen === 'manage_publications' && <ManagePublicationsScreen onNavigate={handleNavigate} onEdit={handleEditPublication} />}
        </div>
        
        {currentScreen !== 'welcome' && currentScreen !== 'login' && currentScreen !== 'register' && currentScreen !== 'forgot_password' && currentScreen !== 'enter_code' && currentScreen !== 'reset_password' && currentScreen !== 'profile' && currentScreen !== 'personal_info' && currentScreen !== 'privacy_settings' && currentScreen !== 'language_settings' && currentScreen !== 'help_support' && <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />}
      </div>
    </div>
  );
}
