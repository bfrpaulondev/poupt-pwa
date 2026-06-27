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
  Eye,
  EyeOff,
  Flame,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';

/* ============================================================
   CONFIG
   ============================================================ */
const jarDefinitions = [
  { key: 'necessities', label: 'Necessidades', icon: '🏠', color: '#3B82F6' },
  { key: 'freedom', label: 'Liberdade', icon: '🏦', color: '#10B981' },
  { key: 'savings', label: 'Poupança', icon: '🏛️', color: '#F59E0B' },
  { key: 'education', label: 'Educação', icon: '📚', color: '#8B5CF6' },
  { key: 'play', label: 'Lazer', icon: '🎮', color: '#EF4444' },
  { key: 'give', label: 'Doar', icon: '💝', color: '#EC4899' },
];

const quickActions = [
  { icon: Plus, label: 'Adicionar', description: 'Nova transação', screen: 'addTransaction', color: 'var(--gold)' },
  { icon: BarChart3, label: 'Relatórios', description: 'Analisar mês', screen: 'reports', color: '#8B5CF6' },
  { icon: Target, label: 'Metas', description: 'Planear objetivos', screen: 'goals', color: '#10B981' },
  { icon: Camera, label: 'Scanner', description: 'Usar moedas', screen: 'poupMoedas', color: '#F59E0B' },
];

/* ============================================================
   HELPERS
   ============================================================ */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const isIncomeTransaction = (t) =>
  t?.type === 'income' || t?.type === 'receita';

const getReadableName = (name) => {
  if (!name) return 'amigo';
  const s = String(name).trim();
  if (!s) return 'amigo';
  const first = s.split(' ')[0];
  if (first.includes('@')) return first.split('@')[0];
  return first;
};

const getSpentStatus = (pct) => {
  if (pct >= 90) {
    return {
      label: 'Crítico',
      color: '#EF4444',
      message: 'Reduz gastos variáveis e prioriza pagamentos obrigatórios.',
    };
  }
  if (pct >= 70) {
    return {
      label: 'Atenção',
      color: '#F59E0B',
      message: 'O mês está a ficar apertado. Mantém margem para fixos.',
    };
  }
  return {
    label: 'Controlado',
    color: '#10B981',
    message: 'O teu ritmo de gastos está dentro de uma zona saudável.',
  };
};

const formatTime = (date) =>
  date
    ? date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : '--:--';

/* ============================================================
   SHELL
   ============================================================ */
function DashboardShell({ children }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1480,
        margin: '0 auto',
        padding: 'clamp(16px, 3vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(16px, 2.4vw, 24px)',
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

/* ============================================================
   LOADING
   ============================================================ */
function LoadingState() {
  return (
    <DashboardShell>
      <div
        style={{
          minHeight: 360,
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--card)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              margin: '0 auto 16px',
              borderRadius: 18,
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              animation: 'pulse-soft 1.6s ease-in-out infinite',
            }}
          />
          <p
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            A carregar painel financeiro
          </p>
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              color: 'var(--text-muted)',
            }}
          >
            A preparar resumo, frascos e transações.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ============================================================
   SECTION HEADER
   ============================================================ */
