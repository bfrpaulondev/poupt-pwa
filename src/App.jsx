import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import { themes } from './themes';
import { api } from './services/api';
import { setCurrencyGlobal } from './utils/helpers';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import {
  Home,
  FlaskConical,
  Bot,
  CreditCard,
  User,
  Menu,
  X,
  Target,
  BarChart3,
  Bell,
  Building2,
  Shield,
  Coins,
  Settings,
  ChevronRight,
} from 'lucide-react';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Jars from './pages/Jars';
import Coach from './pages/Coach';
import Debts from './pages/Debts';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import AddTransaction from './pages/AddTransaction';
import MoedasStore from './pages/MoedasStore';
import Investments from './pages/Investments';
import SurvivalMode from './pages/SurvivalMode';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';

const screenComponents = {
  landing: Landing,
  login: Login,
  register: Register,
  onboarding: Onboarding,
  dashboard: Dashboard,
  jars: Jars,
  coach: Coach,
  debts: Debts,
  goals: Goals,
  profile: Profile,
  settings: SettingsPage,
  addTransaction: AddTransaction,
  poupMoedas: MoedasStore,
  investments: Investments,
  survival: SurvivalMode,
  alerts: Notifications,
  reports: Reports,
};

const tabs = [
  { id: 'dashboard', label: 'Inicio', icon: Home },
  { id: 'jars', label: 'Frascos', icon: FlaskConical },
  { id: 'coach', label: 'Coach', icon: Bot },
  { id: 'debts', label: 'Dividas', icon: CreditCard },
  { id: 'profile', label: 'Perfil', icon: User },
];

const menuItems = [
  { id: 'goals', label: 'Objetivos', icon: Target },
  { id: 'reports', label: 'Relatorios', icon: BarChart3 },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'investments', label: 'Investimentos', icon: Building2 },
  { id: 'survival', label: 'Modo Sobrevivencia', icon: Shield },
  { id: 'poupMoedas', label: 'Loja PoupMoedas', icon: Coins },
  { id: 'settings', label: 'Configuracoes', icon: Settings },
];

