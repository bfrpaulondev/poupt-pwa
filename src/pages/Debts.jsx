import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import useThemeColors from '../utils/useThemeColors';
import {
  CreditCard, AlertTriangle, TrendingDown, ChevronDown,
  ChevronUp, Banknote, Snowflake, Flame, Shield,
  ArrowDownLeft, CircleDot, Clock, PiggyBank,
} from 'lucide-react';

const fmt = (v) => `${v.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export default function Debts() {
  const { debts, setScreen } = useStore();
  const { theme } = useThemeColors();
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [showSnowball, setShowSnowball] = useState(false);

  const totalRemaining = debts.reduce((s, d) => s + d.remaining, 0);
  const totalOriginal = debts.reduce((s, d) => s + d.total, 0);
  const totalPaid = totalOriginal - totalRemaining;
  const overallProgress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;
  const overdueCount = debts.filter(d => d.daysOverdue > 0).length;
  const totalMonthly = debts.reduce((s, d) => s + d.monthlyPayment, 0);

  // Snowball: smallest remaining first
  const snowballOrder = [...debts].sort((a, b) => a.remaining - b.remaining);

  const getStatusInfo = (debt) => {
    if (debt.daysOverdue > 30) return { label: 'Critico', color: '#EF4444', icon: Flame, bg: 'rgba(239,68,68,0.12)' };
    if (debt.daysOverdue > 0) return { label: 'Em atraso', color: '#F97316', icon: AlertTriangle, bg: 'rgba(249,115,22,0.12)' };
    if (debt.remaining === 0) return { label: 'Pago', color: '#10B981', icon: Shield, bg: 'rgba(16,185,129,0.12)' };
    return { label: 'Ativo', color: theme.primary, icon: CreditCard, bg: 'rgba(255,215,0,0.08)' };
  };

  const getProgressColor = (pct) => {
    if (pct >= 75) return '#10B981';
    if (pct >= 40) return theme.primary;
    return '#EF4444';
  };

  return (
    <div className="px-4 pt-4 pb-8 space-y-4 animate-fade-in poupt-scroll" style={{ background: theme.background, minHeight: '100dvh', overflowX: 'hidden' }}>

      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-xl font-bold" style={{ color: theme.text }}>
          💰 As Tuas Dívidas
        </h1>
        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
          Controlo total · {debts.length} dívida{debts.length !== 1 ? 's' : ''} · Método Snowball
        </p>
      </motion.div>

      {/* ── Summary Card ── */}
      <div className="glass p-4 rounded-2xl" style={{ borderColor: `${theme.primary}22` }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.primary }}>
            Resumo Geral
          </span>
          {overdueCount > 0 && (
            <span className="survival-pulse text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
              {overdueCount} em atraso
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <p className="text-[10px]" style={{ color: theme.textMuted }}>Total em dívida</p>
            <p className="text-sm font-bold" style={{ color: '#EF4444' }}>{fmt(totalRemaining)}</p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: theme.textMuted }}>Já pago</p>
            <p className="text-sm font-bold" style={{ color: '#10B981' }}>{fmt(totalPaid)}</p>
          </div>
          <div>
            <p className="text-[10px]" style={{ color: theme.textMuted }}>Mensal</p>
            <p className="text-sm font-bold" style={{ color: theme.primary }}>{fmt(totalMonthly)}</p>
          </div>
        </div>

        {/* Overall progress bar */}
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span style={{ color: theme.textMuted }}>Progresso geral</span>
            <span style={{ color: theme.textMuted }}>{overallProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: theme.border }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${overallProgress}%`,
                background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              }} />
          </div>
        </div>
      </div>

      {/* ── Overdue Alert ── */}
      {overdueCount > 0 && (
        <div className="p-3 rounded-xl flex items-center gap-2 animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={16} style={{ color: '#EF4444' }} />
          <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
            {overdueCount} dívida{overdueCount > 1 ? 's' : ''} em atraso — prioriza estes pagamentos!
          </span>
        </div>
      )}

      {/* ── Snowball Button ── */}
      <button
        onClick={() => setShowSnowball(!showSnowball)}
        className="btn-gold-outline w-full flex items-center justify-center gap-2 text-sm"
        style={{ padding: '12px 20px' }}>
        <Snowflake size={16} />
        {showSnowball ? 'Esconder Snowball' : 'Ver Método Snowball'}
        {showSnowball ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* ── Snowball Visualization ── */}
      <AnimatePresence>
        {showSnowball && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="feature-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,215,0,0.12)' }}>
                  <Snowflake size={16} style={{ color: theme.primary }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold gradient-text"
                    style={{ backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }}>
                    Método Snowball
                  </h3>
                  <p className="text-[10px]" style={{ color: theme.textMuted }}>
                    Paga a menor primeiro → ganha momentum 🏔️
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {snowballOrder.map((debt, idx) => (
                  <motion.div key={debt.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{
                      background: idx === 0 ? 'rgba(255,215,0,0.06)' : 'transparent',
                      border: idx === 0 ? `1px solid ${theme.primary}33` : '1px solid transparent',
                    }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: idx === 0 ? `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` : theme.surface,
                        color: idx === 0 ? theme.textInverse : theme.textMuted,
                      }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: theme.text }}>{debt.name}</p>
                      <p className="text-[10px]" style={{ color: theme.textMuted }}>{fmt(debt.remaining)} restante</p>
                    </div>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${theme.primary}22`, color: theme.primary }}>
                        ⚡ Prioridade
                      </span>
                    )}
                    {debt.interestRate > 0 && (
                      <span className="text-[10px] shrink-0" style={{ color: '#F97316' }}>
                        {debt.interestRate}%
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="pt-2 flex justify-between text-xs" style={{ borderTop: `1px solid ${theme.border}` }}>
                <span style={{ color: theme.textMuted }}>Pagamento mínimo total</span>
                <span className="font-bold" style={{ color: theme.primary }}>{fmt(totalMonthly)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Debt Cards ── */}
      <div className="space-y-3">
        {debts.map((debt, idx) => {
          const progress = debt.total > 0 ? ((debt.total - debt.remaining) / debt.total) * 100 : 0;
          const status = getStatusInfo(debt);
          const StatusIcon = status.icon;
          const isExpanded = expandedIdx === idx;

          return (
            <motion.div key={debt.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.3 }}
              className="glass-card overflow-hidden"
              style={{
                borderLeft: debt.daysOverdue > 30 ? '3px solid #EF4444' :
                  debt.daysOverdue > 0 ? '3px solid #F97316' :
                  debt.remaining === 0 ? '3px solid #10B981' :
                  `3px solid ${theme.primary}33`,
              }}>

              {/* Card header - always visible */}
              <div className="p-4 cursor-pointer" onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: status.bg }}>
                    <StatusIcon size={18} style={{ color: status.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate" style={{ color: theme.text }}>{debt.name}</p>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: status.bg, color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: theme.textMuted }}>
                      {debt.creditor} · {fmt(debt.remaining)} restante
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: status.color }}>{fmt(debt.total)}</p>
                    {debt.daysOverdue > 0 && (
                      <p className="text-[10px] flex items-center gap-0.5 justify-end" style={{ color: '#EF4444' }}>
                        <Clock size={9} /> {debt.daysOverdue}d atraso
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {debt.remaining > 0 && (
                  <div className="mt-3">
                    <div className="w-full rounded-full h-1.5" style={{ background: theme.border }}>
                      <div className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: getProgressColor(progress),
                        }} />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1">
                      <span style={{ color: '#10B981' }}>{fmt(debt.total - debt.remaining)} pago</span>
                      <span style={{ color: theme.textMuted }}>{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center mt-1">
                  <ChevronDown size={14} style={{ color: theme.textMuted, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: `1px solid ${theme.border}` }}>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {debt.interestRate > 0 && (
                          <div className="flex justify-between text-xs">
                            <span style={{ color: theme.textMuted }}>🏷️ Taxa</span>
                            <span className="font-semibold" style={{ color: '#F97316' }}>{debt.interestRate}%</span>
                          </div>
                        )}
                        {debt.monthlyPayment > 0 && (
                          <div className="flex justify-between text-xs">
                            <span style={{ color: theme.textMuted }}>💳 Mensal</span>
                            <span className="font-semibold" style={{ color: theme.primary }}>{fmt(debt.monthlyPayment)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span style={{ color: theme.textMuted }}>🏦 Credor</span>
                          <span className="font-semibold" style={{ color: theme.text }}>{debt.creditor}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span style={{ color: theme.textMuted }}>📊 Pago</span>
                          <span className="font-semibold" style={{ color: '#10B981' }}>{fmt(debt.total - debt.remaining)}</span>
                        </div>
                      </div>

                      {/* Snowball rank */}
                      {(() => {
                        const rank = snowballOrder.findIndex(d => d.name === debt.name) + 1;
                        return (
                          <div className="flex items-center gap-2 p-2 rounded-lg"
                            style={{ background: rank === 1 ? `${theme.primary}11` : theme.surface }}>
                            <Snowflake size={12} style={{ color: rank === 1 ? theme.primary : theme.textMuted }} />
                            <span className="text-[11px] font-medium" style={{ color: rank === 1 ? theme.primary : theme.textMuted }}>
                              Snowball: #{rank} {rank === 1 ? '— Prioridade máxima ⚡' : rank <= 2 ? '— Próximo alvo 🎯' : ''}
                            </span>
                          </div>
                        );
                      })()}

                      {/* Months to payoff estimate */}
                      {debt.monthlyPayment > 0 && (
                        <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: theme.surface }}>
                          <TrendingDown size={12} style={{ color: theme.textMuted }} />
                          <span className="text-[11px]" style={{ color: theme.textMuted }}>
                            Estimativa: ~{Math.ceil(debt.remaining / debt.monthlyPayment)} meses para liquidar
                          </span>
                        </div>
                      )}

                      {/* Action button */}
                      <button className="btn-gold-outline w-full flex items-center justify-center gap-2 text-xs"
                        style={{ padding: '10px 16px' }}>
                        <Banknote size={14} /> Registar Pagamento
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* ── Empty State ── */}
      {debts.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <PiggyBank size={48} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
          <p className="text-sm font-semibold" style={{ color: theme.text }}>Sem dívidas registadas</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Adiciona as tuas dívidas para começar a controlar</p>
        </div>
      )}

      {/* ── Motivational Footer ── */}
      {debts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-xs font-medium gradient-text"
            style={{ backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})` }}>
            🏔️ Cada euro pago é um passo para a liberdade
          </p>
          <p className="text-[10px] mt-1" style={{ color: theme.textMuted }}>
            Faltam {fmt(totalRemaining)} — tu consegues!
          </p>
        </div>
      )}
    </div>
  );
}
