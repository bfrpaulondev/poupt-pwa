import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { api } from '../services/api';
import { modeColors, modeLabels, formatCurrency } from '../utils/helpers';
import { Plus, Camera, BarChart3, Target, ChevronRight, AlertTriangle, Bot, Coins } from 'lucide-react';

export default function Dashboard() {
  const { user, setScreen, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;

  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [jars, setJars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overdueDebts, setOverdueDebts] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryRes, txRes, jarsRes] = await Promise.allSettled([
        api.getReportSummary(),
        api.getTransactions('?limit=5'),
        api.getTransactions('/summary'),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setSummary(summaryRes.value.data);
      }

      if (txRes.status === 'fulfilled' && txRes.value?.data?.transactions) {
        setRecentTransactions(txRes.value.data.transactions.slice(0, 5));
      }

      // Try to get jars from user jarPercentages
      if (user?.jarPercentages) {
        const jarDefs = [
          { key: 'necessities', label: 'Necessidades', icon: '🏠', color: '#3B82F6' },
          { key: 'freedom', label: 'Liberdade', icon: '🏦', color: '#10B981' },
          { key: 'savings', label: 'Poupanca', icon: '🏛️', color: '#F59E0B' },
          { key: 'education', label: 'Educacao', icon: '📚', color: '#8B5CF6' },
          { key: 'play', label: 'Lazer', icon: '🎮', color: '#EF4444' },
          { key: 'give', label: 'Doar', icon: '💝', color: '#EC4899' },
        ];
        const income = user?.income || 0;
        const jarsData = jarDefs.map(j => ({
          ...j,
          percentage: user.jarPercentages[j.key] || 0,
          allocated: income * (user.jarPercentages[j.key] || 0) / 100,
          spent: 0,
        }));
        setJars(jarsData);
      }

      // Check overdue debts
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
  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivencia';

  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const available = totalIncome - totalExpenses;
  const spentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const barColor = spentPercent > 80 ? '#FF4444' : spentPercent > 50 ? '#FFB020' : '#4CAF50';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl gold-gradient gold-shimmer" />
          <p className="text-sm" style={{ color: theme.textMuted }}>A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-4" style={{ background: theme.background }}>
      {/* Greeting row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: theme.text }}>
            {greeting}, {userName} 🌅
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full coin-sparkle"
              style={{ background: `${theme.primary}20`, color: theme.primary }}
            >
              🪙 {user?.poupMoedas || 0} PoupMoedas
            </span>
            <span className="text-xs" style={{ color: theme.textMuted }}>
              🔥 {user?.streak || 0} dias
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full"
            style={{ background: `${modeColor}20`, color: modeColor }}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Survival mode banner */}
      {overdueDebts > 0 && (
        <motion.button
          onClick={() => setScreen('survival')}
          className="w-full p-3 rounded-xl flex items-center gap-2 survival-pulse"
          style={{ background: '#FF444418', border: '1.5px solid #FF444460' }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertTriangle size={16} color="#FF4444" />
          <span className="text-xs font-bold" style={{ color: '#FF6B6B' }}>
            ⚠️ MODO SOBREVIVENCIA ATIVO
          </span>
          <ChevronRight size={14} color="#FF6B6B" className="ml-auto" />
        </motion.button>
      )}

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <p className="text-xs font-medium mb-1" style={{ color: theme.textMuted }}>
          Disponivel este mes
        </p>
        <h2
          className="text-3xl font-extrabold mb-3 gradient-text"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          {formatCurrency(available)}
        </h2>

        {totalIncome > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: theme.textMuted }}>
                Gasto: {formatCurrency(totalExpenses)} / {formatCurrency(totalIncome)}
              </span>
              <span className="text-xs font-bold" style={{ color: barColor }}>
                {spentPercent.toFixed(0)}%
              </span>
            </div>

            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: theme.surface }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(spentPercent, 100)}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </>
        )}

        {/* Mini jar icons */}
        {jars.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {jars.map((jar) => (
              <div key={jar.key} className="flex-1 flex flex-col items-center">
                <span className="text-xs">{jar.icon}</span>
                <span className="text-[8px] font-medium mt-0.5" style={{ color: jar.color }}>
                  {jar.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Camera, label: 'Scanner', screen: 'poupMoedas' },
          { icon: Plus, label: 'Adicionar', screen: 'addTransaction' },
          { icon: BarChart3, label: 'Relatorio', screen: 'reports' },
          { icon: Target, label: 'Plano', screen: 'goals' },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.9 }}
            onClick={() => setScreen(action.screen)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-colors duration-150"
            style={{ background: theme.surface }}
          >
            <action.icon size={20} style={{ color: theme.primary }} />
            <span className="text-[10px] font-medium" style={{ color: theme.textMuted }}>
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Recent transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold" style={{ color: theme.text }}>
              Transacoes Recentes
            </h3>
            <button
              onClick={() => setScreen('reports')}
              className="text-xs font-medium"
              style={{ color: theme.primary }}
            >
              Ver todas →
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx._id || tx.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: theme.surface }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: tx.type === 'income' ? '#4CAF50' : '#FF6B6B' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                    {tx.description}
                  </p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    {tx.category} {tx.jar ? `• ${tx.jar}` : ''}
                  </p>
                </div>
                <span
                  className="text-sm font-bold shrink-0"
                  style={{
                    color: tx.type === 'income' ? '#4CAF50' : '#FF6B6B',
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Coach mini card */}
      <motion.button
        onClick={() => setScreen('coach')}
        whileTap={{ scale: 0.98 }}
        className="w-full glass rounded-xl p-4 flex items-center gap-3"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: `${theme.primary}20` }}
        >
          <Bot size={20} style={{ color: theme.primary }} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
            Fala com o {user?.coachName || 'Coach'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: theme.text }}>
            O teu treinador financeiro pessoal
          </p>
        </div>
        <ChevronRight size={16} style={{ color: theme.textMuted }} />
      </motion.button>

      {/* Overdue debt alert */}
      {overdueDebts > 0 && (
        <motion.div
          className="rounded-xl p-4"
          style={{ background: '#FF444412', border: '1px solid #FF444430' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} color="#FF6B6B" />
            <p className="text-xs font-bold" style={{ color: '#FF6B6B' }}>
              {overdueDebts} divida{overdueDebts > 1 ? 's' : ''} em atraso
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state when no data */}
      {!summary && recentTransactions.length === 0 && !loading && (
        <div className="text-center py-8">
          <Coins size={40} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
          <p className="text-sm font-medium" style={{ color: theme.text }}>
            Bem-vindo ao PoupPT!
          </p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
            Adiciona a tua primeira transacao para comecar
          </p>
          <button
            onClick={() => setScreen('addTransaction')}
            className="mt-4 px-6 py-2.5 rounded-xl text-sm font-bold gold-gradient"
          >
            Adicionar Transacao
          </button>
        </div>
      )}
    </div>
  );
}
