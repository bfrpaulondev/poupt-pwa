import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/helpers';
import {
  Plus, CreditCard, Users, Check, AlertTriangle, X, Banknote,
  Clock, Snowflake, User, ChevronLeft, AlertCircle, Building2,
  Heart, Briefcase, Home, Wallet, TrendingDown, Calendar,
  Percent, FileText, Trash2,
} from 'lucide-react';

/* ============================================================ */
/* Static data                                                  */
/* ============================================================ */

const FORMAL_TYPES = [
  { value: 'banco',         label: 'Banco',          icon: Building2, color: '#3B82F6' },
  { value: 'credito',       label: 'Cartão Crédito', icon: CreditCard, color: '#EF4444' },
  { value: 'financiamento', label: 'Financiamento',  icon: Wallet,    color: '#8B5CF6' },
  { value: 'outro',         label: 'Outro',          icon: FileText,  color: '#64748B' },
];

const INFORMAL_TYPES = [
  { value: 'amigo',    label: 'Amigo',    icon: User,      color: '#10B981' },
  { value: 'familia',  label: 'Família',  icon: Heart,     color: '#EC4899' },
  { value: 'senhorio', label: 'Senhorio', icon: Home,      color: '#F59E0B' },
  { value: 'colega',   label: 'Colega',   icon: Briefcase, color: '#3B82F6' },
  { value: 'outro',    label: 'Outro',    icon: FileText,  color: '#64748B' },
];

const QUICK_AMOUNTS = [25, 50, 100, 250];

const EMPTY_FORMAL = {
  creditorName: '',
  amount: '',
  minimumPayment: '',
  interestRate: '',
  dueDate: '',
  relationshipType: 'banco',
  notes: '',
};

