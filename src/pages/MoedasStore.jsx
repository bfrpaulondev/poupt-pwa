import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  Coins, Play, Gift, Star, Shield, CreditCard, MessageCircle, Palette,
  Check, Camera, FileBarChart, Users, Zap, CalendarDays, Flame,
  TrendingUp, ArrowDownLeft, ArrowUpRight, Clock
} from 'lucide-react';

const earnActions = [
  { id: 'watch_ad', label: 'Ver anuncio', reward: 50, icon: Play, desc: 'Ve um curto anuncio e ganha moedas', color: '#3B82F6' },
  { id: 'daily_login', label: 'Login diario', reward: 10, icon: CalendarDays, desc: 'Entra todos os dias para ganhar', color: '#10B981' },
  { id: 'add_transaction', label: 'Registar transacao', reward: 5, icon: CreditCard, desc: 'Regista uma transacao na app', color: '#F59E0B' },
  { id: 'complete_challenge', label: 'Completar desafio', reward: 100, icon: Zap, desc: 'Completa desafios semanais', color: '#8B5CF6' },
  { id: 'streak_bonus', label: 'Streak bonus', reward: 30, icon: Flame, desc: 'Bonus por streak de 7 dias', color: '#EF4444' },
];

const spendItems = [
  { id: 'coach_question', label: 'Pergunta ao Coach', cost: 100, icon: MessageCircle, desc: 'Faz uma pergunta extra ao teu AI Coach', color: '#8B5CF6' },
  { id: 'ocr_scan', label: 'Scanner OCR', cost: 50, icon: Camera, desc: 'Digitaliza um recibo automaticamente', color: '#3B82F6' },
  { id: 'weekly_report', label: 'Relatorio semanal', cost: 30, icon: FileBarChart, desc: 'Relatorio detalhado da semana', color: '#10B981' },
  { id: 'creditor_template', label: 'Template credor', cost: 10, icon: Users, desc: 'Modelo de mensagem para credores', color: '#F59E0B' },
  { id: 'premium_theme', label: 'Tema premium', cost: 200, icon: Palette, desc: 'Desbloqueia um tema exclusivo', color: '#EC4899' },
];

