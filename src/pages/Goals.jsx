import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Target, Plus, Check, Trash2 } from 'lucide-react';

export default function Goals() {
  const { user } = useStore();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'fundo_emergencia', targetAmount: '', currentAmount: 0,
    monthlyContribution: '', deadline: '', color: '#10B981'
  });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await api.getGoals();
      setGoals(res.data.goals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createGoal({
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        monthlyContribution: Number(form.monthlyContribution || 0)
      });
      setShowForm(false);
      setForm({ name: '', type: 'fundo_emergencia', targetAmount: '', currentAmount: 0, monthlyContribution: '', deadline: '', color: '#10B981' });
      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const goalTypes = [
    { value: 'fundo_emergencia', label: 'Fundo Emergencia', color: '#10B981' },
    { value: 'poupanca', label: 'Poupanca', color: '#3B82F6' },
    { value: 'investimento', label: 'Investimento', color: '#8B5CF6' },
    { value: 'divida', label: 'Eliminar Divida', color: '#EF4444' },
    { value: 'compra', label: 'Compra Especifica', color: '#F59E0B' },
    { value: 'outro', label: 'Outro', color: '#64748B' },
  ];

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Metas Financeiras</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)' }}>
          <Plus size={14} /> Nova Meta
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-4 space-y-3 animate-slide-up">
          <input type="text" placeholder="Nome da meta" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            {goalTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input type="number" placeholder="Montante alvo (EUR)" value={form.targetAmount} onChange={e => setForm({...form, targetAmount: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <input type="number" placeholder="Contribuicao mensal (EUR)" value={form.monthlyContribution} onChange={e => setForm({...form, monthlyContribution: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">Criar Meta</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.map(goal => {
          const progress = goal.targetAmount > 0
            ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
            : 0;
          const typeInfo = goalTypes.find(t => t.value === goal.type) || goalTypes[5];
          return (
            <div key={goal._id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${typeInfo.color}20` }}>
                  <Target size={20} style={{ color: typeInfo.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{goal.name}</p>
                  <p className="text-xs" style={{ color: typeInfo.color }}>{typeInfo.label}</p>
                </div>
                {goal.isCompleted && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                    <Check size={16} style={{ color: '#10B981' }} />
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(goal.currentAmount)}</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(goal.targetAmount)}</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${progress}%`, background: typeInfo.color }} />
              </div>
              <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
                {progress.toFixed(0)}%
              </p>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Define a tua primeira meta financeira!
          </p>
        </div>
      )}
    </div>
  );
}
