import useStore from '../store/useStore';
import { Bell, Settings, ChevronLeft } from 'lucide-react';

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
        {showBack ? (
          <button onClick={() => setScreen('dashboard')}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}>
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF69B4, #FF85C8)',
              boxShadow: '0 2px 10px rgba(255,105,180,0.25)'
            }}>
            <span className="text-sm font-bold text-white">P</span>
          </div>
        )}
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {screenTitles[currentScreen] || 'PoupPT'}
          </h1>
          {user && currentScreen === 'dashboard' && (
            <span className="text-xs mode-badge"
              style={{ background: `${getModeColor()}18`, color: getModeColor() }}>
              {getModeLabel()}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={() => setScreen('notifications')}
          className="relative p-2 rounded-xl transition-colors"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
              style={{ background: 'var(--danger)', color: 'white' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setScreen('moedas')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)' }}>
          <span>{user?.poupMoedas || 0}</span>
        </button>
        <button onClick={() => setScreen('settings')}
          className="p-2 rounded-xl transition-colors"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
