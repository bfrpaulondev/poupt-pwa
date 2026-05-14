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
  { key: 'necessities', label: 'Necessidades', shortLabel: 'Necessidades', icon: '🏠', color: '#3B82F6' },
  { key: 'freedom', label: 'Liberdade financeira', shortLabel: 'Liberdade', icon: '🏦', color: '#10B981' },
  { key: 'savings', label: 'Poupança longo prazo', shortLabel: 'Poupança', icon: '🏛️', color: '#F59E0B' },
  { key: 'education', label: 'Educação', shortLabel: 'Educação', icon: '📚', color: '#8B5CF6' },
  { key: 'play', label: 'Lazer', shortLabel: 'Lazer', icon: '🎮', color: '#EF4444' },
  { key: 'give', label: 'Doar', shortLabel: 'Doar', icon: '💝', color: '#EC4899' },
];

const quickActions = [
  { icon: Plus, label: 'Adicionar', description: 'Nova transação', screen: 'addTransaction', color: 'var(--gold)' },
  { icon: BarChart3, label: 'Relatórios', description: 'Analisar mês', screen: 'reports', color: '#8B5CF6' },
  { icon: Target, label: 'Metas', description: 'Planear objetivos', screen: 'goals', color: '#10B981' },
  { icon: Camera, label: 'Scanner', description: 'Usar moedas', screen: 'poupMoedas', color: '#F59E0B' },
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

const getReadableName = (name) => {
  if (!name) return 'amigo';
  const safeName = String(name).trim();
  if (!safeName) return 'amigo';
  const firstPart = safeName.split(' ')[0];
  if (firstPart.includes('@')) return firstPart.split('@')[0];
  return firstPart;
};

const getSpentStatus = (spentPercent) => {
  if (spentPercent >= 90) {
    return {
      label: 'Crítico',
      color: '#EF4444',
      message: 'Reduz gastos variáveis e prioriza pagamentos obrigatórios.',
    };
  }

  if (spentPercent >= 70) {
    return {
      label: 'Atenção',
      color: '#F59E0B',
      message: 'O mês está a ficar apertado. Mantém margem para despesas fixas.',
    };
  }

  return {
    label: 'Controlado',
    color: '#10B981',
    message: 'O teu ritmo de gastos está dentro de uma zona saudável.',
  };
};

function DashboardShell({ children }) {
  return (
    <main className="w-full min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto w-full max-w-[1480px] min-w-0 space-y-6 sm:space-y-8 lg:space-y-10">
        {children}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <DashboardShell>
      <div className="min-h-[420px] rounded-[28px] flex items-center justify-center px-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-3xl gold-gradient gold-shimmer" />
          <div>
            <p className="text-base font-black" style={{ color: 'var(--text-primary)' }}>
              A carregar painel financeiro
            </p>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              A preparar resumo, frascos e transações.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function SectionHeader({ title, description, actionLabel, onAction }) {
  return (
    <div className="mb-4 sm:mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition-transform active:scale-95"
          style={{ background: 'rgba(255,215,0,0.12)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.22)' }}
        >
          {actionLabel}
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}

function HeroPanel({ user, available, modeLabel, modeColor, onRefresh, lastUpdated }) {
  const userName = getReadableName(user?.name || user?.email);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-w-0 overflow-hidden rounded-[28px] sm:rounded-[34px] lg:rounded-[38px]"
      style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
    >
      <div className="absolute inset-0 opacity-25" style={{ background: 'radial-gradient(circle at 18% 16%, white 0%, transparent 28%), radial-gradient(circle at 90% 14%, white 0%, transparent 24%), linear-gradient(145deg, rgba(255,255,255,0.18), transparent)' }} />

      <div className="relative p-5 sm:p-7 lg:p-8 xl:p-10">
        <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black text-black/80" style={{ background: 'rgba(255,255,255,0.30)' }}>
                <Shield size={13} />
                <span className="truncate">{modeLabel}</span>
              </span>
              <span className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black text-black/70" style={{ background: 'rgba(0,0,0,0.10)' }}>
                PoupPT
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="max-w-full break-words text-[clamp(2rem,7vw,4.9rem)] font-black leading-[0.98] tracking-[-0.055em] text-black">
                {getGreeting()}, {userName}
              </h1>
              <p className="mt-4 max-w-3xl text-[15px] sm:text-base lg:text-lg leading-relaxed text-black/72">
                Painel financeiro com visão clara do saldo, gastos, frascos, dívidas e ações principais.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="w-full md:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-black transition-transform active:scale-95"
            style={{ background: 'rgba(255,255,255,0.34)' }}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-3xl p-5 sm:p-6" style={{ background: 'rgba(0,0,0,0.16)' }}>
            <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-black/65">Disponível</p>
            <p className="mt-2 break-words text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-black">
              {formatCurrency(available)}
            </p>
          </div>

          <div className="rounded-3xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.24)' }}>
            <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-black/65">PoupMoedas</p>
            <p className="mt-2 text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-black">
              {user?.poupMoedas || 0}
            </p>
          </div>

          <div className="rounded-3xl p-5 sm:p-6" style={{ background: 'rgba(255,255,255,0.24)' }}>
            <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-black/65">Streak</p>
            <p className="mt-2 text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-black">
              {user?.streak || 0} dias
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-3xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.18)' }}>
          <p className="text-xs sm:text-sm font-bold text-black/70">
            Última atualização: {lastUpdated ? lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </p>
          <p className="text-xs sm:text-sm font-black" style={{ color: modeColor }}>
            Modo atual: {modeLabel}
          </p>
        </div>
      </div>
    </motion.section>
  );
}

function SpendingPanel({ totalIncome, totalExpenses, available, lastUpdated }) {
  const spentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? ((available / totalIncome) * 100) : 0;
  const status = getSpentStatus(spentPercent);

  return (
    <section className="rounded-[28px] sm:rounded-[34px] p-5 sm:p-6 lg:p-7" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Resumo de gastos</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Gastos do mês
          </h2>
        </div>
        <div className="shrink-0 rounded-2xl px-3 py-2 text-sm font-black" style={{ background: `${status.color}18`, color: status.color }}>
          {spentPercent.toFixed(0)}%
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(totalExpenses)}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{formatCurrency(totalIncome)}</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercent, 100)}%` }}
            transition={{ duration: 0.9 }}
            className="h-full rounded-full"
            style={{ background: status.color }}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-3xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Taxa de poupança</p>
          <p className="mt-2 text-2xl font-black" style={{ color: savingsRate >= 0 ? '#10B981' : '#EF4444' }}>
            {savingsRate.toFixed(1)}%
          </p>
        </div>

        <div className="rounded-3xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Atualizado</p>
          <p className="mt-2 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            {lastUpdated ? lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </p>
        </div>
      </div>

      <p className="mt-5 rounded-3xl p-4 text-sm leading-relaxed" style={{ background: `${status.color}10`, color: 'var(--text-secondary)', border: `1px solid ${status.color}22` }}>
        <strong style={{ color: status.color }}>{status.label}:</strong> {status.message}
      </p>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, footer, color }) {
  return (
    <section className="min-w-0 rounded-[26px] p-5 sm:p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{label}</p>
          <p className="mt-2 break-words text-2xl sm:text-3xl font-black tracking-tight" style={{ color }}>
            {value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
      <p className="mt-4 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {footer}
      </p>
    </section>
  );
}

function QuickActionCard({ action, onNavigate }) {
  const Icon = action.icon;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => onNavigate(action.screen)}
      className="group min-w-0 rounded-[26px] p-5 sm:p-6 text-left transition-all duration-200"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105" style={{ background: `${action.color}18` }}>
          <Icon size={22} style={{ color: action.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base sm:text-lg font-black truncate" style={{ color: 'var(--text-primary)' }}>
            {action.label}
          </p>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {action.description}
          </p>
        </div>
        <ChevronRight size={18} className="hidden sm:block shrink-0" style={{ color: 'var(--text-muted)' }} />
      </div>
    </motion.button>
  );
}

function JarCard({ jar }) {
  return (
    <div className="min-w-0 rounded-3xl p-4 sm:p-5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${jar.color}16` }}>
            <span className="text-lg">{jar.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-black truncate" style={{ color: 'var(--text-primary)' }}>
              {jar.shortLabel}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatCurrency(jar.allocated)}
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base font-black shrink-0" style={{ color: jar.color }}>
          {jar.percentage}%
        </p>
      </div>

      <div className="mt-4 h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(jar.percentage, 100)}%`, background: jar.color }} />
      </div>
    </div>
  );
}

