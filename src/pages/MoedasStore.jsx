import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { themes, themeCatalog } from '../themes';
import {
  Coins, Play, CreditCard, MessageCircle, Camera, FileBarChart,
  Users, Zap, CalendarDays, Flame, TrendingUp, ArrowDownLeft,
  ArrowUpRight, Clock, Crown, Sparkles, Share2, Palette, Check, Lock,
} from 'lucide-react';

/* ============================================================ */
/* Static data                                                  */
/* ============================================================ */

const earnActions = [
  { id: 'watch_ad',          label: 'Ver anúncio',         reward: 50,  icon: Play,         desc: 'Vê um anúncio curto e ganha moedas.',  color: '#3B82F6' },
  { id: 'daily_login',       label: 'Login diário',        reward: 10,  icon: CalendarDays, desc: 'Entra todos os dias para ganhar.',     color: '#10B981' },
  { id: 'add_transaction',   label: 'Registar transação',  reward: 5,   icon: CreditCard,   desc: 'Regista uma transação na app.',         color: '#F59E0B' },
  { id: 'complete_challenge',label: 'Completar desafio',   reward: 100, icon: Zap,          desc: 'Completa desafios semanais.',           color: '#8B5CF6' },
  { id: 'streak_bonus',      label: 'Bónus de sequência',  reward: 30,  icon: Flame,        desc: 'Bónus por sequência de 7 dias.',        color: '#EF4444' },
  { id: 'share_achievement', label: 'Partilhar conquista', reward: 20,  icon: Share2,       desc: 'Partilha uma conquista.',               color: '#EC4899' },
];

const spendItems = [
  { id: 'coach_question',    label: 'Pergunta ao Coach',  cost: 100, icon: MessageCircle, desc: 'Faz uma pergunta extra ao teu Coach.',    color: '#8B5CF6' },
  { id: 'ocr_scan',          label: 'Scanner OCR',        cost: 50,  icon: Camera,        desc: 'Digitaliza um recibo automaticamente.',   color: '#3B82F6' },
  { id: 'weekly_report',     label: 'Relatório semanal',  cost: 30,  icon: FileBarChart,  desc: 'Relatório detalhado da semana.',          color: '#10B981' },
  { id: 'creditor_template', label: 'Template para credor', cost: 10, icon: Users,        desc: 'Modelo de mensagem para credores.',       color: '#F59E0B' },
];

/* ============================================================ */
/* Animated number                                              */
/* ============================================================ */

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

  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{count.toLocaleString('pt-PT')}</span>;
}

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

const getTimeAgo = (date) => {
  const diff = new Date() - new Date(date);
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `há ${mins} min`;
  if (hours < 24) return `há ${hours}h`;
  return `há ${days}d`;
};

/* ============================================================ */
/* UI primitives                                                */
/* ============================================================ */

