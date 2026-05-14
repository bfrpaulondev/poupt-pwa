import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import {
  TrendingUp, TrendingDown, Plus, BarChart3, Trash2, X,
  Building2, Bitcoin, Landmark, Home, PiggyBank, Lock,
  ChevronDown, ChevronUp, Crown, Percent, Edit3, Save,
  ChevronLeft, Check, AlertCircle, Wallet,
} from 'lucide-react';

/* ============================================================ */
/* Type configuration                                           */
/* ============================================================ */

const TYPES = {
  stock:       { label: 'Ações',     icon: TrendingUp,  color: '#3B82F6', desc: 'Ações individuais' },
  etf:         { label: 'ETFs',      icon: BarChart3,   color: '#10B981', desc: 'Fundos negociados' },
  fund:        { label: 'Fundos',    icon: Landmark,    color: '#8B5CF6', desc: 'Fundos de investimento' },
  crypto:      { label: 'Crypto',    icon: Bitcoin,     color: '#F59E0B', desc: 'Criptomoedas' },
  real_estate: { label: 'Imóveis',   icon: Home,        color: '#EF4444', desc: 'Investimento imobiliário' },
  ppr:         { label: 'PPR',       icon: PiggyBank,   color: '#EC4899', desc: 'Poupança Reforma' },
  other:       { label: 'Outro',     icon: Building2,   color: '#64748B', desc: 'Outro tipo' },
};

const EMPTY_FORM = {
  name: '', type: 'etf', quantity: '', avgPrice: '',
  currentPrice: '', platform: '', currency: 'EUR', dividendPerShare: '',
};

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string') return `rgba(212,175,55,${alpha})`;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return `rgba(212,175,55,${alpha})`;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(212,175,55,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
};

/* ============================================================ */
/* Layout primitives                                            */
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
      boxSizing: 'border-box',
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
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

const inputBase = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid var(--border, rgba(255,255,255,0.1))',
  background: 'rgba(255,255,255,0.04)',
  color: 'var(--text, #fff)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  minWidth: 0,
};

