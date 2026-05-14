import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { modeColors, modeLabels, formatCurrency } from '../utils/helpers';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  Target,
  AlertTriangle,
  Bot,
  Coins,
  CreditCard,
  FlaskConical,
  WalletCards,
} from 'lucide-react';
import { CardSkeleton } from '../components/SkeletonLoader';
import {
  Page,
  Card,
  SectionHeader,
  Button,
  StatCard,
  ProgressBar,
  EmptyState,
  TransactionItem,
} from '../components/ui';

const jarDefs = [
  { key: 'necessities', label: 'Necessidades', color: 'var(--jar-necessities)' },
  { key: 'freedom', label: 'Liberdade', color: 'var(--jar-freedom)' },
  { key: 'savings', label: 'Poupança', color: 'var(--jar-savings)' },
  { key: 'education', label: 'Educação', color: 'var(--jar-education)' },
  { key: 'play', label: 'Lazer', color: 'var(--jar-play)' },
  { key: 'give', label: 'Doar', color: 'var(--jar-give)' },
];

export default function Dashboard() {
  const { user, setScreen, defaultJarPercentages } = useStore();

  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [jars, setJars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdueDebts, setOverdueDebts] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('poupt-refresh-dashboard', handleRefresh);
    return () => window.removeEventListener('poupt-refresh-dashboard', handleRefresh);
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, txRes] = await Promise.allSettled([
        api.getReportSummary(),
        api.getTransactions('?limit=5'),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      }

      if (txRes.status === 'fulfilled' && txRes.value?.data) {
        const txs = txRes.value.data.transactions || txRes.value.data || [];
        setRecentTransactions(Array.isArray(txs) ? txs.slice(0, 5) : []);
      }

      const jarPcts = user?.jarPercentages || defaultJarPercentages;
      const income = user?.income || 0;
      setJars(
        jarDefs.map((jar) => ({
          ...jar,
          percentage: jarPcts[jar.key] || 0,
          allocated: income * ((jarPcts[jar.key] || 0) / 100),
        }))
      );

      try {
        const debtRes = await api.getDebts();
        if (debtRes.data?.summary?.overdueCount > 0) {
          setOverdueDebts(debtRes.data.summary.overdueCount);
        }
      } catch {}
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const userName = user?.name ? user.name.split(' ')[0] : 'amigo';
  const modeColor = modeColors[user?.financialMode] || modeColors.sobrevivencia;
  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivência';

  const totalIncome = summary?.totalIncome ?? summary?.income ?? 0;
  const totalExpenses = summary?.totalExpenses ?? summary?.expenses ?? 0;
  const available = totalIncome - totalExpenses;
  const spentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const progressTone = spentPercent > 80 ? 'danger' : spentPercent > 55 ? 'warning' : 'success';

  if (loading) {
    return (
      <div className="ui-page space-y-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <Page
      eyebrow="Visão geral"
      title={`${greeting}, ${userName}`}
      description="Acompanha o mês, decide a próxima ação e mantém o orçamento sob controlo."
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                Disponível este mês
              </p>
              <h2 className="mt-2 text-4xl font-extrabold tracking-[-0.05em]" style={{ color: available >= 0 ? 'var(--text-primary)' : 'var(--danger)' }}>
                {formatCurrency(available)}
              </h2>
            </div>

            <div
              className="shrink-0 rounded-2xl px-3 py-2 text-xs font-extrabold"
              style={{ background: `${modeColor}18`, color: modeColor }}
            >
              {modeLabel}
            </div>
          </div>

          {totalIncome > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                <span>{formatCurrency(totalExpenses)} gastos</span>
                <span>{spentPercent.toFixed(0)}%</span>
              </div>
              <ProgressBar value={spentPercent} tone={progressTone} />
            </div>
          )}

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
            <StatCard icon={ArrowDownLeft} label="Receitas" value={formatCurrency(totalIncome)} tone="success" />
            <StatCard icon={ArrowUpRight} label="Despesas" value={formatCurrency(totalExpenses)} tone="danger" />
            <StatCard icon={Coins} label="Moedas" value={user?.poupMoedas || 0} footer={`${user?.streak || 0} dias de streak`} />
          </div>
        </Card>
      </motion.div>

      {overdueDebts > 0 && (
        <button
          type="button"
          onClick={() => setScreen('survival')}
          className="mt-4 w-full rounded-2xl border p-4 text-left survival-pulse"
          style={{ background: 'rgba(220, 38, 38, 0.08)', borderColor: 'rgba(220, 38, 38, 0.22)' }}
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: 'rgba(220, 38, 38, 0.12)', color: 'var(--danger)' }}>
              <AlertTriangle size={19} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold" style={{ color: 'var(--danger)' }}>
                {overdueDebts} dívida{overdueDebts > 1 ? 's' : ''} em atraso
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Prioriza pagamentos e ativa o modo de sobrevivência.
              </p>
            </div>
          </div>
        </button>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="primary" size="lg" onClick={() => setScreen('addTransaction')}>
          <Plus size={18} /> Adicionar
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setScreen('reports')}>
          <BarChart3 size={18} /> Relatórios
        </Button>
      </div>

      <SectionHeader
        title="Orçamento por frascos"
        description="Distribuição configurada sobre o teu rendimento mensal."
        action={
          <button type="button" onClick={() => setScreen('jars')} className="text-xs font-extrabold" style={{ color: 'var(--gold)' }}>
            Editar
          </button>
        }
      />

      <Card compact className="space-y-4">
        {jars.map((jar) => (
          <div key={jar.key}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: jar.color }} />
                <p className="truncate text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{jar.label}</p>
              </div>
              <p className="text-xs font-extrabold shrink-0" style={{ color: 'var(--text-muted)' }}>
                {jar.percentage}% · {formatCurrency(jar.allocated)}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full" style={{ width: `${jar.percentage}%`, background: jar.color }} />
            </div>
          </div>
        ))}
      </Card>

      <SectionHeader
        title="Ações rápidas"
        description="Acede às áreas principais sem abrir o menu."
      />

      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={FlaskConical} label="Frascos" onClick={() => setScreen('jars')} />
        <QuickAction icon={CreditCard} label="Dívidas" onClick={() => setScreen('debts')} />
        <QuickAction icon={Target} label="Objetivos" onClick={() => setScreen('goals')} />
        <QuickAction icon={WalletCards} label="Investimentos" onClick={() => setScreen('investments')} />
      </div>

      <SectionHeader
        title="Últimas transações"
        action={
          recentTransactions.length > 0 && (
            <button type="button" onClick={() => setScreen('reports')} className="text-xs font-extrabold" style={{ color: 'var(--gold)' }}>
              Ver todas
            </button>
          )
        }
      />

      {recentTransactions.length > 0 ? (
        <div className="space-y-2.5">
          {recentTransactions.map((tx) => {
            const isIncome = tx.type === 'income' || tx.type === 'receita';
            const amount = `${isIncome ? '+' : '-'}${formatCurrency(Math.abs(tx.amount || 0))}`;
            const subtitle = [tx.category, tx.jar].filter(Boolean).join(' · ');

            return (
              <TransactionItem
                key={tx._id || tx.id}
                title={tx.description || 'Transação'}
                subtitle={subtitle}
                amount={amount}
                type={tx.type}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Coins}
          title="Sem transações recentes"
          description="Adiciona a primeira receita ou despesa para começares a acompanhar o mês."
          action={
            <Button variant="primary" size="md" className="mt-4" onClick={() => setScreen('addTransaction')}>
              <Plus size={16} /> Adicionar transação
            </Button>
          }
        />
      )}

      <SectionHeader title="Coach financeiro" />

      <button type="button" onClick={() => setScreen('coach')} className="w-full text-left">
        <Card compact interactive>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--gold) 12%, transparent)', color: 'var(--gold)' }}>
              <Bot size={21} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {user?.coachName || 'Coach'}
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                Revê decisões, dívidas, metas e hábitos financeiros.
              </p>
            </div>
          </div>
        </Card>
      </button>
    </Page>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <Card compact interactive>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--gold) 10%, transparent)', color: 'var(--gold)' }}>
            <Icon size={18} />
          </div>
          <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        </div>
      </Card>
    </button>
  );
}
