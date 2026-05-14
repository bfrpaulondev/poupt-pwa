import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
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

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Jars = lazy(() => import('./pages/Jars'));
const Coach = lazy(() => import('./pages/Coach'));
const Debts = lazy(() => import('./pages/Debts'));
const Goals = lazy(() => import('./pages/Goals'));
const Profile = lazy(() => import('./pages/Profile'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const AddTransaction = lazy(() => import('./pages/AddTransaction'));
const MoedasStore = lazy(() => import('./pages/MoedasStore'));
const Investments = lazy(() => import('./pages/Investments'));
const SurvivalMode = lazy(() => import('./pages/SurvivalMode'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Reports = lazy(() => import('./pages/Reports'));

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
      className="flex items-center justify-around px-1 py-1.5 border-t safe-area-bottom"
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
            className="flex flex-1 flex-col items-center gap-0.5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 min-h-[48px]"
            style={{
              color: isActive ? theme.primary : theme.textMuted,
              background: isActive ? `${theme.primary}15` : 'transparent',
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[11px] font-medium">{tab.label}</span>
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
            className="fixed top-0 left-0 bottom-0 z-50 w-[min(280px,80vw)] flex flex-col"
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
                    className="flex items-center gap-3 w-full px-5 py-4 text-left transition-colors duration-150 hover:opacity-80 min-h-[48px]"
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
    notifications,
  } = useStore();

  const [ready, setReady] = useState(false);
  const theme = themes[currentTheme] || themes.darkGold;
  const hasUnreadNotif = useMemo(() => notifications?.some(n => !n.read) || false, [notifications]);

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
    root.style.setProperty('--is-dark', theme.isDark ? '1' : '0');
    root.style.setProperty('--glass-bg', theme.glassBg || 'rgba(255,255,255,0.06)');
    root.style.setProperty('--glass-border', theme.glassBorder || 'rgba(255,255,255,0.08)');
    root.style.setProperty('--glass-strong-bg', theme.glassStrongBg || 'rgba(255,255,255,0.1)');
    root.style.setProperty('--glass-strong-border', theme.glassStrongBorder || 'rgba(255,255,255,0.12)');
    root.style.setProperty('--gradient-start', theme.gradient[0]);
    root.style.setProperty('--gradient-end', theme.gradient[1]);
    root.style.setProperty('--shadow-color', theme.shadow);

    // Apply jar colors from theme
    const jarKeys = ['necessities', 'freedom', 'savings', 'education', 'play', 'give'];
    const themeJarColors = theme.jarColors || [];
    jarKeys.forEach((key, idx) => {
      if (themeJarColors[idx]) {
        root.style.setProperty(`--jar-${key}`, themeJarColors[idx]);
      }
    });

    // Update meta theme-color for PWA
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme.background);
    }
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
      // Note: hash-based navigation is already handled by restoreSession in the store
    };

    init();
  }, []);

  // Hash navigation back-button listener
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && hash !== currentScreen) {
        setScreen(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentScreen, setScreen]);

  // Font Inter is loaded via CSS @import in index.css - no need for JS append

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
        <div className="shrink-0 safe-area-top" style={{ background: theme.background }}>
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 sm:px-6 py-3">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2.5 rounded-xl transition-colors duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
              className="p-2.5 rounded-xl relative min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{ color: theme.text }}
            >
              <Bell size={20} />
              {hasUnreadNotif && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF4D5E]" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto poupt-scroll">
        <div
          className="mx-auto w-full"
          style={{
            maxWidth: isFullScreen ? 'none' : '42rem',
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
        <div className="mx-auto w-full max-w-2xl shrink-0">
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