export default function MoedasStore() {
  const { user, updateUser } = useStore();
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [earning, setEarning] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('earn');
  const [transactions, setTransactions] = useState([]);
  const [coinSpin, setCoinSpin] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoinSpin(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 2500);
  };

  const handleWatchAd = async () => {
    setWatchingAd(true);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const res = await api.earnMoedas('watch_ad');
        updateUser({ poupMoedas: res.data.balance });
        setTransactions(prev => [{ type: 'earn', amount: 50, action: 'Ver anuncio', date: new Date() }, ...prev]);
        showSuccess(`+${res.data.earned} PoupMoedas!`);
      } catch (err) {
        console.error(err);
      }
      setWatchingAd(false);
      setAdProgress(0);
    }, 3500);
  };

  const handleEarn = async (action) => {
    setEarning(action.id);
    try {
      const res = await api.earnMoedas(action.id, action.reward);
      updateUser({ poupMoedas: res.data.balance });
      setTransactions(prev => [{ type: 'earn', amount: action.reward, action: action.label, date: new Date() }, ...prev]);
      showSuccess(`+${action.reward} PoupMoedas!`);
    } catch (err) {
      showSuccess(err.message || 'Erro ao ganhar moedas');
    }
    setEarning(null);
  };

  const handleSpend = async (item) => {
    setPurchasing(item.id);
    try {
      const res = await api.spendMoedas(item.id);
      updateUser({ poupMoedas: res.data.balance });
      setTransactions(prev => [{ type: 'spend', amount: item.cost, action: item.label, date: new Date() }, ...prev]);
      showSuccess(`${item.label} desbloqueado!`);
    } catch (err) {
      showSuccess(err.message || 'Moedas insuficientes');
    }
    setPurchasing(null);
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `ha ${mins} min`;
    if (hours < 24) return `ha ${hours} hora${hours > 1 ? 's' : ''}`;
    return `ha ${days} dia${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Balance Card */}
      <div className="gold-gradient p-6 rounded-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%)' }} />
        <div className="relative">
          <div className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            <Coins size={32} className="text-white"
              style={{ transform: coinSpin ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.6s' }} />
          </div>
          <p className="text-4xl font-bold text-white">{user?.poupMoedas || 0}</p>
          <p className="text-sm text-white/80 mt-1">PoupMoedas</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp size={12} className="text-white/60" />
            <p className="text-xs text-white/60">Moeda virtual do PoupPT</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="p-3 rounded-xl text-sm font-medium text-center animate-fade-in"
          style={{ background: success.startsWith('+') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: success.startsWith('+') ? '#10B981' : '#EF4444' }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('earn')}
          className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center transition-all"
          style={{
            background: activeTab === 'earn' ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
            color: activeTab === 'earn' ? '#10B981' : 'var(--text-secondary)',
            border: activeTab === 'earn' ? '1px solid rgba(16,185,129,0.4)' : '1px solid var(--border)'
          }}>
          <ArrowDownLeft size={12} className="inline mr-1" /> Ganhar
        </button>
        <button onClick={() => setActiveTab('spend')}
          className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center transition-all"
          style={{
            background: activeTab === 'spend' ? 'rgba(212,160,23,0.15)' : 'var(--bg-secondary)',
            color: activeTab === 'spend' ? 'var(--gold)' : 'var(--text-secondary)',
            border: activeTab === 'spend' ? '1px solid rgba(212,160,23,0.4)' : '1px solid var(--border)'
          }}>
          <ArrowUpRight size={12} className="inline mr-1" /> Gastar
        </button>
        <button onClick={() => setActiveTab('history')}
          className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center transition-all"
          style={{
            background: activeTab === 'history' ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
            color: activeTab === 'history' ? '#3B82F6' : 'var(--text-secondary)',
            border: activeTab === 'history' ? '1px solid rgba(59,130,246,0.4)' : '1px solid var(--border)'
          }}>
          <Clock size={12} className="inline mr-1" /> Historico
        </button>
      </div>

      {/* Ganhar PoupMoedas */}
      {activeTab === 'earn' && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            Ganhar PoupMoedas
          </h3>

          {/* Watch Ad - Special card */}
          {watchingAd ? (
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <Play size={20} style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Ver Anuncio</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ganha 50 PoupMoedas por anuncio</p>
                </div>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full gold-gradient transition-all"
                  style={{ width: `${adProgress}%` }} />
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>
                A ver anuncio...
              </p>
            </div>
          ) : (
            <button onClick={handleWatchAd}
              className="w-full glass-card p-4 flex items-center gap-3 text-left"
              style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59,130,246,0.15)' }}>
                <Play size={22} style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Ver Anuncio</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ve um curto anuncio e ganha moedas</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.15)' }}>
                <p className="text-sm font-bold" style={{ color: '#10B981' }}>+50</p>
              </div>
            </button>
          )}

          {/* Other earn actions */}
          {earnActions.filter(a => a.id !== 'watch_ad').map(action => {
            const Icon = action.icon;
            const isEarning = earning === action.id;
            return (
              <button key={action.id} onClick={() => handleEarn(action)} disabled={isEarning}
                className="w-full glass-card p-4 flex items-center gap-3 text-left"
                style={{ opacity: isEarning ? 0.6 : 1 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${action.color}15` }}>
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <p className="text-xs font-bold" style={{ color: '#10B981' }}>+{action.reward}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Gastar PoupMoedas */}
      {activeTab === 'spend' && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            Gastar PoupMoedas
          </h3>
          {spendItems.map(item => {
            const Icon = item.icon;
            const canAfford = (user?.poupMoedas || 0) >= item.cost;
            const isPurchasing = purchasing === item.id;
            return (
              <div key={item.id} className="glass-card p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}15` }}>
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
                <button onClick={() => handleSpend(item)}
                  disabled={!canAfford || isPurchasing}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  style={{
                    background: canAfford ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                    color: canAfford ? 'var(--gold)' : 'var(--text-muted)',
                    border: canAfford ? '1px solid var(--gold)' : '1px solid var(--border)',
                    opacity: isPurchasing ? 0.5 : 1
                  }}>
                  <Coins size={12} /> {item.cost}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Historico */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            Historico de Transacoes
          </h3>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <div key={idx} className="glass-card p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: tx.type === 'earn' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                  {tx.type === 'earn'
                    ? <ArrowDownLeft size={14} style={{ color: '#10B981' }} />
                    : <ArrowUpRight size={14} style={{ color: '#EF4444' }} />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tx.action}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{getTimeAgo(tx.date)}</p>
                </div>
                <p className="text-xs font-bold"
                  style={{ color: tx.type === 'earn' ? '#10B981' : '#EF4444' }}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Sem transacoes ainda
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Ganha ou gasta PoupMoedas para ver o historico aqui
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
