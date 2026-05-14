import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, formatDate, modeColors, modeLabels } from '../utils/helpers';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Bot,
  Camera,
  ChevronRight,
  Coins,
  CreditCard,
  Plus,
  RefreshCw,
  Shield,
  Target,
  Wallet,
} from 'lucide-react';

const jarDefinitions = [
  { key: 'necessities', label: 'Necessidades', shortLabel: 'Necess.', icon: '🏠', color: '#3B82F6' },
  { key: 'freedom', label: 'Liberdade financeira', shortLabel: 'Livre', icon: '🏦', color: '#10B981' },
  { key: 'savings', label: 'Poupança longo prazo', shortLabel: 'Poup.', icon: '🏛️', color: '#F59E0B' },
  { key: 'education', label: 'Educação', shortLabel: 'Edu.', icon: '📚', color: '#8B5CF6' },
  { key: 'play', label: 'Lazer', shortLabel: 'Lazer', icon: '🎮', color: '#EF4444' },
  { key: 'give', label: 'Doar', shortLabel: 'Doar', icon: '💝', color: '#EC4899' },
];

const quickActions = [
  { icon: Plus, label: 'Adicionar', description: 'Nova transação', screen: 'addTransaction' },
  { icon: BarChart3, label: 'Relatórios', description: 'Analisar mês', screen: 'reports' },
  { icon: Target, label: 'Metas', description: 'Planear objetivos', screen: 'goals' },
  { icon: Camera, label: 'Scanner', description: 'Usar moedas', screen: 'poupMoedas' },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

const isIncomeTransaction = (transaction) => {
  return transaction?.type === 'income' || transaction?.type === 'receita';
};

function LoadingState() {
  return (
    <div className="min-h-[360px] w-full flex items-center justify-center px-6">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl gold-gradient gold-shimmer" />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          A carregar painel financeiro...
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone = 'default', footer }) {
  const toneColor = {
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    default: 'var(--gold)',
  }[tone];

  return (
    <div className="rounded-3xl p-4 sm:p-5 lg:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </p>
          <p className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight break-words" style={{ color: toneColor }}>
            {value}
          </p>
        </div>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${toneColor}18` }}>
          <Icon size={20} style={{ color: toneColor }} />
        </div>
      </div>
      {footer && (
        <p className="mt-3 text-[11px] sm:text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {footer}
        </p>
      )}
    </div>
  );
}

function QuickActionCard({ action, onNavigate }) {
  const Icon = action.icon;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(action.screen)}
      className="group rounded-3xl p-4 sm:p-5 text-left transition-all duration-200"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Icon size={20} style={{ color: 'var(--gold)' }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {action.label}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {action.description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function JarCard({ jar }) {
  return (
    <div className="rounded-2xl p-3 sm:p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{jar.icon}</span>
          <span className="text-xs sm:text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {jar.shortLabel}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-black shrink-0" style={{ color: jar.color }}>
          {jar.percentage}%
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(jar.percentage, 100)}%`, background: jar.color }} />
      </div>
      <p className="mt-2 text-[11px] sm:text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        {formatCurrency(jar.allocated)}
      </p>
    </div>
  );
}

