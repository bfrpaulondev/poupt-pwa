<<<<<<< HEAD
import { useEffect, useMemo, useState, Suspense } from 'react';
=======
import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
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
  Plus,
  Sparkles,
  PiggyBank,
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

<<<<<<< HEAD
const primaryNav = [
  { id: 'dashboard', label: 'Início', icon: Home },
  { id: 'jars', label: 'Frascos', icon: FlaskConical },
  { id: 'coach', label: 'Coach', icon: Bot },
  { id: 'debts', label: 'Dívidas', icon: CreditCard },
  { id: 'profile', label: 'Perfil', icon: User },
];

const secondaryNav = [
  { id: 'goals', label: 'Objetivos', icon: Target },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'alerts', label: 'Alertas', icon: Bell },
  { id: 'investments', label: 'Investimentos', icon: Building2 },
  { id: 'survival', label: 'Modo Sobrevivência', icon: Shield },
  { id: 'poupMoedas', label: 'Loja PoupMoedas', icon: Coins },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const fullscreenScreens = ['landing', 'login', 'register', 'onboarding'];
const allNavItems = [...primaryNav, ...secondaryNav, { id: 'addTransaction', label: 'Adicionar', icon: Plus }];

function Logo({ theme }) {
  return (
    <div className="app-logo">
      <div
        className="app-logo-mark"
        style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }}
      >
        <PiggyBank size={19} />
      </div>
      <div className="min-w-0">
        <p className="app-logo-title">PoupPT</p>
        <p className="app-logo-subtitle">Gestão financeira</p>
      </div>
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
    </div>
  );
}

<<<<<<< HEAD
function NavButton({ item, isActive, onNavigate, compact = false }) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(item.id)}
      className={`app-nav-button ${isActive ? 'is-active' : ''} ${compact ? 'is-compact' : ''}`}
      title={item.label}
    >
      <Icon size={19} />
      {!compact && <span>{item.label}</span>}
    </button>
  );
}

function DesktopSidebar({ theme, currentScreen, onNavigate, user }) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-header">
        <Logo theme={theme} />
      </div>

      <nav className="app-sidebar-nav poupt-scroll">
        <div className="app-nav-group">
          <p className="app-nav-label">Principal</p>
          {primaryNav.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentScreen === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="app-nav-group">
          <p className="app-nav-label">Ferramentas</p>
          {secondaryNav.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentScreen === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="app-sidebar-footer">
        <div className="app-balance-card">
          <span>PoupMoedas</span>
          <strong>{user?.poupMoedas || 0}</strong>
        </div>
      </div>
    </aside>
  );
}

