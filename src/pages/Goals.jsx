import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import useThemeColors from '../utils/useThemeColors';
import {
  Target, Plus, Check, X, Calendar, Clock,
  Shield, PiggyBank, TrendingUp, CreditCard, ShoppingBag, Banknote
} from 'lucide-react';

const goalTypes = [
  { value: 'fundo_emergencia', label: 'Emergencia', icon: Shield, color: '#10B981' },
  { value: 'poupanca', label: 'Poupanca', icon: PiggyBank, color: '#3B82F6' },
  { value: 'investimento', label: 'Investimento', icon: TrendingUp, color: '#8B5CF6' },
  { value: 'divida', label: 'Divida', icon: CreditCard, color: '#EF4444' },
  { value: 'compra', label: 'Compra', icon: ShoppingBag, color: '#F59E0B' },
  { value: 'outro', label: 'Outro', icon: Target, color: '#64748B' },
];

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💼', '🏥', '📱', '🎮', '💎', '🏆'];

export default function Goals() {
  const { theme } = useThemeColors();
  const { goals, setScreen } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'fundo_emergencia', targetAmount: '', deadline: '', icon: '🎯'
  });

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const allGoals = goals || [];

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.targetAmount) return;
    // Would add goal to store
    setShowForm(false);
    setForm({ name: '', type: 'fundo_emergencia', targetAmount: '', deadline: '', icon: '🎯' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, margin: 0 }}>Metas Financeiras</h2>
        <button onClick={() => setShowForm(!showForm)} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 12,
          fontSize: 12, fontWeight: 500, background: s(theme.primary, 0.15), color: theme.primary,
          border: 'none', cursor: 'pointer'
        }}>
          <Plus size={14} /> Nova Meta
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Nova Meta</h3>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={16} style={{ color: theme.textMuted }} />
            </button>
          </div>

          <input type="text" placeholder="Nome da meta" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })} required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 13, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none' }} />

          {/* Type Selector */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 8, display: 'block' }}>Tipo de meta</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {goalTypes.map(t => {
                const Icon = t.icon;
                const isActive = form.type === t.value;
                return (
                  <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })} style={{
                    padding: '10px 4px', borderRadius: 12, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: isActive ? s(t.color, 0.2) : theme.surface,
                    color: isActive ? t.color : theme.textMuted,
                    border: isActive ? `1px solid ${t.color}` : `1px solid ${theme.border}`
                  }}>
                    <Icon size={12} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <input type="number" placeholder="Montante alvo (EUR)" value={form.targetAmount}
            onChange={e => setForm({ ...form, targetAmount: e.target.value })} required min="1" step="0.01"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 13, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none' }} />

          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 6, display: 'block' }}>
              <Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Prazo (opcional)
            </label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 13, background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none' }} />
          </div>

          {/* Icon Picker */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 6, display: 'block' }}>Icone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {goalIcons.map(icon => (
                <button key={icon} type="button" onClick={() => setForm({ ...form, icon })} style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, cursor: 'pointer',
                  background: form.icon === icon ? s(theme.primary, 0.2) : theme.surface,
                  border: form.icon === icon ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`
                }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={{
              flex: 1, padding: 10, borderRadius: 12, fontSize: 13,
              color: theme.textMuted, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer'
            }}>
              Cancelar
            </button>
            <button type="submit" style={{
              flex: 1, padding: 10, borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              color: theme.textInverse, border: 'none', cursor: 'pointer'
            }}>
              Criar Meta
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {allGoals.length === 0 && !showForm && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: s(theme.primary, 0.1)
          }}>
            <Target size={36} style={{ color: theme.primary }} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: theme.text, margin: '0 0 4px' }}>Define a tua primeira meta!</h3>
          <p style={{ fontSize: 12, color: theme.textMuted, margin: '0 0 16px' }}>Ter objectivos claros ajuda-te a manter o foco</p>
          <button onClick={() => setShowForm(true)} style={{
            padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            color: theme.textInverse, border: 'none'
          }}>
            Criar Meta
          </button>
        </div>
      )}

      {/* Goals List */}
      {allGoals.length > 0 && allGoals.map((goal, idx) => {
        const typeInfo = goalTypes.find(t => t.value === (goal.type || 'outro')) || goalTypes[5];
        const Icon = typeInfo.icon;
        const progress = goal.targetAmount > 0 ? Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100) : 0;
        const goalColor = goal.color || typeInfo.color;

        return (
          <div key={goal.id || idx} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${goalColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                background: s(goalColor, 0.15)
              }}>
                {goal.icon || <Icon size={20} style={{ color: goalColor }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.name}</p>
                <span style={{ fontSize: 11, color: goalColor }}>{typeInfo.label}</span>
              </div>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: goalColor }}>€{(goal.currentAmount || 0).toFixed(2)}</span>
              <span style={{ color: theme.textMuted }}>€{(goal.targetAmount || 0).toFixed(2)}</span>
            </div>
            <div style={{ width: '100%', borderRadius: 20, height: 8, background: theme.border }}>
              <div style={{ height: 8, borderRadius: 20, width: `${progress}%`, background: goalColor, transition: 'width 0.3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted }}>{progress.toFixed(0)}%</span>
              {goal.deadline && (
                <span style={{ fontSize: 10, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={10} /> {new Date(goal.deadline).toLocaleDateString('pt-PT')}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
