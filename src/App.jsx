import { useEffect, useMemo, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import { themes } from './themes';
import { api } from './services/api';
import { setCurrencyGlobal } from './utils/helpers';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineIndicator from './components/OfflineIndicator';
import {
  Home, FlaskConical, Bot, CreditCard, User, Menu, X, Target,
  BarChart3, Bell, Building2, Shield, Coins, Settings,
  ChevronRight, Plus, PiggyBank,
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
  landing: Landing, login: Login, register: Register, onboarding: Onboarding,
  dashboard: Dashboard, jars: Jars, coach: Coach, debts: Debts, goals: Goals,
  profile: Profile, settings: SettingsPage, addTransaction: AddTransaction,
  poupMoedas: MoedasStore, investments: Investments, survival: SurvivalMode,
  alerts: Notifications, reports: Reports,
};

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

function Logo() {
  return (
    <div className="app-logo">
      <div className="app-logo-mark" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))' }}>
        <PiggyBank size={20} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="app-logo-title">PoupPT</p>
        <p className="app-logo-subtitle">Gestão financeira</p>
      </div>
    </div>
  );
}

function NavButton({ item, isActive, onNavigate }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.id)}
      className={`app-nav-button ${isActive ? 'is-active' : ''}`}
      title={item.label}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </button>
  );
}

function DesktopSidebar({ currentScreen, onNavigate, user }) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-header"><Logo /></div>
      <nav className="app-sidebar-nav poupt-scroll">
        <div className="app-nav-group">
          <p className="app-nav-label">Principal</p>
          {primaryNav.map((item) => (
            <NavButton key={item.id} item={item} isActive={currentScreen === item.id} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="app-nav-group">
          <p className="app-nav-label">Ferramentas</p>
          {secondaryNav.map((item) => (
            <NavButton key={item.id} item={item} isActive={currentScreen === item.id} onNavigate={onNavigate} />
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

function MobileDrawer({ isOpen, currentScreen, onClose, onNavigate, user }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.62 }}
            exit={{ opacity: 0 }}
            className="app-drawer-backdrop"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="app-drawer"
          >
            <div className="app-drawer-header">
              <Logo />
              <button type="button" onClick={onClose} className="app-icon-button" aria-label="Fechar menu">
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
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onNavigate(item.id); onClose(); }}
                    className={`app-drawer-link ${isActive ? 'is-active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function MobileBottomNav({ currentScreen, onNavigate }) {
  return (
    <nav className="app-bottom-nav">
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
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.9} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Topbar({ title, onMenu, onNavigate, user, unreadCount }) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button type="button" onClick={onMenu} className="app-icon-button app-mobile-only" aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <div>
          <p className="app-eyebrow">PoupPT</p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="app-topbar-actions">
        <button type="button" onClick={() => onNavigate('poupMoedas')} className="app-coin-pill">
          <Coins size={14} />
          <span>{user?.poupMoedas || 0}</span>
        </button>
        <button type="button" onClick={() => onNavigate('addTransaction')} className="app-action-button app-desktop-only">
          <Plus size={16} />
          <span>Adicionar</span>
        </button>
        <button type="button" onClick={() => onNavigate('alerts')} className="app-icon-button app-alert-button" aria-label="Notificações">
          <Bell size={18} />
          {unreadCount > 0 && <span>{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        <button type="button" onClick={() => onNavigate('settings')} className="app-icon-button app-desktop-only" aria-label="Configurações">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}

function LoadingScreen({ theme }) {
  return (
    <div className="app-loading" style={{ background: theme.background }}>
      <div className="app-loading-mark" style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }}>
        <PiggyBank size={32} />
      </div>
      <p>A carregar...</p>
    </div>
  );
}

function App() {
  const {
    currentScreen, setScreen, currentTheme, menuOpen, setMenuOpen,
    restoreSession, user, logout, notifications,
  } = useStore();

  const [ready, setReady] = useState(false);
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

  useEffect(() => {
    if (user?.currency) setCurrencyGlobal(user.currency);
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
    root.style.setProperty('--card', theme.surface);
    root.style.setProperty('--border', theme.border);
    root.style.setProperty('--shadow', theme.shadow);
    root.style.setProperty('--gradient-start', theme.gradient[0]);
    root.style.setProperty('--gradient-end', theme.gradient[1]);
    root.style.setProperty('--danger', '#EF4444');
    root.style.setProperty('--success', '#10B981');
    root.style.setProperty('--warning', '#F59E0B');
  }, [theme]);

  useEffect(() => {
    const init = async () => {
      restoreSession();
      const savedUser = JSON.parse(localStorage.getItem('poupt_user') || 'null');
      if (savedUser?.currency) setCurrencyGlobal(savedUser.currency);
      setReady(true);

      const token = localStorage.getItem('poupt_token');
      if (token && token !== 'mock-token-123') {
        try {
          const res = await api.getMe();
          if (res.data?.user) useStore.getState().updateUser(res.data.user);
        } catch (err) {
          const msg = (err.message || '').toLowerCase();
          if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid token') || msg.includes('jwt')) {
            logout();
          }
        }
      }

      const hash = window.location.hash.slice(1);
      if (hash && screenComponents[hash] && localStorage.getItem('poupt_token')) {
        setScreen(hash);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fechar drawer ao redimensionar para desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024 && menuOpen) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen, setMenuOpen]);

  // Bloquear scroll quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  if (!ready) return <LoadingScreen theme={theme} />;

  if (isFullscreen) {
    return (
      <div className="app-fullscreen" style={{ background: theme.background }}>
        <Suspense fallback={<LoadingScreen theme={theme} />}>
          <ErrorBoundary>
            <ScreenComponent />
          </ErrorBoundary>
        </Suspense>
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="app-shell" style={{ background: theme.background }}>
      <DesktopSidebar currentScreen={currentScreen} onNavigate={navigate} user={user} />

      <div className="app-main">
        <Topbar
          title={pageTitle}
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
                <ErrorBoundary>
                  <ScreenComponent />
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav currentScreen={currentScreen} onNavigate={navigate} />

      <MobileDrawer
        isOpen={menuOpen}
        currentScreen={currentScreen}
        onClose={() => setMenuOpen(false)}
        onNavigate={navigate}
        user={user}
      />

      <OfflineIndicator />
    </div>
  );
}

export default App;
