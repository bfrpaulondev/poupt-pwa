import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import {
  formatCurrency,
  categoryLabels,
  jarLabels,
  jarColorsFallback,
} from '../utils/helpers';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Calendar, PieChart as PieChartIcon, CreditCard, TrendingUp, TrendingDown,
  ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, ArrowLeft,
  Wallet, BarChart3, Sparkles, FlaskConical, Award, AlertCircle,
} from 'lucide-react';

/* ============================================================
   HELPERS
   ============================================================ */
const getChartColors = () => {
  const primary =
    getComputedStyle(document.documentElement).getPropertyValue('--gold').trim() ||
    '#D4A843';
  return [
    primary, '#10B981', '#3B82F6', '#8B5CF6',
    '#EF4444', '#EC4899', '#F97316', '#64748B',
  ];
};

const formatMonthName = (month, year) =>
  new Date(year, month - 1, 1).toLocaleDateString('pt-PT', {
    month: 'long',
    year: 'numeric',
  });

const isCurrentMonth = (m, y) => {
  const now = new Date();
  return m === now.getMonth() + 1 && y === now.getFullYear();
};

/* ============================================================
   TOOLTIPS DOS GRÁFICOS
   ============================================================ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        minWidth: 140,
      }}
    >
      {label && (
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 6px',
            textTransform: 'capitalize',
          }}
        >
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            marginTop: i > 0 ? 4 : 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'var(--text-muted)', flex: 1 }}>{p.name}:</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {typeof p.value === 'number' && p.unit === '%'
              ? `${p.value.toFixed(1)}%`
              : formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 4px',
        }}
      >
        {d.name}
      </p>
      <p
        style={{
          fontSize: 14,
          color: d.payload.fill || 'var(--gold)',
          fontWeight: 800,
          margin: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCurrency(d.value)}
      </p>
    </div>
  );
}

/* ============================================================
   SHELL / SECTION
   ============================================================ */
function Shell({ children }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1280,
        margin: '0 auto',
        padding: 'clamp(16px, 3vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(14px, 2vw, 20px)',
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, padding = true, style = {}, ...rest }) {
  return (
    <section
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: padding ? 'clamp(16px, 2.4vw, 22px)' : 0,
        minWidth: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </section>
  );
}

function CardHeader({ icon: Icon, color = 'var(--gold)', title, subtitle, action }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
        {Icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: `${color}18`,
              color,
              flexShrink: 0,
            }}
          >
            <Icon size={17} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontSize: 'clamp(14px, 1.8vw, 16px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              style={{
                marginTop: 2,
                fontSize: 12,
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyChart({ message, icon: Icon = AlertCircle, height = 220 }) {
  return (
    <div
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        textAlign: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-muted)',
          border: '1px dashed var(--border)',
        }}
      >
        <Icon size={20} />
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, maxWidth: 280 }}>
        {message}
      </p>
    </div>
  );
}

/* ============================================================
   MONTH NAVIGATOR
   ============================================================ */
function MonthNavigator({ selectedMonth, onNavigate, onResetToToday }) {
  const monthName = formatMonthName(selectedMonth.month, selectedMonth.year);
  const isToday = isCurrentMonth(selectedMonth.month, selectedMonth.year);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        borderRadius: 14,
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      <button
        type="button"
        onClick={() => onNavigate(-1)}
        aria-label="Mês anterior"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ChevronLeft size={16} />
      </button>

      <button
        type="button"
        onClick={onResetToToday}
        title="Voltar a hoje"
        style={{
          padding: '8px 14px',
          borderRadius: 10,
          background: isToday ? 'rgba(212,168,67,0.14)' : 'transparent',
          color: isToday ? 'var(--gold)' : 'var(--text-primary)',
          border: 'none',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 800,
          textTransform: 'capitalize',
          minWidth: 130,
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {monthName}
      </button>

      <button
        type="button"
        onClick={() => onNavigate(1)}
        aria-label="Mês seguinte"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          display: 'grid',
          placeItems: 'center',
          background: 'transparent',
          color: 'var(--text-secondary)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ============================================================
   SUMMARY CARDS
   ============================================================ */
function SummaryCard({ icon: Icon, label, value, color, hint }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
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
          {label}
        </p>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: `${color}18`,
            flexShrink: 0,
          }}
        >
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p
        style={{
          fontSize: 'clamp(20px, 2.6vw, 26px)',
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
      {hint && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
          {hint}
        </p>
      )}
    </Card>
  );
}

/* ============================================================
   TABS
   ============================================================ */
function TabsBar({ tabs, active, onChange }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
        gap: 6,
        padding: 6,
        borderRadius: 14,
        background: 'var(--card)',
        border: '1px solid var(--border)',
      }}
    >
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            style={{
              position: 'relative',
              padding: '10px 12px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 44,
              zIndex: 1,
              transition: 'color 0.18s',
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  zIndex: -1,
                  boxShadow: '0 4px 12px rgba(212,168,67,0.32)',
                }}
              />
            )}
            <Icon size={14} />
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   TAB: MENSAL
   ============================================================ */
