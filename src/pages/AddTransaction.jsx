import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import {
  categoryLabels,
  categoryIcons,
  jarLabels,
  jarColors,
  jarIcons,
  formatCurrency,
} from '../utils/helpers';
import {
  ArrowUpRight, ArrowDownLeft, Save, X, ShoppingCart, Home, TrainFront,
  Heart, GraduationCap, Gamepad2, Shirt, AlertTriangle, TrendingUp,
  PiggyBank, Banknote, Laptop, Plus, Minus, CreditCard, Landmark,
  Calendar, FileText, Coins, Repeat, Wallet, ChevronLeft, AlertCircle,
  Briefcase, Receipt, Check,
} from 'lucide-react';

/* ============================================================ */
/* Static data                                                  */
/* ============================================================ */

const iconMap = {
  ShoppingCart, Home, TrainFront, Heart, GraduationCap, Gamepad2, Shirt,
  AlertTriangle, TrendingUp, PiggyBank, Banknote, Laptop, Plus, Minus,
  ArrowUpRight, ArrowDownLeft, CreditCard, Landmark, Briefcase, Receipt,
  Wallet,
};

const INCOME_CATEGORIES = [
  'salario',
  'freelance',
  'outro_rendimento',
  'emprestimo_recebido',
];

const EXPENSE_CATEGORIES = [
  'alimentacao',
  'habitacao',
  'transportes',
  'saude',
  'educacao',
  'lazer',
  'roupa',
  'divida',
  'investimento',
  'poupanca',
  'pagamento_divida',
  'emprestimo_dado',
  'outro_gasto',
];

