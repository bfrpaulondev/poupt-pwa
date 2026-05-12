import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { categoryLabels, jarLabels, jarColors } from '../utils/helpers';
import { ArrowUpRight, ArrowDownLeft, Save, X } from 'lucide-react';

export default function AddTransaction() {
  const { user, addTransaction, setScreen } = useStore();
  const [type, setType] = useState('despesa');
  const [form, setForm] = useState({
    amount: '', category: 'alimentacao', description: '', jar: '', date: new Date().toISOString().split('T')[0], notes: ''
  });
  const [saving, setSaving] = useState(false);

  const incomeCategories = ['salario', 'freelance', 'outro_rendimento', 'emprestimo_recebido'];
  const expenseCategories = ['alimentacao', 'habitacao', 'transportes', 'saude', 'educacao', 'lazer', 'roupa', 'divida', 'investimento', 'poupanca', 'pagamento_divida', 'emprestimo_dado', 'outro_gasto'];

  const categories = type === 'receita' ? incomeCategories : expenseCategories;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createTransaction({
        ...form,
        type,
        amount: Number(form.amount),
        jar: form.jar || null
      });
      addTransaction(res.data.transaction);
      setScreen('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Type Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setType('despesa'); setForm({...form, category: 'alimentacao'}); }}
          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: type === 'despesa' ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
            color: type === 'despesa' ? '#EF4444' : 'var(--text-secondary)',
            border: type === 'despesa' ? '1px solid #EF4444' : '1px solid var(--border)'
          }}>
          <ArrowDownLeft size={14} /> Despesa
        </button>
        <button onClick={() => { setType('receita'); setForm({...form, category: 'salario'}); }}
          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
          style={{
            background: type === 'receita' ? 'rgba(16,185,129,0.15)' : 'var(--bg-secondary)',
            color: type === 'receita' ? '#10B981' : 'var(--text-secondary)',
            border: type === 'receita' ? '1px solid #10B981' : '1px solid var(--border)'
          }}>
          <ArrowUpRight size={14} /> Receita
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div className="glass-card p-6 text-center">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {type === 'receita' ? 'Receita' : 'Despesa'}
          </span>
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-lg font-semibold" style={{ color: type === 'receita' ? '#10B981' : '#EF4444' }}>EUR</span>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
              placeholder="0.00" required min="0.01" step="0.01"
              className="text-3xl font-bold w-40 text-center bg-transparent"
              style={{ color: type === 'receita' ? '#10B981' : '#EF4444' }} />
          </div>
        </div>

        {/* Description */}
        <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Descricao" required
          className="w-full px-4 py-3 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />

        {/* Category */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Categoria</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setForm({...form, category: cat})}
                className="py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: form.category === cat ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                  color: form.category === cat ? 'var(--gold)' : 'var(--text-secondary)',
                  border: form.category === cat ? '1px solid var(--gold)' : '1px solid var(--border)'
                }}>
                {categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        {/* Jar Assignment */}
        <div>
          <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>Frasco (opcional)</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(jarLabels).map(([key, label]) => (
              <button key={key} type="button" onClick={() => setForm({...form, jar: form.jar === key ? '' : key})}
                className="py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: form.jar === key ? `${jarColors[key]}20` : 'var(--bg-secondary)',
                  color: form.jar === key ? jarColors[key] : 'var(--text-secondary)',
                  border: form.jar === key ? `1px solid ${jarColors[key]}` : '1px solid var(--border)'
                }}>
                {label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
          className="w-full px-4 py-3 rounded-xl text-sm"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => setScreen('dashboard')}
            className="px-5 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <X size={14} /> Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={14} /> {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
}
