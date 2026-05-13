import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import {
  Coins, Play, Gift, Star, MessageCircle, Palette,
  Check, Camera, FileBarChart, Users, Zap, CalendarDays, Flame,
  TrendingUp, ArrowDownLeft, ArrowUpRight, Clock, Crown, Sparkles,
  Share2, CreditCard
} from 'lucide-react';

const earnActions = [
  { id: 'watch_ad', label: 'Ver anuncio', reward: 50, icon: Play, desc: 'Ve um curto anuncio e ganha moedas', color: '#3B82F6' },
  { id: 'daily_login', label: 'Login diario', reward: 10, icon: CalendarDays, desc: 'Entra todos os dias para ganhar', color: '#10B981' },
  { id: 'add_transaction', label: 'Registar transacao', reward: 5, icon: CreditCard, desc: 'Regista uma transacao na app', color: '#F59E0B' },
  { id: 'streak_bonus', label: 'Streak bonus', reward: 30, icon: Flame, desc: 'Bonus por streak de 7 dias', color: '#EF4444' },
  { id: 'share_achievement', label: 'Partilhar conquista', reward: 20, icon: Share2, desc: 'Partilha uma conquista', color: '#EC4899' },
];

const spendItems = [
  { id: 'coach_question', label: 'Pergunta ao Coach', cost: 100, icon: MessageCircle, desc: 'Faz uma pergunta extra ao Coach', color: '#8B5CF6' },
  { id: 'ocr_scan', label: 'Scanner OCR', cost: 50, icon: Camera, desc: 'Digitaliza um recibo', color: '#3B82F6' },
  { id: 'weekly_report', label: 'Relatorio semanal', cost: 30, icon: FileBarChart, desc: 'Relatorio detalhado', color: '#10B981' },
  { id: 'premium_theme', label: 'Tema premium', cost: 200, icon: Palette, desc: 'Desbloqueia um tema exclusivo', color: '#EC4899' },
  { id: 'coach_upgrade', label: 'Coach upgrade', cost: 150, icon: Star, desc: 'Desbloqueia coach avancado', color: '#F59E0B' },
];

