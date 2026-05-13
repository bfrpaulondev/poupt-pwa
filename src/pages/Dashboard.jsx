import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Plus, Camera, BarChart3, Target, ChevronRight, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const { mockUser, jars, transactions, setScreen } = useStore();
  const theme = themes.darkGold;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const totalSpent = jars.reduce((s, j) => s + j.spent, 0);
  const totalAllocated = jars.reduce((s, j) => s + j.allocated, 0);
  const available = totalAllocated - totalSpent;
  const spentPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const barColor =
    spentPercent > 80 ? '#EF4444' : spentPercent > 50 ? '#F59E0B' : '#10B981';

  const recentTx = transactions.slice(0, 5);
  const hasOverdueDebts = true;

  return (
    <div className="px-4 py-3 poupt-scroll" style={{ background: theme.background }}>
      {/* Greeting row */}
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: theme.text }}>
          {greeting}, Ana 🌅
        </h2>
        <div className="flex items-center gap-3 mt-1.5">
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full coin-sparkle"
            style={{ background: 'rgba(255,215,0,0.1)', color: theme.primary }}
          >
            🪙 {mockUser.poupMoedas} PoupMoedas
          </span>
          <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
            🔥 {mockUser.streak} dias
          </span>
        </div>
      </div>

      {/* Survival mode banner */}
      {hasOverdueDebts && (
        <motion.button
          onClick={() => setScreen('survival')}
          className="w-full mb-4 p-3.5 rounded-xl flex items-center gap-2.5 survival-pulse"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertTriangle size={16} color="#EF4444" />
          <span className="text-xs font-bold flex-1" style={{ color: '#EF4444' }}>
            ⚠️ MODO SOBREVIVENCIA ATIVO
          </span>
          <ChevronRight size={14} color="#EF4444" />
        </motion.button>
      )}

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 mb-4"
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
          €{available.toFixed(2)}
        </h2>

        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: theme.textMuted }}>
            Gasto: €{totalSpent.toFixed(2)} / €{totalAllocated.toFixed(2)}
          </span>
          <span className="text-xs font-bold" style={{ color: barColor }}>
            {spentPercent.toFixed(0)}%
          </span>
        </div>

        <div
          className="w-full h-2 rounded-full overflow-hidden"
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

        {/* Mini jar icons */}
        <div className="flex items-center gap-2 mt-3">
          {jars.map((jar) => {
            const pct = jar.allocated > 0 ? (jar.spent / jar.allocated) * 100 : 0;
            return (
              <div key={jar.name} className="flex-1 flex flex-col items-center">
                <span className="text-xs">{jar.icon}</span>
                <div className="w-full h-1 rounded-full mt-1" style={{ background: theme.surface }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: jar.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        {[
          { icon: Camera, label: 'Scanner', screen: 'poupMoedas' },
          { icon: Plus, label: 'Adicionar', screen: 'addTransaction' },
          { icon: BarChart3, label: 'Relatorio', screen: 'reports' },
          { icon: Target, label: 'Plano', screen: 'goals' },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.92 }}
            onClick={() => setScreen(action.screen)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
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
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-bold" style={{ color: theme.text }}>
            Transacoes Recentes
          </h3>
          <button
            onClick={() => setScreen('reports')}
            className="text-xs font-bold"
            style={{ color: theme.primary }}
          >
            Ver todas →
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {recentTx.map((tx) => {
            const jarObj = jars.find((j) => j.name === tx.jar);
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: theme.surface }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: jarObj?.color || theme.textMuted }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                    {tx.description}
                  </p>
                  <p className="text-xs" style={{ color: theme.textMuted }}>
                    {tx.category} · {tx.jar}
                  </p>
                </div>
                <span
                  className="text-sm font-bold shrink-0"
                  style={{
                    color: tx.type === 'income' ? '#10B981' : '#EF4444',
                  }}
                >
                  {tx.type === 'income' ? '+' : ''}€{Math.abs(tx.amount).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Coach mini card */}
      <motion.button
        onClick={() => setScreen('coach')}
        whileTap={{ scale: 0.98 }}
        className="w-full glass rounded-xl p-4 mb-4 flex items-center gap-3"
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: 'rgba(255,215,0,0.1)' }}
        >
          🤖
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-medium" style={{ color: theme.textMuted }}>
            {mockUser.coachMode === 'sargento' ? 'Sargento diz:' : 'Amigavel diz:'}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: theme.text }}>
            A WiZink vence em 3 dias. Tens os €85, soldado?
          </p>
        </div>
        <ChevronRight size={16} style={{ color: theme.textMuted }} />
      </motion.button>

      {/* Alert card */}
      <motion.div
        className="rounded-xl p-3.5 mb-4"
        style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} color="#EF4444" />
          <p className="text-xs font-bold" style={{ color: '#EF4444' }}>
            WiZink vence em 3 dias
          </p>
        </div>
      </motion.div>
    </div>
  );
}
