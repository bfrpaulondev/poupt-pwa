import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, Plus, BarChart3 } from 'lucide-react';

export default function Investments() {
  const { user } = useStore();
  const [investments, setInvestments] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'etf', quantity: '', avgPrice: '', currentPrice: '', platform: '', currency: 'EUR'
  });

  useEffect(() => { loadInvestments(); }, []);

  const loadInvestments = async () => {
    try {
      const res = await api.getInvestments();
      setInvestments(res.data.investments);
      setPortfolio(res.data.portfolio);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createInvestment({
        ...form, quantity: Number(form.quantity),
        avgPrice: Number(form.avgPrice), currentPrice: Number(form.currentPrice || form.avgPrice)
      });
      setShowForm(false);
      loadInvestments();
    } catch (err) {
      console.error(err);
    }
  };

  const typeLabels = {
    stock: 'Acao', etf: 'ETF', fund: 'Fundo', crypto: 'Crypto',
    real_estate: 'Imovel', ppr: 'PPR', other: 'Outro'
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Portfolio Summary */}
      {portfolio && (
        <div className="glass-card p-4">
          <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>Portfolio</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Valor Atual</span>
              <p className="text-lg font-bold" style={{ color: '#10B981' }}>{formatCurrency(portfolio.currentValue)}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ganho/Perda</span>
              <p className="text-lg font-bold"
                style={{ color: portfolio.totalProfitLoss >= 0 ? '#10B981' : '#EF4444' }}>
                {formatCurrency(portfolio.totalProfitLoss)}
              </p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Investido</span>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(portfolio.totalInvested)}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Dividendos</span>
              <p className="text-base font-semibold" style={{ color: 'var(--gold)' }}>{formatCurrency(portfolio.totalDividends)}</p>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowForm(!showForm)}
        className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
        <Plus size={14} /> Adicionar Investimento
      </button>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-4 space-y-3 animate-slide-up">
          <input type="text" placeholder="Nome do ativo (ex: VWCE ETF)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" placeholder="Quantidade" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required
              className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            <input type="number" placeholder="Preco medio" value={form.avgPrice} onChange={e => setForm({...form, avgPrice: e.target.value})} required
              className="px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <input type="text" placeholder="Plataforma (ex: Degiro)" value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">Adicionar</button>
          </div>
        </form>
      )}

      {/* Investments List */}
      <div className="space-y-2">
        {investments.map(inv => (
          <div key={inv._id} className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {typeLabels[inv.type]} - {inv.platform}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(inv.currentValue)}
                </p>
                <p className="text-xs" style={{ color: inv.profitLoss >= 0 ? '#10B981' : '#EF4444' }}>
                  {inv.profitLoss >= 0 ? '+' : ''}{formatCurrency(inv.profitLoss)} ({inv.profitLossPercent}%)
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {investments.length === 0 && !loading && (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Adiciona o teu primeiro investimento!
          </p>
        </div>
      )}
    </div>
  );
}