const FREQUENCIES = [
  { value: 'weekly',   label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly',  label: 'Mensal' },
  { value: 'yearly',   label: 'Anual' },
];

const QUICK_AMOUNTS = [10, 20, 50, 100];

const EMPTY_FORM = {
  amount: '',
  category: 'alimentacao',
  description: '',
  jar: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
  isRecurring: false,
  recurringFrequency: 'monthly',
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

const resolveColor = (color) => {
  if (!color) return '#D4AF37';
  if (color.startsWith('#')) return color;
  // CSS variable fallback to gold
  return '#D4AF37';
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
  fontFamily: 'inherit',
};

const FieldLabel = ({ children, icon, optional = false }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--text-secondary, #9CA3AF)',
      marginBottom: 6,
    }}
  >
    {icon}
    {children}
    {optional && (
      <span
        style={{
          textTransform: 'none',
          letterSpacing: 0,
          fontWeight: 600,
          fontSize: 10,
          color: 'var(--text-muted, #6B7280)',
          marginLeft: 2,
        }}
      >
        (opcional)
      </span>
    )}
  </label>
);

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function AddTransaction() {
  const { user, addTransaction, setScreen, updateUser } = useStore();

  const [type, setType] = useState('despesa');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [moedasEarned, setMoedasEarned] = useState(null);

  const isIncome = type === 'receita';
  const toneColor = isIncome ? '#10B981' : '#EF4444';
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const amountValue = Number(form.amount || 0);
  const currency = user?.currency || 'EUR';

  /* ---------- Helpers ---------- */
  const updateForm = (data) => setForm((prev) => ({ ...prev, ...data }));

  const handleTypeChange = (newType) => {
    setType(newType);
    updateForm({
      category: newType === 'receita' ? 'salario' : 'alimentacao',
      jar: '',
    });
  };

  const getCategoryIcon = (cat, size = 16) => {
    const iconName = categoryIcons?.[cat];
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={size} /> : <Receipt size={size} />;
  };

  const getJarIcon = (key, size = 15) => {
    const iconName = jarIcons?.[key];
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={size} /> : <Wallet size={size} />;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setErrorMsg('Indica um valor válido.');
      return;
    }
    if (!form.description.trim()) {
      setErrorMsg('Adiciona uma descrição.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await api.createTransaction({
        ...form,
        type,
        amount: Number(form.amount),
        jar: form.jar || null,
        isRecurring: form.isRecurring || undefined,
        recurringFrequency: form.isRecurring ? form.recurringFrequency : undefined,
      });

      addTransaction(res?.data?.transaction);
      window.dispatchEvent(new CustomEvent('poupt-refresh-dashboard'));

      try {
        const moedasRes = await api.earnMoedas('add_transaction', 5);
        updateUser({ poupMoedas: moedasRes?.data?.balance });
        setMoedasEarned(moedasRes?.data?.earned || 5);
        setTimeout(() => {
          setMoedasEarned(null);
          setScreen('dashboard');
        }, 1200);
      } catch {
        setScreen('dashboard');
      }
    } catch (err) {
      setErrorMsg(err?.message || 'Erro ao guardar transação.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Jar entries ---------- */
  const jarEntries = useMemo(
    () => (jarLabels ? Object.entries(jarLabels) : []),
    []
  );

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
              background: hexToRgba(toneColor, 0.18),
              color: toneColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}
          >
            {isIncome ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
          </div>

          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted, #6B7280)',
              }}
            >
              Nova transação
            </p>
            <h1
              style={{
                margin: '4px 0 0',
                fontSize: 'clamp(18px, 4vw, 22px)',
                fontWeight: 800,
                color: 'var(--text, #fff)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              {isIncome ? 'Adicionar receita' : 'Adicionar despesa'}
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary, #9CA3AF)',
                lineHeight: 1.4,
              }}
            >
              Regista movimentos para manter o orçamento atualizado.
            </p>
          </div>
        </div>
      </Card>

      {/* ============== MOEDAS TOAST ============== */}
      <AnimatePresence>
        {moedasEarned && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{
              padding: 'clamp(14px, 3vw, 18px)',
              borderRadius: 14,
              background:
                'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.08))',
              border: '1px solid rgba(212,175,55,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              style={{
                width: 36, height: 36,
                borderRadius: '50%',
                background: 'rgba(212,175,55,0.25)',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Coins size={18} />
            </motion.div>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 800,
                color: '#D4AF37',
              }}
            >
              +{moedasEarned} PoupMoedas ganhos!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* ============== FORM ============== */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(14px, 2.5vw, 20px)',
        }}
      >
        {/* ====== TYPE + AMOUNT ====== */}
        <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Type toggle */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <TypeButton
                active={!isIncome}
                icon={<ArrowDownLeft size={18} />}
                label="Despesa"
                color="#EF4444"
                onClick={() => handleTypeChange('despesa')}
              />
              <TypeButton
                active={isIncome}
                icon={<ArrowUpRight size={18} />}
                label="Receita"
                color="#10B981"
                onClick={() => handleTypeChange('receita')}
              />
            </div>

            {/* Amount display */}
            <div
              style={{
                padding: 'clamp(18px, 3.5vw, 24px) clamp(14px, 3vw, 20px)',
                borderRadius: 18,
                background: hexToRgba(toneColor, 0.06),
                border: `1px solid ${hexToRgba(toneColor, 0.25)}`,
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted, #6B7280)',
                }}
              >
                Valor
              </p>

              <div
                style={{
                  marginTop: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    fontSize: 'clamp(14px, 3vw, 18px)',
                    fontWeight: 800,
                    color: toneColor,
                  }}
                >
                  {currency}
                </span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => updateForm({ amount: e.target.value })}
                  placeholder="0.00"
                  required
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  style={{
                    width: '100%',
                    maxWidth: 240,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'center',
                    fontSize: 'clamp(32px, 8vw, 48px)',
                    fontWeight: 900,
                    letterSpacing: '-0.04em',
                    outline: 'none',
                    color: toneColor,
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 0,
                    padding: '4px 0',
                  }}
                />
              </div>

              {amountValue > 0 && (
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--text-muted, #6B7280)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCurrency(amountValue, currency)}
                </p>
              )}

              {/* Quick amounts */}
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  gap: 6,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {QUICK_AMOUNTS.map((amt) => {
                  const active = form.amount === String(amt);
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => updateForm({ amount: String(amt) })}
                      style={{
                        flex: '1 1 60px',
                        maxWidth: 100,
                        minHeight: 38,
                        padding: '6px 12px',
                        borderRadius: 8,
                        background: active
                          ? hexToRgba(toneColor, 0.2)
                          : 'rgba(255,255,255,0.04)',
                        color: active ? toneColor : 'var(--text-secondary, #9CA3AF)',
                        border: `1px solid ${active ? hexToRgba(toneColor, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {currency === 'EUR' ? '€' : ''}{amt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* ====== DESCRIPTION + CATEGORY ====== */}
        <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <FieldLabel icon={<FileText size={12} />}>Descrição</FieldLabel>
              <input
                type="text"
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                placeholder={isIncome ? 'Ex: Salário mensal' : 'Ex: Compras no supermercado'}
                required
                style={inputBase}
              />
            </div>

            <div>
              <FieldLabel>Categoria</FieldLabel>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                  gap: 8,
                }}
              >
                {categories.map((cat) => {
                  const active = form.category === cat;
                  return (
                    <OptionButton
                      key={cat}
                      active={active}
                      icon={getCategoryIcon(cat, 16)}
                      label={categoryLabels?.[cat] || cat}
                      color={toneColor}
                      onClick={() => updateForm({ category: cat })}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* ====== JAR (optional) ====== */}
        {jarEntries.length > 0 && (
          <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0, flex: '1 1 200px' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--text, #fff)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <Wallet size={14} /> Frasco
                  </h3>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: 12,
                      color: 'var(--text-secondary, #9CA3AF)',
                      lineHeight: 1.5,
                    }}
                  >
                    Opcional. Associa esta transação a uma área do orçamento.
                  </p>
                </div>
                {form.jar && (
                  <button
                    type="button"
                    onClick={() => updateForm({ jar: '' })}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border, rgba(255,255,255,0.1))',
                      color: 'var(--text-secondary, #9CA3AF)',
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      minHeight: 32,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      flexShrink: 0,
                    }}
                  >
                    <X size={12} /> Limpar
                  </button>
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: 8,
                }}
              >
                {jarEntries.map(([key, label]) => {
                  const active = form.jar === key;
                  const color = resolveColor(jarColors?.[key]);
                  return (
                    <OptionButton
                      key={key}
                      active={active}
                      icon={getJarIcon(key, 15)}
                      label={String(label).split(' ')[0]}
                      color={color}
                      onClick={() => updateForm({ jar: active ? '' : key })}
                    />
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* ====== DATE + NOTES + RECURRING ====== */}
        <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
              }}
            >
              <div>
                <FieldLabel icon={<Calendar size={12} />}>Data</FieldLabel>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm({ date: e.target.value })}
                  style={inputBase}
                />
              </div>
            </div>

            <div>
              <FieldLabel icon={<FileText size={12} />} optional>
                Notas
              </FieldLabel>
              <textarea
                value={form.notes}
                onChange={(e) => updateForm({ notes: e.target.value })}
                placeholder="Detalhes úteis sobre este movimento…"
                rows={3}
                style={{
                  ...inputBase,
                  resize: 'vertical',
                  minHeight: 80,
                }}
              />
            </div>

            {/* Recurring toggle */}
            <div
              style={{
                padding: 'clamp(12px, 2.5vw, 16px)',
                borderRadius: 12,
                background: form.isRecurring
                  ? 'rgba(212,175,55,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${form.isRecurring ? 'rgba(212,175,55,0.3)' : 'var(--border, rgba(255,255,255,0.08))'}`,
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flex: '1 1 200px',
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 40, height: 40,
                      borderRadius: 12,
                      background: 'rgba(212,175,55,0.18)',
                      color: '#D4AF37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Repeat size={18} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 800,
                        color: 'var(--text, #fff)',
                      }}
                    >
                      Transação recorrente
                    </p>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: 11,
                        color: 'var(--text-secondary, #9CA3AF)',
                        lineHeight: 1.4,
                      }}
                    >
                      Útil para salários, rendas ou subscrições.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateForm({ isRecurring: !form.isRecurring })}
                  aria-label="Alternar recorrência"
                  style={{
                    position: 'relative',
                    width: 52,
                    height: 30,
                    borderRadius: 999,
                    background: form.isRecurring
                      ? 'linear-gradient(135deg, #D4AF37, #B8941F)'
                      : 'rgba(255,255,255,0.08)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  <motion.span
                    animate={{ left: form.isRecurring ? 25 : 3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{
                      position: 'absolute',
                      top: 3,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  />
                </button>
              </div>

              <AnimatePresence>
                {form.isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <FieldLabel>Frequência</FieldLabel>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: 8,
                      }}
                    >
                      {FREQUENCIES.map((freq) => {
                        const active = form.recurringFrequency === freq.value;
                        return (
                          <button
                            key={freq.value}
                            type="button"
                            onClick={() => updateForm({ recurringFrequency: freq.value })}
                            style={{
                              minHeight: 42,
                              padding: '8px 12px',
                              borderRadius: 10,
                              background: active
                                ? 'rgba(212,175,55,0.15)'
                                : 'rgba(255,255,255,0.04)',
                              color: active ? '#D4AF37' : 'var(--text-secondary, #9CA3AF)',
                              border: `1px solid ${active ? 'rgba(212,175,55,0.5)' : 'var(--border, rgba(255,255,255,0.08))'}`,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                              minWidth: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {freq.label}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>

        {/* ====== ACTIONS ====== */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            style={{
              flex: '1 1 120px',
              minHeight: 52,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'transparent',
              color: 'var(--text, #fff)',
              border: '1px solid var(--border, rgba(255,255,255,0.1))',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <X size={16} /> Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: '2 1 200px',
              minHeight: 52,
              padding: '12px 16px',
              borderRadius: 12,
              background: saving
                ? 'rgba(212,175,55,0.5)'
                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
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
              boxShadow: saving ? 'none' : '0 8px 20px rgba(212,175,55,0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Save size={16} /> {saving ? 'A guardar…' : 'Guardar transação'}
          </button>
        </div>
      </form>
    </Shell>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function TypeButton({ active, icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 56,
        padding: '12px 16px',
        borderRadius: 12,
        background: active ? hexToRgba(color, 0.15) : 'rgba(255,255,255,0.03)',
        color: active ? color : 'var(--text-secondary, #9CA3AF)',
        border: `1px solid ${active ? hexToRgba(color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
        fontSize: 14,
        fontWeight: 800,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'all 0.15s ease',
        minWidth: 0,
      }}
    >
      {icon}
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}

function OptionButton({ active, icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 72,
        padding: '10px 8px',
        borderRadius: 12,
        background: active ? hexToRgba(color, 0.15) : 'rgba(255,255,255,0.04)',
        color: active ? color : 'var(--text-secondary, #9CA3AF)',
        border: `1px solid ${active ? hexToRgba(color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.12s ease',
        minWidth: 0,
        position: 'relative',
      }}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: color,
            color: '#0B0B0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Check size={10} strokeWidth={3} />
        </span>
      )}
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          width: '100%',
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </button>
  );
}
