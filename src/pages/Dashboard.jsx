import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import useThemeColors, { alpha } from '../utils/useThemeColors';
import {
  Plus,
  Camera,
  BarChart3,
  Target,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export default function Dashboard() {
  const { mockUser, jars, transactions, setScreen } = useStore();
  const { colors } = useThemeColors();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const totalSpent = jars.reduce((sum, jar) => sum + jar.spent, 0);
  const totalAllocated = jars.reduce((sum, jar) => sum + jar.allocated, 0);
  const available = totalAllocated - totalSpent;
  const spentPercent = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const barColor =
    spentPercent > 80
      ? colors.danger
      : spentPercent > 50
        ? colors.warning
        : colors.success;

  const recentTx = transactions.slice(0, 5);
  const hasOverdueDebts = true;

  return (
    <div
      style={{
        padding: '14px 15px 20px',
        background: colors.background,
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            margin: 0,
            color: colors.text,
            fontSize: 19,
            lineHeight: '24px',
            fontWeight: 900,
          }}
        >
          {greeting}, {mockUser?.name?.split(' ')[0] || 'Ana'}
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 7,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: '5px 10px',
              borderRadius: 999,
              background: alpha(colors.gold, 0.12),
              color: colors.gold,
            }}
          >
            🪙 {mockUser.poupMoedas} PoupMoedas
          </span>

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: colors.muted,
            }}
          >
            🔥 {mockUser.streak} dias
          </span>
        </div>
      </div>

      {hasOverdueDebts && (
        <motion.button
          type="button"
          onClick={() => setScreen('survival')}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            marginBottom: 16,
            padding: '14px 13px',
            borderRadius: 14,
            background: alpha(colors.danger, 0.07),
            border: `1.5px solid ${alpha(colors.danger, 0.3)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
          }}
        >
          <AlertTriangle size={16} color={colors.danger} />

          <span
            style={{
              flex: 1,
              color: colors.danger,
              fontSize: 12,
              fontWeight: 900,
              textAlign: 'left',
            }}
          >
            MODO SOBREVIVÊNCIA ATIVO
          </span>

          <ChevronRight size={14} color={colors.danger} />
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: 20,
          marginBottom: 16,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.055)',
          border: '1px solid rgba(255,255,255,0.11)',
        }}
      >
        <p
          style={{
            margin: '0 0 4px',
            color: colors.muted,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Disponível este mês
        </p>

        <h2
          style={{
            margin: '0 0 14px',
            color: colors.gold,
            fontSize: 32,
            lineHeight: '38px',
            fontWeight: 900,
            letterSpacing: '-1px',
          }}
        >
          €{available.toFixed(2)}
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <span
            style={{
              color: colors.muted,
              fontSize: 12,
            }}
          >
            Gasto: €{totalSpent.toFixed(2)} / €{totalAllocated.toFixed(2)}
          </span>

          <span
            style={{
              color: barColor,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {spentPercent.toFixed(0)}%
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: 999,
            background: colors.surface,
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercent, 100)}%` }}
            transition={{ duration: 1 }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: barColor,
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 14,
          }}
        >
          {jars.map((jar) => {
            const percent = jar.allocated > 0 ? (jar.spent / jar.allocated) * 100 : 0;

            return (
              <div
                key={jar.name}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13 }}>{jar.icon}</span>

                <div
                  style={{
                    width: '100%',
                    height: 4,
                    borderRadius: 999,
                    marginTop: 5,
                    background: colors.surface,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(percent, 100)}%`,
                      height: '100%',
                      borderRadius: 999,
                      background: jar.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 17,
        }}
      >
        {[
          { icon: Camera, label: 'Scanner', screen: 'poupMoedas' },
          { icon: Plus, label: 'Adicionar', screen: 'addTransaction' },
          { icon: BarChart3, label: 'Relatório', screen: 'reports' },
          { icon: Target, label: 'Plano', screen: 'goals' },
        ].map((action) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.label}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setScreen(action.screen)}
              style={{
                minHeight: 70,
                padding: 10,
                border: 'none',
                borderRadius: 14,
                background: colors.surface,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                cursor: 'pointer',
              }}
            >
              <Icon size={20} color={colors.gold} />

              <span
                style={{
                  color: colors.muted,
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <section style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: colors.text,
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            Transações recentes
          </h3>

          <button
            type="button"
            onClick={() => setScreen('reports')}
            style={{
              border: 'none',
              background: 'transparent',
              color: colors.gold,
              fontSize: 12,
              fontWeight: 900,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Ver todas →
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {recentTx.map((transaction) => {
            const jar = jars.find((item) => item.name === transaction.jar);
            const isIncome = transaction.type === 'income';

            return (
              <div
                key={transaction.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: colors.surface,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: jar?.color || colors.muted,
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      color: colors.text,
                      fontSize: 14,
                      lineHeight: '18px',
                      fontWeight: 800,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {transaction.description}
                  </p>

                  <p
                    style={{
                      margin: '2px 0 0',
                      color: colors.muted,
                      fontSize: 11,
                    }}
                  >
                    {transaction.category} · {transaction.jar}
                  </p>
                </div>

                <span
                  style={{
                    color: isIncome ? colors.success : colors.danger,
                    fontSize: 14,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {isIncome ? '+' : '-'}€{Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <motion.button
        type="button"
        onClick={() => setScreen('coach')}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          marginBottom: 16,
          padding: 15,
          borderRadius: 15,
          border: '1px solid rgba(255,255,255,0.11)',
          background: 'rgba(255,255,255,0.055)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: alpha(colors.gold, 0.12),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          🤖
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'left',
          }}
        >
          <p
            style={{
              margin: 0,
              color: colors.muted,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {mockUser.coachMode === 'sargento' ? 'Sargento diz:' : 'Amigável diz:'}
          </p>

          <p
            style={{
              margin: '2px 0 0',
              color: colors.text,
              fontSize: 12,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            A WiZink vence em 3 dias. Tens os €85?
          </p>
        </div>

        <ChevronRight size={16} color={colors.muted} />
      </motion.button>

      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: alpha(colors.danger, 0.05),
          border: `1px solid ${alpha(colors.danger, 0.16)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <AlertTriangle size={15} color={colors.danger} />

        <p
          style={{
            margin: 0,
            color: colors.danger,
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          WiZink vence em 3 dias
        </p>
      </div>
    </div>
  );
}