import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from './store/useStore';
import { themes } from './themes';
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
  Map,
  Building2,
  Shield,
  Coins,
  FileText,
  Settings,
  Trophy,
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

const screenNames = {
  landing: 'PoupPT',
  login: 'Entrar',
  register: 'Criar Conta',
  onboarding: 'Configuracao',
  dashboard: 'Inicio',
  jars: '6 Frascos',
  coach: 'AI Coach',
  debts: 'Dividas',
  goals: 'Objetivos',
  profile: 'Perfil',
  settings: 'Configuracoes',
  reports: 'Relatorios',
  survival: 'Sobrevivencia',
  poupMoedas: 'PoupMoedas',
  addTransaction: 'Nova Transacao',
  investments: 'Investimentos',
  alerts: 'Alertas',
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

function StatusBar({ theme }) {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div
      className="flex items-center justify-between px-6 py-2 text-xs font-semibold"
      style={{ color: theme.text }}
    >
      <span>{time}</span>
      <div className="flex items-center gap-1">
        <div className="flex gap-[2px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-[3px] h-[6px] rounded-[1px]"
              style={{
                background: i <= 3 ? theme.text : theme.textMuted,
              }}
            />
          ))}
        </div>
        <span className="ml-1 text-[10px]">5G</span>
        <svg width="22" height="10" viewBox="0 0 22 10" className="ml-1">
          <rect x="0" y="0" width="18" height="10" rx="2" stroke={theme.textMuted} strokeWidth="1" fill="none" />
          <rect x="19" y="3" width="2" height="4" rx="1" fill={theme.textMuted} />
          <rect x="1.5" y="1.5" width="12" height="7" rx="1" fill={theme.primary} />
        </svg>
      </div>
    </div>
  );
}

function BottomNav({ theme, currentScreen, onTab }) {
  return (
    <div
      className="flex items-center justify-around px-2 py-2 border-t"
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
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200"
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

function HamburgerMenu({ theme, isOpen, onClose, onNavigate }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40"
            style={{ background: '#000' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 left-0 bottom-0 z-50 w-[260px] flex flex-col"
            style={{ background: theme.surface }}
          >
            <div
              className="flex items-center justify-between p-4 border-b"
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
                    onClick={() => onNavigate(item.id)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left transition-colors duration-150 hover:opacity-80"
                    style={{ color: theme.text }}
                  >
                    <Icon size={18} style={{ color: theme.textMuted }} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    <ChevronRight size={14} style={{ color: theme.textMuted }} />
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t" style={{ borderColor: theme.border }}>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: theme.textMuted }}
              >
                <span>🪙</span>
                <span>PoupMoedas: 145</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThemeBar({ theme, themeId, onThemeChange, className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 mt-4 flex-wrap px-4 ${className}`}>
      {Object.entries(themes).map(([id, t]) => (
        <button
          key={id}
          onClick={() => onThemeChange(id)}
          className="relative transition-transform duration-200 hover:scale-110"
          title={t.name}
        >
          <div
            className="w-8 h-8 rounded-full border-2 transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})`,
              borderColor: id === themeId ? '#fff' : 'rgba(255,255,255,0.2)',
              boxShadow: id === themeId ? `0 0 12px ${t.primary}60` : 'none',
              transform: id === themeId ? 'scale(1.15)' : 'scale(1)',
            }}
          />
          {id === themeId && (
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold whitespace-nowrap"
              style={{ color: t.primary }}
            >
              {t.name}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function App() {
  const { currentScreen, setScreen, currentTheme, setTheme, menuOpen, setMenuOpen, restoreSession } = useStore();
  const [ready, setReady] = useState(false);

  const theme = themes[currentTheme] || themes.darkGold;

  // Inject theme as CSS custom properties into :root
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
    restoreSession();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080810' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }}>
            <span className="text-2xl font-bold text-black">P</span>
          </div>
          <p className="text-sm" style={{ color: theme.textMuted }}>A carregar...</p>
        </div>
      </div>
    );
  }

  const isFullScreen = ['landing', 'login', 'register', 'onboarding'].includes(currentScreen);

  const ScreenComponent = screenComponents[currentScreen] || Dashboard;

  const handleTab = (id) => {
    setScreen(id);
  };

  return (
    <>
      {/* Title above phone */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 text-center mobile-hide"
      >
        <h1
          className="text-lg font-bold gradient-text"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          {screenNames[currentScreen] || 'PoupPT'}
        </h1>
      </motion.div>

      {/* Phone Frame */}
      <div
        className="relative phone-frame-shadow rounded-[40px] overflow-hidden flex flex-col w-full max-w-[375px] h-full max-h-[812px] sm:w-[375px] sm:h-[812px]"
        style={{
          background: theme.background,
          transition: 'background-color 0.5s ease',
        }}
      >
        {/* Status Bar */}
        <StatusBar theme={theme} />

        {/* Dynamic Island / Notch */}
        <div className="flex justify-center">
          <div
            className="w-[120px] h-[28px] rounded-b-2xl"
            style={{ background: '#000' }}
          />
        </div>

        {/* App Header with hamburger */}
        {!isFullScreen && (
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ background: theme.background }}
          >
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-xl transition-colors duration-150"
              style={{ color: theme.text }}
            >
              <Menu size={20} />
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
              <Bell size={18} />
              <div
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: '#FF4444' }}
              />
            </button>
          </div>
        )}

        {/* Screen Content */}
        <div
          className="overflow-y-auto poupt-scroll flex-1"
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
                <ScreenComponent />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        {!isFullScreen && (
          <BottomNav theme={theme} currentScreen={currentScreen} onTab={handleTab} />
        )}

        {/* Hamburger Menu */}
        <HamburgerMenu
          theme={theme}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={(id) => setScreen(id)}
        />
      </div>

      {/* Theme selector below phone */}
      <ThemeBar theme={theme} themeId={currentTheme} onThemeChange={setTheme} className="mobile-hide" />
    </>
  );
}

export default App;
