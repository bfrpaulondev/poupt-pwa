import useStore from '../store/useStore';
import { Bell, Settings, ChevronLeft } from 'lucide-react';
import { modeLabels, modeColors } from '../utils/helpers';

export default function TopBar() {
  const { user, currentScreen, setScreen, getModeLabel, getModeColor, notifications } = useStore();

  const showBack = ['add-transaction', 'survival', 'settings', 'moedas', 'investments', 'notifications'].includes(currentScreen);

  const screenTitles = {
    dashboard: 'PoupPT',
    jars: '6 Frascos',
    coach: user?.coachName || 'Coach',
    debts: 'Dividas',
    goals: 'Metas',
    profile: 'Perfil',
    settings: 'Configuracoes',
    'add-transaction': 'Nova Transacao',
    moedas: 'PoupMoedas',
    investments: 'Investimentos',
    survival: 'Modo Sobrevivencia',
    notifications: 'Notificacoes'
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
      style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button onClick={() => setScreen('dashboard')}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} style={{ color: 'var(--text-secondary)' }} />
          </button>
        )}
        {!showBack && (
          <div className="w-8 h-8 rounded-xl gold-gradient flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
        )}
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {screenTitles[currentScreen] || 'PoupPT'}
          </h1>
          {user && currentScreen === 'dashboard' && (
            <span className="text-xs mode-badge"
              style={{ background: `${getModeColor()}20`, color: getModeColor() }}>
              {getModeLabel()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setScreen('notifications')} className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: '#EF4444', color: 'white' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setScreen('moedas')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)' }}>
          <span>{user?.poupMoedas || 0}</span>
        </button>
        <button onClick={() => setScreen('settings')}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
