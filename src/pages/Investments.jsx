import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import {
  TrendingUp, TrendingDown, Plus, BarChart3, Trash2, X,
  Building2, Bitcoin, Landmark, Home, PiggyBank, Lock,
  ChevronDown, ChevronUp, Coins, Crown, Percent
} from 'lucide-react';

const typeLabels = {
  stock: 'Acoes', etf: 'ETFs', fund: 'Fundos', crypto: 'Crypto',
  real_estate: 'Imoveis', ppr: 'PPR', other: 'Outro'
};

const typeIcons = {
  stock: TrendingUp, etf: BarChart3, fund: Landmark, crypto: Bitcoin,
  real_estate: Home, ppr: PiggyBank, other: Building2
};

const typeColors = {
  stock: '#3B82F6', etf: '#10B981', fund: '#8B5CF6', crypto: '#F59E0B',
  real_estate: '#EF4444', ppr: '#EC4899', other: '#64748B'
};

const inputStyle = {
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)'
};

export default function Investments() {
  const { user } = useStore();
  const [investments, setInvestments] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'etf', quantity: '', avgPrice: '', currentPrice: '', platform: '', currency: 'EUR',
    dividendPerShare: ''
  });

  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

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
      const data = {
        ...form,
        quantity: Number(form.quantity),
        avgPrice: Number(form.avgPrice),
        currentPrice: Number(form.currentPrice || form.avgPrice),
        dividendPerShare: form.dividendPerShare ? Number(form.dividendPerShare) : 0
      };
      await api.createInvestment(data);
      setShowForm(false);
      setForm({ name: '', type: 'etf', quantity: '', avgPrice: '', currentPrice: '', platform: '', currency: 'EUR', dividendPerShare: '' });
      loadInvestments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    setDeleting(true);
    try {
      await api.deleteInvestment(id);
      setDeleteConfirmId(null);
      loadInvestments();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl gold-gradient animate-pulse" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A carregar investimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Premium Notice for free users */}
      {!isPremium && (
        <div className="p-4 rounded-2xl flex items-center gap-3"
          style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)' }}>
          <Crown size={20} style={{ color: 'var(--gold)' }} />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Funcionalidade Premium</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Investimentos avancados e dividendos disponiveis no plano Premium
            </p>
          </div>
          <Lock size={16} style={{ color: 'var(--gold)' }} />
        </div>
      )}

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
                {portfolio.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(portfolio.totalProfitLoss)}
              </p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Investido</span>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(portfolio.totalInvested)}
              </p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Dividendos</span>
              <p className="text-base font-semibold" style={{ color: 'var(--gold)' }}>
                {formatCurrency(portfolio.totalDividends)}
              </p>
            </div>
          </div>
          {portfolio.totalInvested > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--text-secondary)' }}>Rentabilidade</span>
                <span className="font-semibold"
                  style={{ color: portfolio.totalProfitLoss >= 0 ? '#10B981' : '#EF4444' }}>
                  {((portfolio.totalProfitLoss / portfolio.totalInvested) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, 50 + (portfolio.totalProfitLoss / portfolio.totalInvested) * 50))}%`,
                    background: portfolio.totalProfitLoss >= 0 ? '#10B981' : '#EF4444'
                  }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Investment Button */}
      <button onClick={() => setShowForm(!showForm)}
        className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
        <Plus size={14} /> Adicionar Investimento
      </button>

      {/* Add Investment Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass-card p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Novo Investimento
            </h3>
            <button type="button" onClick={() => setShowForm(false)}>
              <X size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>

          <input type="text" placeholder="Nome do ativo (ex: VWCE ETF)" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />

          <div>
            <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Tipo de ativo</label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(typeLabels).filter(([k]) => k !== 'other').map(([key, label]) => {
                const Icon = typeIcons[key];
                return (
                  <button key={key} type="button" onClick={() => setForm({...form, type: key})}
                    className="py-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1"
                    style={{
                      background: form.type === key ? `${typeColors[key]}15` : 'var(--bg-secondary)',
                      color: form.type === key ? typeColors[key] : 'var(--text-muted)',
                      border: form.type === key ? `1px solid ${typeColors[key]}` : '1px solid var(--border)'
                    }}>
                    <Icon size={14} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Quantidade</label>
              <input type="number" placeholder="0" value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})} required min="0.01" step="0.01"
                className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Preco medio</label>
              <input type="number" placeholder="0.00 EUR" value={form.avgPrice}
                onChange={e => setForm({...form, avgPrice: e.target.value})} required min="0.01" step="0.01"
                className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Preco atual</label>
              <input type="number" placeholder="0.00 EUR" value={form.currentPrice}
                onChange={e => setForm({...form, currentPrice: e.target.value})} min="0.01" step="0.01"
                className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-medium mb-1 block" style={{ color: 'var(--text-muted)' }}>Dividendo/acao</label>
              <input type="number" placeholder="0.00 EUR" value={form.dividendPerShare}
                onChange={e => setForm({...form, dividendPerShare: e.target.value})} min="0" step="0.01"
                className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />
            </div>
          </div>

          <input type="text" placeholder="Plataforma (ex: Degiro, Interactive Brokers)" value={form.platform}
            onChange={e => setForm({...form, platform: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 rounded-xl text-sm"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white gold-gradient">
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Investments List */}
      <div className="space-y-2">
        {investments.map(inv => {
          const TypeIcon = typeIcons[inv.type] || Building2;
          const typeColor = typeColors[inv.type] || '#64748B';
          const totalDividends = (inv.dividendPerShare || 0) * inv.quantity;
          const isExpanded = expandedId === inv._id;
          const isDeleteConfirm = deleteConfirmId === inv._id;

          return (
            <div key={inv._id} className="glass-card p-4"
              style={{ borderLeft: `3px solid ${inv.profitLoss >= 0 ? '#10B981' : '#EF4444'}` }}>
              <div className="flex items-center gap-3"
                onClick={() => { setExpandedId(isExpanded ? null : inv._id); setDeleteConfirmId(null); }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${typeColor}15` }}>
                  <TypeIcon size={18} style={{ color: typeColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {inv.name}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: `${typeColor}15`, color: typeColor }}>
                      {typeLabels[inv.type] || inv.type}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {inv.quantity} x {formatCurrency(inv.avgPrice)} {inv.platform ? `- ${inv.platform}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(inv.currentValue)}
                  </p>
                  <p className="text-xs font-semibold"
                    style={{ color: inv.profitLoss >= 0 ? '#10B981' : '#EF4444' }}>
                    {inv.profitLoss >= 0 ? '+' : ''}{formatCurrency(inv.profitLoss)}
                  </p>
                </div>
                {isExpanded
                  ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                  : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                }
              </div>

              {/* Profit/Loss bar */}
              {inv.avgPrice > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {inv.profitLossPercent >= 0 ? '+' : ''}{inv.profitLossPercent?.toFixed(1) || 0}%
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(inv.avgPrice)} {'→'} {formatCurrency(inv.currentPrice)}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                    <div className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(5, 50 + (inv.profitLossPercent || 0) * 0.5))}%`,
                        background: inv.profitLoss >= 0 ? '#10B981' : '#EF4444'
                      }} />
                  </div>
                </div>
              )}

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-3 pt-3 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Investido</span>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(inv.quantity * inv.avgPrice)}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                      <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Valor atual</span>
                      <p className="text-xs font-semibold" style={{ color: '#10B981' }}>
                        {formatCurrency(inv.currentValue)}
                      </p>
                    </div>
                    {totalDividends > 0 && (
                      <div className="p-2 rounded-xl" style={{ background: 'rgba(212,160,23,0.1)' }}>
                        <span className="text-[10px] block" style={{ color: 'var(--gold)' }}>
                          <Percent size={8} className="inline mr-0.5" />Dividendos
                        </span>
                        <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>
                          {formatCurrency(totalDividends)}
                        </p>
                        <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                          {formatCurrency(inv.dividendPerShare)}/acao
                        </span>
                      </div>
                    )}
                    {inv.platform && (
                      <div className="p-2 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                        <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Plataforma</span>
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.platform}</p>
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <div>
                    {isDeleteConfirm ? (
                      <div className="flex gap-2">
                        <button onClick={() => setDeleteConfirmId(null)}
                          className="flex-1 py-2 rounded-xl text-xs"
                          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                          Cancelar
                        </button>
                        <button onClick={() => handleDelete(inv._id)} disabled={deleting}
                          className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' }}>
                          <Trash2 size={12} /> {deleting ? 'A eliminar...' : 'Confirmar'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirmId(inv._id)}
                        className="w-full py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                        style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        <Trash2 size={12} /> Eliminar investimento
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {investments.length === 0 && !loading && (
        <div className="text-center py-12">
          <BarChart3 size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Adiciona o teu primeiro investimento!
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Acompanha acoes, ETFs, crypto e muito mais
          </p>
        </div>
      )}
    </div>
  );
}
