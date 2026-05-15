import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, getDaysUntil } from '../utils/helpers';
import {
  Target, Plus, Check, Trash2, X, Banknote, Calendar, Clock,
  Shield, PiggyBank, TrendingUp, CreditCard, ShoppingBag,
  Coins, Palette, PartyPopper, AlertCircle, ChevronLeft,
} from 'lucide-react';

/* ============================================================ */
/* Static data                                                  */
/* ============================================================ */

const GOAL_TYPES = [
  { value: 'fundo_emergencia', label: 'Fundo Emergência', color: '#10B981', icon: Shield },
  { value: 'poupanca',         label: 'Poupança',          color: '#3B82F6', icon: PiggyBank },
  { value: 'investimento',     label: 'Investimento',      color: '#8B5CF6', icon: TrendingUp },
  { value: 'divida',           label: 'Eliminar Dívida',   color: '#EF4444', icon: CreditCard },
  { value: 'compra',           label: 'Compra Específica', color: '#F59E0B', icon: ShoppingBag },
  { value: 'outro',            label: 'Outro',             color: '#64748B', icon: Target },
];

const GOAL_ICONS = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💼', '🏥', '📱', '🎮', '💎', '⭐'];

const GOAL_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#F97316', '#64748B'];

const EMPTY_FORM = {
  name: '',
  type: 'fundo_emergencia',
  targetAmount: '',
  currentAmount: '',
  monthlyContribution: '',
  deadline: '',
  icon: '🎯',
  color: '#10B981',
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

const getTypeInfo = (type) =>
  GOAL_TYPES.find((t) => t.value === type) || GOAL_TYPES[0];

const getProgress = (goal) => {
  if (!goal?.targetAmount) return 0;
  return Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100);
};

