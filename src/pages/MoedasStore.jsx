import { useEffect, useRef, useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
<<<<<<< HEAD
import { themes, themeCatalog } from '../themes';
=======
import { formatCurrency, formatDate, getTimeAgo } from '../utils/helpers';
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
import {
  Coins,
  Play,
  CreditCard,
  MessageCircle,
  Camera,
  FileBarChart,
  Users,
  Zap,
  CalendarDays,
  Flame,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Crown,
  Sparkles,
  Share2,
  Palette,
  Check,
  Lock,
} from 'lucide-react';

const earnActions = [
  { id: 'watch_ad', label: 'Ver anúncio', reward: 50, icon: Play, desc: 'Vê um anúncio curto e ganha moedas.', color: '#3B82F6' },
  { id: 'daily_login', label: 'Login diário', reward: 10, icon: CalendarDays, desc: 'Entra todos os dias para ganhar.', color: '#10B981' },
  { id: 'add_transaction', label: 'Registar transação', reward: 5, icon: CreditCard, desc: 'Regista uma transação na app.', color: '#F59E0B' },
  { id: 'complete_challenge', label: 'Completar desafio', reward: 100, icon: Zap, desc: 'Completa desafios semanais.', color: '#8B5CF6' },
  { id: 'streak_bonus', label: 'Bónus de sequência', reward: 30, icon: Flame, desc: 'Bónus por sequência de 7 dias.', color: '#EF4444' },
  { id: 'share_achievement', label: 'Partilhar conquista', reward: 20, icon: Share2, desc: 'Partilha uma conquista.', color: '#EC4899' },
];

const spendItems = [
  { id: 'coach_question', label: 'Pergunta ao Coach', cost: 100, icon: MessageCircle, desc: 'Faz uma pergunta extra ao teu Coach.', color: '#8B5CF6' },
  { id: 'ocr_scan', label: 'Scanner OCR', cost: 50, icon: Camera, desc: 'Digitaliza um recibo automaticamente.', color: '#3B82F6' },
  { id: 'weekly_report', label: 'Relatório semanal', cost: 30, icon: FileBarChart, desc: 'Relatório detalhado da semana.', color: '#10B981' },
  { id: 'creditor_template', label: 'Template para credor', cost: 10, icon: Users, desc: 'Modelo de mensagem para credores.', color: '#F59E0B' },
];

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(target || 0);
  const prevTarget = useRef(target || 0);

  useEffect(() => {
    if (target === prevTarget.current) return;

    const start = prevTarget.current;
    const end = target || 0;
    prevTarget.current = end;

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
  const {
    user,
    updateUser,
    currentTheme,
    setTheme,
    isThemeOwned,
    buyTheme,
    ownedThemes,
  } = useStore();

  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [earning, setEarning] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('themes');
  const [transactions, setTransactions] = useState([]);
  const [coinSpin, setCoinSpin] = useState(false);

  const balance = user?.poupMoedas || 0;
  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

  useEffect(() => {
    const interval = setInterval(() => setCoinSpin((prev) => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  const notify = (message, type = 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }

    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 2600);
  };

  const addHistory = (item) => {
    setTransactions((prev) => [{ ...item, date: new Date() }, ...prev]);
  };

  const syncUser = async (payload) => {
    try {
      await api.updateMe(payload);
    } catch {}
  };

  const handleWatchAd = async () => {
    setWatchingAd(true);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress((prev) => Math.min(prev + 2, 100));
    }, 60);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const res = await api.earnMoedas('watch_ad', 50);
        const earned = res.data?.earned || 50;
        const newBalance = res.data?.balance ?? balance + earned;
        updateUser({ poupMoedas: newBalance });
        addHistory({ type: 'earn', amount: earned, action: 'Ver anúncio' });
        notify(`+${earned} PoupMoedas`);
      } catch {
        const earned = 50;
        updateUser({ poupMoedas: balance + earned });
        addHistory({ type: 'earn', amount: earned, action: 'Ver anúncio' });
        notify(`+${earned} PoupMoedas`);
      }
      setWatchingAd(false);
      setAdProgress(0);
    }, 3500);
  };

  const handleEarn = async (action) => {
    if (action.id === 'watch_ad') {
      handleWatchAd();
      return;
    }

    setEarning(action.id);
    try {
      const res = await api.earnMoedas(action.id, action.reward);
      const earned = res.data?.earned || action.reward;
      const newBalance = res.data?.balance ?? balance + earned;
      updateUser({ poupMoedas: newBalance });
      addHistory({ type: 'earn', amount: earned, action: action.label });
      notify(`+${earned} PoupMoedas`);
    } catch (err) {
      notify(err.message || 'Não foi possível ganhar moedas.', 'error');
    } finally {
      setEarning(null);
    }
  };

  const handleSpend = async (item) => {
    if (balance < item.cost) {
      notify('PoupMoedas insuficientes.', 'error');
      return;
    }

    setPurchasing(item.id);
    try {
      updateUser({ poupMoedas: balance - item.cost });
      addHistory({ type: 'spend', amount: item.cost, action: item.label });
      notify(`${item.label} desbloqueado.`);
      await api.spendMoedas(item.id).catch(() => null);
    } finally {
      setPurchasing(null);
    }
  };

  const handleThemeAction = async (themeId) => {
    const theme = themes[themeId];
    if (!theme) return;

    const owned = isThemeOwned(themeId);

    if (owned) {
      const applied = setTheme(themeId);
      if (!applied) {
        notify('Este tema ainda está bloqueado.', 'error');
        return;
      }
      updateUser({ theme: themeId });
      await syncUser({ theme: themeId });
      notify('Tema aplicado.');
      return;
    }

    setPurchasing(themeId);
    const result = buyTheme(themeId);

    if (!result.ok) {
      notify(result.reason, 'error');
      setPurchasing(null);
      return;
    }

    const updatedOwnedThemes = Array.from(new Set([...ownedThemes, themeId, 'darkGold']));
    const newBalance = Math.max(0, balance - theme.price);

    addHistory({ type: 'spend', amount: theme.price, action: `Tema ${theme.name}` });
    await syncUser({ ownedThemes: updatedOwnedThemes, theme: themeId, poupMoedas: newBalance });
    notify(result.reason);
    setPurchasing(null);
  };

