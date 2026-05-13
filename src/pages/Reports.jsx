import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, categoryLabels, jarLabels, jarColors } from '../utils/helpers';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Calendar, PieChart as PieChartIcon, CreditCard, TrendingUp,
  TrendingDown, ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight
} from 'lucide-react';

const CHART_COLORS = ['var(--gold)', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#EC4899', '#F97316', '#64748B'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-2 rounded-xl text-xs" style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="p-2 rounded-xl text-xs" style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
      <p style={{ color: d.payload.fill || 'var(--gold)' }}>{formatCurrency(d.value)}</p>
    </div>
  );
};

export default function Reports() {
  const { user } = useStore();
  const [activeTab, setActiveTab] = useState('mensal');
  const [monthlyData, setMonthlyData] = useState(null);
  const [debtProgress, setDebtProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  useEffect(() => { loadData(); }, [selectedMonth]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [monthlyRes, debtRes] = await Promise.all([
        api.getReportMonthly(selectedMonth.month, selectedMonth.year).catch(() => null),
        api.getDebtProgress().catch(() => null)
      ]);
      if (monthlyRes?.data) setMonthlyData(monthlyRes.data);
      if (debtRes?.data) setDebtProgress(debtRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (dir) => {
    setSelectedMonth(prev => {
      let { month, year } = prev;
      month += dir;
      if (month > 12) { month = 1; year++; }
      if (month < 1) { month = 12; year--; }
      return { month, year };
    });
  };

  const monthName = new Date(selectedMonth.year, selectedMonth.month - 1, 1)
    .toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

  // Prepare chart data
  const incomeVsExpenses = monthlyData?.monthlyBreakdown || [];
  const categoryBreakdown = monthlyData?.categoryBreakdown || [];
  const jarsAllocation = monthlyData?.jarsAllocation || Object.entries(jarLabels).map(([key, label]) => ({
    jar: key, name: label, value: 0, percentage: 0
  }));
  const savingsRateTrend = monthlyData?.savingsRateTrend || [];
  const totalIncome = monthlyData?.totalIncome || 0;
  const totalExpenses = monthlyData?.totalExpenses || 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

  const tabs = [
    { id: 'mensal', label: 'Mensal', icon: Calendar },
    { id: 'categorias', label: 'Categorias', icon: PieChartIcon },
    { id: 'dividas', label: 'Dividas', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl gold-gradient gold-shimmer" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A carregar relatorios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Relatorios</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <span className="text-xs font-medium capitalize min-w-[100px] text-center"
            style={{ color: 'var(--text-primary)' }}>
            {monthName}
          </span>
          <button onClick={() => navigateMonth(1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="glass-card p-4 sm:p-5 text-center">
          <ArrowDownLeft size={14} className="mx-auto mb-1" style={{ color: '#10B981' }} />
          <p className="text-sm font-bold" style={{ color: '#10B981' }}>{formatCurrency(totalIncome)}</p>
          <p className="text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>Receitas</p>
        </div>
        <div className="glass-card p-4 sm:p-5 text-center">
          <ArrowUpRight size={14} className="mx-auto mb-1" style={{ color: '#EF4444' }} />
          <p className="text-sm font-bold" style={{ color: '#EF4444' }}>{formatCurrency(totalExpenses)}</p>
          <p className="text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>Despesas</p>
        </div>
        <div className="glass-card p-4 sm:p-5 text-center">
          <TrendingUp size={14} className="mx-auto mb-1" style={{ color: savingsRate >= 0 ? 'var(--gold)' : '#EF4444' }} />
          <p className="text-sm font-bold" style={{ color: savingsRate >= 0 ? 'var(--gold)' : '#EF4444' }}>
            {savingsRate.toFixed(1)}%
          </p>
          <p className="text-[9px] sm:text-[10px]" style={{ color: 'var(--text-muted)' }}>Poupanca</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2.5 sm:gap-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex-1 py-3 rounded-xl text-xs font-medium text-center transition-all flex items-center justify-center gap-1.5"
            style={{
              background: activeTab === id ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)',
              color: activeTab === id ? 'var(--gold)' : 'var(--text-secondary)',
              border: activeTab === id ? '1px solid rgba(255,215,0,0.4)' : '1px solid var(--border)'
            }}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Mensal Tab */}
      {activeTab === 'mensal' && (
        <div className="space-y-4">
          {/* Income vs Expenses Bar Chart */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Receitas vs Despesas
            </h3>
            {incomeVsExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={incomeVsExpenses} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, color: 'var(--text-secondary)' }} />
                  <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sem dados disponiveis</p>
              </div>
            )}
          </div>

          {/* 6 Jars Allocation Donut */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Alocacao dos 6 Frascos
            </h3>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={jarsAllocation.map(j => ({ name: j.name || jarLabels[j.jar] || j.jar, value: j.value || j.percentage || 0 }))}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value"
                  >
                    {jarsAllocation.map((entry, idx) => (
                      <Cell key={idx} fill={jarColors[entry.jar] || CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full">
                {jarsAllocation.map((j, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: jarColors[j.jar] || CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-[10px] sm:text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {j.name || jarLabels[j.jar] || j.jar}
                    </span>
                    <span className="text-[10px] sm:text-xs font-medium ml-auto" style={{ color: 'var(--text-primary)' }}>
                      {j.percentage?.toFixed(0) || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Savings Rate Trend */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Taxa de Poupanca
            </h3>
            {savingsRateTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={savingsRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={{ stroke: 'var(--border)' }}
                    unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="rate" name="Taxa de Poupanca" stroke="var(--gold)"
                    strokeWidth={2} dot={{ fill: 'var(--gold)', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sem historico disponivel</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Categorias Tab */}
      {activeTab === 'categorias' && (
        <div className="space-y-4">
          {/* Category Breakdown Pie */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Distribuicao por Categoria
            </h3>
            {categoryBreakdown.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.map(c => ({
                        name: categoryLabels[c.category] || c.category,
                        value: c.total || c.amount || 0
                      }))}
                      cx="50%" cy="50%" innerRadius={45} outerRadius={90}
                      paddingAngle={2} dataKey="value"
                    >
                      {categoryBreakdown.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 w-full">
                  {categoryBreakdown.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                      <span className="text-[10px] sm:text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
                        {categoryLabels[c.category] || c.category}
                      </span>
                      <span className="text-[10px] sm:text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(c.total || c.amount || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sem dados de categorias este mes</p>
              </div>
            )}
          </div>

          {/* Top Categories List */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Maiores Despesas
            </h3>
            {categoryBreakdown.length > 0 ? (
              <div className="space-y-3">
                {categoryBreakdown
                  .filter(c => (c.total || c.amount || 0) > 0)
                  .sort((a, b) => (b.total || b.amount || 0) - (a.total || a.amount || 0))
                  .slice(0, 5)
                  .map((c, idx) => {
                    const value = c.total || c.amount || 0;
                    const maxVal = categoryBreakdown.reduce((max, cat) =>
                      Math.max(max, cat.total || cat.amount || 0), 0);
                    const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {categoryLabels[c.category] || c.category}
                          </span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(value)}
                          </span>
                        </div>
                        <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                          <div className="h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                Sem despesas registadas este mes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dividas Tab */}
      {activeTab === 'dividas' && (
        <div className="space-y-4">
          {/* Debt Payoff Progress */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Progresso de Pagamento
            </h3>
            {debtProgress ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <span className="text-[10px] sm:text-xs block" style={{ color: 'var(--text-muted)' }}>Total em divida</span>
                    <p className="text-sm font-bold" style={{ color: '#EF4444' }}>
                      {formatCurrency(debtProgress.totalRemaining || debtProgress.totalDebt || 0)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                    <span className="text-[10px] sm:text-xs block" style={{ color: 'var(--text-muted)' }}>Ja pago</span>
                    <p className="text-sm font-bold" style={{ color: '#10B981' }}>
                      {formatCurrency(debtProgress.totalPaid || 0)}
                    </p>
                  </div>
                </div>

                {/* Overall Progress */}
                {debtProgress.totalDebt > 0 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Progresso geral</span>
                      <span className="font-semibold" style={{ color: '#10B981' }}>
                        {((debtProgress.totalPaid / debtProgress.totalDebt) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full rounded-full h-3" style={{ background: 'var(--border)' }}>
                      <div className="h-3 rounded-full transition-all gold-gradient"
                        style={{ width: `${Math.min(100, (debtProgress.totalPaid / debtProgress.totalDebt) * 100)}%` }} />
                    </div>
                  </div>
                )}

                {/* Individual debts */}
                {debtProgress.debts?.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Dividas individuais
                    </h4>
                    {debtProgress.debts.map((d, idx) => {
                      const paid = d.paid || d.amountPaid || 0;
                      const total = d.total || d.originalAmount || d.amount || 1;
                      const pct = Math.min(100, (paid / total) * 100);
                      return (
                        <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {d.creditorName || d.name || `Divida ${idx + 1}`}
                            </span>
                            <span style={{ color: '#10B981' }}>{pct.toFixed(0)}%</span>
                          </div>
                          <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                            <div className="h-2 rounded-full transition-all"
                              style={{ width: `${pct}%`, background: pct >= 100 ? '#10B981' : 'var(--gold)' }} />
                          </div>
                          <div className="flex justify-between text-[10px] sm:text-xs mt-1">
                            <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(paid)} pago</span>
                            <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(total)} total</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sem dividas registadas</p>
              </div>
            )}
          </div>

          {/* Snowball Strategy */}
          <div className="glass-card p-5 sm:p-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
              <TrendingDown size={16} /> Estrategia Snowball
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
              Paga primeiro as dividas menores para criar momento
            </p>
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,215,0,0.1)' }}>
              <p className="text-xs" style={{ color: 'var(--gold)' }}>
                Acede a estrategia detalhada na pagina de Dividas
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