function SectionHeader({ title, description, actionLabel, onAction, icon: Icon }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(212,168,67,0.12)',
                color: 'var(--gold)',
                flexShrink: 0,
              }}
            >
              <Icon size={16} />
            </div>
          )}
          <h2
            style={{
              fontSize: 'clamp(17px, 2.2vw, 21px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
        </div>
        {description && (
          <p
            style={{
              marginTop: 6,
              maxWidth: '60ch',
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.55,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            background: 'rgba(212,168,67,0.12)',
            color: 'var(--gold)',
            border: '1px solid rgba(212,168,67,0.22)',
            cursor: 'pointer',
            minHeight: 40,
            flexShrink: 0,
          }}
        >
          {actionLabel}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

/* ============================================================
   HERO — Saldo + saudação
   ============================================================ */
function HeroPanel({ user, available, modeLabel, modeColor, onRefresh, lastUpdated }) {
  const [hidden, setHidden] = useState(false);
  const userName = getReadableName(user?.name || user?.email);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'clamp(20px, 2.4vw, 28px)',
        background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        minWidth: 0,
      }}
    >
      {/* Decoração de fundo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
          background:
            'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.35) 0%, transparent 35%), radial-gradient(circle at 15% 85%, rgba(0,0,0,0.12) 0%, transparent 40%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          padding: 'clamp(20px, 3.5vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Topo: badge + ações */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                color: 'rgba(0,0,0,0.85)',
                background: 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Shield size={12} />
              {modeLabel}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 800,
                color: 'rgba(0,0,0,0.65)',
                background: 'rgba(0,0,0,0.08)',
              }}
            >
              <Sparkles size={11} />
              PoupPT
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setHidden((v) => !v)}
              aria-label={hidden ? 'Mostrar saldo' : 'Esconder saldo'}
              style={{
                width: 40,
                height: 40,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.3)',
                color: 'rgba(0,0,0,0.75)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Atualizar"
              style={{
                width: 40,
                height: 40,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.3)',
                color: 'rgba(0,0,0,0.75)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Saudação */}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.65)',
              margin: '0 0 6px',
            }}
          >
            {getGreeting()},
          </p>
          <h1
            style={{
              fontSize: 'clamp(26px, 5.5vw, 42px)',
              fontWeight: 800,
              color: '#000',
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              wordBreak: 'break-word',
            }}
          >
            {userName} 👋
          </h1>
        </div>

        {/* Saldo principal */}
        <div
          style={{
            padding: 'clamp(18px, 2.5vw, 24px)',
            borderRadius: 20,
            background: 'rgba(0,0,0,0.18)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'rgba(0,0,0,0.65)',
              margin: '0 0 8px',
            }}
          >
            Saldo disponível
          </p>
          <p
            style={{
              fontSize: 'clamp(28px, 6vw, 44px)',
              fontWeight: 800,
              color: '#000',
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              wordBreak: 'break-word',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {hidden ? '••••••' : formatCurrency(available)}
          </p>
          <p
            style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(0,0,0,0.6)',
            }}
          >
            Atualizado às {formatTime(lastUpdated)}
          </p>
        </div>

        {/* Mini stats: PoupMoedas + Streak */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}
        >
          <MiniStat
            icon={Coins}
            label="PoupMoedas"
            value={user?.poupMoedas || 0}
          />
          <MiniStat
            icon={Flame}
            label="Streak"
            value={`${user?.streak || 0} dias`}
          />
        </div>
      </div>
    </motion.section>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(0,0,0,0.12)',
          color: '#000',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'rgba(0,0,0,0.65)',
            margin: 0,
            lineHeight: 1,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#000',
            margin: '4px 0 0',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   SPENDING PANEL
   ============================================================ */
function SpendingPanel({ totalIncome, totalExpenses, available }) {
  const spentPercent = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;
  const savingsRate = totalIncome > 0 ? (available / totalIncome) * 100 : 0;
  const status = getSpentStatus(spentPercent);

  return (
    <section
      style={{
        padding: 'clamp(18px, 2.5vw, 24px)',
        borderRadius: 'clamp(20px, 2.4vw, 24px)',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Gastos do mês
          </p>
          <h2
            style={{
              marginTop: 8,
              fontSize: 'clamp(18px, 2.4vw, 22px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {formatCurrency(totalExpenses)}
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginLeft: 6,
              }}
            >
              / {formatCurrency(totalIncome)}
            </span>
          </h2>
        </div>
        <span
          style={{
            flexShrink: 0,
            padding: '6px 12px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            background: `${status.color}18`,
            color: status.color,
          }}
        >
          {spentPercent.toFixed(0)}%
        </span>
      </div>

      {/* Barra de progresso */}
      <div style={{ marginTop: 16 }}>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: 'var(--border)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(spentPercent, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${status.color}, ${status.color}cc)`,
            }}
          />
        </div>
      </div>

      {/* Taxa de poupança */}
      <div
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 14,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: savingsRate >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            color: savingsRate >= 0 ? '#10B981' : '#EF4444',
            flexShrink: 0,
          }}
        >
          <TrendingUp size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Taxa de poupança
          </p>
          <p
            style={{
              marginTop: 2,
              fontSize: 18,
              fontWeight: 800,
              color: savingsRate >= 0 ? '#10B981' : '#EF4444',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Mensagem de status */}
      <div
        style={{
          marginTop: 12,
          padding: 14,
          borderRadius: 14,
          background: `${status.color}0d`,
          border: `1px solid ${status.color}22`,
        }}
      >
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.55,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          <strong style={{ color: status.color, fontWeight: 800 }}>{status.label}:</strong>{' '}
          {status.message}
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   STAT CARD (4 cards do meio)
   ============================================================ */
function StatCard({ icon: Icon, label, value, footer, color }) {
  return (
    <section
      style={{
        padding: 'clamp(16px, 2vw, 20px)',
        borderRadius: 20,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.15s, transform 0.15s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            margin: 0,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: `${color}18`,
            flexShrink: 0,
          }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <p
        style={{
          fontSize: 'clamp(20px, 2.6vw, 24px)',
          fontWeight: 800,
          color,
          margin: 0,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          wordBreak: 'break-word',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {footer}
      </p>
    </section>
  );
}

/* ============================================================
   QUICK ACTION
   ============================================================ */
function QuickActionCard({ action, onNavigate }) {
  const Icon = action.icon;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      onClick={() => onNavigate(action.screen)}
      style={{
        padding: 'clamp(14px, 2vw, 18px)',
        borderRadius: 18,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        textAlign: 'left',
        cursor: 'pointer',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        transition: 'border-color 0.18s',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: `${action.color}18`,
          flexShrink: 0,
        }}
      >
        <Icon size={20} style={{ color: action.color }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {action.label}
        </p>
        <p
          style={{
            marginTop: 2,
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {action.description}
        </p>
      </div>
      <ChevronRight
        size={16}
        style={{ color: 'var(--text-muted)', flexShrink: 0 }}
      />
    </motion.button>
  );
}

/* ============================================================
   JAR CARD
   ============================================================ */
function JarCard({ jar }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: `${jar.color}18`,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {jar.icon}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {jar.label}
            </p>
            <p
              style={{
                marginTop: 2,
                fontSize: 11,
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(jar.allocated)}
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: jar.color,
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {jar.percentage}%
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'var(--border)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(jar.percentage, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            borderRadius: 999,
            background: jar.color,
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   TRANSACTION ITEM
   ============================================================ */
function TransactionItem({ transaction }) {
  const isIncome = isIncomeTransaction(transaction);
  const color = isIncome ? '#10B981' : '#EF4444';
  const Icon = isIncome ? ArrowDownLeft : ArrowUpRight;

  const meta = [
    transaction.category,
    transaction.jar,
    transaction.date && formatDate(transaction.date),
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <article
      style={{
        padding: 14,
        borderRadius: 14,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: `${color}18`,
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.description || 'Transação'}
        </p>
        <p
          style={{
            marginTop: 2,
            fontSize: 11,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {meta || 'Sem detalhes'}
        </p>
      </div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 800,
          color,
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(Math.abs(transaction.amount || 0))}
      </p>
    </article>
  );
}

/* ============================================================
   EMPTY TRANSACTIONS
   ============================================================ */
function EmptyTransactions({ onAdd }) {
  return (
    <div
      style={{
        padding: 'clamp(24px, 4vw, 36px) 20px',
        borderRadius: 18,
        background: 'var(--bg-primary)',
        border: '1px dashed var(--border)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(212,168,67,0.12)',
          color: 'var(--gold)',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 12px',
        }}
      >
        <Coins size={28} />
      </div>
      <p
        style={{
          fontSize: 15,
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Ainda sem transações
      </p>
      <p
        style={{
          marginTop: 6,
          fontSize: 13,
          color: 'var(--text-muted)',
          lineHeight: 1.55,
          maxWidth: 320,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        Regista a primeira receita ou despesa para ativar o painel.
      </p>
      <button
        type="button"
        onClick={onAdd}
        style={{
          marginTop: 16,
          padding: '10px 18px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 800,
          color: 'var(--text-inverse)',
          background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
          border: 'none',
          cursor: 'pointer',
          minHeight: 44,
          boxShadow: '0 6px 16px rgba(212,168,67,0.28)',
        }}
      >
        + Adicionar transação
      </button>
    </div>
  );
}

/* ============================================================
   SURVIVAL BANNER
   ============================================================ */
function SurvivalBanner({ overdueDebts, onOpen }) {
  if (!overdueDebts) return null;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        width: '100%',
        padding: 'clamp(16px, 2.2vw, 20px)',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(239,68,68,0.14), rgba(239,68,68,0.06))',
        border: '1px solid rgba(239,68,68,0.32)',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: 'rgba(239,68,68,0.2)',
          color: '#EF4444',
          flexShrink: 0,
        }}
      >
        <AlertTriangle size={20} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#EF4444',
            margin: 0,
          }}
        >
          Modo sobrevivência ativo
        </p>
        <p
          style={{
            marginTop: 2,
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {overdueDebts} dívida{overdueDebts > 1 ? 's' : ''} em atraso. Revê pagamentos.
        </p>
      </div>
      <ChevronRight size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
    </motion.button>
  );
}

/* ============================================================
   COACH PANEL
   ============================================================ */
function CoachPanel({ user, modeColor, onOpen }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      whileTap={{ scale: 0.99 }}
      whileHover={{ y: -2 }}
      style={{
        width: '100%',
        padding: 'clamp(18px, 2.5vw, 24px)',
        borderRadius: 22,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        minWidth: 0,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          display: 'grid',
          placeItems: 'center',
          background: `${modeColor}20`,
          color: modeColor,
          flexShrink: 0,
        }}
      >
        <Bot size={26} />
      </div>
      <div style={{ minWidth: 0, flex: '1 1 200px' }}>
        <p
          style={{
            fontSize: 'clamp(15px, 2vw, 18px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Fala com o {user?.coachName || 'Coach'}
        </p>
        <p
          style={{
            marginTop: 4,
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          Orientação financeira com base nos teus gastos, metas e dívidas.
        </p>
      </div>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 800,
          background: `${modeColor}18`,
          color: modeColor,
          flexShrink: 0,
        }}
      >
        Abrir <ChevronRight size={14} />
      </span>
    </motion.button>
  );
}

/* ============================================================
   DASHBOARD PRINCIPAL
   ============================================================ */
export default function Dashboard() {
  const { user, setScreen, updateUser } = useStore();

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

      // Detectar modo financeiro automaticamente (uma vez por sessão)
      try {
        const modeRes = await api.detectMode();
        if (modeRes?.data?.financialMode && modeRes.data.financialMode !== user?.financialMode) {
          updateUser({ financialMode: modeRes.data.financialMode });
        }
      } catch (err) {
        // Detecção de modo é best-effort — não bloqueia o dashboard
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
      {/* Banner de alerta (se aplicável) */}
      <SurvivalBanner
        overdueDebts={overdueDebts}
        onOpen={() => setScreen('survival')}
      />

      {/* HERO + GASTOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(16px, 2vw, 20px)',
        }}
        className="dashboard-hero-grid"
      >
        <HeroPanel
          user={user}
          available={available}
          modeLabel={modeLabel}
          modeColor={modeColor}
          onRefresh={loadDashboardData}
          lastUpdated={lastUpdated}
        />
        <SpendingPanel
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          available={available}
        />
      </div>

      {/* 4 STAT CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(10px, 1.5vw, 14px)',
        }}
      >
        <StatCard
          icon={ArrowDownLeft}
          label="Receitas"
          value={formatCurrency(totalIncome)}
          color="#10B981"
          footer="Total recebido no período."
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
          label="Saldo"
          value={formatCurrency(available)}
          color={available >= 0 ? 'var(--gold)' : '#EF4444'}
          footer="Receitas menos despesas."
        />
        <StatCard
          icon={CreditCard}
          label="Dívidas atraso"
          value={String(overdueDebts)}
          color={overdueDebts > 0 ? '#EF4444' : '#10B981'}
          footer="Pagamentos que exigem atenção."
        />
      </div>

      {/* AÇÕES RÁPIDAS */}
      <section>
        <SectionHeader
          icon={Sparkles}
          title="Ações rápidas"
          description="Operações principais a um toque de distância."
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'clamp(10px, 1.5vw, 14px)',
          }}
        >
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.screen}
              action={action}
              onNavigate={setScreen}
            />
          ))}
        </div>
      </section>

      {/* FRASCOS + TRANSAÇÕES */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(16px, 2vw, 20px)',
        }}
        className="dashboard-split-grid"
      >
        {/* FRASCOS */}
        <section
          style={{
            padding: 'clamp(18px, 2.5vw, 24px)',
            borderRadius: 'clamp(20px, 2.4vw, 24px)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            minWidth: 0,
          }}
        >
          <SectionHeader
            title="6 Frascos"
            description="Distribuição do rendimento."
            actionLabel="Editar"
            onAction={() => setScreen('jars')}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10,
            }}
          >
            {jars.map((jar) => (
              <JarCard key={jar.key} jar={jar} />
            ))}
          </div>
        </section>

        {/* TRANSAÇÕES */}
        <section
          style={{
            padding: 'clamp(18px, 2.5vw, 24px)',
            borderRadius: 'clamp(20px, 2.4vw, 24px)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            minWidth: 0,
          }}
        >
          <SectionHeader
            title="Transações recentes"
            description="Últimos movimentos."
            actionLabel={recentTransactions.length > 0 ? 'Ver tudo' : null}
            onAction={recentTransactions.length > 0 ? () => setScreen('reports') : null}
          />
          {recentTransactions.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {recentTransactions.map((t) => (
                <TransactionItem key={t._id || t.id} transaction={t} />
              ))}
            </div>
          ) : (
            <EmptyTransactions onAdd={() => setScreen('addTransaction')} />
          )}
        </section>
      </div>

      {/* COACH */}
      <CoachPanel
        user={user}
        modeColor={modeColor}
        onOpen={() => setScreen('coach')}
      />

      {/* Estilos responsivos via tag */}
      <style>{`
        @media (min-width: 1024px) {
          .dashboard-hero-grid {
            grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr) !important;
          }
          .dashboard-split-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
        @media (min-width: 1440px) {
          .dashboard-hero-grid {
            grid-template-columns: minmax(0, 1.5fr) minmax(360px, 0.9fr) !important;
          }
        }
      `}</style>
    </DashboardShell>
  );
}