<<<<<<< HEAD
  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'agora';
    if (mins < 60) return `há ${mins} min`;
    if (hours < 24) return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  };

=======
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
  const tabs = [
    { id: 'themes', label: 'Temas', icon: Palette, activeColor: 'var(--gold)' },
    { id: 'earn', label: 'Ganhar', icon: ArrowDownLeft, activeColor: '#10B981' },
    { id: 'spend', label: 'Gastar', icon: ArrowUpRight, activeColor: '#EF4444' },
    { id: 'history', label: 'Histórico', icon: Clock, activeColor: '#3B82F6' },
  ];

  return (
<<<<<<< HEAD
    <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5 animate-fade-in">
      <div className="gold-gradient p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'radial-gradient(circle at 30% 50%, white 0%, transparent 52%)' }} />
=======
    <div className="px-5 xs:px-6 sm:px-8 py-5 xs:py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fade-in">
      <button onClick={() => setScreen('dashboard')}
        className="flex items-center gap-1 mb-3 text-sm font-semibold"
        style={{ color: 'var(--text-secondary)' }}>
        ← Voltar
      </button>
      {/* Balance Card with Animated Counter */}
      <div className="gold-gradient p-7 sm:p-9 rounded-2xl text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%)' }} />
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
        <div className="relative">
          <div className="mx-auto mb-3 w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)' }}>
            <Coins size={32} className="text-white" style={{ transform: coinSpin ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.6s' }} />
          </div>
<<<<<<< HEAD
          <p className="text-4xl sm:text-5xl font-black text-white">
=======
          <p className="text-3xl xs:text-4xl font-bold text-white">
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
            <AnimatedCounter target={balance} />
          </p>
          <p className="text-sm text-white/80 mt-1">PoupMoedas disponíveis</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <TrendingUp size={12} className="text-white/70" />
            <p className="text-xs text-white/70">Usa moedas para desbloquear temas e extras.</p>
          </div>
        </div>
      </div>

      {(success || error) && (
        <div
          className="p-3 rounded-xl text-sm font-semibold text-center animate-fade-in"
          style={{
            background: error ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)',
            color: error ? '#EF4444' : '#10B981',
            border: `1px solid ${error ? 'rgba(239,68,68,0.28)' : 'rgba(16,185,129,0.28)'}`,
          }}
        >
          {error || success}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {tabs.map(({ id, label, icon: Icon, activeColor }) => (
<<<<<<< HEAD
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className="py-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5"
=======
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 py-4 rounded-xl text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5"
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
            style={{
              background: activeTab === id ? `${activeColor}18` : 'var(--bg-secondary)',
              color: activeTab === id ? activeColor : 'var(--text-secondary)',
              border: activeTab === id ? `1px solid ${activeColor}55` : '1px solid var(--border)',
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'themes' && (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>Loja de temas</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>8 temas disponíveis. Compra uma vez, usa sempre.</p>
            </div>
            {isPremium && (
              <span className="px-3 py-1 rounded-full text-[10px] font-black" style={{ background: 'rgba(255,215,0,0.16)', color: 'var(--gold)' }}>
                Premium: tudo desbloqueado
              </span>
            )}
          </div>

          <div className="theme-grid">
            {themeCatalog.map((theme) => {
              const owned = isThemeOwned(theme.id);
              const active = currentTheme === theme.id;
              const busy = purchasing === theme.id;

              return (
                <div
                  key={theme.id}
                  className="theme-card"
                  style={{
                    '--theme-a': theme.gradient[0],
                    '--theme-b': theme.gradient[1],
                    background: theme.surface,
                    color: theme.text,
                    borderColor: active ? theme.primary : theme.border,
                  }}
                >
                  <div className="theme-card-header">
                    <div>
                      <p className="text-sm font-black">{theme.name}</p>
                      <p className="text-xs mt-1 opacity-70">{theme.description}</p>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-black"
                      style={{ background: owned ? `${theme.primary}22` : 'rgba(0,0,0,0.18)', color: owned ? theme.primary : theme.textMuted }}
                    >
                      {owned ? 'Comprado' : `${theme.price} moedas`}
                    </span>
                  </div>

                  <div className="theme-preview-dots">
                    <span style={{ background: theme.primary }} />
                    <span style={{ background: theme.primaryLight }} />
                    <span style={{ background: theme.surfaceHover }} />
                    <span style={{ background: theme.border }} />
                  </div>

                  <div className="theme-card-actions">
                    <button
                      type="button"
                      onClick={() => handleThemeAction(theme.id)}
                      disabled={busy}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2"
                      style={{
                        background: active ? `${theme.primary}28` : owned ? `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` : 'rgba(255,255,255,0.08)',
                        color: active ? theme.primary : owned ? theme.textInverse : theme.text,
                        border: active ? `1px solid ${theme.primary}` : '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {active ? <Check size={13} /> : owned ? <Sparkles size={13} /> : <Lock size={13} />}
                      {active ? 'Ativo' : owned ? 'Aplicar' : busy ? 'A comprar...' : 'Comprar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'earn' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>Ganhar PoupMoedas</h3>

          {watchingAd ? (
            <div className="glass-card p-6">
              <div className="flex items-center gap-4 mb-3">
                <Play size={20} style={{ color: '#3B82F6' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Ver anúncio</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ganha 50 PoupMoedas.</p>
                </div>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full gold-gradient transition-all" style={{ width: `${adProgress}%` }} />
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-secondary)' }}>A ver anúncio...</p>
            </div>
<<<<<<< HEAD
          ) : null}
=======
          ) : (
            <button onClick={handleWatchAd}
              className="w-full glass-card p-6 flex items-center gap-4 text-left"
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
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58

          {earnActions.map((action) => {
            const Icon = action.icon;
            const isEarning = earning === action.id;
            return (
<<<<<<< HEAD
              <button
                key={action.id}
                type="button"
                onClick={() => handleEarn(action)}
                disabled={isEarning || watchingAd}
                className="w-full glass-card p-5 flex items-center gap-4 text-left"
                style={{ opacity: isEarning || watchingAd ? 0.65 : 1 }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${action.color}18` }}>
=======
              <button key={action.id} onClick={() => handleEarn(action)} disabled={isEarning}
                className="w-full glass-card p-6 flex items-center gap-4 text-left"
                style={{ opacity: isEarning ? 0.6 : 1 }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${action.color}15` }}>
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{action.desc}</p>
                </div>
                <div className="px-2.5 py-1.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <p className="text-xs font-black" style={{ color: '#10B981' }}>+{action.reward}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === 'spend' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>Gastar PoupMoedas</h3>
          {spendItems.map((item) => {
            const Icon = item.icon;
            const canAfford = balance >= item.cost;
            const isPurchasing = purchasing === item.id;
            return (
<<<<<<< HEAD
              <div key={item.id} className="glass-card p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
=======
              <div key={item.id} className="glass-card p-6 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: `${item.color}15` }}>
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpend(item)}
                  disabled={!canAfford || isPurchasing}
<<<<<<< HEAD
                  className="px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1"
=======
                  className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1"
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                  style={{
                    background: canAfford ? 'rgba(255,215,0,0.16)' : 'var(--bg-secondary)',
                    color: canAfford ? 'var(--gold)' : 'var(--text-muted)',
                    border: canAfford ? '1px solid var(--gold)' : '1px solid var(--border)',
                    opacity: isPurchasing ? 0.55 : 1,
                  }}
                >
                  <Coins size={12} /> {item.cost}
                </button>
              </div>
            );
          })}

          {!isPremium && (
            <div className="p-5 rounded-2xl flex items-center gap-4" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
              <Crown size={20} style={{ color: 'var(--gold)' }} />
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>Premium</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Desbloqueia extras avançados e temas sem custo.</p>
              </div>
              <Sparkles size={16} style={{ color: 'var(--gold)' }} />
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase" style={{ color: 'var(--text-muted)' }}>Histórico de PoupMoedas</h3>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, idx) => (
                <div key={`${tx.action}-${idx}`} className="glass-card p-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: tx.type === 'earn' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {tx.type === 'earn'
                      ? <ArrowDownLeft size={14} style={{ color: '#10B981' }} />
                      : <ArrowUpRight size={14} style={{ color: '#EF4444' }} />}
                  </div>
                  <div className="flex-1">
<<<<<<< HEAD
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{tx.action}</p>
                    <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{getTimeAgo(tx.date)}</p>
=======
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tx.action}</p>
                    <p className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>{getTimeAgo(tx.date)}</p>
>>>>>>> 97e3dd26dab4973aee196010106563ce6ff4bc58
                  </div>
                  <p className="text-xs font-black" style={{ color: tx.type === 'earn' ? '#10B981' : '#EF4444' }}>
                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Clock size={42} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Sem histórico ainda.</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>As compras e ganhos aparecem aqui.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
