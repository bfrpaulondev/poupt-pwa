import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, modeLabels, modeColors, categoryLabels } from '../utils/helpers';
import { TrendingUp, TrendingDown, CreditCard, Target, Trophy, Plus, AlertTriangle, ArrowRight, Shield, Flame } from 'lucide-react';

export default function Dashboard() {
  const { user, setScreen, getModeColor, getModeLabel, transactions, setTransactions } = useStore();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.getReportSummary();
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const modeColor = getModeColor();
  const modeLabel = getModeLabel();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl gold-gradient animate-pulse" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  const s = summary || {};

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Mode Banner */}
      <div className="p-4 rounded-2xl" style={{ background: `${modeColor}15`, border: `1px solid ${modeColor}30` }}>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold" style={{ color: modeColor }}>MODO</span>
            <h2 className="text-lg font-bold" style={{ color: modeColor }}>{modeLabel}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Balanço mensal</span>
            <p className="text-lg font-bold" style={{ color: s.balance >= 0 ? '#10B981' : '#EF4444' }}>
              {formatCurrency(s.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} style={{ color: '#10B981' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Receitas</span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#10B981' }}>{formatCurrency(s.income)}</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} style={{ color: '#EF4444' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Despesas</span>
          </div>
          <p className="text-lg font-bold" style={{ color: '#EF4444' }}>{formatCurrency(s.expenses)}</p>
        </div>
      </div>

      {/* 6 Frascos Preview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>6 Frascos</h3>
          <button onClick={() => setScreen('jars')} className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
            Ver detalhes
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {s.jarAllocations && Object.entries(s.jarAllocations).map(([key, amount]) => {
            const colors = { necessities: '#3B82F6', freedom: '#10B981', savings: '#F59E0B', education: '#8B5CF6', play: '#EF4444', give: '#EC4899' };
            const labels = { necessities: 'Necess.', freedom: 'Liberd.', savings: 'Poupanca', education: 'Educ.', play: 'Lazer', give: 'Doar' };
            const pct = s.jarPercentages?.[key] || 0;
            return (
              <div key={key} className="p-2 rounded-xl text-center" style={{ background: `${colors[key]}10` }}>
                <p className="text-xs font-medium" style={{ color: colors[key] }}>{labels[key]}</p>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(amount)}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Debt Summary - if in survival/recovery mode */}
      {['sobrevivencia', 'recuperacao'].includes(user?.financialMode) && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard size={16} style={{ color: '#EF4444' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dividas</h3>
            </div>
            <button onClick={() => setScreen('debts')} className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--gold)' }}>
              Gerir <ArrowRight size={12} />
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total em divida</span>
            <span className="text-base font-bold" style={{ color: '#EF4444' }}>{formatCurrency(s.totalDebt)}</span>
          </div>
          {s.overdueDebts > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle size={14} style={{ color: '#EF4444' }} />
              <span className="text-xs" style={{ color: '#EF4444' }}>
                {s.overdueDebts} divida{s.overdueDebts > 1 ? 's' : ''} em atraso
              </span>
            </div>
          )}
        </div>
      )}

      {/* Investment Summary - if in growth/prosperity mode */}
      {['crescimento', 'prosperidade'].includes(user?.financialMode) && s.investmentData && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} style={{ color: '#10B981' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Investimentos</h3>
            </div>
            <button onClick={() => setScreen('investments')} className="text-xs font-medium flex items-center gap-1"
              style={{ color: 'var(--gold)' }}>
              Ver <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Valor atual</span>
              <p className="text-base font-bold" style={{ color: '#10B981' }}>{formatCurrency(s.investmentData.currentValue)}</p>
            </div>
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Ganho/Perda</span>
              <p className="text-base font-bold"
                style={{ color: s.investmentData.profitLoss >= 0 ? '#10B981' : '#EF4444' }}>
                {formatCurrency(s.investmentData.profitLoss)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Survival Mode CTA */}
      {user?.financialMode === 'sobrevivencia' && (
        <button onClick={() => setScreen('survival')}
          className="w-full p-4 rounded-2xl flex items-center gap-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <Shield size={24} style={{ color: '#EF4444' }} />
          <div className="text-left flex-1">
            <p className="text-sm font-bold" style={{ color: '#EF4444' }}>Modo Sobrevivencia</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Acoes imediatas para estabilizar</p>
          </div>
          <ArrowRight size={16} style={{ color: '#EF4444' }} />
        </button>
      )}

      {/* Gamification */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Flame size={16} style={{ color: 'var(--gold)' }} />
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Streak</span>
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{user?.streak || 0} dias</p>
            </div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <Trophy size={16} style={{ color: 'var(--gold)' }} />
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Nivel</span>
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{user?.level || 1}</p>
            </div>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--border)' }} />
          <div className="flex items-center gap-2">
            <Target size={16} style={{ color: 'var(--gold)' }} />
            <div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>XP</span>
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>{user?.xp || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => setScreen('add-transaction')}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl gold-gradient shadow-lg flex items-center justify-center"
        style={{ boxShadow: '0 4px 20px rgba(212,160,23,0.4)' }}>
        <Plus size={24} color="white" />
      </button>
    </div>
  );
}
