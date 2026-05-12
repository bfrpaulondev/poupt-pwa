import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, modeColors } from '../utils/helpers';
import { Plus, CreditCard, Users, ArrowDownLeft, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Debts() {
  const { user, setScreen } = useStore();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInformalForm, setShowInformalForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    creditorName: '', amount: '', minimumPayment: '', interestRate: '',
    dueDate: '', relationshipType: 'banco', notes: ''
  });

  const [informalForm, setInformalForm] = useState({
    creditorName: '', amount: '', dueDate: '', relationshipType: 'amigo', notes: ''
  });

  useEffect(() => { loadDebts(); }, []);

  const loadDebts = async () => {
    try {
      const res = await api.getDebts();
      setDebts(res.data.debts);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDebt = async (e) => {
    e.preventDefault();
    try {
      await api.createDebt({ ...form, type: 'formal', amount: Number(form.amount), minimumPayment: Number(form.minimumPayment), interestRate: Number(form.interestRate) });
      setShowForm(false);
      setForm({ creditorName: '', amount: '', minimumPayment: '', interestRate: '', dueDate: '', relationshipType: 'banco', notes: '' });
      loadDebts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInformal = async (e) => {
    e.preventDefault();
    try {
      await api.createInformalDebt({ ...informalForm, amount: Number(informalForm.amount) });
      setShowInformalForm(false);
      setInformalForm({ creditorName: '', amount: '', dueDate: '', relationshipType: 'amigo', notes: '' });
      loadDebts();
    } catch (err) {
      console.error(err);
    }
  };

  const formalDebts = debts.filter(d => d.type === 'formal');
  const informalDebts = debts.filter(d => d.type === 'informal');

  const modeColor = modeColors[user?.financialMode] || '#D4A017';

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Summary */}
      {summary && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Resumo</h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{summary.totalDebts} dividas</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total em divida</span>
              <p className="text-base font-bold" style={{ color: '#EF4444' }}>{formatCurrency(summary.totalOwed)}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ja pago</span>
              <p className="text-base font-bold" style={{ color: '#10B981' }}>{formatCurrency(summary.totalPaid)}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Em atraso</span>
              <p className="text-base font-bold" style={{ color: summary.overdueCount > 0 ? '#EF4444' : '#10B981' }}>
                {summary.overdueCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Debt Buttons */}
      <div className="flex gap-2">
        <button onClick={() => { setShowForm(true); setShowInformalForm(false); }}
          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          <CreditCard size={14} /> Divida Formal
        </button>
        <button onClick={() => { setShowInformalForm(true); setShowForm(false); }}
          className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(212,160,23,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.3)' }}>
          <Users size={14} /> Divida Informal
        </button>
      </div>

      {/* Formal Debt Form */}
      {showForm && (
        <form onSubmit={handleCreateDebt} className="glass-card p-4 space-y-3 animate-slide-up">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nova Divida Formal</h3>
          <input type="text" placeholder="Nome do credor" value={form.creditorName} onChange={e => setForm({...form, creditorName: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <input type="number" placeholder="Montante (EUR)" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Pagamento minimo" value={form.minimumPayment} onChange={e => setForm({...form, minimumPayment: e.target.value})}
              className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            <input type="number" placeholder="Taxa juro (%)" value={form.interestRate} onChange={e => setForm({...form, interestRate: e.target.value})}
              className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">Adicionar</button>
          </div>
        </form>
      )}

      {/* Informal Debt Form */}
      {showInformalForm && (
        <form onSubmit={handleCreateInformal} className="glass-card p-4 space-y-3 animate-slide-up">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
            <Users size={14} className="inline mr-1" /> Nova Divida Informal
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Emprestimo de amigo, familiar ou conhecido
          </p>
          <input type="text" placeholder="Nome da pessoa" value={informalForm.creditorName} onChange={e => setInformalForm({...informalForm, creditorName: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <input type="number" placeholder="Montante (EUR)" value={informalForm.amount} onChange={e => setInformalForm({...informalForm, amount: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <input type="date" value={informalForm.dueDate} onChange={e => setInformalForm({...informalForm, dueDate: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <select value={informalForm.relationshipType} onChange={e => setInformalForm({...informalForm, relationshipType: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <option value="amigo">Amigo</option>
            <option value="familia">Familia</option>
            <option value="senhorio">Senhorio</option>
            <option value="outro">Outro</option>
          </select>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowInformalForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">Adicionar</button>
          </div>
        </form>
      )}

      {/* Formal Debts List */}
      {formalDebts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>
            Dividas Formais
          </h3>
          <div className="space-y-2">
            {formalDebts.map(debt => (
              <div key={debt._id} className="glass-card p-4"
                onClick={() => setExpandedId(expandedId === debt._id ? null : debt._id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: debt.status === 'pago' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' }}>
                      {debt.status === 'pago' ? <Check size={16} style={{ color: '#10B981' }} /> :
                        <CreditCard size={16} style={{ color: '#EF4444' }} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{debt.creditorName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatCurrency(debt.remainingAmount || (debt.amount - debt.amountPaid))} restante
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: debt.status === 'pago' ? '#10B981' : '#EF4444' }}>
                      {formatCurrency(debt.amount)}
                    </p>
                    {debt.daysOverdue > 0 && (
                      <p className="text-[10px] flex items-center gap-1" style={{ color: '#EF4444' }}>
                        <AlertTriangle size={10} /> {debt.daysOverdue} dias em atraso
                      </p>
                    )}
                  </div>
                </div>
                {expandedId === debt._id && (
                  <div className="mt-3 pt-3 space-y-2 animate-fade-in" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>Pago</span>
                      <span style={{ color: '#10B981' }}>{formatCurrency(debt.amountPaid)}</span>
                    </div>
                    {debt.interestRate > 0 && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Taxa</span>
                        <span style={{ color: 'var(--text-primary)' }}>{debt.interestRate}%</span>
                      </div>
                    )}
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full transition-all" style={{
                        width: `${debt.amount > 0 ? (debt.amountPaid / debt.amount * 100) : 0}%`,
                        background: debt.status === 'pago' ? '#10B981' : '#EF4444'
                      }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Informal Debts List */}
      {informalDebts.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--gold)' }}>
            <Users size={12} className="inline mr-1" /> Dividas Informais
          </h3>
          <div className="space-y-2">
            {informalDebts.map(debt => (
              <div key={debt._id} className="glass-card p-4"
                style={{ borderLeft: `3px solid var(--gold)` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(212,160,23,0.15)' }}>
                      <Users size={16} style={{ color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{debt.creditorName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {debt.relationshipType} - {formatCurrency(debt.amount - debt.amountPaid)} restante
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    debt.status === 'pago' ? 'bg-green-900/30 text-green-400' :
                    debt.status === 'parcial' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {debt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && !loading && (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Sem dividas registadas. Adiciona acima.
          </p>
        </div>
      )}
    </div>
  );
}
