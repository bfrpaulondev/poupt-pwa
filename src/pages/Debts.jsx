import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, getDaysUntil, modeColors } from '../utils/helpers';
import {
  Plus, CreditCard, Users, ArrowDownLeft, Check, AlertTriangle,
  ChevronDown, ChevronUp, Snowflake, X, Banknote, Clock,
  TrendingDown, CircleDot, User
} from 'lucide-react';

export default function Debts() {
  const { user, setScreen } = useStore();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('formal');
  const [showForm, setShowForm] = useState(false);
  const [showInformalForm, setShowInformalForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [paymentDebtId, setPaymentDebtId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paying, setPaying] = useState(false);
  const [snowball, setSnowball] = useState(null);
  const [showSnowball, setShowSnowball] = useState(false);
  const [debtProgress, setDebtProgress] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];
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
      setErrorMsg('Erro ao carregar dividas. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadSnowball = async () => {
    try {
      const res = await api.getSnowballOrder();
      // Backend returns data.plan array, normalize to order
      const planData = res.data?.plan || res.data?.order || [];
      setSnowball({ order: planData, totalMinimumPayment: planData.reduce((s, d) => s + (d.minimumPayment || d.pagamentoMinimo || 0), 0) });
      setShowSnowball(true);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDebtProgress = async () => {
    try {
      const res = await api.getDebtProgress();
      setDebtProgress(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDebt = async (e) => {
    e.preventDefault();
    try {
      const debtData = {
        ...form,
        type: 'formal',
        amount: Number(form.amount),
        minimumPayment: Number(form.minimumPayment),
        interestRate: Number(form.interestRate)
      };
      // Only include dueDate if provided and valid
      if (!debtData.dueDate || debtData.dueDate === '') {
        delete debtData.dueDate;
      } else {
        debtData.dueDate = new Date(debtData.dueDate).toISOString();
      }
      await api.createDebt(debtData);
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
      const debtData = { ...informalForm, amount: Number(informalForm.amount) };
      if (!debtData.dueDate || debtData.dueDate === '') {
        delete debtData.dueDate;
      } else {
        debtData.dueDate = new Date(debtData.dueDate).toISOString();
      }
      await api.createInformalDebt(debtData);
      setShowInformalForm(false);
      setInformalForm({ creditorName: '', amount: '', dueDate: '', relationshipType: 'amigo', notes: '' });
      loadDebts();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayment = async (debtId) => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setPaying(true);
    try {
      await api.addDebtPayment(debtId, Number(paymentAmount), paymentNotes);
      setPaymentDebtId(null);
      setPaymentAmount('');
      setPaymentNotes('');
      loadDebts();
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  const formalDebts = debts.filter(d => d.type === 'formal');
  const informalDebts = debts.filter(d => d.type === 'informal');
  const activeDebts = activeTab === 'formal' ? formalDebts : informalDebts;

  const modeColor = modeColors[user?.financialMode] || 'var(--gold)';

  const getDebtProgress = (debt) => {
    if (!debt.amount || debt.amount === 0) return 0;
    const paid = debt.amountPaid || 0;
    return Math.min(100, (paid / debt.amount) * 100);
  };

  const getRemaining = (debt) => {
    return debt.remainingAmount || (debt.amount - (debt.amountPaid || 0));
  };

  const isOverdue = (debt) => {
    if (!debt.dueDate || debt.status === 'pago') return false;
    return getDaysUntil(debt.dueDate) < 0;
  };


  return (
    <div className="px-4 xs:px-5 sm:px-8 py-4 xs:py-5 sm:py-6 space-y-5 animate-fade-in">
      <button onClick={() => setScreen('dashboard')}
        className="flex items-center gap-1 mb-3 text-xs font-medium"
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
      {summary && (
        <div className="glass-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Resumo</h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {summary.totalDebts} divida{summary.totalDebts !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
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
          {summary.totalOwed > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Progresso geral</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {summary.totalOwed > 0 ? ((summary.totalPaid / (summary.totalOwed + summary.totalPaid)) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{
                    width: `${summary.totalOwed > 0 ? (summary.totalPaid / (summary.totalOwed + summary.totalPaid)) * 100 : 0}%`,
                    background: '#10B981'
                  }} />
              </div>
            </div>
          )}
        </div>
      )}

      {summary && summary.overdueCount > 0 && (
        <div className="p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
          <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
            {summary.overdueCount} divida{summary.overdueCount > 1 ? 's' : ''} em atraso - prioriza estes pagamentos
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => { setActiveTab('formal'); setShowForm(false); setShowInformalForm(false); }}
          className="flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-medium transition-all text-center min-h-[44px]"
          style={{
            background: activeTab === 'formal' ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
            color: activeTab === 'formal' ? '#EF4444' : 'var(--text-secondary)',
            border: activeTab === 'formal' ? '1px solid #EF4444' : '1px solid var(--border)'
          }}>
          <CreditCard size={12} className="inline mr-1" /> Formais ({formalDebts.length})
        </button>
        <button onClick={() => { setActiveTab('informal'); setShowForm(false); setShowInformalForm(false); }}
          className="flex-1 py-2.5 sm:py-3 rounded-xl text-xs font-medium transition-all text-center min-h-[44px]"
          style={{
            background: activeTab === 'informal' ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)',
            color: activeTab === 'informal' ? 'var(--gold)' : 'var(--text-secondary)',
            border: activeTab === 'informal' ? '1px solid var(--gold)' : '1px solid var(--border)'
          }}>
          <Users size={12} className="inline mr-1" /> Informais ({informalDebts.length})
        </button>
      </div>

      {activeTab === 'formal' && (
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(!showForm); setShowInformalForm(false); }}
            className="flex-1 py-3 sm:py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            <Plus size={14} /> Divida Formal
          </button>
          <button onClick={loadSnowball}
            className="px-4 py-3 sm:py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
            <Snowflake size={14} /> Snowball
          </button>
        </div>
      )}

      {activeTab === 'informal' && (
        <button onClick={() => { setShowInformalForm(!showInformalForm); setShowForm(false); }}
          className="w-full py-3 sm:py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
          style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.3)' }}>
          <Plus size={14} /> Divida Informal
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreateDebt} className="glass-card p-4 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Nova Divida Formal</h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <input type="text" placeholder="Nome do credor (ex: Banco CTT)" value={form.creditorName}
            onChange={e => setForm({...form, creditorName: e.target.value})} required
            className="w-full input-field" />
          <input type="number" placeholder="Montante total (EUR)" value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})} required min="0.01" step="0.01"
            className="w-full input-field" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Pagamento minimo" value={form.minimumPayment}
              onChange={e => setForm({...form, minimumPayment: e.target.value})} min="0" step="0.01"
              className="input-field" />
            <input type="number" placeholder="Taxa juro (%)" value={form.interestRate}
              onChange={e => setForm({...form, interestRate: e.target.value})} min="0" step="0.01"
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Data limite</label>
              <input type="date" value={form.dueDate || ''} min={today} onChange={e => setForm({...form, dueDate: e.target.value})}
                className="w-full input-field" placeholder="Opcional" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Tipo</label>
              <select value={form.relationshipType} onChange={e => setForm({...form, relationshipType: e.target.value})}
                className="w-full input-field">
                <option value="banco">Banco</option>
                <option value="credito">Cartao Credito</option>
                <option value="financiamento">Financiamento</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
          <textarea placeholder="Notas (opcional)" value={form.notes}
            onChange={e => setForm({...form, notes: e.target.value})}
            rows={2} className="w-full input-field resize-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">
              Adicionar
            </button>
          </div>
        </form>
      )}

      {showInformalForm && (
        <form onSubmit={handleCreateInformal} className="glass-card p-4 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
              <Users size={14} className="inline mr-1" /> Nova Divida Informal
            </h3>
            <button type="button" onClick={() => setShowInformalForm(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Emprestimo de amigo, familiar ou conhecido
          </p>
          <input type="text" placeholder="Nome da pessoa" value={informalForm.creditorName}
            onChange={e => setInformalForm({...informalForm, creditorName: e.target.value})} required
            className="w-full input-field" />
          <input type="number" placeholder="Montante (EUR)" value={informalForm.amount}
            onChange={e => setInformalForm({...informalForm, amount: e.target.value})} required min="0.01" step="0.01"
            className="w-full input-field" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Data limite</label>
              <input type="date" value={informalForm.dueDate}
                onChange={e => setInformalForm({...informalForm, dueDate: e.target.value})}
                className="w-full input-field" />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Relacao</label>
              <select value={informalForm.relationshipType}
                onChange={e => setInformalForm({...informalForm, relationshipType: e.target.value})}
                className="w-full input-field">
                <option value="amigo">Amigo</option>
                <option value="familia">Familia</option>
                <option value="senhorio">Senhorio</option>
                <option value="colega">Colega</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>
          <textarea placeholder="Notas (opcional)" value={informalForm.notes}
            onChange={e => setInformalForm({...informalForm, notes: e.target.value})}
            rows={2} className="w-full input-field resize-none" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowInformalForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">
              Adicionar
            </button>
          </div>
        </form>
      )}

      {showSnowball && snowball && (
        <div className="glass-card p-4 sm:p-5 space-y-3 sm:space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#10B981' }}>
              <Snowflake size={16} /> Metodo Snowball
            </h3>
            <button onClick={() => setShowSnowball(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Paga a divida menor primeiro para ganhar momentum
          </p>
          {snowball.order && snowball.order.length > 0 ? (
            <div className="space-y-2">
              {snowball.order.map((debt, idx) => {
                const remaining = debt.remaining || debt.remainingAmount || (debt.totalAmount - (debt.amountPaid || 0)) || 0;
                return (
                <div key={debt._id || debt.debt || idx} className="flex items-center gap-3 p-2 sm:p-3 rounded-xl"
                  style={{ background: idx === 0 ? 'rgba(16,185,129,0.1)' : 'transparent', border: idx === 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: idx === 0 ? '#10B981' : 'var(--bg-secondary)', color: idx === 0 ? 'white' : 'var(--text-secondary)' }}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{debt.creditorName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(remaining)} restante
                    </p>
                  </div>
                  {idx === 0 && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
                      Prioridade
                    </span>
                  )}
                </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Nenhuma divida para ordenar
            </p>
          )}
          {snowball.totalMinimumPayment > 0 && (
            <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Pagamento minimo total</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(snowball.totalMinimumPayment)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {activeTab === 'formal' && formalDebts.map(debt => {
          const progress = getDebtProgress(debt);
          const remaining = getRemaining(debt);
          const overdue = isOverdue(debt);
          const daysLeft = getDaysUntil(debt.dueDate);

          return (
            <div key={debt._id} className="glass-card p-4 sm:p-5"
              style={{ borderLeft: overdue ? '3px solid #EF4444' : debt.status === 'pago' ? '3px solid #10B981' : '3px solid transparent' }}>
              <div className="flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === debt._id ? null : debt._id)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: debt.status === 'pago' ? 'rgba(16,185,129,0.15)' : overdue ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }}>
                    {debt.status === 'pago' ? <Check size={18} style={{ color: '#10B981' }} /> :
                      overdue ? <AlertTriangle size={18} style={{ color: '#EF4444' }} /> :
                        <CreditCard size={18} style={{ color: '#EF4444' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{debt.creditorName}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {debt.status === 'pago' ? 'Pago' : `${formatCurrency(remaining)} restante`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: debt.status === 'pago' ? '#10B981' : '#EF4444' }}>
                    {formatCurrency(debt.amount)}
                  </p>
                  {overdue && (
                    <p className="text-xs flex items-center gap-1 justify-end" style={{ color: '#EF4444' }}>
                      <AlertTriangle size={10} /> {Math.abs(daysLeft)} dias em atraso
                    </p>
                  )}
                  {!overdue && daysLeft !== null && daysLeft >= 0 && debt.status !== 'pago' && (
                    <p className="text-xs flex items-center gap-1 justify-end" style={{ color: 'var(--text-muted)' }}>
                      <Clock size={10} /> {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {debt.status !== 'pago' && (
                <div className="mt-3">
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${progress}%`, background: progress >= 75 ? '#10B981' : progress >= 40 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: '#10B981' }}>{formatCurrency(debt.amountPaid || 0)} pago</span>
                    <span style={{ color: 'var(--text-muted)' }}>{progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {expandedId === debt._id && (
                <div className="mt-3 pt-3 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    {debt.interestRate > 0 && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Taxa</span>
                        <span style={{ color: 'var(--text-primary)' }}>{debt.interestRate}%</span>
                      </div>
                    )}
                    {debt.minimumPayment > 0 && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Pag. minimo</span>
                        <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(debt.minimumPayment)}</span>
                      </div>
                    )}
                    {debt.dueDate && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Limite</span>
                        <span style={{ color: overdue ? '#EF4444' : 'var(--text-primary)' }}>{formatDate(debt.dueDate)}</span>
                      </div>
                    )}
                    {debt.relationshipType && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Tipo</span>
                        <span style={{ color: 'var(--text-primary)' }}>{debt.relationshipType}</span>
                      </div>
                    )}
                  </div>
                  {debt.notes && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{debt.notes}</p>
                  )}
                  {debt.status !== 'pago' && (
                    <div>
                      {paymentDebtId === debt._id ? (
                        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                          <input type="number" placeholder="Montante a pagar (EUR)" value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)} min="0.01" step="0.01"
                            className="w-full input-field" />
                          <input type="text" placeholder="Notas (opcional)" value={paymentNotes}
                            onChange={e => setPaymentNotes(e.target.value)}
                            className="w-full input-field" />
                          <div className="flex gap-2">
                            <button onClick={() => { setPaymentDebtId(null); setPaymentAmount(''); setPaymentNotes(''); }}
                              className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              Cancelar
                            </button>
                            <button onClick={() => handlePayment(debt._id)} disabled={paying || !paymentAmount}
                              className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-1">
                              <Banknote size={12} /> {paying ? 'A pagar...' : 'Registar Pagamento'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setPaymentDebtId(debt._id)}
                          className="w-full py-2.5 sm:py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <Banknote size={12} /> Registar Pagamento
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {activeTab === 'informal' && informalDebts.map(debt => {
          const progress = getDebtProgress(debt);
          const remaining = getRemaining(debt);
          const overdue = isOverdue(debt);

          return (
            <div key={debt._id} className="glass-card p-4 sm:p-5"
              style={{ borderLeft: overdue ? '3px solid #EF4444' : '3px solid var(--gold)' }}>
              <div className="flex items-center justify-between"
                onClick={() => setExpandedId(expandedId === debt._id ? null : debt._id)}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: debt.status === 'pago' ? 'rgba(16,185,129,0.15)' : 'rgba(255,215,0,0.15)' }}>
                    {debt.status === 'pago' ? <Check size={18} style={{ color: '#10B981' }} /> :
                      <User size={18} style={{ color: 'var(--gold)' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: debt.status === 'pago' ? '#10B981' : 'var(--gold)' }}>
                      {debt.creditorName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {debt.relationshipType} - {debt.status === 'pago' ? 'Pago' : `${formatCurrency(remaining)} restante`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    debt.status === 'pago' ? 'bg-green-900/30 text-green-400' :
                    overdue ? 'bg-red-900/30 text-red-400' :
                    'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {debt.status === 'pago' ? 'Pago' : debt.status === 'parcial' ? 'Parcial' : 'Por pagar'}
                  </span>
                  {overdue && (
                    <p className="text-xs mt-1 flex items-center gap-1 justify-end" style={{ color: '#EF4444' }}>
                      <AlertTriangle size={10} /> Em atraso
                    </p>
                  )}
                </div>
              </div>

              {debt.status !== 'pago' && (
                <div className="mt-3">
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                    <div className="h-2 rounded-full transition-all"
                      style={{ width: `${progress}%`, background: 'var(--gold)' }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span style={{ color: 'var(--gold)' }}>{formatCurrency(debt.amountPaid || 0)} pago</span>
                    <span style={{ color: 'var(--text-muted)' }}>{progress.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {expandedId === debt._id && (
                <div className="mt-3 pt-3 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                      <span style={{ color: 'var(--text-primary)' }}>{formatCurrency(debt.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>Pago</span>
                      <span style={{ color: '#10B981' }}>{formatCurrency(debt.amountPaid || 0)}</span>
                    </div>
                    {debt.dueDate && (
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-secondary)' }}>Limite</span>
                        <span style={{ color: overdue ? '#EF4444' : 'var(--text-primary)' }}>{formatDate(debt.dueDate)}</span>
                      </div>
                    )}
                  </div>
                  {debt.notes && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{debt.notes}</p>
                  )}
                  {debt.status !== 'pago' && (
                    <div>
                      {paymentDebtId === debt._id ? (
                        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                          <input type="number" placeholder="Montante a pagar (EUR)" value={paymentAmount}
                            onChange={e => setPaymentAmount(e.target.value)} min="0.01" step="0.01"
                            className="w-full input-field" />
                          <input type="text" placeholder="Notas (opcional)" value={paymentNotes}
                            onChange={e => setPaymentNotes(e.target.value)}
                            className="w-full input-field" />
                          <div className="flex gap-2">
                            <button onClick={() => { setPaymentDebtId(null); setPaymentAmount(''); setPaymentNotes(''); }}
                              className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              Cancelar
                            </button>
                            <button onClick={() => handlePayment(debt._id)} disabled={paying || !paymentAmount}
                              className="flex-1 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-1">
                              <Banknote size={12} /> {paying ? 'A pagar...' : 'Registar Pagamento'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setPaymentDebtId(debt._id)}
                          className="w-full py-2.5 sm:py-3 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
                          style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.3)' }}>
                          <Banknote size={12} /> Registar Pagamento
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {debts.length === 0 && !loading && (
        <div className="text-center py-12">
          <CreditCard size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Sem dividas registadas
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Adiciona acima para comecar a controlar
          </p>
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