const Shell = ({ children }) => (
  <div
    style={{
      width: '100%',
      maxWidth: 1100,
      margin: '0 auto',
      padding: 'clamp(16px, 3vw, 28px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(14px, 2.5vw, 20px)',
      minWidth: 0,
    }}
  >
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: 'var(--card, #1a1a1a)',
      border: '1px solid var(--border, rgba(255,255,255,0.08))',
      borderRadius: 16,
      minWidth: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ children, hint }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
    <h3
      style={{
        margin: 0,
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-secondary, #9CA3AF)',
      }}
    >
      {children}
    </h3>
    {hint && (
      <span style={{ fontSize: 12, color: 'var(--text-muted, #6B7280)' }}>{hint}</span>
    )}
  </div>
);

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function MoedasStore() {
  const {
    user, updateUser, currentTheme, setTheme,
    isThemeOwned, buyTheme, ownedThemes,
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

  /* Coin idle animation */
  useEffect(() => {
    const i = setInterval(() => setCoinSpin((v) => !v), 3000);
    return () => clearInterval(i);
  }, []);

  /* ---------- notify ---------- */
  const notify = (message, type = 'success') => {
    if (type === 'error') { setError(message); setSuccess(null); }
    else { setSuccess(message); setError(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 2600);
  };

  const addHistory = (item) => {
    setTransactions((prev) => [{ ...item, date: new Date() }, ...prev]);
  };

  const syncUser = async (payload) => { try { await api.updateMe(payload); } catch {} };

  /* ---------- earn ---------- */
  const handleWatchAd = async () => {
    setWatchingAd(true);
    setAdProgress(0);
    const interval = setInterval(() => setAdProgress((p) => Math.min(p + 2, 100)), 60);

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
    if (action.id === 'watch_ad') return handleWatchAd();
    setEarning(action.id);
    try {
      const res = await api.earnMoedas(action.id, action.reward);
      const earned = res.data?.earned || action.reward;
      const newBalance = res.data?.balance ?? balance + earned;
      updateUser({ poupMoedas: newBalance });
      addHistory({ type: 'earn', amount: earned, action: action.label });
      notify(`+${earned} PoupMoedas`);
    } catch (err) {
      notify(err?.message || 'Não foi possível ganhar moedas.', 'error');
    } finally { setEarning(null); }
  };

  /* ---------- spend ---------- */
  const handleSpend = async (item) => {
    if (balance < item.cost) return notify('PoupMoedas insuficientes.', 'error');
    setPurchasing(item.id);
    try {
      updateUser({ poupMoedas: balance - item.cost });
      addHistory({ type: 'spend', amount: item.cost, action: item.label });
      notify(`${item.label} desbloqueado.`);
      await api.spendMoedas(item.id).catch(() => null);
    } finally { setPurchasing(null); }
  };

  /* ---------- themes ---------- */
  const handleThemeAction = async (themeId) => {
    const theme = themes[themeId];
    if (!theme) return;
    const owned = isThemeOwned(themeId);

    if (owned) {
      const applied = setTheme(themeId);
      if (!applied) return notify('Este tema ainda está bloqueado.', 'error');
      updateUser({ theme: themeId });
      await syncUser({ theme: themeId });
      notify('Tema aplicado.');
      return;
    }

    setPurchasing(themeId);
    const result = buyTheme(themeId);
    if (!result.ok) { notify(result.reason, 'error'); setPurchasing(null); return; }
    const updatedOwnedThemes = Array.from(new Set([...ownedThemes, themeId, 'darkGold']));
    const newBalance = Math.max(0, balance - theme.price);
    addHistory({ type: 'spend', amount: theme.price, action: `Tema ${theme.name}` });
    await syncUser({ ownedThemes: updatedOwnedThemes, theme: themeId, poupMoedas: newBalance });
    notify(result.reason);
    setPurchasing(null);
  };

  /* ---------- derived ---------- */
  const tabs = useMemo(() => ([
    { id: 'themes',  label: 'Temas',     icon: Palette,        color: '#D4AF37' },
    { id: 'earn',    label: 'Ganhar',    icon: ArrowDownLeft,  color: '#10B981' },
    { id: 'spend',   label: 'Gastar',    icon: ArrowUpRight,   color: '#EF4444' },
    { id: 'history', label: 'Histórico', icon: Clock,          color: '#3B82F6' },
  ]), []);

  /* ============================================================ */
  return (
    <Shell>
      {/* ============== BALANCE HERO ============== */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
          borderRadius: 22,
          padding: 'clamp(24px, 5vw, 36px) clamp(20px, 4vw, 32px)',
          textAlign: 'center',
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(212,175,55,0.25)',
        }}
      >
        {/* decorative glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative' }}>
          <motion.div
            animate={{ rotateY: coinSpin ? 180 : 0 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Coins size={32} color="#fff" strokeWidth={2.2} />
          </motion.div>

          <p
            style={{
              margin: 0,
              fontSize: 'clamp(36px, 8vw, 56px)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            <AnimatedCounter target={balance} />
          </p>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 14,
              color: 'rgba(255,255,255,0.85)',
              fontWeight: 600,
            }}
          >
            PoupMoedas disponíveis
          </p>

          <div
            style={{
              marginTop: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.15)',
              padding: '6px 12px',
              borderRadius: 999,
              maxWidth: '100%',
            }}
          >
            <TrendingUp size={12} color="rgba(255,255,255,0.85)" />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              Usa moedas para desbloquear temas e extras
            </span>
          </div>
        </div>
      </motion.section>

      {/* ============== TOAST ============== */}
      <AnimatePresence>
        {(success || error) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              textAlign: 'center',
              background: error ? 'rgba(239,68,68,0.14)' : 'rgba(16,185,129,0.14)',
              color: error ? '#FCA5A5' : '#34D399',
              border: `1px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            }}
          >
            {error || success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== TABS ============== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 10,
        }}
      >
        {tabs.map(({ id, label, icon: Icon, color }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              style={{
                minHeight: 48,
                padding: '10px 12px',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: active ? `${color}1F` : 'var(--card, #1a1a1a)',
                color: active ? color : 'var(--text-secondary, #9CA3AF)',
                border: `1px solid ${active ? color + '66' : 'var(--border, rgba(255,255,255,0.08))'}`,
                transition: 'all 0.18s ease',
                minWidth: 0,
              }}
            >
              <Icon size={15} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* ============== CONTENT ============== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 2vw, 16px)' }}
        >
          {/* ===== THEMES ===== */}
          {activeTab === 'themes' && (
            <>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text, #fff)' }}>
                    Loja de temas
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted, #6B7280)' }}>
                    {themeCatalog.length} temas disponíveis · Compra uma vez, usa sempre
                  </p>
                </div>
                {isPremium && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 800,
                      background: 'rgba(212,175,55,0.16)',
                      color: '#D4AF37',
                      border: '1px solid rgba(212,175,55,0.3)',
                    }}
                  >
                    <Crown size={12} /> Premium · tudo desbloqueado
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 'clamp(12px, 2vw, 16px)',
                }}
              >
                {themeCatalog.map((theme) => {
                  const owned = isThemeOwned(theme.id);
                  const active = currentTheme === theme.id;
                  const busy = purchasing === theme.id;

                  return (
                    <motion.div
                      key={theme.id}
                      layout
                      whileHover={{ y: -2 }}
                      style={{
                        background: theme.surface,
                        color: theme.text,
                        border: `2px solid ${active ? theme.primary : theme.border}`,
                        borderRadius: 18,
                        padding: 18,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                        minWidth: 0,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Gradient strip */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 4,
                          background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                        }}
                      />

                      {/* Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, minWidth: 0 }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 15,
                              fontWeight: 800,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {theme.name}
                          </p>
                          <p
                            style={{
                              margin: '4px 0 0',
                              fontSize: 12,
                              opacity: 0.7,
                              wordBreak: 'break-word',
                            }}
                          >
                            {theme.description}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                            background: owned ? `${theme.primary}22` : 'rgba(0,0,0,0.2)',
                            color: owned ? theme.primary : theme.textMuted,
                            flexShrink: 0,
                            alignSelf: 'flex-start',
                          }}
                        >
                          {owned ? '✓ Comprado' : `${theme.price} 🪙`}
                        </span>
                      </div>

                      {/* Preview swatches */}
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[theme.primary, theme.primaryLight, theme.surfaceHover, theme.border].map((c, i) => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: 28,
                              borderRadius: 8,
                              background: c,
                              border: '1px solid rgba(0,0,0,0.1)',
                            }}
                          />
                        ))}
                      </div>

                      {/* Action button */}
                      <button
                        type="button"
                        onClick={() => handleThemeAction(theme.id)}
                        disabled={busy}
                        style={{
                          minHeight: 44,
                          padding: '10px 14px',
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: busy ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          background: active
                            ? `${theme.primary}28`
                            : owned
                              ? `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`
                              : 'rgba(255,255,255,0.08)',
                          color: active ? theme.primary : owned ? theme.textInverse : theme.text,
                          border: `1px solid ${active ? theme.primary : 'rgba(255,255,255,0.12)'}`,
                          opacity: busy ? 0.7 : 1,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {active ? <Check size={14} /> : owned ? <Sparkles size={14} /> : <Lock size={14} />}
                        {active ? 'Ativo' : owned ? 'Aplicar' : busy ? 'A comprar…' : 'Comprar'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {/* ===== EARN ===== */}
          {activeTab === 'earn' && (
            <>
              <SectionTitle hint={`Saldo: ${balance.toLocaleString('pt-PT')} 🪙`}>
                Ganhar PoupMoedas
              </SectionTitle>

              {/* Ad progress */}
              <AnimatePresence>
                {watchingAd && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Card style={{ padding: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div
                          style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'rgba(59,130,246,0.18)',
                            color: '#3B82F6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Play size={18} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text, #fff)' }}>
                            A ver anúncio…
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>
                            Vais ganhar 50 PoupMoedas
                          </p>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#D4AF37' }}>
                          {adProgress}%
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: 8,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.08)',
                          overflow: 'hidden',
                        }}
                      >
                        <motion.div
                          animate={{ width: `${adProgress}%` }}
                          transition={{ duration: 0.06 }}
                          style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #D4AF37, #FFD700)',
                            borderRadius: 999,
                          }}
                        />
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                }}
              >
                {earnActions.map((action) => {
                  const Icon = action.icon;
                  const isEarning = earning === action.id;
                  const disabled = isEarning || watchingAd;

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleEarn(action)}
                      disabled={disabled}
                      style={{
                        background: 'var(--card, #1a1a1a)',
                        border: '1px solid var(--border, rgba(255,255,255,0.08))',
                        borderRadius: 14,
                        padding: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        textAlign: 'left',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1,
                        minWidth: 0,
                        transition: 'all 0.15s ease',
                        color: 'var(--text, #fff)',
                      }}
                      onMouseEnter={(e) => !disabled && (e.currentTarget.style.borderColor = action.color + '66')}
                      onMouseLeave={(e) => !disabled && (e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.08))')}
                    >
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: `${action.color}1F`,
                          color: action.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0, fontSize: 14, fontWeight: 700,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {action.label}
                        </p>
                        <p
                          style={{
                            margin: '2px 0 0', fontSize: 12,
                            color: 'var(--text-secondary, #9CA3AF)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {action.desc}
                        </p>
                      </div>
                      <div
                        style={{
                          padding: '6px 12px', borderRadius: 999,
                          background: 'rgba(16,185,129,0.15)',
                          color: '#10B981',
                          fontSize: 13, fontWeight: 800,
                          flexShrink: 0, whiteSpace: 'nowrap',
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                        }}
                      >
                        +{action.reward}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ===== SPEND ===== */}
          {activeTab === 'spend' && (
            <>
              <SectionTitle hint={`Saldo: ${balance.toLocaleString('pt-PT')} 🪙`}>
                Gastar PoupMoedas
              </SectionTitle>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 12,
                }}
              >
                {spendItems.map((item) => {
                  const Icon = item.icon;
                  const canAfford = balance >= item.cost;
                  const isPurchasing = purchasing === item.id;

                  return (
                    <Card key={item.id} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: `${item.color}1F`,
                          color: item.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text, #fff)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {item.label}
                        </p>
                        <p
                          style={{
                            margin: '2px 0 0', fontSize: 12,
                            color: 'var(--text-secondary, #9CA3AF)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}
                        >
                          {item.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpend(item)}
                        disabled={!canAfford || isPurchasing}
                        style={{
                          minHeight: 38, padding: '6px 14px', borderRadius: 10,
                          fontSize: 13, fontWeight: 800,
                          background: canAfford ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                          color: canAfford ? '#D4AF37' : 'var(--text-muted, #6B7280)',
                          border: `1px solid ${canAfford ? 'rgba(212,175,55,0.4)' : 'var(--border, rgba(255,255,255,0.08))'}`,
                          cursor: canAfford && !isPurchasing ? 'pointer' : 'not-allowed',
                          opacity: isPurchasing ? 0.6 : 1,
                          flexShrink: 0,
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Coins size={13} /> {item.cost}
                      </button>
                    </Card>
                  );
                })}
              </div>

              {!isPremium && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: 18,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.16), rgba(184,148,31,0.06))',
                    border: '1px solid rgba(212,175,55,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexWrap: 'wrap',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: 'rgba(212,175,55,0.22)',
                      color: '#D4AF37',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Crown size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#D4AF37' }}>
                      Vai Premium
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>
                      Desbloqueia extras avançados e temas sem custo.
                    </p>
                  </div>
                  <Sparkles size={18} color="#D4AF37" style={{ flexShrink: 0 }} />
                </motion.div>
              )}
            </>
          )}

          {/* ===== HISTORY ===== */}
          {activeTab === 'history' && (
            <>
              <SectionTitle hint={transactions.length > 0 ? `${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'}` : null}>
                Histórico de PoupMoedas
              </SectionTitle>

              {transactions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {transactions.map((tx, idx) => (
                    <motion.div
                      key={`${tx.action}-${idx}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    >
                      <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: tx.type === 'earn' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                            color: tx.type === 'earn' ? '#10B981' : '#EF4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {tx.type === 'earn' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text, #fff)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}
                          >
                            {tx.action}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted, #6B7280)' }}>
                            {getTimeAgo(tx.date)}
                          </p>
                        </div>
                        <p
                          style={{
                            margin: 0, fontSize: 14, fontWeight: 800,
                            color: tx.type === 'earn' ? '#10B981' : '#EF4444',
                            fontVariantNumeric: 'tabular-nums',
                            flexShrink: 0,
                          }}
                        >
                          {tx.type === 'earn' ? '+' : '−'}{tx.amount}
                        </p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 'clamp(32px, 6vw, 48px) 20px',
                    border: '1px dashed var(--border, rgba(255,255,255,0.1))',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,0.015)',
                  }}
                >
                  <div
                    style={{
                      width: 60, height: 60, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-muted, #6B7280)',
                      margin: '0 auto 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Clock size={26} />
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text, #fff)' }}>
                    Sem histórico ainda
                  </p>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary, #9CA3AF)' }}>
                    As compras e ganhos aparecem aqui.
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
