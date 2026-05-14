import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, getTimeAgo } from '../utils/helpers';
import {
  Coins, Play, Gift, Star, Shield, CreditCard, MessageCircle, Palette,
  Check, Camera, FileBarChart, Users, Zap, CalendarDays, Flame,
  TrendingUp, ArrowDownLeft, ArrowUpRight, Clock, Crown, Sparkles,
  Share2
} from 'lucide-react';

const earnActions = [
  { id: 'watch_ad', label: 'Ver anuncio', reward: 50, icon: Play, desc: 'Ve um curto anuncio e ganha moedas', color: '#3B82F6' },
  { id: 'daily_login', label: 'Login diario', reward: 10, icon: CalendarDays, desc: 'Entra todos os dias para ganhar', color: '#10B981' },
  { id: 'add_transaction', label: 'Registar transacao', reward: 5, icon: CreditCard, desc: 'Regista uma transacao na app', color: '#F59E0B' },
  { id: 'complete_challenge', label: 'Completar desafio', reward: 100, icon: Zap, desc: 'Completa desafios semanais', color: '#8B5CF6' },
  { id: 'streak_bonus', label: 'Streak bonus', reward: 30, icon: Flame, desc: 'Bonus por streak de 7 dias', color: '#EF4444' },
  { id: 'share_achievement', label: 'Partilhar conquista', reward: 20, icon: Share2, desc: 'Partilha uma conquista com amigos', color: '#EC4899' },
];

const spendItems = [
  { id: 'coach_question', label: 'Pergunta ao Coach', cost: 100, icon: MessageCircle, desc: 'Faz uma pergunta extra ao teu AI Coach', color: '#8B5CF6' },
  { id: 'ocr_scan', label: 'Scanner OCR', cost: 50, icon: Camera, desc: 'Digitaliza um recibo automaticamente', color: '#3B82F6' },
  { id: 'weekly_report', label: 'Relatorio semanal', cost: 30, icon: FileBarChart, desc: 'Relatorio detalhado da semana', color: '#10B981' },
  { id: 'creditor_template', label: 'Template credor', cost: 10, icon: Users, desc: 'Modelo de mensagem para credores', color: '#F59E0B' },
  { id: 'premium_theme', label: 'Tema premium', cost: 200, icon: Palette, desc: 'Desbloqueia um tema exclusivo', color: '#EC4899' },
];

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    const end = target;
    prevTarget.current = target;

    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);

  return <span>{count}</span>;
}

export default function MoedasStore() {
  const { user, updateUser, setScreen } = useStore();
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [earning, setEarning] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('earn');
  const [transactions, setTransactions] = useState([]);
  const [coinSpin, setCoinSpin] = useState(false);

  const balance = user?.poupMoedas || 0;

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
        showSuccess(`+${res.data.earned || 50} PoupMoedas!`);
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

  const tabs = [
    { id: 'earn', label: 'Ganhar', icon: ArrowDownLeft, activeColor: '#10B981' },
    { id: 'spend', label: 'Gastar', icon: ArrowUpRight, activeColor: 'var(--gold)' },
    { id: 'history', label: 'Historico', icon: Clock, activeColor: '#3B82F6' },
  ];

  return (
    <div className="px-4 xs:px-5 sm:px-8 py-4 xs:py-5 sm:py-6 space-y-5 animate-fade-in">
      <button onClick={() => setScreen('dashboard')}
        className="flex items-center gap-1 mb-3 text-xs font-medium"
        style={{ color: 'var(--text-secondary)' }}>
        ← Voltar
      </button>
      {/* Balance Card with Animated Counter */}
      <div className="gold-gradient p-6 sm:p-8 rounded-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%)' }} />
        <div className="relative">
          <div className="mx-auto mb-3 w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
            <Coins size={32} className="text-white"
              style={{ transform: coinSpin ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.6s' }} />
          </div>
          <p className="text-3xl xs:text-4xl font-bold text-white">
            <AnimatedCounter target={balance} />
          </p>
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
      <div className="flex gap-2.5 sm:gap-3">
        {tabs.map(({ id, label, icon: Icon, activeColor }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 py-3 rounded-xl text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5"
            style={{
              background: activeTab === id ? `${activeColor}15` : 'var(--bg-secondary)',
              color: activeTab === id ? activeColor : 'var(--text-secondary)',
              border: activeTab === id ? `1px solid ${activeColor}40` : '1px solid var(--border)'
            }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Ganhar Tab */}
      {activeTab === 'earn' && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            Ganhar PoupMoedas
          </h3>

          {/* Watch Ad - Special card */}
          {watchingAd ? (
            <div className="glass-card p-5">
              <div className="flex items-center gap-4 mb-3">
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
              className="w-full glass-card p-5 flex items-center gap-4 text-left"
              style={{ border: '1px solid rgba(59,130,246,0.3)' }}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
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
                className="w-full glass-card p-5 flex items-center gap-4 text-left"
                style={{ opacity: isEarning ? 0.6 : 1 }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
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

      {/* Gastar Tab */}
      {activeTab === 'spend' && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            Gastar PoupMoedas
          </h3>
          {spendItems.map(item => {
            const Icon = item.icon;
            const canAfford = balance >= item.cost;
            const isPurchasing = purchasing === item.id;
            return (
              <div key={item.id} className="glass-card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}15` }}>
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
                <button onClick={() => handleSpend(item)}
                  disabled={!canAfford || isPurchasing}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  style={{
                    background: canAfford ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
                    color: canAfford ? 'var(--gold)' : 'var(--text-muted)',
                    border: canAfford ? '1px solid var(--gold)' : '1px solid var(--border)',
                    opacity: isPurchasing ? 0.5 : 1
                  }}>
                  <Coins size={12} /> {item.cost}
                </button>
              </div>
            );
          })}

          {/* Premium CTA */}
          {user?.plan !== 'premium' && (
            <div className="p-5 rounded-2xl flex items-center gap-4 mt-3"
              style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Crown size={20} style={{ color: 'var(--gold)' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Premium</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Desbloqueia tudo com moedas ilimitadas
                </p>
              </div>
              <Sparkles size={16} style={{ color: 'var(--gold)' }} />
            </div>
          )}
        </div>
      )}

      {/* Historico Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>
            Historico de Transacoes
          </h3>
          {transactions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto space-y-3" style={{ scrollbarWidth: 'thin' }}>
              {transactions.map((tx, idx) => (
                <div key={idx} className="glass-card p-3.5 sm:p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: tx.type === 'earn' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {tx.type === 'earn'
                      ? <ArrowDownLeft size={14} style={{ color: '#10B981' }} />
                      : <ArrowUpRight size={14} style={{ color: '#EF4444' }} />
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tx.action}</p>
                    <p className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>{getTimeAgo(tx.date)}</p>
                  </div>
                  <p className="text-xs font-bold"
                    style={{ color: tx.type === 'earn' ? '#10B981' : '#EF4444' }}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </p>
                </div>
              ))}
            </div>
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
