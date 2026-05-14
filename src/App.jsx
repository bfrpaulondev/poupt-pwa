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
  Plus,
  WalletCards,
  FlaskConical,
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

const primaryTabs = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'addTransaction', label: 'Adicionar', icon: Plus },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'coach', label: 'Coach', icon: Bot },
  { id: 'profile', label: 'Perfil', icon: User },
];

const menuItems = [
  { id: 'jars', label: 'Frascos', description: 'Distribuição do rendimento', icon: FlaskConical },
  { id: 'debts', label: 'Dívidas', description: 'Formais, informais e Snowball', icon: CreditCard },
  { id: 'goals', label: 'Objetivos', description: 'Metas e poupanças', icon: Target },
  { id: 'investments', label: 'Investimentos', description: 'Carteira e evolução', icon: Building2 },
  { id: 'survival', label: 'Modo Sobrevivência', description: 'Plano de emergência', icon: Shield },
  { id: 'poupMoedas', label: 'PoupMoedas', description: 'Saldo e loja', icon: Coins },
  { id: 'settings', label: 'Definições', description: 'Conta, tema e privacidade', icon: Settings },
];

function BottomNav({ currentScreen, onTab }) {
  return (
    <div className="ui-bottom-nav-wrap">
      <nav className="ui-bottom-nav" aria-label="Navegação principal">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTab(tab.id)}
              className={isActive ? 'active' : ''}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TopBar({ user, hasUnreadNotif, onMenu, onAlerts }) {
  const firstName = user?.name ? user.name.split(' ')[0] : 'PoupPT';

  return (
    <header className="ui-app-topbar safe-area-top">
      <div className="ui-app-topbar-inner">
        <button type="button" onClick={onMenu} className="ui-icon-button" aria-label="Abrir menu">
          <Menu size={20} />
        </button>

        <div className="ui-brand">
          <div className="ui-brand-mark">P</div>
          <div>
            <p className="ui-brand-title">PoupPT</p>
            <p className="ui-brand-subtitle">Olá, {firstName}</p>
          </div>
        </div>

        <button type="button" onClick={onAlerts} className="ui-icon-button" aria-label="Notificações">
          <Bell size={19} />
          {hasUnreadNotif && <span className="ui-notification-dot" />}
        </button>
      </div>
    </header>
  );
}

function AppMenu({ isOpen, onClose, onNavigate, user }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="ui-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.aside
            className="ui-menu-panel"
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="ui-menu-header safe-area-top">
              <div className="ui-brand">
                <div className="ui-brand-mark">P</div>
                <div>
                  <p className="ui-brand-title">Menu</p>
                  <p className="ui-brand-subtitle">{user?.poupMoedas || 0} PoupMoedas</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="ui-icon-button" aria-label="Fechar menu">
                <X size={19} />
              </button>
            </div>

            <div className="ui-menu-list poupt-scroll">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="ui-menu-item"
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                  >
                    <Icon size={19} />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{item.label}</span>
                      <span className="block truncate text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function LoadingScreen({ theme }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: theme.background }}>
      <div className="text-center">
        <div className="ui-brand-mark mx-auto mb-4">P</div>
        <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>A carregar...</p>
      </div>
    </div>
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
  const theme = themes[currentTheme] || themes.cleanFinance || themes.darkGold;
  const hasUnreadNotif = useMemo(() => notifications?.some((n) => !n.read) || false, [notifications]);

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
    root.style.setProperty('--text-inverse', theme.textInverse);
    root.style.setProperty('--bg-primary', theme.background);
    root.style.setProperty('--bg-secondary', theme.surface);
    root.style.setProperty('--bg-surface-hover', theme.surfaceHover);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--danger', '#DC2626');
    root.style.setProperty('--success', '#16A34A');
    root.style.setProperty('--warning', '#D97706');
    root.style.setProperty('--is-dark', theme.isDark ? '1' : '0');
    root.style.setProperty('--glass-bg', theme.glassBg || theme.surface);
    root.style.setProperty('--glass-border', theme.glassBorder || theme.border);
    root.style.setProperty('--glass-strong-bg', theme.glassStrongBg || theme.surface);
    root.style.setProperty('--glass-strong-border', theme.glassStrongBorder || theme.border);
    root.style.setProperty('--gradient-start', theme.gradient[0]);
    root.style.setProperty('--gradient-end', theme.gradient[1]);
    root.style.setProperty('--shadow-color', theme.shadow);

    const jarKeys = ['necessities', 'freedom', 'savings', 'education', 'play', 'give'];
    const themeJarColors = theme.jarColors || [];
    jarKeys.forEach((key, idx) => {
      if (themeJarColors[idx]) {
        root.style.setProperty(`--jar-${key}`, themeJarColors[idx]);
      }
    });

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
    };

    init();
  }, []);

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

  if (!ready) {
    return <LoadingScreen theme={theme} />;
  }

  const isFullScreen = ['landing', 'login', 'register', 'onboarding'].includes(currentScreen);
  const ScreenComponent = screenComponents[currentScreen] || Dashboard;

  if (isFullScreen) {
    return (
      <div className="ui-app-shell">
        <div className="ui-app-content poupt-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18 }}
            >
              <Suspense fallback={<LoadingScreen theme={theme} />}>
                <ErrorBoundary>
                  <ScreenComponent />
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="ui-app-shell">
      <TopBar
        user={user}
        hasUnreadNotif={hasUnreadNotif}
        onMenu={() => setMenuOpen(true)}
        onAlerts={() => setScreen('alerts')}
      />

      <main className="ui-app-content poupt-scroll">
        <div className="ui-app-content-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18 }}
            >
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-64" style={{ color: theme.textMuted }}>
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
      </main>

      <BottomNav currentScreen={currentScreen} onTab={setScreen} />

      <AppMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={setScreen}
        user={user}
      />

      <OfflineIndicator />
    </div>
  );
}

export default App;
