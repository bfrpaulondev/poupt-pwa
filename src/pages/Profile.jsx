import useStore from '../store/useStore';
import { formatCurrency, modeLabels, modeColors, calculateLevel } from '../utils/helpers';
import { User, Trophy, Flame, Target, Coins, Settings, ChevronRight, Award, Star, Shield } from 'lucide-react';

export default function Profile() {
  const { user, setScreen, getModeColor, getModeLabel } = useStore();
  const levelInfo = calculateLevel(user?.xp || 0);

  const menuItems = [
    { icon: Shield, label: 'Modo de Vida', value: getModeLabel(), screen: null, color: getModeColor() },
    { icon: Coins, label: 'PoupMoedas', value: user?.poupMoedas || 0, screen: 'moedas', color: 'var(--gold)' },
    { icon: Flame, label: 'Streak', value: `${user?.streak || 0} dias`, screen: null, color: '#F97316' },
    { icon: Settings, label: 'Configuracoes', value: '', screen: 'settings', color: 'var(--text-secondary)' },
  ];

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* User Card */}
      <div className="glass-card p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl"
          style={{ background: `${getModeColor()}20` }}>
          {user?.avatar || '🧑'}
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {user?.name || 'Utilizador'}
        </h2>
        <span className="mode-badge" style={{ background: `${getModeColor()}20`, color: getModeColor() }}>
          {getModeLabel()}
        </span>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {user?.plan === 'premium' ? 'Premium' : 'Gratuito'}
        </p>
      </div>

      {/* Level & XP */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award size={16} style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
              Nivel {levelInfo.level}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {levelInfo.currentLevelXp}/{levelInfo.xpForNext} XP
          </span>
        </div>
        <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
          <div className="h-2 rounded-full transition-all gold-gradient"
            style={{ width: `${levelInfo.progress}%` }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <Flame size={18} className="mx-auto mb-1" style={{ color: '#F97316' }} />
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{user?.streak || 0}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Streak</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Target size={18} className="mx-auto mb-1" style={{ color: '#10B981' }} />
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{user?.xp || 0}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>XP Total</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Coins size={18} className="mx-auto mb-1" style={{ color: 'var(--gold)' }} />
          <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{user?.poupMoedas || 0}</p>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Moedas</p>
        </div>
      </div>

      {/* Trophies */}
      {user?.trophies?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>
            <Trophy size={12} className="inline mr-1" /> Trofeus
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {user.trophies.map((trophy, i) => (
              <div key={i} className="glass-card p-3 flex items-center gap-2">
                <span className="text-xl">{trophy.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{trophy.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map(({ icon: Icon, label, value, screen, color }) => (
          <button key={label} onClick={() => screen && setScreen(screen)}
            className="w-full glass-card p-4 flex items-center gap-3 text-left">
            <Icon size={18} style={{ color }} />
            <div className="flex-1">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
            </div>
            {value && <span className="text-sm" style={{ color }}>{value}</span>}
            {screen && <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
