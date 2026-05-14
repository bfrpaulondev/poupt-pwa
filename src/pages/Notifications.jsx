import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { getTimeAgo } from '../utils/helpers';
import {
  Bell, BellOff, CheckCheck, AlertTriangle, CreditCard, Target,
  TrendingUp, Flame, Trophy, Lightbulb, MessageCircle, FileText,
  Info, ChevronLeft, Filter, Circle, X,
} from 'lucide-react';

/* ============================================================ */
/* Configurations                                               */
/* ============================================================ */

const notificationTypeConfig = {
  divida_vencida:    { label: 'Dívida vencida',         icon: AlertTriangle, color: '#EF4444' },
  pagamento_proximo: { label: 'Pagamento próximo',      icon: CreditCard,    color: '#F97316' },
  meta_atingida:     { label: 'Meta atingida',          icon: Target,        color: '#10B981' },
  transicao_modo:    { label: 'Transição de modo',      icon: TrendingUp,    color: '#3B82F6' },
  streak_quebrado:   { label: 'Streak quebrado',        icon: Flame,         color: '#EF4444' },
  conquista:         { label: 'Conquista',              icon: Trophy,        color: '#D4AF37' },
  lembrete_poupanca: { label: 'Lembrete de poupança',   icon: Lightbulb,     color: '#F59E0B' },
  divida_informal:   { label: 'Dívida informal',        icon: MessageCircle, color: '#EC4899' },
  relatorio_semanal: { label: 'Relatório semanal',      icon: FileText,      color: '#8B5CF6' },
  dica_coach:        { label: 'Dica do Coach',          icon: MessageCircle, color: '#D4AF37' },
  sistema:           { label: 'Sistema',                icon: Info,          color: '#64748B' },
};

const priorityConfig = {
  critica: { label: 'Crítica', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  order: 1 },
  alta:    { label: 'Alta',    color: '#F97316', bg: 'rgba(249,115,22,0.12)', order: 2 },
  media:   { label: 'Média',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', order: 3 },
  baixa:   { label: 'Baixa',   color: '#10B981', bg: 'rgba(16,185,129,0.12)', order: 4 },
};

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

const groupByDate = (items) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const groups = { hoje: [], ontem: [], anteriores: [] };

  items.forEach((n) => {
    const d = new Date(n.createdAt);
    if (isSameDay(d, today)) groups.hoje.push(n);
    else if (isSameDay(d, yesterday)) groups.ontem.push(n);
    else groups.anteriores.push(n);
  });

  return groups;
};

/* ============================================================ */
/* UI primitives                                                */
/* ============================================================ */

const Shell = ({ children }) => (
  <div
    style={{
      width: '100%',
      maxWidth: 880,
      margin: '0 auto',
      padding: 'clamp(16px, 3vw, 28px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(14px, 2.5vw, 20px)',
      minWidth: 0,
    }}
  >
    {children}
  </div>
);