export default function MoedasStore() {
  const theme = themes.darkGold;
  const { user, updateUser, setScreen } = useStore();
  const [activeTab, setActiveTab] = useState('earn');
  const [watchingAd, setWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [purchasing, setPurchasing] = useState(null);
  const [success, setSuccess] = useState(null);
  const [txHistory, setTxHistory] = useState([]);

  const balance = user?.poupMoedas || 0;

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(null), 2500); };

  const handleWatchAd = () => {
    setWatchingAd(true); setAdProgress(0);
    const interval = setInterval(() => {
      setAdProgress(prev => { if (prev >= 100) { clearInterval(interval); return 100; } return prev + 2; });
    }, 60);
    setTimeout(() => {
      clearInterval(interval);
      updateUser({ poupMoedas: balance + 50 });
      setTxHistory(prev => [{ type: 'earn', amount: 50, action: 'Ver anuncio', date: new Date() }, ...prev]);
      showSuccess('+50 PoupMoedas!');
      setWatchingAd(false); setAdProgress(0);
    }, 3500);
  };

  const handleEarn = (action) => {
    updateUser({ poupMoedas: balance + action.reward });
    setTxHistory(prev => [{ type: 'earn', amount: action.reward, action: action.label, date: new Date() }, ...prev]);
    showSuccess(`+${action.reward} PoupMoedas!`);
  };

  const handleSpend = (item) => {
    if (balance < item.cost) { showSuccess('Moedas insuficientes'); return; }
    setPurchasing(item.id);
    updateUser({ poupMoedas: balance - item.cost });
    setTxHistory(prev => [{ type: 'spend', amount: item.cost, action: item.label, date: new Date() }, ...prev]);
    showSuccess(`${item.label} desbloqueado!`);
    setPurchasing(null);
  };

  const tabs = [
    { id: 'earn', label: 'Ganhar', icon: ArrowDownLeft, color: '#10B981' },
    { id: 'spend', label: 'Gastar', icon: ArrowUpRight, color: theme.primary },
    { id: 'history', label: 'Historico', icon: Clock, color: '#3B82F6' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Balance Card */}
      <div style={{
        padding: 24, borderRadius: 16, textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'radial-gradient(circle at 30% 50%, white, transparent 50%)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)'
          }}>
            <Coins size={28} color="#fff" />
          </div>
          <p style={{ fontSize: 36, fontWeight: 700, color: '#fff', margin: 0 }}>{balance}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>PoupMoedas</p>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div style={{
          padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 500, textAlign: 'center',
          background: success.startsWith('+') ? s('#10B981', 0.15) : s('#EF4444', 0.15),
          color: success.startsWith('+') ? '#10B981' : '#EF4444'
        }}>
          {success}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {tabs.map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: 10, borderRadius: 12, fontSize: 11, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            background: activeTab === id ? s(color, 0.1) : theme.surface,
            color: activeTab === id ? color : theme.textMuted,
            border: activeTab === id ? `1px solid ${s(color, 0.4)}` : `1px solid ${theme.border}`
          }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Earn Tab */}
      {activeTab === 'earn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', margin: 0 }}>Ganhar PoupMoedas</h3>

          {watchingAd ? (
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Play size={20} style={{ color: '#3B82F6' }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Ver Anuncio</p>
                  <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Ganha 50 PoupMoedas</p>
                </div>
              </div>
              <div style={{ width: '100%', borderRadius: 20, height: 8, background: theme.border }}>
                <div style={{ height: 8, borderRadius: 20, transition: 'width 0.1s', width: `${adProgress}%`, background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }} />
              </div>
              <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 8, textAlign: 'center' }}>A ver anuncio...</p>
            </div>
          ) : (
            <button onClick={handleWatchAd} className="glass-card" style={{
              width: '100%', padding: 16, display: 'flex', alignItems: 'center', gap: 12,
              textAlign: 'left', cursor: 'pointer', border: `1px solid ${s('#3B82F6', 0.3)}`
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s('#3B82F6', 0.15) }}>
                <Play size={20} style={{ color: '#3B82F6' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Ver Anuncio</p>
                <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Ve um curto anuncio e ganha moedas</p>
              </div>
              <div style={{ padding: '6px 10px', borderRadius: 12, background: s('#10B981', 0.15) }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#10B981', margin: 0 }}>+50</p>
              </div>
            </button>
          )}

          {earnActions.filter(a => a.id !== 'watch_ad').map(action => {
            const Icon = action.icon;
            return (
              <button key={action.id} onClick={() => handleEarn(action)} className="glass-card" style={{
                width: '100%', padding: 16, display: 'flex', alignItems: 'center', gap: 12,
                textAlign: 'left', cursor: 'pointer'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s(action.color, 0.15) }}>
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>{action.label}</p>
                  <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>{action.desc}</p>
                </div>
                <div style={{ padding: '6px 10px', borderRadius: 12, background: s('#10B981', 0.15) }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', margin: 0 }}>+{action.reward}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Spend Tab */}
      {activeTab === 'spend' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', margin: 0 }}>Gastar PoupMoedas</h3>
          {spendItems.map(item => {
            const Icon = item.icon;
            const canAfford = balance >= item.cost;
            return (
              <div key={item.id} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s(item.color, 0.15) }}>
                  <Icon size={18} style={{ color: item.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>{item.desc}</p>
                </div>
                <button onClick={() => handleSpend(item)} disabled={!canAfford || purchasing === item.id} style={{
                  padding: '6px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: canAfford ? s(theme.primary, 0.2) : theme.surface,
                  color: canAfford ? theme.primary : theme.textMuted,
                  border: canAfford ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`,
                  opacity: purchasing === item.id ? 0.5 : 1
                }}>
                  <Coins size={12} /> {item.cost}
                </button>
              </div>
            );
          })}

          {user?.plan !== 'premium' && (
            <div style={{
              padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12, marginTop: 8,
              background: s(theme.primary, 0.1), border: `1px solid ${s(theme.primary, 0.3)}`
            }}>
              <Crown size={20} style={{ color: theme.primary }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: theme.primary, margin: 0 }}>Premium</p>
                <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Moedas ilimitadas com Premium</p>
              </div>
              <Sparkles size={16} style={{ color: theme.primary }} />
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', margin: 0 }}>Historico</h3>
          {txHistory.length > 0 ? txHistory.map((tx, idx) => (
            <div key={idx} className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tx.type === 'earn' ? s('#10B981', 0.15) : s('#EF4444', 0.15)
              }}>
                {tx.type === 'earn' ? <ArrowDownLeft size={14} style={{ color: '#10B981' }} /> : <ArrowUpRight size={14} style={{ color: '#EF4444' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: theme.text, margin: 0 }}>{tx.action}</p>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: tx.type === 'earn' ? '#10B981' : '#EF4444', margin: 0 }}>
                {tx.type === 'earn' ? '+' : '-'}{tx.amount}
              </p>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <Clock size={40} style={{ color: theme.textMuted, margin: '0 auto 12px' }} />
              <p style={{ fontSize: 13, color: theme.textMuted }}>Sem transacoes ainda</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