function TransactionItem({ transaction }) {
  const isIncome = isIncomeTransaction(transaction);
  const color = isIncome ? '#10B981' : '#EF4444';
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  return (
    <article className="min-w-0 rounded-3xl p-4 sm:p-5 flex items-center gap-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm sm:text-base font-black truncate" style={{ color: 'var(--text-primary)' }}>
          {transaction.description || 'Transação'}
        </p>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed truncate" style={{ color: 'var(--text-muted)' }}>
          {transaction.category || 'Sem categoria'}
          {transaction.jar ? ` • ${transaction.jar}` : ''}
          {transaction.date ? ` • ${formatDate(transaction.date)}` : ''}
        </p>
      </div>
      <p className="text-sm sm:text-base font-black shrink-0" style={{ color }}>
        {isIncome ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0))}
      </p>
    </article>
  );
}

function EmptyTransactions({ onAdd }) {
  return (
    <div className="rounded-[28px] p-7 sm:p-10 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
      <Coins size={44} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
      <p className="text-lg sm:text-xl font-black" style={{ color: 'var(--text-primary)' }}>
        Ainda sem transações
      </p>
      <p className="mt-2 text-sm sm:text-base leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
        Regista a primeira receita ou despesa para ativar o painel financeiro.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-6 rounded-2xl px-5 py-3 text-sm font-black text-black gold-gradient transition-transform active:scale-95"
      >
        Adicionar transação
      </button>
    </div>
  );
}

