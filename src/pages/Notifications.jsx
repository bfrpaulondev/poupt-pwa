import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import {
  Bell, BellOff, CheckCheck, AlertTriangle, CreditCard, Target,
  TrendingUp, Flame, Trophy, Lightbulb, MessageCircle, Circle, Info
} from 'lucide-react';

const typeConfig = {
  alert: { icon: AlertTriangle, color: '#EF4444' },
  achievement: { icon: Trophy, color: '#FFD700' },
  reminder: { icon: Bell, color: '#F97316' },
  tip: { icon: Lightbulb, color: '#10B981' },
  debt: { icon: CreditCard, color: '#EF4444' },
  goal: { icon: Target, color: '#3B82F6' },
  streak: { icon: Flame, color: '#F97316' },
  system: { icon: Info, color: '#64748B' },
};

export default function Notifications() {
  const theme = themes.darkGold;
  const { notifications, setScreen } = useStore();
  const [filter, setFilter] = useState('all');

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const allNotifications = notifications || [];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayNotifications = allNotifications.filter(n => new Date(n.date) >= todayStart);
  const earlierNotifications = allNotifications.filter(n => new Date(n.date) < todayStart);

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `ha ${mins} min`;
    if (hours < 24) return `ha ${hours} hora${hours > 1 ? 's' : ''}`;
    return `ha ${days} dia${days > 1 ? 's' : ''}`;
  };

  const handleMarkRead = (id) => {
    // Update in store - simplified
  };

  const NotificationItem = ({ n }) => {
    const nType = n.type || 'system';
    const conf = typeConfig[nType] || typeConfig.system;
    const Icon = conf.icon;
    const isUnread = !n.read;

    return (
      <div onClick={() => !n.read && handleMarkRead(n.id)} style={{
        padding: 16, borderRadius: 12, cursor: 'pointer',
        background: isUnread ? s(conf.color, 0.05) : 'transparent',
        borderLeft: `3px solid ${isUnread ? conf.color : theme.border}`,
        opacity: isUnread ? 1 : 0.6
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: s(conf.color, 0.12)
          }}>
            <Icon size={18} style={{ color: conf.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.title}
              </p>
              {isUnread && <Circle size={6} fill={theme.primary} style={{ color: theme.primary, flexShrink: 0 }} />}
            </div>
            <p style={{ fontSize: 12, color: theme.textMuted, margin: 0, lineHeight: 1.4 }}>
              {n.message}
            </p>
            <span style={{ fontSize: 10, color: theme.textMuted, marginTop: 4, display: 'block' }}>
              {getTimeAgo(n.date)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const NotificationGroup = ({ title, items }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', margin: '0 0 8px' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map(n => <NotificationItem key={n.id} n={n} />)}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Header */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Bell size={24} style={{ color: theme.primary }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, width: 20, height: 20,
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff', background: '#EF4444'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Notificacoes</h2>
              <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>
                {unreadCount > 0 ? `${unreadCount} nao lida${unreadCount > 1 ? 's' : ''}` : 'Todas lidas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications grouped */}
      {allNotifications.length > 0 ? (
        <>
          <NotificationGroup title="Hoje" items={todayNotifications} />
          <NotificationGroup title="Anteriores" items={earlierNotifications} />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <BellOff size={48} style={{ color: theme.textMuted, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13, fontWeight: 500, color: theme.textMuted }}>Sem notificacoes</p>
          <p style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>Os teus alertas aparecerao aqui</p>
        </div>
      )}
    </motion.div>
  );
}
