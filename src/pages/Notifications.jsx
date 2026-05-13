import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import {
  Bell, BellOff, CheckCheck, AlertTriangle, CreditCard, Target,
  TrendingUp, Flame, Trophy, Lightbulb, MessageCircle, FileText,
  Shield, Info, ChevronDown, Filter, X, Circle
} from 'lucide-react';

const notificationTypeConfig = {
  divida_vencida: { label: 'Divida vencida', icon: AlertTriangle, color: '#EF4444' },
  pagamento_proximo: { label: 'Pagamento proximo', icon: CreditCard, color: '#F97316' },
  meta_atingida: { label: 'Meta atingida', icon: Target, color: '#10B981' },
  transicao_modo: { label: 'Transicao de modo', icon: TrendingUp, color: '#3B82F6' },
  streak_quebrado: { label: 'Streak quebrado', icon: Flame, color: '#EF4444' },
  conquista: { label: 'Conquista', icon: Trophy, color: 'var(--gold)' },
  lembrete_poupanca: { label: 'Lembrete de poupanca', icon: Lightbulb, color: '#F59E0B' },
  divida_informal: { label: 'Divida informal', icon: MessageCircle, color: '#EC4899' },
  relatorio_semanal: { label: 'Relatorio semanal', icon: FileText, color: '#8B5CF6' },
  dica_coach: { label: 'Dica do Coach', icon: MessageCircle, color: 'var(--gold)' },
  sistema: { label: 'Sistema', icon: Info, color: '#64748B' },
};

const priorityConfig = {
  critica: { label: 'Critica', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  alta: { label: 'Alta', color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  media: { label: 'Media', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  baixa: { label: 'Baixa', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
};

export default function Notifications() {
  const { notifications, setNotifications } = useStore();
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);

    if (mins < 1) return 'agora';
    if (mins < 60) return `ha ${mins} min`;
    if (hours < 24) return `ha ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days < 7) return `ha ${days} dia${days > 1 ? 's' : ''}`;
    return `ha ${weeks} semana${weeks > 1 ? 's' : ''}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = filterPriority === 'all'
    ? notifications
    : notifications.filter(n => n.priority === filterPriority);

  const unreadByPriority = {
    critica: notifications.filter(n => !n.read && n.priority === 'critica').length,
    alta: notifications.filter(n => !n.read && n.priority === 'alta').length,
    media: notifications.filter(n => !n.read && n.priority === 'media').length,
    baixa: notifications.filter(n => !n.read && n.priority === 'baixa').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-xl gold-gradient gold-shimmer" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>A carregar notificacoes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5 animate-fade-in">
      {/* Header with unread count */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={24} style={{ color: 'var(--gold)' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: '#EF4444' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Notificacoes
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {unreadCount > 0
                  ? `${unreadCount} nao lida${unreadCount > 1 ? 's' : ''}`
                  : 'Todas lidas'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: showFilters ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <Filter size={14} style={{ color: showFilters ? 'var(--gold)' : 'var(--text-muted)' }} />
            </button>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} disabled={markingAll}
                className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>
                <CheckCheck size={12} /> {markingAll ? '...' : 'Marcar todas'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Priority Filters */}
      {showFilters && (
        <div className="glass-card p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Filtrar por prioridade:</span>
          </div>
          <div className="flex gap-2.5 sm:gap-3 flex-wrap">
            <button onClick={() => setFilterPriority('all')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: filterPriority === 'all' ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)',
                color: filterPriority === 'all' ? 'var(--gold)' : 'var(--text-muted)',
                border: filterPriority === 'all' ? '1px solid var(--gold)' : '1px solid var(--border)'
              }}>
              Todas
            </button>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <button key={key} onClick={() => setFilterPriority(key)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1"
                style={{
                  background: filterPriority === key ? config.bg : 'var(--bg-secondary)',
                  color: filterPriority === key ? config.color : 'var(--text-muted)',
                  border: filterPriority === key ? `1px solid ${config.color}` : '1px solid var(--border)'
                }}>
                <Circle size={6} fill={config.color} style={{ color: config.color }} />
                {config.label}
                {unreadByPriority[key] > 0 && (
                  <span className="ml-0.5 font-bold">({unreadByPriority[key]})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Critical Priority Banner */}
      {unreadByPriority.critica > 0 && filterPriority !== 'baixa' && filterPriority !== 'media' && (
        <div className="p-3 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <AlertTriangle size={16} style={{ color: '#EF4444' }} />
          <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
            {unreadByPriority.critica} notificacao{unreadByPriority.critica > 1 ? 'oes' : ''} critica{unreadByPriority.critica > 1 ? 's' : ''} - requer atencao imediata
          </span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map(notification => {
          const typeConf = notificationTypeConfig[notification.type] || notificationTypeConfig.sistema;
          const prioConf = priorityConfig[notification.priority] || priorityConfig.media;
          const TypeIcon = typeConf.icon;

          return (
            <div key={notification._id}
              className="glass-card p-5 sm:p-6 cursor-pointer transition-all"
              onClick={() => !notification.read && handleMarkRead(notification._id)}
              style={{
                borderLeft: `3px solid ${prioConf.color}`,
                opacity: notification.read ? 0.6 : 1
              }}>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${typeConf.color}15` }}>
                  <TypeIcon size={18} style={{ color: typeConf.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {notification.title || typeConf.label}
                    </p>
                    {!notification.read && (
                      <Circle size={6} fill="var(--gold)" style={{ color: 'var(--gold)', shrink: 0 }} />
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                      {getTimeAgo(notification.createdAt)}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: prioConf.bg, color: prioConf.color }}>
                      {prioConf.label}
                    </span>
                    {notification.type && notification.type !== 'sistema' && (
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: `${typeConf.color}10`, color: typeConf.color }}>
                        {typeConf.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          {notifications.length === 0 ? (
            <>
              <BellOff size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Sem notificacoes
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                As tuas alertas e atualizacoes aparecerao aqui
              </p>
            </>
          ) : (
            <>
              <Filter size={48} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Sem notificacoes com este filtro
              </p>
              <button onClick={() => setFilterPriority('all')}
                className="text-xs mt-2 font-medium"
                style={{ color: 'var(--gold)' }}>
                Ver todas as notificacoes
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
