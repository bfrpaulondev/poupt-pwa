import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import {
  ArrowUpRight, ArrowDownLeft, Save, X, ShoppingCart, Home, TrainFront,
  Heart, GraduationCap, Gamepad2, Shirt, AlertTriangle, TrendingUp,
  PiggyBank, Banknote, Laptop, Plus, CreditCard, Landmark, Calendar, Coins
} from 'lucide-react';

const categoryConfig = {
  alimentacao: { label: 'Alimentacao', icon: ShoppingCart },
  habitacao: { label: 'Habitacao', icon: Home },
  transportes: { label: 'Transportes', icon: TrainFront },
  saude: { label: 'Saude', icon: Heart },
  educacao: { label: 'Educacao', icon: GraduationCap },
  lazer: { label: 'Lazer', icon: Gamepad2 },
  roupa: { label: 'Roupa', icon: Shirt },
  divida: { label: 'Divida', icon: AlertTriangle },
  investimento: { label: 'Investimento', icon: TrendingUp },
  poupanca: { label: 'Poupanca', icon: PiggyBank },
  salario: { label: 'Salario', icon: Banknote },
  freelance: { label: 'Freelance', icon: Laptop },
  outro: { label: 'Outro', icon: Plus },
};

export default function AddTransaction() {
  const theme = themes.darkGold;
  const { addTransaction, setScreen, jars } = useStore();
  const [type, setType] = useState('despesa');
  const [form, setForm] = useState({
    amount: '', category: 'alimentacao', description: '', jar: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [moedasEarned, setMoedasEarned] = useState(null);

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const incomeCategories = ['salario', 'freelance', 'outro'];
  const expenseCategories = ['alimentacao', 'habitacao', 'transportes', 'saude', 'educacao', 'lazer', 'roupa', 'divida', 'investimento', 'poupanca'];
  const categories = type === 'receita' ? incomeCategories : expenseCategories;

  const handleTypeChange = (newType) => {
    setType(newType);
    setForm(f => ({ ...f, category: newType === 'receita' ? 'salario' : 'alimentacao', jar: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    try {
      addTransaction({ ...form, type, amount: Number(form.amount), id: Date.now() });
      setMoedasEarned(5);
      setTimeout(() => { setMoedasEarned(null); setScreen('dashboard'); }, 1500);
    } catch { } finally { setSaving(false); }
  };

  const typeColor = type === 'receita' ? '#10B981' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Moedas earned toast */}
      {moedasEarned && (
        <div style={{
          padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 500, textAlign: 'center',
          background: s(theme.primary, 0.15), color: theme.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
        }}>
          <Coins size={14} /> +{moedasEarned} PoupMoedas ganhos!
        </div>
      )}

      {/* Type Toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { id: 'despesa', label: 'Despesa', icon: ArrowDownLeft, color: '#EF4444' },
          { id: 'receita', label: 'Receita', icon: ArrowUpRight, color: '#10B981' },
        ].map(({ id, label, icon: Icon, color }) => (
          <button key={id} onClick={() => handleTypeChange(id)} style={{
            flex: 1, padding: 12, borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
            background: type === id ? s(color, 0.15) : theme.surface,
            color: type === id ? color : theme.textMuted,
            border: type === id ? `1px solid ${color}` : `1px solid ${theme.border}`
          }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Amount */}
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <span style={{ fontSize: 11, color: theme.textMuted }}>{type === 'receita' ? 'Receita' : 'Despesa'}</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: typeColor }}>EUR</span>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00" required min="0.01" step="0.01"
              style={{
                fontSize: 28, fontWeight: 700, width: 140, textAlign: 'center',
                background: 'transparent', border: 'none', outline: 'none', color: typeColor
              }} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 6, display: 'block' }}>Descricao</label>
          <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder={type === 'receita' ? 'Ex: Salario mensal' : 'Ex: Compras no supermercado'} required
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 13,
              background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none'
            }} />
        </div>

        {/* Category */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 8, display: 'block' }}>Categoria</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {categories.map(cat => {
              const conf = categoryConfig[cat] || { label: cat, icon: Plus };
              const Icon = conf.icon;
              const isActive = form.category === cat;
              return (
                <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })} style={{
                  padding: '10px 4px', borderRadius: 12, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.2s',
                  background: isActive ? s(theme.primary, 0.2) : theme.surface,
                  color: isActive ? theme.primary : theme.textMuted,
                  border: isActive ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`
                }}>
                  <Icon size={14} style={{ opacity: isActive ? 1 : 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{conf.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jar Selector */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 8, display: 'block' }}>Frasco (opcional)</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {(jars || []).map((jar, idx) => {
              const isActive = form.jar === jar.name;
              const jarColor = theme.jarColors[idx % theme.jarColors.length];
              return (
                <button key={jar.name} type="button" onClick={() => setForm({ ...form, jar: form.jar === jar.name ? '' : jar.name })} style={{
                  padding: '10px 4px', borderRadius: 12, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: isActive ? s(jarColor, 0.2) : theme.surface,
                  color: isActive ? jarColor : theme.textMuted,
                  border: isActive ? `1px solid ${jarColor}` : `1px solid ${theme.border}`
                }}>
                  <span style={{ fontSize: 16 }}>{jar.icon || '🏺'}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{jar.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted, marginBottom: 6, display: 'block' }}>
            <Calendar size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Data
          </label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 13,
              background: theme.surface, border: `1px solid ${theme.border}`, color: theme.text, outline: 'none'
            }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" onClick={() => setScreen('dashboard')} style={{
            padding: '14px 20px', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            color: theme.textMuted, border: `1px solid ${theme.border}`, background: 'transparent'
          }}>
            <X size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-gold" style={{
            flex: 1, padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: saving ? 0.5 : 1
          }}>
            <Save size={14} /> {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