const EMPTY_INFORMAL = {
  creditorName: '',
  amount: '',
  dueDate: '',
  relationshipType: 'amigo',
  notes: '',
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

const getDebtProgress = (debt) => {
  if (!debt?.amount || debt.amount === 0) return 0;
  const paid = debt.amountPaid || 0;
  return Math.min(100, (paid / debt.amount) * 100);
};

const getRemaining = (debt) => {
  if (!debt) return 0;
  return debt.remainingAmount ?? (debt.amount - (debt.amountPaid || 0));
};

const isOverdue = (debt) => {
  if (!debt?.dueDate || debt.status === 'pago') return false;
  const d = getDaysUntil(debt.dueDate);
  return d !== null && d < 0;
};

const getTypeInfo = (type, list) =>
  list.find((t) => t.value === type) || list[list.length - 1];

const getProgressColor = (progress) => {
  if (progress >= 75) return '#10B981';
  if (progress >= 40) return '#F59E0B';
  return '#EF4444';
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

const FieldLabel = ({ children, icon }) => (
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
  </label>
);

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function Debts() {
  const { user, setScreen } = useStore();

  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('formal');
  const [showForm, setShowForm] = useState(false);
  const [showInformalForm, setShowInformalForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [paymentDebtId, setPaymentDebtId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paying, setPaying] = useState(false);
  const [snowball, setSnowball] = useState(null);
  const [showSnowball, setShowSnowball] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState(EMPTY_FORMAL);
  const [informalForm, setInformalForm] = useState(EMPTY_INFORMAL);

  /* ---------- Load ---------- */
  useEffect(() => { loadDebts(); }, []);

  const loadDebts = async () => {
    try {
      const res = await api.getDebts();
      setDebts(res?.data?.debts || []);
      setSummary(res?.data?.summary || null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar dívidas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadSnowball = async () => {
    try {
      const res = await api.getSnowballOrder();
      const planData = res?.data?.plan || res?.data?.order || [];
      setSnowball({
        order: planData,
        totalMinimumPayment: planData.reduce(
          (s, d) => s + (d.minimumPayment || d.pagamentoMinimo || 0),
          0
        ),
      });
      setShowSnowball(true);
    } catch (err) {
      console.error(err);
      setErrorMsg('Não foi possível carregar o plano Snowball.');
    }
  };

  /* ---------- Create formal ---------- */
  const handleCreateDebt = async (e) => {
    e.preventDefault();
    if (!form.creditorName.trim() || !form.amount) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const debtData = {
        ...form,
        type: 'formal',
        amount: Number(form.amount),
        minimumPayment: Number(form.minimumPayment || 0),
        interestRate: Number(form.interestRate || 0),
      };
      if (!debtData.dueDate) delete debtData.dueDate;
      else debtData.dueDate = new Date(debtData.dueDate).toISOString();

      await api.createDebt(debtData);
      setShowForm(false);
      setForm(EMPTY_FORMAL);
      await loadDebts();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível criar a dívida.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Create informal ---------- */
  const handleCreateInformal = async (e) => {
    e.preventDefault();
    if (!informalForm.creditorName.trim() || !informalForm.amount) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const debtData = {
        ...informalForm,
        amount: Number(informalForm.amount),
      };
      if (!debtData.dueDate) delete debtData.dueDate;
      else debtData.dueDate = new Date(debtData.dueDate).toISOString();

      await api.createInformalDebt(debtData);
      setShowInformalForm(false);
      setInformalForm(EMPTY_INFORMAL);
      await loadDebts();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível criar a dívida informal.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Payment ---------- */
  const handlePayment = async (debtId) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setPaying(true);
    setErrorMsg('');
    try {
      await api.addDebtPayment(debtId, Number(paymentAmount), paymentNotes);
      setPaymentDebtId(null);
      setPaymentAmount('');
      setPaymentNotes('');
      await loadDebts();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível registar o pagamento.');
    } finally {
      setPaying(false);
    }
  };

  /* ---------- Derived ---------- */
  const formalDebts = useMemo(() => debts.filter((d) => d.type === 'formal'), [debts]);
  const informalDebts = useMemo(() => debts.filter((d) => d.type === 'informal'), [debts]);
  const activeDebts = activeTab === 'formal' ? formalDebts : informalDebts;

  const overallProgress = useMemo(() => {
    if (!summary || !summary.totalOwed) return 0;
    const total = summary.totalOwed + summary.totalPaid;
    if (total === 0) return 0;
    return (summary.totalPaid / total) * 100;
  }, [summary]);

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
              background: 'rgba(239,68,68,0.18)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CreditCard size={24} />
          </div>

          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(18px, 4vw, 22px)',
                fontWeight: 800,
                color: 'var(--text, #fff)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Dívidas
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary, #9CA3AF)',
              }}
            >
              {debts.length === 0
                ? 'Controla as tuas dívidas'
                : `${formalDebts.length} formal${formalDebts.length !== 1 ? 'is' : ''} · ${informalDebts.length} informal${informalDebts.length !== 1 ? 'is' : ''}`}
            </p>
          </div>

          {summary && summary.overdueCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(239,68,68,0.18)',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#EF4444',
                fontSize: 11,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={12} /> {summary.overdueCount} em atraso
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

      {/* ============== SUMMARY ============== */}
      {summary && debts.length > 0 && (
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
              Resumo
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 14,
              marginBottom: summary.totalOwed > 0 ? 18 : 0,
            }}
          >
            <SummaryStat
              label="Total em dívida"
              value={formatCurrency(summary.totalOwed)}
              color="#EF4444"
              large
              icon={<TrendingDown size={11} />}
            />
            <SummaryStat
              label="Já pago"
              value={formatCurrency(summary.totalPaid)}
              color="#10B981"
              large
              icon={<Check size={11} />}
            />
            <SummaryStat
              label="Em atraso"
              value={String(summary.overdueCount || 0)}
              color={summary.overdueCount > 0 ? '#EF4444' : '#10B981'}
              icon={<AlertTriangle size={11} />}
            />
            <SummaryStat
              label="Total"
              value={String(summary.totalDebts || debts.length)}
              color="var(--text, #fff)"
            />
          </div>

          {/* Overall progress bar */}
          {summary.totalOwed > 0 && (
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
                  Progresso geral
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: '#10B981',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {overallProgress.toFixed(0)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981, #059669)',
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ============== TABS ============== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <TabButton
          active={activeTab === 'formal'}
          onClick={() => {
            setActiveTab('formal');
            setShowForm(false);
            setShowInformalForm(false);
            setExpandedId(null);
          }}
          icon={<CreditCard size={14} />}
          label="Formais"
          count={formalDebts.length}
          color="#EF4444"
        />
        <TabButton
          active={activeTab === 'informal'}
          onClick={() => {
            setActiveTab('informal');
            setShowForm(false);
            setShowInformalForm(false);
            setExpandedId(null);
          }}
          icon={<Users size={14} />}
          label="Informais"
          count={informalDebts.length}
          color="#D4AF37"
        />
      </div>

      {/* ============== ACTION BUTTONS ============== */}
      {activeTab === 'formal' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowForm(!showForm);
              setShowInformalForm(false);
            }}
            style={{
              minHeight: 48,
              padding: '12px 16px',
              borderRadius: 12,
              background: showForm
                ? 'rgba(239,68,68,0.18)'
                : 'rgba(239,68,68,0.12)',
              color: '#EF4444',
              border: '1px solid rgba(239,68,68,0.3)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Dívida formal</>}
          </button>

          <button
            type="button"
            onClick={loadSnowball}
            style={{
              minHeight: 48,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'rgba(16,185,129,0.12)',
              color: '#10B981',
              border: '1px solid rgba(16,185,129,0.3)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Snowflake size={14} /> Método Snowball
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setShowInformalForm(!showInformalForm);
            setShowForm(false);
          }}
          style={{
            width: '100%',
            minHeight: 48,
            padding: '12px 16px',
            borderRadius: 12,
            background: showInformalForm
              ? 'rgba(212,175,55,0.18)'
              : 'rgba(212,175,55,0.12)',
            color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.3)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.15s ease',
          }}
        >
          {showInformalForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Dívida informal</>}
        </button>
      )}

      {/* ============== FORMAL FORM ============== */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
              <form
                onSubmit={handleCreateDebt}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: 'var(--text, #fff)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <CreditCard size={16} color="#EF4444" />
                    Nova dívida formal
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted, #6B7280)',
                      padding: 6,
                      minWidth: 32,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Fechar"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Creditor */}
                <div>
                  <FieldLabel>Nome do credor</FieldLabel>
                  <input
                    type="text"
                    placeholder="Ex: Banco CTT"
                    value={form.creditorName}
                    onChange={(e) => setForm({ ...form, creditorName: e.target.value })}
                    required
                    style={inputBase}
                  />
                </div>

                {/* Amount */}
                <div>
                  <FieldLabel>Montante total (€)</FieldLabel>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    style={inputBase}
                  />
                </div>

                {/* Minimum + Interest */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div>
                    <FieldLabel icon={<Banknote size={12} />}>Pagamento mínimo (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.minimumPayment}
                      onChange={(e) => setForm({ ...form, minimumPayment: e.target.value })}
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Percent size={12} />}>Taxa juro (%)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.interestRate}
                      onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                </div>

                {/* DueDate */}
                <div>
                  <FieldLabel icon={<Calendar size={12} />}>Data limite (opcional)</FieldLabel>
                  <input
                    type="date"
                    value={form.dueDate}
                    min={today}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    style={inputBase}
                  />
                </div>

                {/* Type picker */}
                <div>
                  <FieldLabel>Tipo</FieldLabel>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {FORMAL_TYPES.map((t) => {
                      const Icon = t.icon;
                      const active = form.relationshipType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm({ ...form, relationshipType: t.value })}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            minHeight: 44,
                            background: active ? hexToRgba(t.color, 0.15) : 'rgba(255,255,255,0.04)',
                            color: active ? t.color : 'var(--text-secondary, #9CA3AF)',
                            border: `1px solid ${active ? hexToRgba(t.color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            transition: 'all 0.12s ease',
                            minWidth: 0,
                            textAlign: 'left',
                          }}
                        >
                          <Icon size={14} style={{ flexShrink: 0 }} />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <FieldLabel icon={<FileText size={12} />}>Notas (opcional)</FieldLabel>
                  <textarea
                    placeholder="Detalhes adicionais…"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    style={{ ...inputBase, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm(EMPTY_FORMAL);
                    }}
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

      {/* ============== INFORMAL FORM ============== */}
      <AnimatePresence>
        {showInformalForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
              <form
                onSubmit={handleCreateInformal}
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 16,
                      fontWeight: 800,
                      color: 'var(--text, #fff)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <Users size={16} color="#D4AF37" />
                    Nova dívida informal
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowInformalForm(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted, #6B7280)',
                      padding: 6,
                      minWidth: 32,
                      minHeight: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Fechar"
                  >
                    <X size={18} />
                  </button>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: 'var(--text-secondary, #9CA3AF)',
                    lineHeight: 1.5,
                  }}
                >
                  Empréstimo de amigo, familiar ou conhecido.
                </p>

                {/* Name */}
                <div>
                  <FieldLabel>Nome da pessoa</FieldLabel>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={informalForm.creditorName}
                    onChange={(e) => setInformalForm({ ...informalForm, creditorName: e.target.value })}
                    required
                    style={inputBase}
                  />
                </div>

                {/* Amount */}
                <div>
                  <FieldLabel>Montante (€)</FieldLabel>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={informalForm.amount}
                    onChange={(e) => setInformalForm({ ...informalForm, amount: e.target.value })}
                    required
                    min="0.01"
                    step="0.01"
                    inputMode="decimal"
                    style={inputBase}
                  />
                </div>

                {/* DueDate */}
                <div>
                  <FieldLabel icon={<Calendar size={12} />}>Data limite (opcional)</FieldLabel>
                  <input
                    type="date"
                    value={informalForm.dueDate}
                    min={today}
                    onChange={(e) => setInformalForm({ ...informalForm, dueDate: e.target.value })}
                    style={inputBase}
                  />
                </div>

                {/* Relationship */}
                <div>
                  <FieldLabel>Relação</FieldLabel>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {INFORMAL_TYPES.map((t) => {
                      const Icon = t.icon;
                      const active = informalForm.relationshipType === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setInformalForm({ ...informalForm, relationshipType: t.value })}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            minHeight: 44,
                            background: active ? hexToRgba(t.color, 0.15) : 'rgba(255,255,255,0.04)',
                            color: active ? t.color : 'var(--text-secondary, #9CA3AF)',
                            border: `1px solid ${active ? hexToRgba(t.color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 700,
                            transition: 'all 0.12s ease',
                            minWidth: 0,
                            textAlign: 'left',
                          }}
                        >
                          <Icon size={14} style={{ flexShrink: 0 }} />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <FieldLabel icon={<FileText size={12} />}>Notas (opcional)</FieldLabel>
                  <textarea
                    placeholder="Detalhes do empréstimo…"
                    value={informalForm.notes}
                    onChange={(e) => setInformalForm({ ...informalForm, notes: e.target.value })}
                    rows={3}
                    style={{ ...inputBase, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInformalForm(false);
                      setInformalForm(EMPTY_INFORMAL);
                    }}
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

      {/* ============== SNOWBALL ============== */}
      <AnimatePresence>
        {showSnowball && snowball && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Card
              style={{
                padding: 'clamp(18px, 3vw, 24px)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.10), rgba(16,185,129,0.02))',
                borderColor: 'rgba(16,185,129,0.3)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 800,
                    color: '#10B981',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Snowflake size={18} />
                  Método Snowball
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSnowball(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted, #6B7280)',
                    padding: 6,
                    minWidth: 32,
                    minHeight: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              <p
                style={{
                  margin: '0 0 14px',
                  fontSize: 12,
                  color: 'var(--text-secondary, #9CA3AF)',
                  lineHeight: 1.5,
                }}
              >
                Paga a dívida menor primeiro para ganhar momentum e motivação.
              </p>

              {snowball.order && snowball.order.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {snowball.order.map((debt, idx) => {
                    const remaining =
                      debt.remaining ||
                      debt.remainingAmount ||
                      (debt.totalAmount || debt.amount || 0) - (debt.amountPaid || 0) ||
                      0;
                    const isPriority = idx === 0;
                    return (
                      <div
                        key={debt._id || debt.debt || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 'clamp(10px, 2vw, 14px)',
                          borderRadius: 12,
                          background: isPriority
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isPriority ? 'rgba(16,185,129,0.4)' : 'var(--border, rgba(255,255,255,0.08))'}`,
                          minWidth: 0,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: isPriority ? '#10B981' : 'rgba(255,255,255,0.06)',
                            color: isPriority ? '#0B0B0B' : 'var(--text-secondary, #9CA3AF)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div style={{ flex: '1 1 140px', minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 13,
                              fontWeight: 700,
                              color: 'var(--text, #fff)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {debt.creditorName}
                          </p>
                          <p
                            style={{
                              margin: '2px 0 0',
                              fontSize: 11,
                              color: 'var(--text-muted, #6B7280)',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {formatCurrency(remaining)} restante
                          </p>
                        </div>
                        {isPriority && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: 'rgba(16,185,129,0.2)',
                              color: '#10B981',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              flexShrink: 0,
                            }}
                          >
                            Prioridade
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    textAlign: 'center',
                    padding: '20px 0',
                    fontSize: 13,
                    color: 'var(--text-muted, #6B7280)',
                  }}
                >
                  Nenhuma dívida para ordenar
                </p>
              )}

              {snowball.totalMinimumPayment > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary, #9CA3AF)',
                      fontWeight: 600,
                    }}
                  >
                    Pagamento mínimo total
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#10B981',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatCurrency(snowball.totalMinimumPayment)}
                  </span>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== DEBTS LIST ============== */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: 'clamp(40px, 8vw, 64px) 20px',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
            }}
          />
          <p style={{ color: 'var(--text-secondary, #9CA3AF)', fontSize: 13 }}>
            A carregar dívidas…
          </p>
        </div>
      ) : activeDebts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeDebts.map((debt) => (
            <DebtCard
              key={debt._id}
              debt={debt}
              isInformal={activeTab === 'informal'}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              paymentDebtId={paymentDebtId}
              setPaymentDebtId={setPaymentDebtId}
              paymentAmount={paymentAmount}
              setPaymentAmount={setPaymentAmount}
              paymentNotes={paymentNotes}
              setPaymentNotes={setPaymentNotes}
              paying={paying}
              onPayment={handlePayment}
            />
          ))}
        </div>
      ) : debts.length === 0 ? (
        <EmptyState
          activeTab={activeTab}
          onCreate={() =>
            activeTab === 'formal' ? setShowForm(true) : setShowInformalForm(true)
          }
        />
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: 'clamp(32px, 6vw, 48px) 20px',
            border: '1px dashed var(--border, rgba(255,255,255,0.1))',
            borderRadius: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--text-secondary, #9CA3AF)',
            }}
          >
            Sem dívidas {activeTab === 'formal' ? 'formais' : 'informais'}
          </p>
          <button
            type="button"
            onClick={() =>
              activeTab === 'formal' ? setShowForm(true) : setShowInformalForm(true)
            }
            style={{
              marginTop: 12,
              background: 'transparent',
              border: 'none',
              color: '#D4AF37',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Adicionar agora
          </button>
        </div>
      )}
    </Shell>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function SummaryStat({ label, value, color, large = false, icon }) {
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
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon} {label}
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

function TabButton({ active, onClick, icon, label, count, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 48,
        padding: '10px 12px',
        borderRadius: 12,
        background: active ? hexToRgba(color, 0.15) : 'rgba(255,255,255,0.03)',
        color: active ? color : 'var(--text-secondary, #9CA3AF)',
        border: `1px solid ${active ? hexToRgba(color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
        fontSize: 13,
        fontWeight: 700,
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
      <span
        style={{
          background: active ? color : 'rgba(255,255,255,0.08)',
          color: active ? '#0B0B0B' : 'var(--text-secondary, #9CA3AF)',
          padding: '1px 7px',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 800,
          minWidth: 18,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function DebtCard({
  debt,
  isInformal,
  expandedId,
  setExpandedId,
  paymentDebtId,
  setPaymentDebtId,
  paymentAmount,
  setPaymentAmount,
  paymentNotes,
  setPaymentNotes,
  paying,
  onPayment,
}) {
  const progress = getDebtProgress(debt);
  const remaining = getRemaining(debt);
  const overdue = isOverdue(debt);
  const daysLeft = getDaysUntil(debt.dueDate);
  const isExpanded = expandedId === debt._id;
  const isPaying = paymentDebtId === debt._id;
  const isPaid = debt.status === 'pago';

  const typeList = isInformal ? INFORMAL_TYPES : FORMAL_TYPES;
  const typeInfo = getTypeInfo(debt.relationshipType, typeList);
  const TypeIcon = typeInfo.icon;

  const accentColor = isPaid
    ? '#10B981'
    : overdue
      ? '#EF4444'
      : isInformal
        ? '#D4AF37'
        : '#EF4444';

  return (
    <motion.div
      layout
      style={{
        background: 'var(--card, #1a1a1a)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: 14,
        minWidth: 0,
        overflow: 'hidden',
        opacity: isPaid ? 0.85 : 1,
      }}
    >
      {/* ===== Header (clickable) ===== */}
      <div
        onClick={() => setExpandedId(isExpanded ? null : debt._id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 'clamp(14px, 2.5vw, 18px)',
          cursor: 'pointer',
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: hexToRgba(accentColor, 0.18),
            color: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isPaid ? (
            <Check size={20} />
          ) : overdue ? (
            <AlertTriangle size={20} />
          ) : (
            <TypeIcon size={20} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 800,
              color: 'var(--text, #fff)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textDecoration: isPaid ? 'line-through' : 'none',
              textDecorationColor: 'rgba(16,185,129,0.6)',
            }}
          >
            {debt.creditorName}
          </p>
          <div
            style={{
              marginTop: 3,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: typeInfo.color,
                fontWeight: 700,
              }}
            >
              {typeInfo.label}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted, #6B7280)' }}>·</span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-secondary, #9CA3AF)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {isPaid ? 'Pago' : `${formatCurrency(remaining)} restante`}
            </span>
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            flexShrink: 0,
            minWidth: 90,
          }}
        >
          <div
            style={{
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              fontWeight: 800,
              color: accentColor,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {formatCurrency(debt.amount)}
          </div>
          {!isPaid && overdue && daysLeft !== null && (
            <div
              style={{
                marginTop: 3,
                fontSize: 11,
                color: '#EF4444',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
              }}
            >
              <AlertTriangle size={11} /> {Math.abs(daysLeft)}d atraso
            </div>
          )}
          {!isPaid && !overdue && daysLeft !== null && daysLeft >= 0 && (
            <div
              style={{
                marginTop: 3,
                fontSize: 11,
                color: 'var(--text-muted, #6B7280)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                whiteSpace: 'nowrap',
              }}
            >
              <Clock size={11} /> {daysLeft}d
            </div>
          )}
        </div>
      </div>

      {/* ===== Progress bar ===== */}
      {!isPaid && (
        <div style={{ padding: '0 clamp(14px, 2.5vw, 18px) 14px' }}>
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
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: isInformal
                  ? 'linear-gradient(90deg, #D4AF37, #B8941F)'
                  : `linear-gradient(90deg, ${getProgressColor(progress)}, ${hexToRgba(getProgressColor(progress), 0.7)})`,
                borderRadius: 999,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 6,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                color: '#10B981',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(debt.amountPaid || 0)} pago
            </span>
            <span
              style={{
                color: 'var(--text-muted, #6B7280)',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {progress.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* ===== Expanded content ===== */}
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
            <div
              style={{
                padding: 'clamp(14px, 2.5vw, 18px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Stats grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 10,
                }}
              >
                {debt.interestRate > 0 && (
                  <MiniStat
                    label="Taxa juro"
                    value={`${debt.interestRate}%`}
                    color="#F59E0B"
                    icon={<Percent size={10} />}
                  />
                )}
                {debt.minimumPayment > 0 && (
                  <MiniStat
                    label="Pag. mínimo"
                    value={formatCurrency(debt.minimumPayment)}
                    color="var(--text, #fff)"
                    icon={<Banknote size={10} />}
                  />
                )}
                {debt.dueDate && (
                  <MiniStat
                    label="Data limite"
                    value={formatDate(debt.dueDate)}
                    color={overdue ? '#EF4444' : 'var(--text, #fff)'}
                    icon={<Calendar size={10} />}
                  />
                )}
                <MiniStat
                  label="Pago"
                  value={formatCurrency(debt.amountPaid || 0)}
                  color="#10B981"
                  icon={<Check size={10} />}
                />
              </div>

              {/* Notes */}
              {debt.notes && (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border, rgba(255,255,255,0.06))',
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
                    <FileText size={10} /> Notas
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: 'var(--text-secondary, #9CA3AF)',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {debt.notes}
                  </p>
                </div>
              )}

              {/* Payment form/button */}
              {!isPaid && (
                <AnimatePresence mode="wait">
                  {isPaying ? (
                    <motion.div
                      key="payform"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border, rgba(255,255,255,0.08))',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border, rgba(255,255,255,0.1))',
                            borderRadius: 10,
                            padding: '4px 12px 4px 14px',
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: 'var(--text-secondary, #9CA3AF)',
                              flexShrink: 0,
                            }}
                          >
                            €
                          </span>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            inputMode="decimal"
                            autoFocus
                            style={{
                              flex: 1,
                              background: 'transparent',
                              border: 'none',
                              outline: 'none',
                              color: 'var(--text, #fff)',
                              fontSize: 16,
                              padding: '12px 0',
                              minWidth: 0,
                            }}
                          />
                        </div>

                        {/* Quick amounts */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {QUICK_AMOUNTS.map((amt) => {
                            const active = paymentAmount === String(amt);
                            return (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setPaymentAmount(String(amt))}
                                style={{
                                  flex: '1 1 60px',
                                  minHeight: 38,
                                  padding: '6px 10px',
                                  borderRadius: 8,
                                  background: active
                                    ? hexToRgba(accentColor, 0.2)
                                    : 'rgba(255,255,255,0.04)',
                                  color: active ? accentColor : 'var(--text-secondary, #9CA3AF)',
                                  border: `1px solid ${active ? hexToRgba(accentColor, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                €{amt}
                              </button>
                            );
                          })}
                          {remaining > 0 && (
                            <button
                              type="button"
                              onClick={() => setPaymentAmount(String(remaining))}
                              style={{
                                flex: '1 1 60px',
                                minHeight: 38,
                                padding: '6px 10px',
                                borderRadius: 8,
                                background: 'rgba(16,185,129,0.12)',
                                color: '#10B981',
                                border: '1px solid rgba(16,185,129,0.3)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Total
                            </button>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder="Notas (opcional)"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          style={inputBase}
                        />

                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentDebtId(null);
                              setPaymentAmount('');
                              setPaymentNotes('');
                            }}
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
                            onClick={() => onPayment(debt._id)}
                            disabled={paying || !paymentAmount}
                            style={{
                              flex: 1.5,
                              minHeight: 42,
                              padding: '8px 12px',
                              borderRadius: 10,
                              background: !paymentAmount
                                ? 'rgba(255,255,255,0.06)'
                                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
                              color: !paymentAmount ? 'var(--text-muted, #6B7280)' : '#0B0B0B',
                              border: 'none',
                              fontSize: 12,
                              fontWeight: 800,
                              cursor: paying || !paymentAmount ? 'not-allowed' : 'pointer',
                              opacity: paying ? 0.7 : 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6,
                            }}
                          >
                            <Banknote size={13} /> {paying ? 'A pagar…' : 'Registar'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="paybtn"
                      type="button"
                      onClick={() => setPaymentDebtId(debt._id)}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%',
                        minHeight: 44,
                        padding: '10px 16px',
                        borderRadius: 12,
                        background: hexToRgba(accentColor, 0.12),
                        color: accentColor,
                        border: `1px solid ${hexToRgba(accentColor, 0.3)}`,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        transition: 'all 0.12s ease',
                      }}
                    >
                      <Banknote size={14} /> Registar pagamento
                    </motion.button>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MiniStat({ label, value, color, icon }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
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
    </div>
  );
}

function EmptyState({ activeTab, onCreate }) {
  const isFormal = activeTab === 'formal';
  return (
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
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: isFormal ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)',
          color: isFormal ? '#EF4444' : '#D4AF37',
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isFormal ? <CreditCard size={32} /> : <Users size={32} />}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 800,
          color: 'var(--text, #fff)',
        }}
      >
        Sem dívidas registadas
      </p>
      <p
        style={{
          margin: '6px auto 0',
          fontSize: 13,
          color: 'var(--text-secondary, #9CA3AF)',
          lineHeight: 1.5,
          maxWidth: 320,
        }}
      >
        Adiciona as tuas dívidas {isFormal ? 'formais (bancos, créditos)' : 'informais (amigos, família)'} para começar a controlar e eliminar.
      </p>
      <button
        type="button"
        onClick={onCreate}
        style={{
          marginTop: 20,
          background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
          color: '#0B0B0B',
          border: 'none',
          padding: '12px 24px',
          borderRadius: 12,
          fontWeight: 800,
          fontSize: 14,
          cursor: 'pointer',
          minHeight: 48,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 8px 20px rgba(212,175,55,0.25)',
        }}
      >
        <Plus size={16} /> Adicionar dívida
      </button>
    </div>
  );
}