const FieldLabel = ({ children }) => (
  <label
    style={{
      display: 'block',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--text-secondary, #9CA3AF)',
      marginBottom: 6,
    }}
  >
    {children}
  </label>
);

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function Investments() {
  const { user, setScreen } = useStore();

  const [investments, setInvestments] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

  /* ---------- Load ---------- */
  useEffect(() => { loadInvestments(); }, []);

  const loadInvestments = async () => {
    try {
      const res = await api.getInvestments();
      setInvestments(res?.data?.investments || []);
      setPortfolio(res?.data?.portfolio || null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar investimentos. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Create ---------- */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isPremium) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const data = {
        ...form,
        quantity: Number(form.quantity),
        avgPrice: Number(form.avgPrice),
        currentPrice: Number(form.currentPrice || form.avgPrice),
        dividendPerShare: form.dividendPerShare ? Number(form.dividendPerShare) : 0,
      };
      await api.createInvestment(data);
      setShowForm(false);
      setForm(EMPTY_FORM);
      await loadInvestments();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível criar o investimento.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Edit ---------- */
  const handleEdit = (inv) => {
    setEditingId(inv._id);
    setEditForm({
      name: inv.name,
      type: inv.type,
      quantity: String(inv.quantity),
      avgPrice: String(inv.avgPrice),
      currentPrice: String(inv.currentPrice),
      platform: inv.platform || '',
      currency: inv.currency || 'EUR',
      dividendPerShare: String(inv.dividendPerShare || ''),
    });
    setExpandedId(inv._id);
  };

  const handleSaveEdit = async (id) => {
    setSaving(true);
    try {
      const data = {
        ...editForm,
        quantity: Number(editForm.quantity),
        avgPrice: Number(editForm.avgPrice),
        currentPrice: Number(editForm.currentPrice || editForm.avgPrice),
        dividendPerShare: editForm.dividendPerShare ? Number(editForm.dividendPerShare) : 0,
      };
      await api.updateInvestment(id, data);
      setEditingId(null);
      await loadInvestments();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setDeleting(true);
    try {
      await api.deleteInvestment(id);
      setDeleteConfirmId(null);
      await loadInvestments();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível eliminar.');
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Derived ---------- */
  const profitPct = useMemo(() => {
    if (!portfolio?.totalInvested) return 0;
    return (portfolio.totalProfitLoss / portfolio.totalInvested) * 100;
  }, [portfolio]);

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <Shell>
        <div
          style={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
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
          <p style={{ color: 'var(--text-secondary, #9CA3AF)', fontSize: 14 }}>
            A carregar investimentos…
          </p>
        </div>
      </Shell>
    );
  }

  /* ============================================================ */
  return (
    <Shell>
      {/* Back */}
      <button
        type="button"
        onClick={() => setScreen('dashboard')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary, #9CA3AF)',
          cursor: 'pointer',
          padding: 8,
          margin: '-8px 0 0 -8px',
          fontSize: 14,
          fontWeight: 600,
          minHeight: 44,
          alignSelf: 'flex-start',
        }}
      >
        <ChevronLeft size={18} /> Voltar
      </button>

      {/* ============== HEADER ============== */}
      <Card style={{ padding: 'clamp(16px, 3vw, 22px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: 'rgba(212,175,55,0.18)',
              color: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BarChart3 size={24} />
          </div>

          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(18px, 4vw, 22px)',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                color: 'var(--text, #fff)',
              }}
            >
              Investimentos
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary, #9CA3AF)',
              }}
            >
              {investments.length === 0
                ? 'Acompanha o teu portfolio'
                : `${investments.length} ${investments.length === 1 ? 'ativo' : 'ativos'} no portfolio`}
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
                background: 'rgba(212,175,55,0.18)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#D4AF37',
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <Crown size={12} /> Premium
            </span>
          )}
        </div>
      </Card>

      {/* ============== ERROR ============== */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onClick={() => setErrorMsg('')}
            style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              color: '#FCA5A5',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0 }}>{errorMsg}</span>
            <X size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== PREMIUM NOTICE ============== */}
      {!isPremium && (
        <Card
          style={{
            padding: 'clamp(16px, 3vw, 22px)',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(184,148,31,0.04))',
            borderColor: 'rgba(212,175,55,0.3)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 46, height: 46,
                borderRadius: 12,
                background: 'rgba(212,175,55,0.22)',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Crown size={22} />
            </div>
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#D4AF37',
                }}
              >
                Funcionalidade Premium
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 12,
                  color: 'var(--text-secondary, #9CA3AF)',
                  lineHeight: 1.5,
                }}
              >
                Investimentos avançados, dividendos e acompanhamento de portfolio disponíveis no plano Premium.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setScreen('settings')}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                color: '#0B0B0B',
                border: 'none',
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                minHeight: 40,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Upgrade
            </button>
          </div>
        </Card>
      )}

      {/* ============== PORTFOLIO SUMMARY ============== */}
      {portfolio && (
        <Card style={{ padding: 'clamp(18px, 3.5vw, 24px)' }}>
          <div style={{ marginBottom: 16 }}>
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
              Portfolio
            </h3>
          </div>

          {/* Stats grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 14,
              marginBottom: portfolio.totalInvested > 0 ? 18 : 0,
            }}
          >
            <SummaryStat
              label="Valor atual"
              value={formatCurrency(portfolio.currentValue)}
              color="#10B981"
              large
            />
            <SummaryStat
              label="Ganho/Perda"
              value={`${portfolio.totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(portfolio.totalProfitLoss)}`}
              color={portfolio.totalProfitLoss >= 0 ? '#10B981' : '#EF4444'}
              large
            />
            <SummaryStat
              label="Investido"
              value={formatCurrency(portfolio.totalInvested)}
              color="var(--text, #fff)"
            />
            <SummaryStat
              label="Dividendos"
              value={formatCurrency(portfolio.totalDividends)}
              color="#D4AF37"
            />
          </div>

          {/* Profitability bar */}
          {portfolio.totalInvested > 0 && (
            <div
              style={{
                paddingTop: 16,
                borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-secondary, #9CA3AF)', fontWeight: 600 }}>
                  Rentabilidade
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: profitPct >= 0 ? '#10B981' : '#EF4444',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Center marker */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    width: 2,
                    background: 'rgba(255,255,255,0.15)',
                    zIndex: 1,
                  }}
                />
                <motion.div
                  initial={{ width: '50%' }}
                  animate={{
                    width: `${Math.min(100, Math.max(0, 50 + profitPct * 0.5))}%`,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: profitPct >= 0
                      ? 'linear-gradient(90deg, rgba(16,185,129,0.5), #10B981)'
                      : 'linear-gradient(90deg, #EF4444, rgba(239,68,68,0.5))',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ============== ADD BUTTON ============== */}
      <button
        type="button"
        onClick={() => { if (isPremium) setShowForm(!showForm); }}
        disabled={!isPremium}
        style={{
          width: '100%',
          minHeight: 52,
          padding: '12px 18px',
          borderRadius: 14,
          background: isPremium
            ? showForm
              ? 'rgba(239,68,68,0.12)'
              : 'rgba(16,185,129,0.12)'
            : 'rgba(255,255,255,0.04)',
          color: isPremium
            ? showForm ? '#EF4444' : '#10B981'
            : 'var(--text-muted, #6B7280)',
          border: `1px solid ${
            isPremium
              ? showForm ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'
              : 'var(--border, rgba(255,255,255,0.08))'
          }`,
          fontSize: 14,
          fontWeight: 700,
          cursor: isPremium ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          transition: 'all 0.15s ease',
        }}
      >
        {!isPremium ? (
          <><Lock size={15} /> Premium necessário</>
        ) : showForm ? (
          <><X size={15} /> Cancelar</>
        ) : (
          <><Plus size={15} /> Adicionar investimento</>
        )}
      </button>

      {/* ============== ADD FORM ============== */}
      <AnimatePresence>
        {showForm && isPremium && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text, #fff)' }}>
                  Novo investimento
                </h3>

                {/* Name */}
                <div>
                  <FieldLabel>Nome do ativo</FieldLabel>
                  <input
                    type="text"
                    placeholder="Ex: VWCE ETF"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={inputBase}
                  />
                </div>

                {/* Type selector */}
                <div>
                  <FieldLabel>Tipo de ativo</FieldLabel>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {Object.entries(TYPES).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      const active = form.type === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setForm({ ...form, type: key })}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 10,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            minHeight: 64,
                            background: active ? hexToRgba(cfg.color, 0.15) : 'rgba(255,255,255,0.04)',
                            color: active ? cfg.color : 'var(--text-secondary, #9CA3AF)',
                            border: `1px solid ${active ? hexToRgba(cfg.color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                            minWidth: 0,
                          }}
                        >
                          <Icon size={16} />
                          <span style={{ fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantities row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div>
                    <FieldLabel>Quantidade</FieldLabel>
                    <input
                      type="number"
                      placeholder="0"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      required
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel>Preço médio (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.avgPrice}
                      onChange={(e) => setForm({ ...form, avgPrice: e.target.value })}
                      required
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                </div>

                {/* Current price row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div>
                    <FieldLabel>Preço atual (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.currentPrice}
                      onChange={(e) => setForm({ ...form, currentPrice: e.target.value })}
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel>Dividendo/ação (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.dividendPerShare}
                      onChange={(e) => setForm({ ...form, dividendPerShare: e.target.value })}
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <FieldLabel>Plataforma</FieldLabel>
                  <input
                    type="text"
                    placeholder="Ex: Degiro, Interactive Brokers"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    style={inputBase}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                    style={{
                      flex: '1 1 120px',
                      minHeight: 48,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'transparent',
                      color: 'var(--text, #fff)',
                      border: '1px solid var(--border, rgba(255,255,255,0.1))',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: '1 1 120px',
                      minHeight: 48,
                      padding: '12px 16px',
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
                      color: '#0B0B0B',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: saving ? 'wait' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Plus size={15} /> {saving ? 'A criar…' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== INVESTMENTS LIST ============== */}
      {investments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {investments.map((inv) => (
            <InvestmentItem
              key={inv._id}
              inv={inv}
              isPremium={isPremium}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              editingId={editingId}
              setEditingId={setEditingId}
              editForm={editForm}
              setEditForm={setEditForm}
              deleteConfirmId={deleteConfirmId}
              setDeleteConfirmId={setDeleteConfirmId}
              deleting={deleting}
              saving={saving}
              onEdit={handleEdit}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div
            style={{
              textAlign: 'center',
              padding: 'clamp(40px, 8vw, 64px) 20px',
              border: '1px dashed var(--border, rgba(255,255,255,0.1))',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text-muted, #6B7280)',
                margin: '0 auto 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={28} />
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text, #fff)' }}>
              Sem investimentos ainda
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-secondary, #9CA3AF)' }}>
              Acompanha ações, ETFs, PPR, crypto e muito mais.
            </p>
          </div>
        )
      )}
    </Shell>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function SummaryStat({ label, value, color, large = false }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted, #6B7280)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: large ? 'clamp(18px, 4vw, 22px)' : 'clamp(15px, 3.5vw, 18px)',
          fontWeight: 800,
          color,
          fontVariantNumeric: 'tabular-nums',
          wordBreak: 'break-word',
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InvestmentItem({
  inv, isPremium, expandedId, setExpandedId,
  editingId, setEditingId, editForm, setEditForm,
  deleteConfirmId, setDeleteConfirmId, deleting, saving,
  onEdit, onSaveEdit, onDelete,
}) {
  const typeCfg = TYPES[inv.type] || TYPES.other;
  const TypeIcon = typeCfg.icon;
  const totalDividends = (inv.dividendPerShare || 0) * inv.quantity;
  const isExpanded = expandedId === inv._id;
  const isDeleteConfirm = deleteConfirmId === inv._id;
  const isEditing = editingId === inv._id;
  const isProfit = inv.profitLoss >= 0;
  const profitColor = isProfit ? '#10B981' : '#EF4444';

  return (
    <motion.div
      layout
      style={{
        background: 'var(--card, #1a1a1a)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderLeft: `4px solid ${profitColor}`,
        borderRadius: 14,
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {/* ===== HEADER (clickable) ===== */}
      <div
        onClick={() => {
          if (isEditing) return;
          setExpandedId(isExpanded ? null : inv._id);
          setDeleteConfirmId(null);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 'clamp(14px, 2.5vw, 18px)',
          cursor: isEditing ? 'default' : 'pointer',
          minWidth: 0,
        }}
      >
        {/* Type icon */}
        <div
          style={{
            width: 42, height: 42,
            borderRadius: 12,
            background: hexToRgba(typeCfg.color, 0.18),
            color: typeCfg.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TypeIcon size={20} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 0,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: 'var(--text, #fff)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {inv.name}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: hexToRgba(typeCfg.color, 0.15),
                color: typeCfg.color,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {typeCfg.label}
            </span>
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 11,
              color: 'var(--text-secondary, #9CA3AF)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inv.quantity} × {formatCurrency(inv.avgPrice)}
            {inv.platform && ` · ${inv.platform}`}
          </div>
        </div>

        {/* Values */}
        <div
          style={{
            textAlign: 'right',
            flexShrink: 0,
            minWidth: 90,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: 'var(--text, #fff)',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(inv.currentValue)}
          </div>
          <div
            style={{
              marginTop: 3,
              fontSize: 12,
              fontWeight: 700,
              color: profitColor,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isProfit ? '+' : ''}{formatCurrency(inv.profitLoss)}
          </div>
        </div>

        {/* Chevron */}
        <div style={{ flexShrink: 0, color: 'var(--text-muted, #6B7280)' }}>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* ===== PROFIT BAR ===== */}
      {inv.avgPrice > 0 && (
        <div style={{ padding: '0 clamp(14px, 2.5vw, 18px) 14px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              marginBottom: 6,
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: profitColor, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {isProfit ? '+' : ''}{(inv.profitLossPercent ?? 0).toFixed(1)}%
            </span>
            <span style={{ color: 'var(--text-muted, #6B7280)', fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(inv.avgPrice)} → {formatCurrency(inv.currentPrice)}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 6,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{
                width: `${Math.min(100, Math.max(5, 50 + (inv.profitLossPercent || 0) * 0.5))}%`,
              }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                background: profitColor,
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      )}

      {/* ===== EXPANDED CONTENT ===== */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: 'hidden',
              borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
            }}
          >
            <div style={{ padding: 'clamp(14px, 2.5vw, 18px)' }}>
              {!isEditing ? (
                <ViewMode
                  inv={inv}
                  totalDividends={totalDividends}
                  isPremium={isPremium}
                  isDeleteConfirm={isDeleteConfirm}
                  deleting={deleting}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  setDeleteConfirmId={setDeleteConfirmId}
                />
              ) : (
                <EditMode
                  inv={inv}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  saving={saving}
                  onSaveEdit={onSaveEdit}
                  setEditingId={setEditingId}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ViewMode({ inv, totalDividends, isPremium, isDeleteConfirm, deleting, onEdit, onDelete, setDeleteConfirmId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 10,
        }}
      >
        <MiniStat
          label="Investido"
          value={formatCurrency(inv.quantity * inv.avgPrice)}
          color="var(--text, #fff)"
        />
        <MiniStat
          label="Valor atual"
          value={formatCurrency(inv.currentValue)}
          color="#10B981"
        />
        {totalDividends > 0 && (
          <MiniStat
            label="Dividendos"
            value={formatCurrency(totalDividends)}
            color="#D4AF37"
            background="rgba(212,175,55,0.08)"
            icon={<Percent size={10} />}
            hint={`${formatCurrency(inv.dividendPerShare)}/ação`}
          />
        )}
        {inv.platform && (
          <MiniStat
            label="Plataforma"
            value={inv.platform}
            color="var(--text, #fff)"
          />
        )}
      </div>

      {/* Actions */}
      {isPremium && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onEdit(inv)}
            style={{
              flex: '1 1 120px',
              minHeight: 42,
              padding: '8px 14px',
              borderRadius: 10,
              background: 'rgba(59,130,246,0.12)',
              color: '#3B82F6',
              border: '1px solid rgba(59,130,246,0.3)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Edit3 size={13} /> Editar
          </button>

          {isDeleteConfirm ? (
            <div style={{ display: 'flex', gap: 6, flex: '1 1 200px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1,
                  minHeight: 42,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'transparent',
                  color: 'var(--text, #fff)',
                  border: '1px solid var(--border, rgba(255,255,255,0.1))',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => onDelete(inv._id)}
                disabled={deleting}
                style={{
                  flex: 1,
                  minHeight: 42,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  color: '#fff',
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: deleting ? 'wait' : 'pointer',
                  opacity: deleting ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={13} /> {deleting ? '…' : 'Confirmar'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDeleteConfirmId(inv._id)}
              style={{
                flex: '1 1 120px',
                minHeight: 42,
                padding: '8px 14px',
                borderRadius: 10,
                background: 'transparent',
                color: 'var(--text-muted, #6B7280)',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={13} /> Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EditMode({ inv, editForm, setEditForm, saving, onSaveEdit, setEditingId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div>
        <FieldLabel>Nome</FieldLabel>
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          style={inputBase}
          placeholder="Nome do ativo"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        <div>
          <FieldLabel>Quantidade</FieldLabel>
          <input
            type="number"
            value={editForm.quantity}
            onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
            style={inputBase}
            min="0.01"
            step="0.01"
            inputMode="decimal"
          />
        </div>
        <div>
          <FieldLabel>Preço médio</FieldLabel>
          <input
            type="number"
            value={editForm.avgPrice}
            onChange={(e) => setEditForm({ ...editForm, avgPrice: e.target.value })}
            style={inputBase}
            min="0.01"
            step="0.01"
            inputMode="decimal"
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        <div>
          <FieldLabel>Preço atual</FieldLabel>
          <input
            type="number"
            value={editForm.currentPrice}
            onChange={(e) => setEditForm({ ...editForm, currentPrice: e.target.value })}
            style={inputBase}
            min="0.01"
            step="0.01"
            inputMode="decimal"
          />
        </div>
        <div>
          <FieldLabel>Dividendo/ação</FieldLabel>
          <input
            type="number"
            value={editForm.dividendPerShare}
            onChange={(e) => setEditForm({ ...editForm, dividendPerShare: e.target.value })}
            style={inputBase}
            min="0"
            step="0.01"
            inputMode="decimal"
          />
        </div>
      </div>

      <div>
        <FieldLabel>Plataforma</FieldLabel>
        <input
          type="text"
          value={editForm.platform}
          onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
          style={inputBase}
          placeholder="Plataforma"
        />
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        <button
          type="button"
          onClick={() => setEditingId(null)}
          style={{
            flex: '1 1 120px',
            minHeight: 44,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'transparent',
            color: 'var(--text, #fff)',
            border: '1px solid var(--border, rgba(255,255,255,0.1))',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onSaveEdit(inv._id)}
          disabled={saving}
          style={{
            flex: '1 1 120px',
            minHeight: 44,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
            color: '#0B0B0B',
            border: 'none',
            fontSize: 13,
            fontWeight: 800,
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Save size={13} /> {saving ? 'A guardar…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color, background, icon, hint }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        background: background || 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border, rgba(255,255,255,0.06))',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted, #6B7280)',
          marginBottom: 4,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color,
          fontVariantNumeric: 'tabular-nums',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          style={{
            marginTop: 2,
            fontSize: 10,
            color: 'var(--text-muted, #6B7280)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}