function SurvivalBanner({ overdueDebts, onOpen }) {
  if (!overdueDebts) return null;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-[28px] p-5 sm:p-6 text-left survival-pulse"
      style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.32)' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.18)' }}>
          <AlertTriangle size={22} style={{ color: '#EF4444' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base sm:text-lg font-black" style={{ color: '#EF4444' }}>
            Modo sobrevivência ativo
          </p>
          <p className="mt-1 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {overdueDebts} dívida{overdueDebts > 1 ? 's' : ''} em atraso. Revê prioridades e pagamentos pendentes.
          </p>
        </div>
        <ChevronRight size={18} className="mt-1 shrink-0" style={{ color: '#EF4444' }} />
      </div>
    </motion.button>
  );
}

function CoachPanel({ user, modeColor, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.98 }}
      className="w-full rounded-[28px] p-5 sm:p-6 lg:p-7 text-left"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0" style={{ background: `${modeColor}20` }}>
          <Bot size={30} style={{ color: modeColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl sm:text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
            Fala com o {user?.coachName || 'Coach'}
          </p>
          <p className="mt-2 text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Recebe orientação financeira com base no modo atual, gastos, metas e dívidas.
          </p>
        </div>
        <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black" style={{ background: `${modeColor}16`, color: modeColor }}>
          Abrir coach <ChevronRight size={16} />
        </div>
      </div>
    </motion.button>
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

  const totalIncome = summary?.totalIncome ?? summary?.income ?? 0;
  const totalExpenses = summary?.totalExpenses ?? summary?.expenses ?? 0;
  const available = totalIncome - totalExpenses;

  const jars = useMemo(() => {
    const defaultJars = useStore.getState().defaultJarPercentages;
    const jarPercentages = user?.jarPercentages || defaultJars;
    const income = user?.income || totalIncome || 0;

    return jarDefinitions.map((jar) => ({
      ...jar,
      percentage: jarPercentages[jar.key] || 0,
      allocated: income * ((jarPercentages[jar.key] || 0) / 100),
    }));
  }, [totalIncome, user?.income, user?.jarPercentages]);

  const modeColor = modeColors[user?.financialMode] || modeColors.sobrevivencia;
  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivência';

  if (loading) return <LoadingState />;

  return (
    <DashboardShell>
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1.18fr)_minmax(390px,0.82fr)] gap-6 lg:gap-8">
        <HeroPanel
          user={user}
          available={available}
          modeLabel={modeLabel}
          modeColor={modeColor}
          onRefresh={loadDashboardData}
          lastUpdated={lastUpdated}
        />

        <div className="space-y-6 lg:space-y-8">
          <SurvivalBanner overdueDebts={overdueDebts} onOpen={() => setScreen('survival')} />
          <SpendingPanel
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            available={available}
            lastUpdated={lastUpdated}
          />
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <StatCard
          icon={ArrowDownLeft}
          label="Receitas"
          value={formatCurrency(totalIncome)}
          color="#10B981"
          footer="Total recebido no período atual."
        />
        <StatCard
          icon={ArrowUpRight}
          label="Despesas"
          value={formatCurrency(totalExpenses)}
          color="#EF4444"
          footer="Total registado como saída."
        />
        <StatCard
          icon={Wallet}
          label="Saldo disponível"
          value={formatCurrency(available)}
          color={available >= 0 ? 'var(--gold)' : '#EF4444'}
          footer="Receitas menos despesas."
        />
        <StatCard
          icon={CreditCard}
          label="Dívidas em atraso"
          value={String(overdueDebts)}
          color={overdueDebts > 0 ? '#EF4444' : '#10B981'}
          footer="Pagamentos que exigem atenção."
        />
      </section>

      <section>
        <SectionHeader
          title="Ações rápidas"
          description="Operações principais com espaço suficiente para toque no telemóvel e leitura no desktop."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {quickActions.map((action) => (
            <QuickActionCard key={action.screen} action={action} onNavigate={setScreen} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] gap-6 lg:gap-8">
        <div className="rounded-[28px] sm:rounded-[34px] p-5 sm:p-6 lg:p-7" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <SectionHeader
            title="6 Frascos"
            description="Distribuição do rendimento por categoria."
            actionLabel="Editar"
            onAction={() => setScreen('jars')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jars.map((jar) => (
              <JarCard key={jar.key} jar={jar} />
            ))}
          </div>
        </div>

        <div className="rounded-[28px] sm:rounded-[34px] p-5 sm:p-6 lg:p-7" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <SectionHeader
            title="Transações recentes"
            description="Últimos movimentos registados."
            actionLabel={recentTransactions.length > 0 ? 'Ver relatórios' : null}
            onAction={recentTransactions.length > 0 ? () => setScreen('reports') : null}
          />

          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <TransactionItem key={transaction._id || transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <EmptyTransactions onAdd={() => setScreen('addTransaction')} />
          )}
        </div>
      </section>

      <CoachPanel user={user} modeColor={modeColor} onOpen={() => setScreen('coach')} />
    </DashboardShell>
  );
}
