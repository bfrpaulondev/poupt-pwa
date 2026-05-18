import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import {
  Edit2, Save, X, Trophy, Coins, Settings as SettingsIcon,
  LogOut, Crown, TrendingUp, Target, Award, ChevronRight,
  Shield, Heart, Brain, Smile, Star, Sparkles, Calendar,
  Mail, AlertTriangle, Trash2, BarChart3, Wallet, Flame,
} from 'lucide-react';

const personalityIcons = {
  sargento: { icon: Shield, color: '#EF4444', label: 'Sargento' },
  amigavel: { icon: Heart, color: '#10B981', label: 'Amigável' },
  analitico: { icon: Brain, color: '#3B82F6', label: 'Analítico' },
  zen: { icon: Smile, color: '#8B5CF6', label: 'Zen' },
};

const modeMeta = {
  sobrevivencia: { label: 'Sobrevivência', color: '#EF4444', icon: AlertTriangle },
  recuperacao: { label: 'Recuperação', color: '#F59E0B', icon: TrendingUp },
  estabilidade: { label: 'Estabilidade', color: '#10B981', icon: Target },
  liberdade: { label: 'Liberdade', color: '#D4AF37', icon: Crown },
};

const DEFAULT_PERSONALITY = personalityIcons.amigavel;
const DEFAULT_MODE = modeMeta.estabilidade;

