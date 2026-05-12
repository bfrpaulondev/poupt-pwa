import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/helpers';
import {
  Target, Plus, Check, Trash2, X, Banknote, Calendar, Clock,
  Shield, PiggyBank, TrendingUp, CreditCard, ShoppingBag, Sparkles,
  Coins
} from 'lucide-react';

const goalTypes = [
  { value: 'fundo_emergencia', label: 'Fundo de Emergencia', color: '#10B981', icon: Shield },
  { value: 'poupanca', label: 'Poupanca', color: '#3B82F6', icon: PiggyBank },
  { value: 'investimento', label: 'Investimento', color: '#8B5CF6', icon: TrendingUp },
  { value: 'divida', label: 'Eliminar Divida', color: '#EF4444', icon: CreditCard },
  { value: 'compra', label: 'Compra Especifica', color: '#F59E0B', icon: ShoppingBag },
];

export default function Goals() {
  const { user, updateUser } = useStore();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addingToGoal, setAddingToGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');
  const [adding, setAdding] = useState(false);
  const [completedGoal, setCompletedGoal] = useState(null);

  const [form, setForm] = useState({
    name: '', type: 'fundo_emergencia', targetAmount: '', currentAmount: 0,
    monthlyContribution: '', deadline: ''
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
      setForm({ name: '', type: 'fundo_emergencia', targetAmount: '', currentAmount: 0, monthlyContribution: '', deadline: '' });

      try {
        const moedasRes = await api.earnMoedas('create_goal', 10);
        updateUser({ poupMoedas: moedasRes.data.balance });
      } catch {}

      loadGoals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFunds = async (goalId) => {
    if (!addAmount || Number(addAmount) <= 0) return;
    setAdding(true);
    try {
      const res = await api.updateGoalProgress(goalId, Number(addAmount));
      setAddingToGoal(null);
      setAddAmount('');

      const updatedGoal = res.data.goal || res.data;
      if (updatedGoal && updatedGoal.isCompleted) {
        setCompletedGoal(updatedGoal);
        try {
          await api.earnMoedas('complete_goal', 50);
          const moedasRes = await api.getMoedasBalance();
          updateUser({ poupMoedas: moedasRes.data.balance });
        } catch {}
        setTimeout(() => setCompletedGoal(null), 4000);
      } else {
        try {
          await api.earnMoedas('add_to_goal', 3);
          const moedasRes = await api.getMoedasBalance();
          updateUser({ poupMoedas: moedasRes.data.balance });
        } catch {}
      }

      loadGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const getTypeInfo = (type) => {
    return goalTypes.find(t => t.value === type) || goalTypes[0];
  };

  const getProgress = (goal) => {
    if (!goal.targetAmount || goal.targetAmount === 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  const getMonthsRemaining = (goal) => {
    if (!goal.monthlyContribution || goal.monthlyContribution <= 0) return null;
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;
    return Math.ceil(remaining / goal.monthlyContribution);
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)'
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {completedGoal && (
        <div className="p-4 rounded-2xl text-center animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981' }}>
          <Sparkles size={28} className="mx-auto mb-2" style={{ color: '#10B981' }} />
          <p className="text-sm font-bold" style={{ color: '#10B981' }}>Meta concluida!</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{completedGoal.name}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Coins size={12} style={{ color: 'var(--gold)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>+50 PoupMoedas</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Metas Financeiras</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)' }}>
          <Plus size={14} /> Nova Meta
        </button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card p-3 text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{goals.length}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Metas ativas</p>
          </div>
          <div className="glass-card p-3 text-center">
            <p className="text-lg font-bold" style={{ color: '#10B981' }}>
              {goals.filter(g => g.isCompleted).length}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Concluidas</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nova Meta</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <input type="text" placeholder="Nome da meta (ex: Fundo emergencia 6 meses)" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />

          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Tipo de meta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {goalTypes.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} type="button" onClick={() => setForm({...form, type: t.value})}
                    className="py-2.5 px-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
                    style={{
                      background: form.type === t.value ? `${t.color}20` : 'var(--bg-secondary)',
                      color: form.type === t.value ? t.color : 'var(--text-secondary)',
                      border: form.type === t.value ? `1px solid ${t.color}` : '1px solid var(--border)'
                    }}>
                    <Icon size={14} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <input type="number" placeholder="Montante alvo (EUR)" value={form.targetAmount}
            onChange={e => setForm({...form, targetAmount: e.target.value})} required min="1" step="0.01"
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />

          <input type="number" placeholder="Montante inicial (EUR)" value={form.currentAmount || ''}
            onChange={e => setForm({...form, currentAmount: e.target.value})} min="0" step="0.01"
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />

          <input type="number" placeholder="Contribuicao mensal (EUR)" value={form.monthlyContribution}
            onChange={e => setForm({...form, monthlyContribution: e.target.value})} min="0" step="0.01"
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} className="inline mr-1" /> Prazo (opcional)
            </label>
            <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
              className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">
              Criar Meta
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.map(goal => {
          const progress = getProgress(goal);
          const typeInfo = getTypeInfo(goal.type);
          const Icon = typeInfo.icon;
          const monthsLeft = getMonthsRemaining(goal);
          const daysUntilDeadline = getDaysUntil(goal.deadline);

          return (
            <div key={goal._id} className="glass-card p-4"
              style={{ borderLeft: `3px solid ${goal.isCompleted ? '#10B981' : typeInfo.color}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${typeInfo.color}20` }}>
                  {goal.isCompleted ? <Check size={20} style={{ color: '#10B981' }} /> :
                    <Icon size={20} style={{ color: typeInfo.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {goal.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: typeInfo.color }}>{typeInfo.label}</span>
                    {goal.isCompleted && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                        Concluida
                      </span>
                    )}
                  </div>
                </div>
                {goal.isCompleted && (
                  <Sparkles size={18} style={{ color: '#10B981' }} />
                )}
              </div>

              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: typeInfo.color }}>{formatCurrency(goal.currentAmount)}</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(goal.targetAmount)}</span>
              </div>

              <div className="w-full rounded-full h-2.5" style={{ background: 'var(--border)' }}>
                <div className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: goal.isCompleted ? '#10B981' : typeInfo.color
                  }} />
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-medium" style={{ color: goal.isCompleted ? '#10B981' : 'var(--text-muted)' }}>
                  {progress.toFixed(0)}%
                </span>
                <div className="flex items-center gap-3">
                  {goal.deadline && !goal.isCompleted && (
                    <span className="text-[10px] flex items-center gap-1"
                      style={{ color: daysUntilDeadline !== null && daysUntilDeadline < 0 ? '#EF4444' : 'var(--text-muted)' }}>
                      <Clock size={10} />
                      {daysUntilDeadline !== null && daysUntilDeadline < 0
                        ? `${Math.abs(daysUntilDeadline)} dias atrasado`
                        : daysUntilDeadline !== null
                          ? `${daysUntilDeadline} dias`
                          : ''}
                    </span>
                  )}
                  {monthsLeft !== null && monthsLeft > 0 && !goal.isCompleted && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      ~{monthsLeft} mes{monthsLeft !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              </div>

              {goal.monthlyContribution > 0 && !goal.isCompleted && (
                <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    Contribuicao mensal
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(goal.monthlyContribution)}
                  </span>
                </div>
              )}

              {!goal.isCompleted && (
                <div className="mt-3">
                  {addingToGoal === goal._id ? (
                    <div className="space-y-2 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>EUR</span>
                        <input type="number" placeholder="0.00" value={addAmount}
                          onChange={e => setAddAmount(e.target.value)} min="0.01" step="0.01"
                          className="flex-1 px-2 py-2 rounded-xl text-sm" style={inputStyle} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setAddingToGoal(null); setAddAmount(''); }}
                          className="flex-1 py-2 rounded-xl text-xs" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                          Cancelar
                        </button>
                        <button onClick={() => handleAddFunds(goal._id)} disabled={adding || !addAmount}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-1">
                          <Banknote size={12} /> {adding ? 'A adicionar...' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingToGoal(goal._id)}
                      className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                      style={{ background: `${typeInfo.color}15`, color: typeInfo.color, border: `1px solid ${typeInfo.color}30` }}>
                      <Banknote size={12} /> Adicionar Fundos
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Define a tua primeira meta financeira!
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Ter objectivos claros ajuda-te a manter o foco
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-xl gold-gradient animate-pulse" />
        </div>
      )}
    </div>
  );
}