const getMonthsRemaining = (goal) => {
  if (!goal?.monthlyContribution || goal.monthlyContribution <= 0) return null;
  const remaining = goal.targetAmount - (goal.currentAmount || 0);
  if (remaining <= 0) return 0;
  return Math.ceil(remaining / goal.monthlyContribution);
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

export default function Goals() {
  const { user, updateUser, setScreen } = useStore();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addingToGoal, setAddingToGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [completedGoal, setCompletedGoal] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);

  /* ---------- Load ---------- */
  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await api.getGoals();
      setGoals(res?.data?.goals || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar metas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Create ---------- */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetAmount) return;

    setSaving(true);
    setErrorMsg('');
    try {
      const goalData = {
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        monthlyContribution: Number(form.monthlyContribution || 0),
      };
      if (!goalData.deadline) delete goalData.deadline;
      else goalData.deadline = new Date(goalData.deadline).toISOString();

      await api.createGoal(goalData);
      setShowForm(false);
      setForm(EMPTY_FORM);

      try {
        const moedasRes = await api.earnMoedas('create_goal', 10);
        updateUser({ poupMoedas: moedasRes?.data?.balance });
      } catch {}

      await loadGoals();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível criar a meta.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Add funds ---------- */
  const handleAddFunds = async (goalId) => {
    if (!addAmount || Number(addAmount) <= 0) return;
    setAdding(true);
    try {
      const res = await api.updateGoalProgress(goalId, Number(addAmount));
      setAddingToGoal(null);
      setAddAmount('');

      const updatedGoal = res?.data?.goal || res?.data;
      if (updatedGoal?.isCompleted) {
        setCompletedGoal(updatedGoal);
        try {
          await api.earnMoedas('complete_goal', 50);
          const moedasRes = await api.getMoedasBalance();
          updateUser({ poupMoedas: moedasRes?.data?.balance });
        } catch {}
        setTimeout(() => setCompletedGoal(null), 4500);
      } else {
        try {
          await api.earnMoedas('add_to_goal', 3);
          const moedasRes = await api.getMoedasBalance();
          updateUser({ poupMoedas: moedasRes?.data?.balance });
        } catch {}
      }

      await loadGoals();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível adicionar fundos.');
    } finally {
      setAdding(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (id) => {
    if (showDeleteConfirm !== id) {
      setShowDeleteConfirm(id);
      return;
    }
    setDeleting(true);
    try {
      await api.deleteGoal(id);
      setShowDeleteConfirm(null);
      await loadGoals();
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível eliminar.');
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- Derived ---------- */
  const filteredGoals = useMemo(
    () => (filterType === 'all' ? goals : goals.filter((g) => g.type === filterType)),
    [goals, filterType]
  );

  const activeGoals = useMemo(() => goals.filter((g) => !g.isCompleted), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.isCompleted), [goals]);
  const totalSaved = useMemo(
    () => goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0),
    [goals]
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
              background: 'rgba(212,175,55,0.18)',
              color: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Target size={24} />
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
              Metas Financeiras
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary, #9CA3AF)',
              }}
            >
              {goals.length === 0
                ? 'Define os teus objetivos'
                : `${activeGoals.length} ativa${activeGoals.length !== 1 ? 's' : ''}`}
              {completedGoals.length > 0 && ` · ${completedGoals.length} concluída${completedGoals.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            style={{
              minHeight: 44,
              padding: '0 16px',
              borderRadius: 12,
              background: showForm
                ? 'rgba(239,68,68,0.12)'
                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
              color: showForm ? '#EF4444' : '#0B0B0B',
              border: showForm ? '1px solid rgba(239,68,68,0.3)' : 'none',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nova Meta</>}
          </button>
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

      {/* ============== COMPLETION CELEBRATION ============== */}
      <AnimatePresence>
        {completedGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{
              padding: 'clamp(18px, 3.5vw, 24px)',
              borderRadius: 18,
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(16,185,129,0.08))',
              border: '2px solid #10B981',
              textAlign: 'center',
            }}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              style={{
                width: 56, height: 56,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.25)',
                color: '#10B981',
                margin: '0 auto 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PartyPopper size={28} />
            </motion.div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#10B981' }}>
              Meta concluída! 🎉
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 14,
                color: 'var(--text-secondary, #9CA3AF)',
                wordBreak: 'break-word',
              }}
            >
              {completedGoal.name}
            </p>
            <div
              style={{
                marginTop: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                background: 'rgba(212,175,55,0.18)',
                color: '#D4AF37',
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <Coins size={14} /> +50 PoupMoedas
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== STATS GRID ============== */}
      {goals.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'clamp(10px, 2vw, 14px)',
          }}
        >
          <StatCard label="Ativas" value={activeGoals.length} color="var(--text, #fff)" />
          <StatCard label="Concluídas" value={completedGoals.length} color="#10B981" />
          <StatCard label="Total poupado" value={formatCurrency(totalSaved)} color="#D4AF37" small />
        </div>
      )}

      {/* ============== FILTER CHIPS ============== */}
      {goals.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          className="goals-filter-row"
        >
          <FilterChip
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
            label="Todas"
            count={goals.length}
            color="#D4AF37"
          />
          {GOAL_TYPES.map((t) => {
            const count = goals.filter((g) => g.type === t.value).length;
            if (count === 0) return null;
            return (
              <FilterChip
                key={t.value}
                active={filterType === t.value}
                onClick={() => setFilterType(t.value)}
                label={t.label}
                count={count}
                color={t.color}
              />
            );
          })}
        </div>
      )}

      {/* ============== CREATE FORM ============== */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Card style={{ padding: 'clamp(18px, 3vw, 24px)' }}>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text, #fff)' }}>
                    Nova meta
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

                {/* Name */}
                <div>
                  <FieldLabel>Nome da meta</FieldLabel>
                  <input
                    type="text"
                    placeholder="Ex: Fundo emergência 6 meses"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    style={inputBase}
                  />
                </div>

                {/* Type */}
                <div>
                  <FieldLabel>Tipo</FieldLabel>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                    }}
                  >
                    {GOAL_TYPES.map((t) => {
                      const Icon = t.icon;
                      const active = form.type === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setForm({ ...form, type: t.value, color: t.color })}
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

                {/* Amounts */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 12,
                  }}
                >
                  <div>
                    <FieldLabel>Montante alvo (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.targetAmount}
                      onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                      required
                      min="1"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel>Montante inicial (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.currentAmount}
                      onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel>Contribuição mensal (€)</FieldLabel>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.monthlyContribution}
                      onChange={(e) => setForm({ ...form, monthlyContribution: e.target.value })}
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      style={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel icon={<Calendar size={12} />}>Prazo (opcional)</FieldLabel>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      style={inputBase}
                    />
                  </div>
                </div>

                {/* Icon picker */}
                <div>
                  <FieldLabel>Ícone</FieldLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {GOAL_ICONS.map((icon) => {
                      const active = form.icon === icon;
                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setForm({ ...form, icon })}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            background: active
                              ? hexToRgba(form.color, 0.2)
                              : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${active ? form.color : 'var(--border, rgba(255,255,255,0.08))'}`,
                            cursor: 'pointer',
                            transition: 'all 0.12s ease',
                          }}
                        >
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <FieldLabel icon={<Palette size={12} />}>Cor</FieldLabel>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {GOAL_COLORS.map((color) => {
                      const active = form.color === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setForm({ ...form, color })}
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: color,
                            border: active ? '3px solid #fff' : '2px solid transparent',
                            boxShadow: active ? `0 0 0 2px ${color}` : 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          aria-label={`Cor ${color}`}
                        >
                          {active && <Check size={14} color="#fff" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
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
                    <Target size={15} /> {saving ? 'A criar…' : 'Criar meta'}
                  </button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== GOALS LIST ============== */}
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
              width: 48, height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
            }}
          />
          <p style={{ color: 'var(--text-secondary, #9CA3AF)', fontSize: 13 }}>
            A carregar metas…
          </p>
        </div>
      ) : filteredGoals.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              addingToGoal={addingToGoal}
              setAddingToGoal={setAddingToGoal}
              addAmount={addAmount}
              setAddAmount={setAddAmount}
              adding={adding}
              showDeleteConfirm={showDeleteConfirm}
              setShowDeleteConfirm={setShowDeleteConfirm}
              deleting={deleting}
              onAddFunds={handleAddFunds}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        goals.length === 0 ? (
          <EmptyState onCreate={() => setShowForm(true)} />
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 'clamp(32px, 6vw, 48px) 20px',
              border: '1px dashed var(--border, rgba(255,255,255,0.1))',
              borderRadius: 16,
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-secondary, #9CA3AF)' }}>
              Sem metas neste filtro
            </p>
            <button
              type="button"
              onClick={() => setFilterType('all')}
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
              Ver todas as metas
            </button>
          </div>
        )
      )}

      {/* Hide scrollbar */}
      <style>{`
        .goals-filter-row::-webkit-scrollbar { display: none; }
      `}</style>
    </Shell>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function StatCard({ label, value, color, small = false }) {
  return (
    <div
      style={{
        background: 'var(--card, #1a1a1a)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderRadius: 14,
        padding: 'clamp(14px, 2.5vw, 18px)',
        textAlign: 'center',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: small ? 'clamp(16px, 3.5vw, 20px)' : 'clamp(22px, 4.5vw, 28px)',
          fontWeight: 900,
          color,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--text-muted, #6B7280)',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label, count, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        minHeight: 36,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        background: active ? hexToRgba(color, 0.15) : 'rgba(255,255,255,0.04)',
        color: active ? color : 'var(--text-secondary, #9CA3AF)',
        border: `1px solid ${active ? hexToRgba(color, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.12s ease',
      }}
    >
      {label}
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
        }}
      >
        {count}
      </span>
    </button>
  );
}

function GoalCard({
  goal, addingToGoal, setAddingToGoal, addAmount, setAddAmount, adding,
  showDeleteConfirm, setShowDeleteConfirm, deleting,
  onAddFunds, onDelete,
}) {
  const progress = getProgress(goal);
  const typeInfo = getTypeInfo(goal.type);
  const monthsLeft = getMonthsRemaining(goal);
  const daysUntilDeadline = getDaysUntil(goal.deadline);
  const goalColor = goal.color || typeInfo.color;
  const isConfirmDelete = showDeleteConfirm === goal._id;
  const isAdding = addingToGoal === goal._id;

  return (
    <motion.div
      layout
      style={{
        background: 'var(--card, #1a1a1a)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderLeft: `4px solid ${goal.isCompleted ? '#10B981' : goalColor}`,
        borderRadius: 14,
        padding: 'clamp(14px, 2.5vw, 18px)',
        minWidth: 0,
        overflow: 'hidden',
        opacity: goal.isCompleted ? 0.85 : 1,
      }}
    >
      {/* ===== Header ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minWidth: 0,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: hexToRgba(goalColor, 0.18),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          {goal.isCompleted ? '✅' : (goal.icon || '🎯')}
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
              textDecoration: goal.isCompleted ? 'line-through' : 'none',
              textDecorationColor: 'rgba(16,185,129,0.6)',
            }}
          >
            {goal.name}
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
                color: goalColor,
                fontWeight: 700,
              }}
            >
              {typeInfo.label}
            </span>
            {goal.isCompleted && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.18)',
                  color: '#10B981',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Concluída
              </span>
            )}
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(goal._id)}
          disabled={deleting}
          aria-label="Eliminar meta"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isConfirmDelete ? 'rgba(239,68,68,0.15)' : 'transparent',
            color: isConfirmDelete ? '#EF4444' : 'var(--text-muted, #6B7280)',
            border: isConfirmDelete ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.12s ease',
          }}
        >
          {isConfirmDelete ? <AlertCircle size={16} /> : <Trash2 size={15} />}
        </button>
      </div>

      {/* ===== Progress numbers ===== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 6,
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(16px, 4vw, 20px)',
            fontWeight: 900,
            color: goalColor,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatCurrency(goal.currentAmount || 0)}
        </span>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-muted, #6B7280)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          de {formatCurrency(goal.targetAmount)}
        </span>
      </div>

      {/* ===== Progress bar ===== */}
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
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: goal.isCompleted
              ? 'linear-gradient(90deg, #10B981, #059669)'
              : `linear-gradient(90deg, ${goalColor}, ${hexToRgba(goalColor, 0.7)})`,
            borderRadius: 999,
          }}
        />
      </div>

      {/* ===== Meta line ===== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginTop: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: goal.isCompleted ? '#10B981' : 'var(--text-secondary, #9CA3AF)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {progress.toFixed(0)}%
        </span>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {goal.deadline && !goal.isCompleted && (
            <span
              style={{
                fontSize: 11,
                color: daysUntilDeadline !== null && daysUntilDeadline < 0
                  ? '#EF4444'
                  : 'var(--text-muted, #6B7280)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
              }}
            >
              <Clock size={11} />
              {daysUntilDeadline !== null && daysUntilDeadline < 0
                ? `${Math.abs(daysUntilDeadline)}d atrasado`
                : daysUntilDeadline !== null
                  ? `${daysUntilDeadline}d`
                  : ''}
            </span>
          )}
          {monthsLeft !== null && monthsLeft > 0 && !goal.isCompleted && (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted, #6B7280)',
                whiteSpace: 'nowrap',
              }}
            >
              ~{monthsLeft} {monthsLeft === 1 ? 'mês' : 'meses'}
            </span>
          )}
        </div>
      </div>

      {/* ===== Monthly contribution ===== */}
      {goal.monthlyContribution > 0 && !goal.isCompleted && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--border, rgba(255,255,255,0.06))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted, #6B7280)', fontWeight: 600 }}>
            Contribuição mensal
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text, #fff)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCurrency(goal.monthlyContribution)}
          </span>
        </div>
      )}

      {/* ===== Add funds section ===== */}
      {!goal.isCompleted && (
        <div style={{ marginTop: 14 }}>
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div
                key="form"
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
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary, #9CA3AF)', flexShrink: 0 }}>
                      €
                    </span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
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

                  {/* Quick chips */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[5, 10, 25, 50].map((amt) => {
                      const active = addAmount === String(amt);
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAddAmount(String(amt))}
                          style={{
                            flex: '1 1 60px',
                            minHeight: 38,
                            padding: '6px 10px',
                            borderRadius: 8,
                            background: active ? hexToRgba(goalColor, 0.2) : 'rgba(255,255,255,0.04)',
                            color: active ? goalColor : 'var(--text-secondary, #9CA3AF)',
                            border: `1px solid ${active ? hexToRgba(goalColor, 0.5) : 'var(--border, rgba(255,255,255,0.08))'}`,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          €{amt}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => { setAddingToGoal(null); setAddAmount(''); }}
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
                      onClick={() => onAddFunds(goal._id)}
                      disabled={adding || !addAmount}
                      style={{
                        flex: 1.5,
                        minHeight: 42,
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: !addAmount
                          ? 'rgba(255,255,255,0.06)'
                          : 'linear-gradient(135deg, #D4AF37, #B8941F)',
                        color: !addAmount ? 'var(--text-muted, #6B7280)' : '#0B0B0B',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: adding || !addAmount ? 'not-allowed' : 'pointer',
                        opacity: adding ? 0.7 : 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Banknote size={13} /> {adding ? 'A adicionar…' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="add-btn"
                type="button"
                onClick={() => setAddingToGoal(goal._id)}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  minHeight: 44,
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: hexToRgba(goalColor, 0.12),
                  color: goalColor,
                  border: `1px solid ${hexToRgba(goalColor, 0.3)}`,
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
                <Banknote size={14} /> Adicionar fundos
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ===== Delete confirmation ===== */}
      <AnimatePresence>
        {isConfirmDelete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: '#FCA5A5',
                  fontWeight: 600,
                  flex: '1 1 140px',
                  minWidth: 0,
                }}
              >
                Eliminar esta meta?
              </p>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{
                    minHeight: 36,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'transparent',
                    color: 'var(--text, #fff)',
                    border: '1px solid var(--border, rgba(255,255,255,0.15))',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(goal._id)}
                  disabled={deleting}
                  style={{
                    minHeight: 36,
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                    color: '#fff',
                    border: 'none',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: deleting ? 'wait' : 'pointer',
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? '…' : 'Sim, eliminar'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ onCreate }) {
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
          background: 'rgba(212,175,55,0.15)',
          color: '#D4AF37',
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Target size={32} />
      </div>
      <p style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text, #fff)' }}>
        Define a tua primeira meta!
      </p>
      <p
        style={{
          margin: '6px 0 0',
          fontSize: 13,
          color: 'var(--text-secondary, #9CA3AF)',
          lineHeight: 1.5,
          maxWidth: 320,
          marginInline: 'auto',
        }}
      >
        Ter objetivos claros ajuda-te a manter o foco e a acompanhar o teu progresso.
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
        <Plus size={16} /> Criar meta
      </button>
    </div>
  );
}