function BottomNav({ theme, currentScreen, onTab }) {
  return (
    <div
      className="flex items-center justify-around px-1 py-2 border-t safe-area-bottom"
      style={{
        background: theme.surface,
        borderColor: theme.border,
      }}
    >
      {tabs.map((tab) => {
        const isActive = currentScreen === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onTab(tab.id)}
            className="flex flex-1 flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all duration-200"
            style={{
              color: isActive ? theme.primary : theme.textMuted,
              background: isActive ? `${theme.primary}15` : 'transparent',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function HamburgerMenu({ theme, isOpen, onClose, onNavigate, user }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ background: '#000' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-[280px] flex flex-col"
            style={{ background: theme.surface }}
          >
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: theme.border }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🐷</span>
                <span
                  className="font-bold text-lg gradient-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                  }}
                >
                  PoupPT
                </span>
              </div>

              <button onClick={onClose} style={{ color: theme.textMuted }}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto poupt-scroll py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 w-full px-5 py-3.5 text-left transition-colors duration-150 hover:opacity-80"
                    style={{ color: theme.text }}
                  >
                    <Icon size={18} style={{ color: theme.textMuted }} />
                    <span className="text-sm font-medium flex-1">
                      {item.label}
                    </span>
                    <ChevronRight size={14} style={{ color: theme.textMuted }} />
                  </button>
                );
              })}
            </div>

            <div className="p-5 border-t" style={{ borderColor: theme.border }}>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: theme.textMuted }}
              >
                <span>🪙</span>
                <span>PoupMoedas: {user?.poupMoedas || 0}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function App() {
  const {
    currentScreen,
    setScreen,
    currentTheme,
    menuOpen,
    setMenuOpen,
    restoreSession,
    user,
    logout,
  } = useStore();

  const [ready, setReady] = useState(false);
  const theme = themes[currentTheme] || themes.darkGold;

  useEffect(() => {
    if (user?.currency) {
      setCurrencyGlobal(user.currency);
    }
  }, [user?.currency]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--gold', theme.primary);
    root.style.setProperty('--gold-light', theme.primaryLight);
    root.style.setProperty('--gold-dark', theme.primaryDark);
    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--text-secondary', theme.textMuted);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--bg-primary', theme.background);
    root.style.setProperty('--bg-secondary', theme.surface);
    root.style.setProperty('--bg-surface-hover', theme.surfaceHover);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--danger', '#EF4444');
    root.style.setProperty('--success', '#10B981');
    root.style.setProperty('--warning', '#F59E0B');
  }, [theme]);

  useEffect(() => {
    const init = async () => {
      restoreSession();

      const savedUser = JSON.parse(localStorage.getItem('poupt_user') || 'null');

      if (savedUser?.currency) {
        setCurrencyGlobal(savedUser.currency);
      }

      setReady(true);

      const token = localStorage.getItem('poupt_token');

      if (token && token !== 'mock-token-123') {
        try {
          const res = await api.getMe();

          if (res.data?.user) {
            const freshUser = res.data.user;
            localStorage.setItem('poupt_user', JSON.stringify(freshUser));
            useStore.getState().updateUser(freshUser);
          }
        } catch (err) {
          const msg = (err.message || '').toLowerCase();

          if (
            msg.includes('401') ||
            msg.includes('unauthorized') ||
            msg.includes('invalid token') ||
            msg.includes('jwt')
          ) {
            logout();
          }
        }
      }

      const hash = window.location.hash.slice(1);

      if (hash && screenComponents[hash]) {
        const savedToken = localStorage.getItem('poupt_token');

        if (savedToken) {
          setScreen(hash);
        }
      }
    };

    init();
  }, []);

  useEffect(() => {
    const link = document.createElement('link');

    link.href =
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';

    document.head.appendChild(link);
  }, []);

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: theme.background }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            }}
          >
            <span className="text-2xl font-bold text-black">P</span>
          </div>

          <p className="text-sm" style={{ color: theme.textMuted }}>
            A carregar...
          </p>
        </div>
      </div>
    );
  }

  const isFullScreen = ['landing', 'login', 'register', 'onboarding'].includes(
    currentScreen
  );

  const ScreenComponent = screenComponents[currentScreen] || Dashboard;

  const handleTab = (id) => {
    setScreen(id);
    window.location.hash = id;
  };

  return (
    <div
      className="relative flex flex-col w-full h-screen max-h-screen overflow-hidden"
      style={{
        background: theme.background,
        transition: 'background-color 0.5s ease',
      }}
    >
      {!isFullScreen && (
        <div className="shrink-0" style={{ background: theme.background }}>
          <div className="mx-auto flex w-full max-w-[390px] items-center justify-between px-3 py-2">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-xl transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: theme.primary }}>
                🐷 PoupPT
              </span>
            </div>

            <button
              onClick={() => setScreen('alerts')}
              className="p-2 rounded-xl relative"
              style={{ color: theme.text }}
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4D5E]" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto poupt-scroll">
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: isFullScreen ? 'none' : 390,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Suspense
                fallback={
                  <div
                    className="flex items-center justify-center h-64"
                    style={{ color: theme.textMuted }}
                  >
                    A carregar...
                  </div>
                }
              >
                <ErrorBoundary>
                  <ScreenComponent />
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {!isFullScreen && (
        <div className="mx-auto w-full max-w-[390px] shrink-0">
          <BottomNav
            theme={theme}
            currentScreen={currentScreen}
            onTab={handleTab}
          />
        </div>
      )}

      <HamburgerMenu
        theme={theme}
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={(id) => setScreen(id)}
        user={user}
      />

      <OfflineIndicator />
    </div>
  );
}

export default App;