function MensalTab({ incomeVsExpenses, jarsAllocation, savingsRateTrend, chartColors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 18px)' }}>
      {/* Income vs Expenses */}
      <Card>
        <CardHeader
          icon={BarChart3}
          color="#10B981"
          title="Receitas vs Despesas"
          subtitle="Comparativo nos últimos meses"
        />
        {incomeVsExpenses.length > 0 ? (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenses} barGap={6} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={36} />
                <Bar dataKey="expenses" name="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Sem histórico mensal disponível ainda." height={240} />
        )}
      </Card>

      {/* GRID: Frascos + Taxa Poupança */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(14px, 2vw, 18px)',
        }}
        className="reports-split-grid"
      >
        {/* 6 Frascos */}
        <Card>
          <CardHeader
            icon={FlaskConical}
            title="Alocação dos 6 Frascos"
            subtitle="Distribuição do rendimento"
          />
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={jarsAllocation.map((j) => ({
                    name: j.name || jarLabels[j.jar] || j.jar,
                    value: j.value || j.percentage || 0,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {jarsAllocation.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={jarColorsFallback[entry.jar] || chartColors[idx % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda em grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 8,
              marginTop: 12,
            }}
          >
            {jarsAllocation.map((j, idx) => {
              const color = jarColorsFallback[j.jar] || chartColors[idx % chartColors.length];
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      flex: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {j.name || jarLabels[j.jar] || j.jar}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {j.percentage?.toFixed(0) || 0}%
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Taxa de Poupança */}
        <Card>
          <CardHeader
            icon={TrendingUp}
            color="var(--gold)"
            title="Taxa de Poupança"
            subtitle="Evolução nos últimos meses"
          />
          {savingsRateTrend.length > 0 ? (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsRateTrend} margin={{ top: 10, right: 8, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors[0]} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={chartColors[0]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    unit="%"
                    width={40}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="Taxa"
                    stroke={chartColors[0]}
                    strokeWidth={2.5}
                    dot={{ fill: chartColors[0], r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    fill="url(#savingsGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart message="Sem histórico de poupança ainda." height={220} icon={TrendingUp} />
          )}
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: CATEGORIAS
   ============================================================ */
function CategoriasTab({ categoryBreakdown, chartColors }) {
  const sorted = useMemo(
    () =>
      [...categoryBreakdown]
        .filter((c) => (c.total || c.amount || 0) > 0)
        .sort((a, b) => (b.total || b.amount || 0) - (a.total || a.amount || 0)),
    [categoryBreakdown]
  );

  const maxVal = sorted.reduce(
    (max, c) => Math.max(max, c.total || c.amount || 0),
    0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 18px)' }}>
      {/* Pie */}
      <Card>
        <CardHeader
          icon={PieChartIcon}
          title="Distribuição por Categoria"
          subtitle="Onde foi gasto este mês"
        />
        {sorted.length > 0 ? (
          <>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sorted.map((c) => ({
                      name: categoryLabels[c.category] || c.category,
                      value: c.total || c.amount || 0,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {sorted.map((_, idx) => (
                      <Cell key={idx} fill={chartColors[idx % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 8,
                marginTop: 12,
              }}
            >
              {sorted.slice(0, 8).map((c, idx) => {
                const value = c.total || c.amount || 0;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      minWidth: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: chartColors[idx % chartColors.length],
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {categoryLabels[c.category] || c.category}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCurrency(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyChart message="Sem despesas registadas este mês." icon={PieChartIcon} />
        )}
      </Card>

      {/* Ranking */}
      <Card>
        <CardHeader
          icon={Award}
          title="Maiores Despesas"
          subtitle="Top 5 categorias do mês"
        />
        {sorted.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sorted.slice(0, 5).map((c, idx) => {
              const value = c.total || c.amount || 0;
              const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
              const color = chartColors[idx % chartColors.length];
              return (
                <div key={idx}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          display: 'grid',
                          placeItems: 'center',
                          background: `${color}20`,
                          color,
                          fontSize: 11,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {categoryLabels[c.category] || c.category}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color,
                        flexShrink: 0,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatCurrency(value)}
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
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut', delay: idx * 0.05 }}
                      style={{ height: '100%', background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChart message="Sem despesas para ranquear este mês." icon={Award} height={160} />
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   TAB: DÍVIDAS
   ============================================================ */
function DividasTab({ debtProgress, onOpenDebts }) {
  if (!debtProgress) {
    return (
      <Card>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(16,185,129,0.12)',
              color: '#10B981',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CreditCard size={26} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Sem dívidas registadas
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              margin: 0,
              maxWidth: 320,
              lineHeight: 1.5,
            }}
          >
            Estás livre! Continua a focar-te em poupança e investimento.
          </p>
        </div>
      </Card>
    );
  }

  const totalRemaining = debtProgress.totalRemaining || debtProgress.totalDebt || 0;
  const totalPaid = debtProgress.totalPaid || 0;
  const totalDebt = debtProgress.totalDebt || totalRemaining + totalPaid;
  const overallPct = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 18px)' }}>
      <Card>
        <CardHeader
          icon={CreditCard}
          color="#EF4444"
          title="Progresso de Pagamento"
          subtitle="Visão global das tuas dívidas"
        />

        {/* Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.22)',
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
              }}
            >
              Em dívida
            </p>
            <p
              style={{
                marginTop: 4,
                fontSize: 20,
                fontWeight: 800,
                color: '#EF4444',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(totalRemaining)}
            </p>
          </div>
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.22)',
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
              }}
            >
              Já pago
            </p>
            <p
              style={{
                marginTop: 4,
                fontSize: 20,
                fontWeight: 800,
                color: '#10B981',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatCurrency(totalPaid)}
            </p>
          </div>
        </div>

        {/* Overall progress */}
        {totalDebt > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Progresso geral</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#10B981',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {overallPct.toFixed(1)}%
              </span>
            </div>
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
                animate={{ width: `${Math.min(100, overallPct)}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981, var(--gold))',
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Individuais */}
      {debtProgress.debts?.length > 0 && (
        <Card>
          <CardHeader
            icon={Wallet}
            title="Dívidas individuais"
            subtitle="Progresso de cada credor"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {debtProgress.debts.map((d, idx) => {
              const paid = d.paid || d.amountPaid || 0;
              const total = d.total || d.originalAmount || d.amount || 1;
              const pct = Math.min(100, (paid / total) * 100);
              const isPaid = pct >= 100;

              return (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    background: 'var(--bg-primary)',
                    border: `1px solid ${isPaid ? 'rgba(16,185,129,0.32)' : 'var(--border)'}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {d.creditorName || d.name || `Dívida ${idx + 1}`}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: isPaid ? '#10B981' : 'var(--gold)',
                        flexShrink: 0,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--border)',
                      overflow: 'hidden',
                      marginBottom: 6,
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: isPaid ? '#10B981' : 'var(--gold)',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    <span>{formatCurrency(paid)} pago</span>
                    <span>{formatCurrency(total)} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Snowball */}
      <Card style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.12), rgba(212,168,67,0.04))', border: '1px solid rgba(212,168,67,0.32)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              display: 'grid',
              placeItems: 'center',
              background: 'rgba(212,168,67,0.2)',
              color: 'var(--gold)',
              flexShrink: 0,
            }}
          >
            <TrendingDown size={22} />
          </div>
          <div style={{ minWidth: 0, flex: '1 1 200px' }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)', margin: 0 }}>
              Estratégia Snowball
            </p>
            <p
              style={{
                marginTop: 4,
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}
            >
              Paga primeiro as dívidas menores para criar momento e motivação.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenDebts}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              background: 'var(--gold)',
              color: 'var(--text-inverse)',
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
            }}
          >
            Ver dívidas <ChevronRight size={14} />
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   LOADING
   ============================================================ */
function LoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 320,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 14px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
            animation: 'pulse-soft 1.6s ease-in-out infinite',
          }}
        />
        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          A carregar relatórios
        </p>
        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)' }}>
          A preparar gráficos e dados.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function Reports() {
  const { setScreen } = useStore();
  const [activeTab, setActiveTab] = useState('mensal');
  const [monthlyData, setMonthlyData] = useState(null);
  const [debtProgress, setDebtProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartColors, setChartColors] = useState(getChartColors());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  // Recarrega cores ao mudar de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setChartColors(getChartColors());
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [monthlyRes, debtRes] = await Promise.all([
        api.getReportMonthly(selectedMonth.month, selectedMonth.year).catch(() => null),
        api.getDebtProgress().catch(() => null),
      ]);
      if (monthlyRes?.data) setMonthlyData(monthlyRes.data);
      if (debtRes?.data) setDebtProgress(debtRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateMonth = (dir) => {
    setSelectedMonth((prev) => {
      let { month, year } = prev;
      month += dir;
      if (month > 12) {
        month = 1;
        year++;
      }
      if (month < 1) {
        month = 12;
        year--;
      }
      return { month, year };
    });
  };

  const resetToToday = () => {
    const now = new Date();
    setSelectedMonth({ month: now.getMonth() + 1, year: now.getFullYear() });
  };

  const incomeVsExpenses = monthlyData?.monthlyBreakdown || [];
  const categoryBreakdown = monthlyData?.categoryBreakdown || [];
  const jarsAllocation =
    monthlyData?.jarsAllocation ||
    Object.entries(jarLabels).map(([key, label]) => ({
      jar: key,
      name: label,
      value: 0,
      percentage: 0,
    }));
  const savingsRateTrend = monthlyData?.savingsRateTrend || [];
  const totalIncome = monthlyData?.totalIncome || 0;
  const totalExpenses = monthlyData?.totalExpenses || 0;
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const tabs = [
    { id: 'mensal', label: 'Mensal', icon: Calendar },
    { id: 'categorias', label: 'Categorias', icon: PieChartIcon },
    { id: 'dividas', label: 'Dívidas', icon: CreditCard },
  ];

  return (
    <Shell>
      {/* Voltar */}
      <button
        type="button"
        onClick={() => setScreen('dashboard')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          minHeight: 36,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={16} />
        Voltar ao painel
      </button>

      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--gold)',
              margin: 0,
            }}
          >
            Relatórios
          </p>
          <h1
            style={{
              marginTop: 4,
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Análise financeira
          </h1>
        </div>

        <MonthNavigator
          selectedMonth={selectedMonth}
          onNavigate={navigateMonth}
          onResetToToday={resetToToday}
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'clamp(10px, 1.5vw, 14px)',
            }}
          >
            <SummaryCard
              icon={ArrowDownLeft}
              label="Receitas"
              value={formatCurrency(totalIncome)}
              color="#10B981"
              hint="Total recebido"
            />
            <SummaryCard
              icon={ArrowUpRight}
              label="Despesas"
              value={formatCurrency(totalExpenses)}
              color="#EF4444"
              hint="Total gasto"
            />
            <SummaryCard
              icon={Wallet}
              label="Saldo"
              value={formatCurrency(balance)}
              color={balance >= 0 ? 'var(--gold)' : '#EF4444'}
              hint="Receitas menos despesas"
            />
            <SummaryCard
              icon={Sparkles}
              label="Poupança"
              value={`${savingsRate.toFixed(1)}%`}
              color={savingsRate >= 0 ? 'var(--gold)' : '#EF4444'}
              hint="Taxa do período"
            />
          </div>

          {/* TABS */}
          <TabsBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

          {/* CONTEÚDO */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'mensal' && (
                <MensalTab
                  incomeVsExpenses={incomeVsExpenses}
                  jarsAllocation={jarsAllocation}
                  savingsRateTrend={savingsRateTrend}
                  chartColors={chartColors}
                />
              )}
              {activeTab === 'categorias' && (
                <CategoriasTab
                  categoryBreakdown={categoryBreakdown}
                  chartColors={chartColors}
                />
              )}
              {activeTab === 'dividas' && (
                <DividasTab
                  debtProgress={debtProgress}
                  onOpenDebts={() => setScreen('debts')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .reports-split-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </Shell>
  );
}