function MobileDrawer({ theme, isOpen, currentScreen, onClose, onNavigate, user }) {
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="ui-menu-backdrop"
            initial={{ opacity: 0 }}
<<<<<<< HEAD
            animate={{ opacity: 0.62 }}
            exit={{ opacity: 0 }}
            className="app-drawer-backdrop"
=======
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
            onClick={onClose}
          />

          <motion.aside
<<<<<<< HEAD
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="app-drawer"
          >
            <div className="app-drawer-header">
              <Logo theme={theme} />
              <button type="button" onClick={onClose} className="app-icon-button">
                <X size={20} />
              </button>
            </div>

            <div className="app-drawer-user">
              <div>
                <span>{user?.name || 'Utilizador'}</span>
                <small>{user?.email || 'Conta PoupPT'}</small>
              </div>
              <div className="app-drawer-coins">
                <Coins size={14} />
                {user?.poupMoedas || 0}
              </div>
            </div>

            <nav className="app-drawer-nav poupt-scroll">
              {allNavItems.map((item) => {
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                const Icon = item.icon;
                const isActive = currentScreen === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
<<<<<<< HEAD
=======
                    className="ui-menu-item"
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
<<<<<<< HEAD
                    className={`app-drawer-link ${isActive ? 'is-active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </nav>
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

<<<<<<< HEAD
function MobileBottomNav({ currentScreen, onNavigate }) {
  return (
    <nav className="app-bottom-nav safe-area-bottom">
      {primaryNav.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`app-bottom-button ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.6 : 1.9} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Topbar({ theme, title, currentScreen, onMenu, onNavigate, user, unreadCount }) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button type="button" onClick={onMenu} className="app-icon-button app-mobile-only">
          <Menu size={22} />
        </button>
        <div>
          <p className="app-eyebrow">PoupPT</p>
          <h1>{title}</h1>
        </div>
      </div>

      <div className="app-topbar-actions">
        <button type="button" onClick={() => onNavigate('poupMoedas')} className="app-coin-pill">
          <Coins size={15} />
          <span>{user?.poupMoedas || 0}</span>
        </button>

        <button type="button" onClick={() => onNavigate('addTransaction')} className="app-action-button app-desktop-only">
          <Plus size={16} />
          <span>Adicionar</span>
        </button>

        <button type="button" onClick={() => onNavigate('alerts')} className="app-icon-button app-alert-button">
          <Bell size={19} />
          {unreadCount > 0 && <span>{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>

        <button type="button" onClick={() => onNavigate('settings')} className="app-icon-button app-desktop-only">
          <Settings size={19} />
        </button>
      </div>
    </header>
  );
}

function LoadingScreen({ theme }) {
  return (
    <div className="app-loading" style={{ background: theme.background }}>
      <div
        className="app-loading-mark"
        style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }}
      >
        <PiggyBank size={32} />
      </div>
      <p>A carregar...</p>
=======
function LoadingScreen({ theme }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: theme.background }}>
      <div className="text-center">
        <div className="ui-brand-mark mx-auto mb-4">P</div>
        <p className="text-sm font-semibold" style={{ color: theme.textMuted }}>A carregar...</p>
      </div>
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
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
<<<<<<< HEAD
  const theme = themes[currentTheme] || themes.darkGold;
  const isFullscreen = fullscreenScreens.includes(currentScreen);
  const ScreenComponent = screenComponents[currentScreen] || Dashboard;

  const pageTitle = useMemo(() => {
    return allNavItems.find((item) => item.id === currentScreen)?.label || 'PoupPT';
  }, [currentScreen]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const navigate = (screen) => {
    setScreen(screen);
    window.location.hash = screen;
  };
=======
  const theme = themes[currentTheme] || themes.cleanFinance || themes.darkGold;
  const hasUnreadNotif = useMemo(() => notifications?.some((n) => !n.read) || false, [notifications]);
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58

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
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--text-secondary', theme.textMuted);
    root.style.setProperty('--text-muted', theme.textMuted);
    root.style.setProperty('--text-inverse', theme.textInverse);
    root.style.setProperty('--bg-primary', theme.background);
    root.style.setProperty('--bg-secondary', theme.surface);
    root.style.setProperty('--bg-surface-hover', theme.surfaceHover);
    root.style.setProperty('--border', theme.border);
<<<<<<< HEAD
    root.style.setProperty('--shadow', theme.shadow);
    root.style.setProperty('--gradient-start', theme.gradient[0]);
    root.style.setProperty('--gradient-end', theme.gradient[1]);
    root.style.setProperty('--danger', '#EF4444');
    root.style.setProperty('--success', '#10B981');
    root.style.setProperty('--warning', '#F59E0B');
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
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
            useStore.getState().updateUser(res.data.user);
          }
        } catch (err) {
          const msg = (err.message || '').toLowerCase();
          if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid token') || msg.includes('jwt')) {
            logout();
          }
        }
      }
<<<<<<< HEAD

      const hash = window.location.hash.slice(1);
      if (hash && screenComponents[hash] && localStorage.getItem('poupt_token')) {
        setScreen(hash);
      }
=======
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
    };

    init();
  }, []);

<<<<<<< HEAD
=======
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

>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
  if (!ready) {
    return <LoadingScreen theme={theme} />;
  }

<<<<<<< HEAD
  if (isFullscreen) {
    return (
      <div className="app-fullscreen" style={{ background: theme.background }}>
        <Suspense fallback={<LoadingScreen theme={theme} />}>
          <ErrorBoundary>
            <ScreenComponent />
          </ErrorBoundary>
        </Suspense>
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
        <OfflineIndicator />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="app-shell" style={{ background: theme.background }}>
      <DesktopSidebar theme={theme} currentScreen={currentScreen} onNavigate={navigate} user={user} />

      <div className="app-main">
        <Topbar
          theme={theme}
          title={pageTitle}
          currentScreen={currentScreen}
          onMenu={() => setMenuOpen(true)}
          onNavigate={navigate}
          user={user}
          unreadCount={unreadCount}
        />

        <main className="app-content poupt-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              className={`app-page app-page-${currentScreen}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <Suspense fallback={<div className="app-page-loader">A carregar...</div>}>
=======
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                <ErrorBoundary>
                  <ScreenComponent />
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
<<<<<<< HEAD
        </main>
      </div>

      <MobileBottomNav currentScreen={currentScreen} onNavigate={navigate} />

      <MobileDrawer
        theme={theme}
=======
        </div>
      </main>

      <BottomNav currentScreen={currentScreen} onTab={setScreen} />

      <AppMenu
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
        isOpen={menuOpen}
        currentScreen={currentScreen}
        onClose={() => setMenuOpen(false)}
<<<<<<< HEAD
        onNavigate={navigate}
=======
        onNavigate={setScreen}
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
        user={user}
      />

      <OfflineIndicator />
    </div>
  );
}

export default App;