const Card = ({ children, style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--card, #1a1a1a)',
      border: '1px solid var(--border, rgba(255,255,255,0.08))',
      borderRadius: 16,
      minWidth: 0,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function Notifications() {
  const { notifications, setNotifications, setScreen } = useStore();
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  /* ---------- Fetch ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getNotifications();
        if (alive) setNotifications(res?.data?.notifications || res?.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-line

  /* ---------- Actions ---------- */
  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  /* ---------- Derived ---------- */
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const list =
      filterPriority === 'all'
        ? notifications
        : notifications.filter((n) => n.priority === filterPriority);
    // sort: unread first, then by date desc
    return [...list].sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notifications, filterPriority]);

  const grouped = useMemo(() => groupByDate(filteredNotifications), [filteredNotifications]);

  const unreadByPriority = useMemo(
    () => ({
      critica: notifications.filter((n) => !n.read && n.priority === 'critica').length,
      alta:    notifications.filter((n) => !n.read && n.priority === 'alta').length,
      media:   notifications.filter((n) => !n.read && n.priority === 'media').length,
      baixa:   notifications.filter((n) => !n.read && n.priority === 'baixa').length,
    }),
    [notifications]
  );

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <Shell>
        <div
          style={{
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
            }}
          />
          <p style={{ color: 'var(--text-secondary, #9CA3AF)', fontSize: 14 }}>
            A carregar notificações…
          </p>
        </div>
      </Shell>
    );
  }

  /* ============================================================ */
  return (
    <Shell>
      {/* Back */}
      <button
        type="button"
        onClick={() => setScreen('dashboard')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary, #9CA3AF)',
          cursor: 'pointer',
          padding: 8,
          margin: '-8px 0 0 -8px',
          fontSize: 14,
          fontWeight: 600,
          minHeight: 44,
          alignSelf: 'flex-start',
        }}
      >
        <ChevronLeft size={18} />
        Voltar
      </button>

      {/* ============== HEADER ============== */}
      <Card style={{ padding: 'clamp(16px, 3vw, 22px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          {/* Left: bell + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
            <div
              style={{
                position: 'relative',
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(212,175,55,0.15)',
                color: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    minWidth: 20,
                    height: 20,
                    padding: '0 5px',
                    borderRadius: 999,
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--card, #1a1a1a)',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(18px, 4vw, 22px)',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  color: 'var(--text, #fff)',
                }}
              >
                Notificações
              </h1>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 13,
                  color: 'var(--text-secondary, #9CA3AF)',
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} por ler de ${notifications.length}`
                  : `Todas lidas · ${notifications.length} total`}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Filtrar"
              aria-pressed={showFilters}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: showFilters ? 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  showFilters ? 'rgba(212,175,55,0.4)' : 'var(--border, rgba(255,255,255,0.08))'
                }`,
                color: showFilters ? '#D4AF37' : 'var(--text-secondary, #9CA3AF)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Filter size={16} />
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                style={{
                  minHeight: 44,
                  padding: '0 14px',
                  borderRadius: 12,
                  background: 'rgba(16,185,129,0.12)',
                  color: '#10B981',
                  border: '1px solid rgba(16,185,129,0.3)',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: markingAll ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: markingAll ? 0.7 : 1,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckCheck size={15} />
                <span className="mark-all-label">
                  {markingAll ? 'A marcar…' : 'Marcar todas'}
                </span>
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* ============== FILTERS ============== */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <Card style={{ padding: 'clamp(14px, 2.5vw, 18px)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--text-secondary, #9CA3AF)',
                  }}
                >
                  Filtrar por prioridade
                </span>
                {filterPriority !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setFilterPriority('all')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#D4AF37',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <X size={12} /> Limpar
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <FilterChip
                  active={filterPriority === 'all'}
                  onClick={() => setFilterPriority('all')}
                  label="Todas"
                  count={notifications.length}
                  color="#D4AF37"
                />
                {Object.entries(priorityConfig).map(([key, cfg]) => (
                  <FilterChip
                    key={key}
                    active={filterPriority === key}
                    onClick={() => setFilterPriority(key)}
                    label={cfg.label}
                    count={unreadByPriority[key]}
                    color={cfg.color}
                    bg={cfg.bg}
                    dot
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== CRITICAL BANNER ============== */}
      {unreadByPriority.critica > 0 &&
        filterPriority !== 'baixa' &&
        filterPriority !== 'media' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
            }}
          >
            <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#FCA5A5',
                minWidth: 0,
                wordBreak: 'break-word',
              }}
            >
              {unreadByPriority.critica} notificação
              {unreadByPriority.critica > 1 ? 'ões' : ''} crítica
              {unreadByPriority.critica > 1 ? 's' : ''} — requer atenção imediata
            </span>
          </motion.div>
        )}

      {/* ============== LIST (grouped) ============== */}
      {filteredNotifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {grouped.hoje.length > 0 && (
            <NotificationGroup
              title="Hoje"
              items={grouped.hoje}
              onMarkRead={handleMarkRead}
            />
          )}
          {grouped.ontem.length > 0 && (
            <NotificationGroup
              title="Ontem"
              items={grouped.ontem}
              onMarkRead={handleMarkRead}
            />
          )}
          {grouped.anteriores.length > 0 && (
            <NotificationGroup
              title="Anteriores"
              items={grouped.anteriores}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>
      ) : (
        <EmptyState
          isFiltered={notifications.length > 0}
          onClear={() => setFilterPriority('all')}
        />
      )}

      {/* Inline responsive helpers */}
      <style>{`
        @media (max-width: 420px) {
          .mark-all-label { display: none; }
        }
      `}</style>
    </Shell>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function FilterChip({ active, onClick, label, count = 0, color, bg, dot = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        minHeight: 36,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        background: active ? bg || 'rgba(212,175,55,0.18)' : 'rgba(255,255,255,0.04)',
        color: active ? color : 'var(--text-secondary, #9CA3AF)',
        border: `1px solid ${active ? color : 'var(--border, rgba(255,255,255,0.08))'}`,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <Circle size={7} fill={color} style={{ color, flexShrink: 0 }} />
      )}
      {label}
      {count > 0 && (
        <span
          style={{
            background: active ? color : 'rgba(255,255,255,0.08)',
            color: active ? '#0B0B0B' : 'var(--text-secondary, #9CA3AF)',
            padding: '1px 7px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 800,
            minWidth: 18,
            textAlign: 'center',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function NotificationGroup({ title, items, onMarkRead }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <h3
        style={{
          margin: '0 0 4px 4px',
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-secondary, #9CA3AF)',
        }}
      >
        {title} · {items.length}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((n) => (
          <NotificationItem key={n._id} n={n} onMarkRead={onMarkRead} />
        ))}
      </div>
    </section>
  );
}

function NotificationItem({ n, onMarkRead }) {
  const typeConf = notificationTypeConfig[n.type] || notificationTypeConfig.sistema;
  const prioConf = priorityConfig[n.priority] || priorityConfig.media;
  const TypeIcon = typeConf.icon;
  const isUnread = !n.read;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => isUnread && onMarkRead(n._id)}
      style={{
        background: isUnread
          ? 'var(--card, #1a1a1a)'
          : 'rgba(255,255,255,0.015)',
        border: `1px solid ${
          isUnread ? 'var(--border, rgba(255,255,255,0.1))' : 'rgba(255,255,255,0.05)'
        }`,
        borderLeft: `3px solid ${prioConf.color}`,
        borderRadius: 14,
        padding: 'clamp(12px, 2.5vw, 16px)',
        cursor: isUnread ? 'pointer' : 'default',
        opacity: isUnread ? 1 : 0.65,
        transition: 'background 0.15s ease',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: `${typeConf.color}1A`,
            color: typeConf.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <TypeIcon size={18} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
              minWidth: 0,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text, #fff)',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {n.title || typeConf.label}
            </p>
            {isUnread && (
              <Circle
                size={8}
                fill="#D4AF37"
                style={{ color: '#D4AF37', flexShrink: 0 }}
              />
            )}
          </div>

          {/* Message */}
          {n.message && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.5,
                color: 'var(--text-secondary, #9CA3AF)',
                wordBreak: 'break-word',
              }}
            >
              {n.message}
            </p>
          )}

          {/* Meta tags */}
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 6,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted, #6B7280)',
                fontWeight: 600,
              }}
            >
              {getTimeAgo(n.createdAt)}
            </span>
            <span
              style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: 'var(--text-muted, #6B7280)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 999,
                background: prioConf.bg,
                color: prioConf.color,
              }}
            >
              {prioConf.label}
            </span>
            {n.type && n.type !== 'sistema' && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: `${typeConf.color}14`,
                  color: typeConf.color,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {typeConf.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ isFiltered, onClear }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'clamp(32px, 8vw, 56px) 20px',
        border: '1px dashed var(--border, rgba(255,255,255,0.1))',
        borderRadius: 16,
        background: 'rgba(255,255,255,0.015)',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text-muted, #6B7280)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isFiltered ? <Filter size={28} /> : <BellOff size={28} />}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--text, #fff)',
        }}
      >
        {isFiltered ? 'Sem notificações com este filtro' : 'Sem notificações'}
      </p>
      <p
        style={{
          margin: '6px 0 0',
          fontSize: 13,
          color: 'var(--text-secondary, #9CA3AF)',
        }}
      >
        {isFiltered
          ? 'Experimenta outro filtro ou volta a ver todas.'
          : 'As tuas alertas e atualizações aparecerão aqui.'}
      </p>
      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          style={{
            marginTop: 16,
            background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
            color: '#0B0B0B',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 10,
            fontWeight: 800,
            cursor: 'pointer',
            minHeight: 44,
            fontSize: 13,
          }}
        >
          Ver todas as notificações
        </button>
      )}
    </div>
  );
}
