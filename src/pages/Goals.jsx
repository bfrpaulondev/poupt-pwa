import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, getDaysUntil } from '../utils/helpers';
import {
  Target, Plus, Check, Trash2, X, Banknote, Calendar, Clock,
  Shield, PiggyBank, TrendingUp, CreditCard, ShoppingBag, Sparkles,
  Coins, Filter, Heart, Palette, PartyPopper, AlertCircle
} from 'lucide-react';

const goalTypes = [
  { value: 'fundo_emergencia', label: 'Fundo de Emergencia', color: '#10B981', icon: Shield },
  { value: 'poupanca', label: 'Poupanca', color: '#3B82F6', icon: PiggyBank },
  { value: 'investimento', label: 'Investimento', color: '#8B5CF6', icon: TrendingUp },
  { value: 'divida', label: 'Eliminar Divida', color: '#EF4444', icon: CreditCard },
  { value: 'compra', label: 'Compra Especifica', color: '#F59E0B', icon: ShoppingBag },
  { value: 'outro', label: 'Outro', color: '#64748B', icon: Target },
];

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💍', '🎓', '💼', '🏥', '📱', '🎮', '🏠', '💎'];
const goalColors = ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899', '#F97316', '#64748B'];

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

  const [form, setForm] = useState({
    name: '', type: 'fundo_emergencia', targetAmount: '', currentAmount: 0,
    monthlyContribution: '', deadline: '', icon: '🎯', color: '#10B981'
  });

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await api.getGoals();
      setGoals(res.data.goals);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar metas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      const goalData = {
        ...form,
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount || 0),
        monthlyContribution: Number(form.monthlyContribution || 0)
      };
      // Only include deadline if provided and valid
      if (!goalData.deadline || goalData.deadline === '') {
        delete goalData.deadline;
      } else {
        goalData.deadline = new Date(goalData.deadline).toISOString();
      }
      await api.createGoal(goalData);
      setShowForm(false);
      setForm({ name: '', type: 'fundo_emergencia', targetAmount: '', currentAmount: 0, monthlyContribution: '', deadline: '', icon: '🎯', color: '#10B981' });

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

  const handleDelete = async (id) => {
    if (showDeleteConfirm !== id) {
      setShowDeleteConfirm(id);
      return;
    }
    setDeleting(true);
    try {
      await api.deleteGoal(id);
      setShowDeleteConfirm(null);
      loadGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
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

  const filteredGoals = filterType === 'all'
    ? goals
    : goals.filter(g => g.type === filterType);

  const activeGoals = goals.filter(g => !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);



  return (
    <div className="px-5 xs:px-6 sm:px-8 py-5 xs:py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fade-in">
      <button onClick={() => setScreen('dashboard')}
        className="flex items-center gap-1 mb-3 text-sm font-semibold"
        style={{ color: 'var(--text-secondary)' }}>
        ← Voltar
      </button>
      {errorMsg && (
        <div className="p-3 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}
          onClick={() => setErrorMsg('')}>
          {errorMsg} ← to dismiss
        </div>
      )}
      {/* Completion Celebration */}
      {completedGoal && (
        <div className="p-4 rounded-2xl text-center animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10B981' }}>
          <PartyPopper size={32} className="mx-auto mb-2" style={{ color: '#10B981' }} />
          <p className="text-base font-bold" style={{ color: '#10B981' }}>Meta concluida!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{completedGoal.name}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Coins size={14} style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--gold)' }}>+50 PoupMoedas</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Metas Financeiras</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--gold)' }}>
          <Plus size={14} /> Nova Meta
        </button>
      </div>

      {/* Stats Grid */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3">
          <div className="glass-card p-3 sm:p-4 text-center">
            <p className="text-base xs:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{activeGoals.length}</p>
            <p className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>Ativas</p>
          </div>
          <div className="glass-card p-3 sm:p-4 text-center">
            <p className="text-base xs:text-lg font-bold" style={{ color: '#10B981' }}>{completedGoals.length}</p>
            <p className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>Concluidas</p>
          </div>
          <div className="glass-card p-3 sm:p-4 text-center">
            <p className="text-base xs:text-lg font-bold" style={{ color: 'var(--gold)' }}>
              {goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0) > 0
                ? formatCurrency(goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0))
                : '0€'}
            </p>
            <p className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>Total poupado</p>
          </div>
        </div>
      )}

      {/* Filter by Type */}
      {goals.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setFilterType('all')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-xs font-medium whitespace-nowrap shrink-0"
            style={{
              background: filterType === 'all' ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)',
              color: filterType === 'all' ? 'var(--gold)' : 'var(--text-muted)',
              border: filterType === 'all' ? '1px solid rgba(255,215,0,0.4)' : '1px solid var(--border)'
            }}>
            Todas
          </button>
          {goalTypes.map(t => {
            const count = goals.filter(g => g.type === t.value).length;
            if (count === 0) return null;
            return (
              <button key={t.value} onClick={() => setFilterType(t.value)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1"
                style={{
                  background: filterType === t.value ? `${t.color}15` : 'var(--bg-secondary)',
                  color: filterType === t.value ? t.color : 'var(--text-muted)',
                  border: filterType === t.value ? `1px solid ${t.color}40` : '1px solid var(--border)'
                }}>
                {t.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-5 sm:p-6 space-y-4 sm:space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nova Meta</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <input type="text" placeholder="Nome da meta (ex: Fundo emergencia 6 meses)" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required
            className="w-full input-field" />

          {/* Type Selector */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Tipo de meta
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 sm:gap-3">
              {goalTypes.map(t => {
                const Icon = t.icon;
                return (
                  <button key={t.value} type="button" onClick={() => setForm({...form, type: t.value})}
                    className="py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
                    style={{
                      background: form.type === t.value ? `${t.color}20` : 'var(--bg-secondary)',
                      color: form.type === t.value ? t.color : 'var(--text-secondary)',
                      border: form.type === t.value ? `1px solid ${t.color}` : '1px solid var(--border)'
                    }}>
                    <Icon size={12} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <input type="number" placeholder="Montante alvo (EUR)" value={form.targetAmount}
            onChange={e => setForm({...form, targetAmount: e.target.value})} required min="1" step="0.01"
            className="w-full input-field" />

          <input type="number" placeholder="Montante inicial (EUR)" value={form.currentAmount || ''}
            onChange={e => setForm({...form, currentAmount: e.target.value})} min="0" step="0.01"
            className="w-full input-field" />

          <input type="number" placeholder="Contribuicao mensal (EUR)" value={form.monthlyContribution}
            onChange={e => setForm({...form, monthlyContribution: e.target.value})} min="0" step="0.01"
            className="w-full input-field" />

          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} className="inline mr-1" /> Prazo (opcional)
            </label>
            <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})}
              className="w-full input-field" />
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              Icone
            </label>
            <div className="flex flex-wrap gap-1.5">
              {goalIcons.map(icon => (
                <button key={icon} type="button" onClick={() => setForm({...form, icon})}
                  className="w-11 h-11 sm:w-12 sm:h-11 rounded-lg flex items-center justify-center text-sm transition-all"
                  style={{
                    background: form.icon === icon ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
                    border: form.icon === icon ? '1px solid var(--gold)' : '1px solid var(--border)'
                  }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              <Palette size={12} className="inline mr-1" /> Cor
            </label>
            <div className="flex gap-2">
              {goalColors.map(color => (
                <button key={color} type="button" onClick={() => setForm({...form, color})}
                  className="w-11 h-11 sm:w-12 sm:h-11 rounded-full relative transition-all"
                  style={{
                    background: color,
                    boxShadow: form.color === color ? `0 0 0 2px var(--bg-primary), 0 0 0 4px ${color}` : 'none'
                  }}>
                  {form.color === color && (
                    <Check size={12} className="absolute inset-0 m-auto text-white" />
                  )}
                </button>
              ))}
            </div>
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

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.map(goal => {
          const progress = getProgress(goal);
          const typeInfo = getTypeInfo(goal.type);
          const Icon = typeInfo.icon;
          const monthsLeft = getMonthsRemaining(goal);
          const daysUntilDeadline = getDaysUntil(goal.deadline);
          const goalColor = goal.color || typeInfo.color;
          const goalIcon = goal.icon;
          const isConfirmDelete = showDeleteConfirm === goal._id;

          return (
            <div key={goal._id} className="glass-card p-5 sm:p-6"
              style={{ borderLeft: `3px solid ${goal.isCompleted ? '#10B981' : goalColor}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: `${goalColor}20` }}>
                  {goal.isCompleted ? '✅' : goalIcon || <Icon size={20} style={{ color: goalColor }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {goal.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: goalColor }}>{typeInfo.label}</span>
                    {goal.isCompleted && (
                      <span className="text-xs sm:text-xs px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                        Concluida
                      </span>
                    )}
                  </div>
                </div>
                {/* Delete button */}
                <button onClick={() => handleDelete(goal._id)} disabled={deleting}
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all"
                  style={{
                    background: isConfirmDelete ? 'rgba(239,68,68,0.15)' : 'transparent',
                    color: isConfirmDelete ? '#EF4444' : 'var(--text-muted)'
                  }}>
                  {isConfirmDelete ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: goalColor }}>{formatCurrency(goal.currentAmount)}</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(goal.targetAmount)}</span>
              </div>

              <div className="w-full rounded-full h-2.5" style={{ background: 'var(--border)' }}>
                <div className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background: goal.isCompleted ? '#10B981' : goalColor
                  }} />
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-medium" style={{ color: goal.isCompleted ? '#10B981' : 'var(--text-muted)' }}>
                  {progress.toFixed(0)}%
                </span>
                <div className="flex items-center gap-3">
                  {goal.deadline && !goal.isCompleted && (
                    <span className="text-xs sm:text-xs flex items-center gap-1"
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
                    <span className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                      ~{monthsLeft} mes{monthsLeft !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              </div>

              {goal.monthlyContribution > 0 && !goal.isCompleted && (
                <div className="mt-2 pt-2 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                    Contribuicao mensal
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(goal.monthlyContribution)}
                  </span>
                </div>
              )}

              {/* Quick Add Funds */}
              {!goal.isCompleted && (
                <div className="mt-3">
                  {addingToGoal === goal._id ? (
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>EUR</span>
                        <input type="number" placeholder="0.00" value={addAmount}
                          onChange={e => setAddAmount(e.target.value)} min="0.01" step="0.01"
                          className="flex-1 input-field" />
                      </div>
                      {/* Quick amount buttons */}
                      <div className="flex gap-1.5">
                        {[5, 10, 25, 50].map(amt => (
                          <button key={amt} type="button" onClick={() => setAddAmount(String(amt))}
                            className="flex-1 py-2.5 sm:py-3 rounded-lg text-xs sm:text-xs font-medium"
                            style={{
                              background: addAmount === String(amt) ? `${goalColor}20` : 'var(--bg-primary)',
                              color: addAmount === String(amt) ? goalColor : 'var(--text-muted)',
                              border: `1px solid ${addAmount === String(amt) ? goalColor : 'var(--border)'}`
                            }}>
                            €{amt}
                          </button>
                        ))}
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
                      className="w-full py-2.5 sm:py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
                      style={{ background: `${goalColor}15`, color: goalColor, border: `1px solid ${goalColor}30` }}>
                      <Banknote size={12} /> Adicionar Fundos
                    </button>
                  )}
                </div>
              )}

              {/* Delete Confirmation */}
              {isConfirmDelete && (
                <div className="mt-3 p-3 sm:p-4 rounded-xl flex items-center gap-3 animate-fade-in"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle size={16} style={{ color: '#EF4444' }} />
                  <p className="text-xs flex-1" style={{ color: '#EF4444' }}>
                    Eliminar esta meta?
                  </p>
                  <button onClick={() => setShowDeleteConfirm(null)}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-xs"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    Nao
                  </button>
                  <button onClick={() => handleDelete(goal._id)} disabled={deleting}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-xs font-bold"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                    {deleting ? '...' : 'Sim'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {goals.length === 0 && !loading && (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Define a tua primeira meta financeira!
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Ter objectivos claros ajuda-te a manter o foco
          </p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">
            Criar Meta
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-xl gold-gradient gold-shimmer" />
        </div>
      )}
    </div>
  );
}
