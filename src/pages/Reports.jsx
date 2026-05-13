import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import {
  Calendar, CreditCard, TrendingUp, ArrowDownLeft, ArrowUpRight,
  ChevronLeft, ChevronRight, BarChart3, PieChart
} from 'lucide-react';

const monthNames = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export default function Reports() {
  const theme = themes.darkGold;
  const { transactions, jars, user } = useStore();
  const [activeTab, setActiveTab] = useState('resumo');

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const navigateMonth = (dir) => {
    let m = month + dir;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y);
  };

  const monthTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
  }, [transactions, month, year]);

  const totalIncome = monthTransactions.filter(t => t.type === 'receita').reduce((s, t) => s + (t.amount || 0), 0);
  const totalExpenses = monthTransactions.filter(t => t.type === 'despesa').reduce((s, t) => s + (t.amount || 0), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  // Spending by jar
  const spendingByJar = useMemo(() => {
    const map = {};
    monthTransactions.filter(t => t.type === 'despesa' && t.jar).forEach(t => {
      map[t.jar] = (map[t.jar] || 0) + (t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTransactions]);

  // Spending by category
  const spendingByCategory = useMemo(() => {
    const map = {};
    monthTransactions.filter(t => t.type === 'despesa').forEach(t => {
      const cat = t.category || 'outro';
      map[cat] = (map[cat] || 0) + (t.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [monthTransactions]);

  const maxSpend = spendingByJar.length > 0 ? spendingByJar[0][1] : 1;
  const maxCatSpend = spendingByCategory.length > 0 ? spendingByCategory[0][1] : 1;

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: BarChart3 },
    { id: 'frascos', label: 'Frascos', icon: PieChart },
    { id: 'categorias', label: 'Categorias', icon: CreditCard },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: theme.text, margin: 0 }}>Relatorios</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigateMonth(-1)} style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: theme.surface, border: `1px solid ${theme.border}`, cursor: 'pointer'
          }}>
            <ChevronLeft size={14} style={{ color: theme.textMuted }} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 500, color: theme.text, minWidth: 100, textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={() => navigateMonth(1)} style={{
            width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: theme.surface, border: `1px solid ${theme.border}`, cursor: 'pointer'
          }}>
            <ChevronRight size={14} style={{ color: theme.textMuted }} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { icon: ArrowDownLeft, value: totalIncome, label: 'Receitas', color: '#10B981' },
          { icon: ArrowUpRight, value: totalExpenses, label: 'Despesas', color: '#EF4444' },
          { icon: TrendingUp, value: savingsRate, label: 'Poupanca', color: theme.primary, isPercent: true },
        ].map(({ icon: Icon, value, label, color, isPercent }) => (
          <div key={label} className="glass-card" style={{ padding: 12, textAlign: 'center' }}>
            <Icon size={14} style={{ color, margin: '0 auto 4px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color, margin: 0 }}>
              {isPercent ? `${value.toFixed(1)}%` : `€${value.toFixed(2)}`}
            </p>
            <p style={{ fontSize: 9, color: theme.textMuted, margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Income vs Expenses Bar */}
      <div className="glass-card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>Receitas vs Despesas</h3>
        <div style={{ display: 'flex', gap: 8, height: 160 }}>
          {[ 
            { label: 'Receitas', value: totalIncome, color: '#10B981' },
            { label: 'Despesas', value: totalExpenses, color: '#EF4444' },
          ].map(({ label, value, color }) => {
            const max = Math.max(totalIncome, totalExpenses, 1);
            const height = (value / max) * 140;
            return (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                <span style={{ fontSize: 10, fontWeight: 600, color, marginBottom: 4 }}>€{value.toFixed(0)}</span>
                <div style={{ width: '100%', borderRadius: '8px 8px 0 0', background: color, height: Math.max(4, height), transition: 'height 0.3s' }} />
                <span style={{ fontSize: 10, color: theme.textMuted, marginTop: 6 }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            flex: 1, padding: 10, borderRadius: 12, fontSize: 11, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: activeTab === id ? s(theme.primary, 0.15) : theme.surface,
            color: activeTab === id ? theme.primary : theme.textMuted,
            border: activeTab === id ? `1px solid ${s(theme.primary, 0.4)}` : `1px solid ${theme.border}`
          }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Resumo Tab */}
      {activeTab === 'resumo' && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>Resumo Mensal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>Total receitas</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>€{totalIncome.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>Total despesas</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>€{totalExpenses.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>Balanço</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: totalIncome - totalExpenses >= 0 ? '#10B981' : '#EF4444' }}>
                €{(totalIncome - totalExpenses).toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ fontSize: 13, color: theme.textMuted }}>Taxa de poupanca</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.primary }}>{savingsRate.toFixed(1)}%</span>
            </div>
          </div>
          {monthTransactions.length === 0 && (
            <p style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 24 }}>Sem transacoes este mes</p>
          )}
        </div>
      )}

      {/* Frascos Tab */}
      {activeTab === 'frascos' && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>Despesas por Frasco</h3>
          {spendingByJar.length > 0 ? spendingByJar.map(([jar, amount], idx) => {
            const jarColor = theme.jarColors[idx % theme.jarColors.length];
            const pct = maxSpend > 0 ? (amount / maxSpend) * 100 : 0;
            return (
              <div key={jar} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: jarColor, fontWeight: 500 }}>{jar}</span>
                  <span style={{ color: theme.text, fontWeight: 600 }}>€{amount.toFixed(2)}</span>
                </div>
                <div style={{ width: '100%', borderRadius: 20, height: 8, background: theme.border }}>
                  <div style={{ height: 8, borderRadius: 20, width: `${pct}%`, background: jarColor, transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          }) : (
            <p style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 24 }}>Sem despesas por frasco este mes</p>
          )}
        </div>
      )}

      {/* Categorias Tab */}
      {activeTab === 'categorias' && (
        <div className="glass-card" style={{ padding: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>Maiores Despesas</h3>
          {spendingByCategory.length > 0 ? spendingByCategory.map(([cat, amount], idx) => {
            const pct = maxCatSpend > 0 ? (amount / maxCatSpend) * 100 : 0;
            const catColor = theme.jarColors[idx % theme.jarColors.length];
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: theme.textMuted, textTransform: 'capitalize' }}>{cat}</span>
                  <span style={{ color: theme.text, fontWeight: 600 }}>€{amount.toFixed(2)}</span>
                </div>
                <div style={{ width: '100%', borderRadius: 20, height: 6, background: theme.border }}>
                  <div style={{ height: 6, borderRadius: 20, width: `${pct}%`, background: catColor, transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          }) : (
            <p style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center', padding: 24 }}>Sem despesas registadas este mes</p>
          )}
        </div>
      )}
    </motion.div>
  );
}
