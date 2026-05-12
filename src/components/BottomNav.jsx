import useStore from '../store/useStore';
import { LayoutDashboard, PiggyBank, MessageCircle, BarChart3, User } from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'jars', icon: PiggyBank, label: 'Frascos' },
  { id: 'coach', icon: MessageCircle, label: 'Coach' },
  { id: 'reports', icon: BarChart3, label: 'Relatorios' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const { currentScreen, setScreen, getModeColor } = useStore();
  const activeColor = getModeColor();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-2 px-1"
      style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
      {navItems.map(({ id, icon: Icon, label }) => {
        const isActive = currentScreen === id;
        return (
          <button key={id} onClick={() => setScreen(id)}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all duration-200"
            style={{
              background: isActive ? `${activeColor}15` : 'transparent',
              color: isActive ? activeColor : 'var(--text-muted)'
            }}>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
