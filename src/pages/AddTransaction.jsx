import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { categoryLabels, categoryIcons, jarLabels, jarColors, jarIcons, formatCurrency, setCurrencyGlobal } from '../utils/helpers';
import {
  ArrowUpRight, ArrowDownLeft, Save, X, ShoppingCart, Home, TrainFront,
  Heart, GraduationCap, Gamepad2, Shirt, AlertTriangle, TrendingUp,
  PiggyBank, Banknote, Laptop, Plus, Minus, CreditCard, Landmark,
  Calendar, FileText, Coins
} from 'lucide-react';

const iconMap = {
  ShoppingCart, Home, TrainFront, Heart, GraduationCap, Gamepad2, Shirt,
  AlertTriangle, TrendingUp, PiggyBank, Banknote, Laptop, Plus, Minus,
  ArrowUpRight, ArrowDownLeft, CreditCard, Landmark
};

export default function AddTransaction() {
  const { user, addTransaction, setScreen, updateUser } = useStore();
  const [type, setType] = useState('despesa');
  const [form, setForm] = useState({
    amount: '', category: 'alimentacao', description: '', jar: '',
    date: new Date().toISOString().split('T')[0], notes: '',
    isRecurring: false, recurringFrequency: 'monthly'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [moedasEarned, setMoedasEarned] = useState(null);

  const incomeCategories = ['salario', 'freelance', 'outro_rendimento', 'emprestimo_recebido'];
  const expenseCategories = [
    'alimentacao', 'habitacao', 'transportes', 'saude', 'educacao',
    'lazer', 'roupa', 'divida', 'investimento', 'poupanca',
    'pagamento_divida', 'emprestimo_dado', 'outro_gasto'
  ];

  const categories = type === 'receita' ? incomeCategories : expenseCategories;

  const handleTypeChange = (newType) => {
    setType(newType);
    setForm({
      ...form,
      category: newType === 'receita' ? 'salario' : 'alimentacao',
      jar: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    setSaving(true);
    setError(null);
    try {
      const res = await api.createTransaction({
        ...form,
        type,
        amount: Number(form.amount),
        jar: form.jar || null,
        isRecurring: form.isRecurring || undefined,
        recurringFrequency: form.isRecurring ? form.recurringFrequency : undefined
      });
      addTransaction(res.data.transaction);

      // Notify dashboard to refresh
      window.dispatchEvent(new CustomEvent('poupt-refresh-dashboard'));

      try {
        const moedasRes = await api.earnMoedas('add_transaction', 5);
        updateUser({ poupMoedas: moedasRes.data.balance });
        setMoedasEarned(moedasRes.data.earned || 5);
        setTimeout(() => setMoedasEarned(null), 3000);
      } catch {}

      setScreen('dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao guardar transacao');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (cat) => {
    const iconName = categoryIcons[cat];
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={14} /> : <Plus size={14} />;
  };

  const getJarIcon = (key) => {
    const iconName = jarIcons[key];
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={12} /> : null;
  };



  return (
    <div className="px-5 xs:px-6 sm:px-8 py-5 xs:py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fade-in">
      {moedasEarned && (
        <div className="p-3 rounded-xl text-sm font-medium text-center animate-fade-in flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--gold)' }}>
          <Coins size={14} /> +{moedasEarned} PoupMoedas ganhos!
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl text-sm text-center animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => handleTypeChange('despesa')}
          className="flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: type === 'despesa' ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
            color: type === 'despesa' ? '#EF4444' : 'var(--text-secondary)',
            border: type === 'despesa' ? '1px solid #EF4444' : '1px solid var(--border)'
          }}>
          <ArrowDownLeft size={14} /> Despesa
        </button>
        <button onClick={() => handleTypeChange('receita')}
          className="flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: type === 'receita' ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
            color: type === 'receita' ? '#10B981' : 'var(--text-secondary)',
            border: type === 'receita' ? '1px solid #10B981' : '1px solid var(--border)'
          }}>
          <ArrowUpRight size={14} /> Receita
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="glass-card p-7 sm:p-9 text-center">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {type === 'receita' ? 'Receita' : 'Despesa'}
          </span>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-lg font-semibold" style={{ color: type === 'receita' ? '#10B981' : '#EF4444' }}>
              {user?.currency || 'EUR'}
            </span>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
              placeholder="0.00" required min="0.01" step="0.01"
              className="text-3xl font-bold flex-1 min-w-0 max-w-[160px] text-center bg-transparent outline-none"
              style={{ color: type === 'receita' ? '#10B981' : '#EF4444' }} />
          </div>
          {form.amount && Number(form.amount) > 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              {formatDisplayAmount(Number(form.amount), user?.currency)}
            </p>
          )}
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
            Descricao
          </label>
          <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder={type === 'receita' ? 'Ex: Salario mensal' : 'Ex: Compras no supermercado'} required
            className="w-full input-field" />
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
            Categoria
          </label>
          <div className="grid grid-cols-2 xs:grid-cols-3 gap-3 sm:gap-4">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setForm({...form, category: cat})}
                className="py-3.5 px-3 sm:px-3.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1"
                style={{
                  background: form.category === cat ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
                  color: form.category === cat ? 'var(--gold)' : 'var(--text-secondary)',
                  border: form.category === cat ? '1px solid var(--gold)' : '1px solid var(--border)'
                }}>
                <span style={{ opacity: form.category === cat ? 1 : 0.6 }}>{getCategoryIcon(cat)}</span>
                <span className="truncate w-full text-center">{categoryLabels[cat] || cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
            Frasco (opcional)
          </label>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {Object.entries(jarLabels).map(([key, label]) => (
              <button key={key} type="button"
                onClick={() => setForm({...form, jar: form.jar === key ? '' : key})}
                className="py-3.5 px-3 sm:px-3.5 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-1"
                style={{
                  background: form.jar === key ? `${jarColors[key]}20` : 'var(--bg-secondary)',
                  color: form.jar === key ? jarColors[key] : 'var(--text-secondary)',
                  border: form.jar === key ? `1px solid ${jarColors[key]}` : '1px solid var(--border)'
                }}>
                <span style={{ opacity: form.jar === key ? 1 : 0.6 }}>{getJarIcon(key)}</span>
                <span className="truncate w-full text-center">{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={12} className="inline mr-1" /> Data
          </label>
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
            className="w-full input-field" />
        </div>

        <div>
          <label className="text-xs font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
            <FileText size={12} className="inline mr-1" /> Notas (opcional)
          </label>
          <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
            placeholder="Adiciona notas ou detalhes..."
            rows={2}
            className="w-full input-field resize-none" />
        </div>

        {/* Recurring Transaction Toggle */}
        <div className="glass-card p-6 sm:p-7">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={12} className="inline mr-1" /> Transacao recorrente
            </label>
            <button type="button" onClick={() => setForm({...form, isRecurring: !form.isRecurring})}
            className="w-12 h-7 rounded-full transition-all relative min-w-[44px] min-h-[44px] flex items-center"
              style={{ background: form.isRecurring ? 'var(--gold)' : 'var(--border)' }}>
              <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                style={{ left: form.isRecurring ? '22px' : '4px' }} />
            </button>
          </div>
          {form.isRecurring && (
            <select value={form.recurringFrequency || 'monthly'}
              onChange={e => setForm({...form, recurringFrequency: e.target.value})}
              className="w-full input-field mt-2">
              <option value="weekly">Semanal</option>
              <option value="biweekly">Quinzenal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          )}
        </div>

        <div className="flex gap-4 sm:gap-5">
          <button type="button" onClick={() => setScreen('dashboard')}
            className="px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <X size={14} /> Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="btn-gold flex-1 py-3.5 disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={14} /> {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDisplayAmount(value, currency) {
  return formatCurrency(value, currency || 'EUR');
}