function TransactionItem({ transaction }) {
  const isIncome = isIncomeTransaction(transaction);
  const color = isIncome ? '#10B981' : '#EF4444';
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
          {transaction.description || 'Transação'}
        </p>
        <p className="mt-1 text-xs leading-relaxed truncate" style={{ color: 'var(--text-muted)' }}>
          {transaction.category || 'Sem categoria'}
          {transaction.jar ? ` • ${transaction.jar}` : ''}
          {transaction.date ? ` • ${formatDate(transaction.date)}` : ''}
        </p>
      </div>
      <p className="text-sm sm:text-base font-black shrink-0" style={{ color }}>
        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0))}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { user, setScreen } = useStore();

  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdueDebts, setOverdueDebts] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [summaryRes, txRes, debtRes] = await Promise.allSettled([
        api.getReportSummary(),
        api.getTransactions('?limit=5'),
        api.getDebts(),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      }

      if (txRes.status === 'fulfilled' && txRes.value?.data) {
        const txs = txRes.value.data.transactions || txRes.value.data || [];
        setRecentTransactions(Array.isArray(txs) ? txs.slice(0, 5) : []);
      }

      if (debtRes.status === 'fulfilled') {
        setOverdueDebts(debtRes.value?.data?.summary?.overdueCount || 0);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('poupt-refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('poupt-refresh-dashboard', handleRefresh);
  }, [loadDashboardData]);

  const jars = useMemo(() => {
    const defaultJars = useStore.getState().defaultJarPercentages;
    const jarPercentages = user?.jarPercentages || defaultJars;
    const income = user?.income || summary?.totalIncome || summary?.income || 0;

    return jarDefinitions.map((jar) => ({
      ...jar,
      percentage: jarPercentages[jar.key] || 0,
      allocated: income * ((jarPercentages[jar.key] || 0) / 100),
    }));
  }, [summary?.income, summary?.totalIncome, user?.income, user?.jarPercentages]);

  const totalIncome = summary?.totalIncome ?? summary?.income ?? 0;
  const totalExpenses = summary?.totalExpenses ?? summary?.expenses ?? 0;
  const available = totalIncome - totalExpenses;
  const spentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? ((available / totalIncome) * 100) : 0;

  const modeColor = modeColors[user?.financialMode] || modeColors.sobrevivencia;
  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivência';
  const userName = user?.name ? user.name.split(' ')[0] : 'amigo';

  const progressColor = spentPercent > 85 ? '#EF4444' : spentPercent > 65 ? '#F59E0B' : '#10B981';

  if (loading) return <LoadingState />;

  return (
    <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1440px] space-y-6 sm:space-y-8 lg:space-y-10">
        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] gap-6 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[32px] p-5 sm:p-7 lg:p-8 min-h-[330px] flex flex-col justify-between"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
          >
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 18% 20%, white 0%, transparent 32%), radial-gradient(circle at 90% 12%, white 0%, transparent 24%)' }} />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black text-black/75" style={{ background: 'rgba(255,255,255,0.28)' }}>
                  <Shield size={13} />
                  {modeLabel}
                </div>

                <h1 className="mt-5 text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-tight text-black">
                  {getGreeting()}, {userName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-black/70">
                  Visão geral do teu mês financeiro. Mantém o controlo entre receitas, despesas, frascos e metas.
                </p>
              </div>

              <button
                type="button"
                onClick={loadDashboardData}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-black transition-transform active:scale-95"
                style={{ background: 'rgba(255,255,255,0.32)' }}
              >
                <RefreshCw size={16} />
                Atualizar
              </button>
            </div>

            <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="rounded-3xl p-4 sm:p-5" style={{ background: 'rgba(0,0,0,0.14)' }}>
                <p className="text-xs font-bold text-black/65">Disponível</p>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-black tracking-tight">
                  {formatCurrency(available)}
                </p>
              </div>

              <div className="rounded-3xl p-4 sm:p-5" style={{ background: 'rgba(255,255,255,0.22)' }}>
                <p className="text-xs font-bold text-black/65">PoupMoedas</p>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-black tracking-tight">
                  {user?.poupMoedas || 0}
                </p>
              </div>

              <div className="rounded-3xl p-4 sm:p-5" style={{ background: 'rgba(255,255,255,0.22)' }}>
                <p className="text-xs font-bold text-black/65">Streak</p>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-black tracking-tight">
                  {user?.streak || 0} dias
                </p>
              </div>
            </div>
          </motion.div>

          <aside className="space-y-4 sm:space-y-5 lg:space-y-6">
            {overdueDebts > 0 && (
              <motion.button
                type="button"
                onClick={() => setScreen('survival')}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-3xl p-5 text-left survival-pulse"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.32)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.18)' }}>
                    <AlertTriangle size={22} style={{ color: '#EF4444' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-black" style={{ color: '#EF4444' }}>
                      Modo sobrevivência ativo
                    </p>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {overdueDebts} dívida{overdueDebts > 1 ? 's' : ''} em atraso. Prioriza estes pagamentos.
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: '#EF4444' }} />
                </div>
              </motion.button>
            )}

            <div className="rounded-[28px] p-5 sm:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                    Gastos do mês
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                    {formatCurrency(totalExpenses)} de {formatCurrency(totalIncome)}
                  </p>
                </div>
                <span className="text-sm font-black" style={{ color: progressColor }}>
                  {spentPercent.toFixed(0)}%
                </span>
              </div>

              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(spentPercent, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: progressColor }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Taxa de poupança</p>
                  <p className="mt-1 text-lg font-black" style={{ color: savingsRate >= 0 ? '#10B981' : '#EF4444' }}>
                    {savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-2xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Última atualização</p>
                  <p className="mt-1 text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                    {lastUpdated ? lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          <StatCard icon={ArrowDownLeft} label="Receitas" value={formatCurrency(totalIncome)} tone="success" footer="Total recebido no período atual." />
          <StatCard icon={ArrowUpRight} label="Despesas" value={formatCurrency(totalExpenses)} tone="danger" footer="Total registado como saída." />
          <StatCard icon={Wallet} label="Saldo disponível" value={formatCurrency(available)} tone={available >= 0 ? 'default' : 'danger'} footer="Receitas menos despesas." />
          <StatCard icon={CreditCard} label="Dívidas em atraso" value={String(overdueDebts)} tone={overdueDebts > 0 ? 'danger' : 'success'} footer="Pagamentos que exigem atenção." />
        </section>

        <section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                Ações rápidas
              </h2>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                As operações principais com espaçamento confortável em mobile, tablet e desktop.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
            {quickActions.map((action) => (
              <QuickActionCard key={action.screen} action={action} onNavigate={setScreen} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] gap-6 lg:gap-8">
          <div className="rounded-[28px] p-5 sm:p-6 lg:p-7" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  6 Frascos
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Distribuição do rendimento por categoria.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScreen('jars')}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-black"
                style={{ color: 'var(--gold)' }}
              >
                Editar <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {jars.map((jar) => (
                <JarCard key={jar.key} jar={jar} />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setScreen('jars')}
              className="mt-4 sm:hidden w-full rounded-2xl py-3 text-sm font-black"
              style={{ background: 'rgba(255,215,0,0.14)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.26)' }}
            >
              Editar frascos
            </button>
          </div>

          <div className="rounded-[28px] p-5 sm:p-6 lg:p-7" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  Transações recentes
                </h2>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Últimos movimentos registados.
                </p>
              </div>
              {recentTransactions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setScreen('reports')}
                  className="hidden sm:inline-flex items-center gap-1 text-sm font-black"
                  style={{ color: 'var(--gold)' }}
                >
                  Ver relatórios <ChevronRight size={16} />
                </button>
              )}
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction._id || transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl p-8 sm:p-10 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <Coins size={44} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                <p className="text-base sm:text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                  Ainda sem transações
                </p>
                <p className="mt-2 text-sm leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
                  Regista a primeira entrada ou despesa para ativar o painel financeiro.
                </p>
                <button
                  type="button"
                  onClick={() => setScreen('addTransaction')}
                  className="mt-5 rounded-2xl px-5 py-3 text-sm font-black text-black gold-gradient"
                >
                  Adicionar transação
                </button>
              </div>
            )}
          </div>
        </section>

        <section>
          <motion.button
            type="button"
            onClick={() => setScreen('coach')}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-[28px] p-5 sm:p-6 lg:p-7 text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-14 h-14 rounded-3xl flex items-center justify-center shrink-0" style={{ background: `${modeColor}20` }}>
                <Bot size={26} style={{ color: modeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
                  Fala com o {user?.coachName || 'Coach'}
                </p>
                <p className="mt-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Recebe orientação financeira com base no teu modo atual, dívidas, metas e comportamento de gastos.
                </p>
              </div>
              <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black" style={{ background: `${modeColor}16`, color: modeColor }}>
                Abrir coach <ChevronRight size={16} />
              </div>
            </div>
          </motion.button>
        </section>
      </div>
    </main>
  );
}