function normalizeKey(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

export default function Profile() {
  const { user, updateUser, logout, setScreen } = useStore();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCoach, setEditingCoach] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || 'Coach');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // --- Load stats ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getReportSummary?.();
        if (alive) setStats(res?.data || res || null);
      } catch (e) {
        console.warn('stats error', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // --- Derived ---
  const currentMode = normalizeKey(user?.financialMode);
  const mode = modeMeta[currentMode] || DEFAULT_MODE;

  const coachPersonality = normalizeKey(user?.coachPersonality);
  const personality = personalityIcons[coachPersonality] || DEFAULT_PERSONALITY;

  const PersonalityIcon = personality?.icon || Heart;
  const ModeIcon = mode?.icon || Target;

  const level = useMemo(() => {
    const coins = user?.poupMoedas || 0;
    return Math.max(1, Math.floor(coins / 100) + 1);
  }, [user?.poupMoedas]);

  const currentLevelProgress = ((user?.poupMoedas || 0) % 100);

  // --- Handlers ---
  const handleSaveCoach = async () => {
    if (!coachName.trim()) return;
    setSaving(true);
    try {
      await api.updateMe?.({ coachName: coachName.trim() });
      updateUser({ coachName: coachName.trim() });
      setEditingCoach(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Tens a certeza que queres sair?')) logout();
  };

  const confirmDelete = async () => {
    if (deleteConfirmText !== 'ELIMINAR') return;
    try {
      await api.deleteAccount?.();
      logout();
    } catch (e) {
      alert(e?.message || 'Não foi possível eliminar a conta.');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
          }}
        />
      </div>
    );
  }

  // --- Stats Cards data ---
  const statCards = [
    {
      icon: Wallet,
      label: 'Poupado',
      value: formatCurrency(stats?.totalSaved || 0),
      color: '#10B981',
    },
    {
      icon: BarChart3,
      label: 'Transações',
      value: stats?.totalTransactions || 0,
      color: '#3B82F6',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${stats?.streak || 0}d`,
      color: '#F59E0B',
    },
    {
      icon: Trophy,
      label: 'Troféus',
      value: stats?.trophies || 0,
      color: '#D4AF37',
    },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(16px, 3vw, 28px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(16px, 3vw, 24px)',
        minWidth: 0,
      }}
    >
      {/* ========= Header / Avatar ========= */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(184,148,31,0.08))',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: 22,
          padding: 'clamp(20px, 4vw, 32px)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(16px, 3vw, 24px)',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              position: 'relative',
              width: 'clamp(80px, 18vw, 110px)',
              height: 'clamp(80px, 18vw, 110px)',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(32px, 7vw, 48px)',
              flexShrink: 0,
              boxShadow: '0 12px 32px rgba(212,175,55,0.35)',
            }}
          >
            {user?.avatar || '🦊'}
            {/* Level badge */}
            <div
              style={{
                position: 'absolute',
                bottom: -4,
                right: -4,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#0B0B0B',
                border: '3px solid var(--card, #1a1a1a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D4AF37',
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              {level}
            </div>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(22px, 5vw, 32px)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                wordBreak: 'break-word',
              }}
            >
              {user?.name || 'Utilizador'}
            </h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 6,
                color: 'var(--text-secondary, #9CA3AF)',
                fontSize: 14,
                minWidth: 0,
              }}
            >
              <Mail size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || '—'}
              </span>
            </div>

            {/* Level progress */}
            <div style={{ marginTop: 14, maxWidth: 320 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--text-secondary, #9CA3AF)',
                  marginBottom: 6,
                  fontWeight: 600,
                }}
              >
                <span>Nível {level}</span>
                <span>{currentLevelProgress}/100</span>
              </div>
              <div
                style={{
                  height: 8,
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentLevelProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #D4AF37, #FFD700)',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          </div>

          {/* PoupMoedas pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(212,175,55,0.18)',
              border: '1px solid rgba(212,175,55,0.35)',
              padding: '10px 16px',
              borderRadius: 999,
              fontWeight: 800,
              color: '#D4AF37',
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            <Coins size={18} />
            {user?.poupMoedas || 0}
          </div>
        </div>
      </motion.section>

      {/* ========= Stats Grid ========= */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'clamp(10px, 2vw, 16px)',
        }}
      >
        {statCards.map((s, i) => {
          const Icon = s.icon || Award;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                background: 'var(--card, #1a1a1a)',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                borderRadius: 16,
                padding: 'clamp(14px, 2.5vw, 18px)',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `${s.color}22`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                }}
              >
                <Icon size={18} />
              </div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary, #9CA3AF)',
                  fontWeight: 700,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 'clamp(18px, 3.5vw, 22px)',
                  fontWeight: 800,
                  marginTop: 4,
                  fontVariantNumeric: 'tabular-nums',
                  wordBreak: 'break-word',
                }}
              >
                {s.value}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ========= Mode bar ========= */}
      <section
        style={{
          background: 'var(--card, #1a1a1a)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          borderRadius: 16,
          padding: 'clamp(14px, 2.5vw, 18px)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${mode.color}22`,
            color: mode.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ModeIcon size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #9CA3AF)', fontWeight: 600 }}>
            Modo financeiro atual
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: mode.color }}>{mode.label}</div>
        </div>
        <button
          type="button"
          onClick={() => setScreen('settings')}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            color: 'var(--text, #fff)',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            minHeight: 40,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          Alterar
          <ChevronRight size={16} />
        </button>
      </section>

      {/* ========= Two-column layout ========= */}
      <div
        className="profile-grid"
        style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(16px, 3vw, 20px)' }}
      >
        {/* Coach Settings */}
        <section
          style={{
            background: 'var(--card, #1a1a1a)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 16,
            padding: 'clamp(16px, 3vw, 22px)',
            minWidth: 0,
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 16,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${personality.color}22`,
                color: personality.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PersonalityIcon size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>O Teu Coach</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>
                Personalidade: {personality.label}
              </p>
            </div>
          </header>

          {editingCoach ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Nome do coach"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text, #fff)',
                  fontSize: 16,
                  outline: 'none',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleSaveCoach}
                  disabled={saving}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    minHeight: 44,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                    color: '#0B0B0B',
                    fontWeight: 700,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Save size={16} /> {saving ? 'A guardar…' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setEditingCoach(false);
                    setCoachName(user?.coachName || 'Coach');
                  }}
                  style={{
                    minWidth: 100,
                    minHeight: 44,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border, rgba(255,255,255,0.08))',
                    background: 'transparent',
                    color: 'var(--text, #fff)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <X size={16} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 10,
                minWidth: 0,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>Nome</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.coachName || 'Coach'}
                </div>
              </div>
              <button
                onClick={() => setEditingCoach(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  borderRadius: 10,
                  padding: 10,
                  cursor: 'pointer',
                  color: 'var(--text, #fff)',
                  minWidth: 44,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-label="Editar nome do coach"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Trophies */}
        <section
          style={{
            background: 'var(--card, #1a1a1a)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 16,
            padding: 'clamp(16px, 3vw, 22px)',
            minWidth: 0,
          }}
        >
          <header
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(212,175,55,0.18)',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trophy size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Troféus</h3>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>
                {stats?.trophies || 0} conquistas
              </p>
            </div>
          </header>

          {stats?.trophyList?.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: 10,
              }}
            >
              {stats.trophyList.slice(0, 6).map((t, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: 12,
                    padding: 12,
                    textAlign: 'center',
                    minWidth: 0,
                  }}
                >
                  <div style={{ fontSize: 28 }}>{t?.icon || '🏆'}</div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      marginTop: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {t?.name || 'Troféu'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--text-secondary, #9CA3AF)',
                border: '1px dashed var(--border, rgba(255,255,255,0.1))',
                borderRadius: 12,
              }}
            >
              <Award size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13 }}>Continua para desbloquear troféus!</p>
            </div>
          )}
        </section>
      </div>

      {/* ========= Premium CTA ========= */}
      {!user?.isPremium && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
            borderRadius: 18,
            padding: 'clamp(18px, 3vw, 24px)',
            color: '#0B0B0B',
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Crown size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Vai Premium</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>
              Desbloqueia temas exclusivos, relatórios avançados e mais.
            </p>
          </div>
          <button
            onClick={() => setScreen('premium')}
            style={{
              background: '#0B0B0B',
              color: '#D4AF37',
              border: 'none',
              padding: '12px 20px',
              borderRadius: 12,
              fontWeight: 800,
              cursor: 'pointer',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={16} /> Saber mais
          </button>
        </motion.section>
      )}

      {/* ========= Account info ========= */}
      <section
        style={{
          background: 'var(--card, #1a1a1a)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          borderRadius: 16,
          padding: 'clamp(16px, 3vw, 22px)',
          minWidth: 0,
        }}
      >
        <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>Informações da conta</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { icon: Mail, label: 'Email', value: user?.email || '—' },
            {
              icon: Calendar,
              label: 'Membro desde',
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('pt-PT')
                : '—',
            },
            { icon: Star, label: 'Plano', value: user?.isPremium ? 'Premium' : 'Gratuito' },
          ].map((row, i) => {
            const Icon = row.icon || Star;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom:
                    i < 2 ? '1px solid var(--border, rgba(255,255,255,0.06))' : 'none',
                  minWidth: 0,
                }}
              >
                <Icon size={16} color="var(--text-secondary, #9CA3AF)" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: 'var(--text-secondary, #9CA3AF)', minWidth: 90 }}>
                  {row.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}
                >
                  {row.value}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========= Action buttons ========= */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        <button
          onClick={() => setScreen('settings')}
          style={{
            background: 'var(--card, #1a1a1a)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            color: 'var(--text, #fff)',
            padding: '14px 18px',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            minHeight: 48,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <SettingsIcon size={18} /> Definições
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#F87171',
            padding: '14px 18px',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 14,
            minHeight: 48,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <LogOut size={18} /> Terminar sessão
        </button>
      </section>

      {/* ========= Danger zone ========= */}
      <section
        style={{
          background: 'rgba(239,68,68,0.04)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 16,
          padding: 'clamp(16px, 3vw, 22px)',
          minWidth: 0,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <AlertTriangle size={18} color="#EF4444" />
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#F87171' }}>
            Zona de perigo
          </h3>
        </header>
        <p style={{ margin: '0 0 14px', fontSize: 13, color: 'var(--text-secondary, #9CA3AF)' }}>
          Eliminar a tua conta é uma ação permanente. Todos os dados serão perdidos.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#F87171',
            padding: '12px 18px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Trash2 size={16} /> Eliminar conta
        </button>
      </section>

      {/* ========= Delete modal ========= */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card, #1a1a1a)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 18,
                padding: 'clamp(20px, 4vw, 28px)',
                maxWidth: 440,
                width: '100%',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: 'rgba(239,68,68,0.15)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <AlertTriangle size={28} />
              </div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, textAlign: 'center' }}>
                Eliminar conta?
              </h3>
              <p
                style={{
                  margin: '8px 0 16px',
                  fontSize: 14,
                  color: 'var(--text-secondary, #9CA3AF)',
                  textAlign: 'center',
                }}
              >
                Esta ação é irreversível. Escreve <strong style={{ color: '#F87171' }}>ELIMINAR</strong> para confirmar.
              </p>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border, rgba(255,255,255,0.1))',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text, #fff)',
                  fontSize: 16,
                  outline: 'none',
                  marginBottom: 16,
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              />
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    minHeight: 48,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                    background: 'transparent',
                    color: 'var(--text, #fff)',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirmText !== 'ELIMINAR'}
                  style={{
                    flex: 1,
                    minWidth: 120,
                    minHeight: 48,
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background:
                      deleteConfirmText === 'ELIMINAR'
                        ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                        : 'rgba(239,68,68,0.3)',
                    color: '#fff',
                    cursor: deleteConfirmText === 'ELIMINAR' ? 'pointer' : 'not-allowed',
                    fontWeight: 800,
                  }}
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two-column at desktop */}
      <style>{`
        @media (min-width: 1024px) {
          .profile-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}