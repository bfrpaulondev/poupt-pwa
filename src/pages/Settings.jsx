import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { modeLabels, modeColors, modeDescriptions } from '../utils/helpers';
import {
  Save, Moon, Sun, Globe, Shield, Bell, Trash2, LogOut,
  Palette, Download, Info, ChevronRight, Volume2, VolumeX,
  MessageSquare, Target, FileText, Calendar, User, Sparkles
} from 'lucide-react';

const themes = [
  { id: 'ouro-escuro', label: 'Ouro Escuro', color: '#D4A017' },
  { id: 'ouro-claro', label: 'Ouro Claro', color: '#F5D76E' },
  { id: 'azul-royal', label: 'Azul Royal', color: '#2563EB' },
  { id: 'verde-esmeralda', label: 'Verde Esmeralda', color: '#059669' },
  { id: 'roxo', label: 'Roxo', color: '#7C3AED' },
  { id: 'rosa', label: 'Rosa', color: '#DB2777' },
  { id: 'sunset', label: 'Sunset', color: '#EA580C' },
  { id: 'ocean', label: 'Ocean', color: '#0891B2' },
];

const personalityLabels = {
  disciplinado: 'Disciplinado',
  amigavel: 'Amigavel',
  estrategico: 'Estrategico',
  espiritual: 'Espiritual',
};

const personalityDescriptions = {
  disciplinado: 'Firme e direto, foca na disciplina financeira',
  amigavel: 'Acolhedor e motivador, celebra pequenas vitorias',
  estrategico: 'Analitico e pragmatico, planeia cada passo',
  espiritual: 'Conectado com valores, foca na paz financeira',
};

export default function Settings() {
  const { user, updateUser, logout, setScreen } = useStore();
  const [saving, setSaving] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || '');
  const [coachPersonality, setCoachPersonality] = useState(user?.coachPersonality || 'disciplinado');
  const [selectedMode, setSelectedMode] = useState(user?.financialMode || 'sobrevivencia');
  const [selectedTheme, setSelectedTheme] = useState(user?.theme || 'ouro-escuro');
  const [notifications, setNotifications] = useState({
    debtReminders: user?.notificationSettings?.debtReminders ?? true,
    coachMessages: user?.notificationSettings?.coachMessages ?? true,
    weeklyReports: user?.notificationSettings?.weeklyReports ?? true,
    goalMilestones: user?.notificationSettings?.goalMilestones ?? true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSaveCoach = async () => {
    setSaving(true);
    try {
      await api.updateCoach({ coachName, coachPersonality });
      updateUser({ coachName, coachPersonality });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = async (mode) => {
    try {
      await api.updateMode(mode);
      updateUser({ financialMode: mode });
      setSelectedMode(mode);
    } catch (err) {
      console.error(err);
    }
  };

  const handleThemeChange = async (themeId) => {
    setSelectedTheme(themeId);
    try {
      await api.updateMe({ theme: themeId });
      updateUser({ theme: themeId });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationToggle = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    try {
      await api.updateMe({ notificationSettings: updated });
      updateUser({ notificationSettings: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await api.getReportSummary();
      const dataStr = JSON.stringify(res.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `poupt-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleLogout = () => {
    api.logout().catch(() => {});
    logout();
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    try {
      await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('poupt_token')}` }
      });
      logout();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleItems = [
    { key: 'debtReminders', label: 'Lembretes de dividas', desc: 'Avisos quando dividas estao prestes a vencer', icon: FileText },
    { key: 'coachMessages', label: 'Mensagens do Coach', desc: 'Dicas e motivacao do teu AI Coach', icon: MessageSquare },
    { key: 'weeklyReports', label: 'Relatorios semanais', desc: 'Resumo semanal das tuas financas', icon: Calendar },
    { key: 'goalMilestones', label: 'Marcos de objetivos', desc: 'Notificacao ao atingir metas', icon: Target },
  ];

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Tema */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Tema
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {themes.map(theme => (
            <button key={theme.id} onClick={() => handleThemeChange(theme.id)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all"
              style={{
                background: selectedTheme === theme.id ? `${theme.color}15` : 'transparent',
                border: selectedTheme === theme.id ? `1px solid ${theme.color}` : '1px solid transparent'
              }}>
              <div className="w-8 h-8 rounded-full relative"
                style={{ background: theme.color, boxShadow: selectedTheme === theme.id ? `0 0 12px ${theme.color}50` : 'none' }}>
                {selectedTheme === theme.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-medium text-center leading-tight"
                style={{ color: selectedTheme === theme.id ? theme.color : 'var(--text-muted)' }}>
                {theme.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notificacoes */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notificacoes
          </h3>
        </div>
        <div className="space-y-3">
          {toggleItems.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: notifications[key] ? 'rgba(212,160,23,0.15)' : 'var(--bg-secondary)' }}>
                <Icon size={16} style={{ color: notifications[key] ? 'var(--gold)' : 'var(--text-muted)' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <button onClick={() => handleNotificationToggle(key)}
                className="w-11 h-6 rounded-full relative transition-all"
                style={{ background: notifications[key] ? 'var(--gold)' : 'var(--border)' }}>
                <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                  style={{ left: notifications[key] ? '22px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coach Settings */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            AI Coach
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              Nome do Coach
            </label>
            <input type="text" value={coachName} onChange={e => setCoachName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
              Personalidade
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(personalityLabels).map(([key, label]) => (
                <button key={key} onClick={() => setCoachPersonality(key)}
                  className="py-2.5 px-3 rounded-xl text-left transition-all"
                  style={{
                    background: coachPersonality === key ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                    border: coachPersonality === key ? '1px solid var(--gold)' : '1px solid var(--border)'
                  }}>
                  <p className="text-xs font-semibold"
                    style={{ color: coachPersonality === key ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {label}
                  </p>
                  <p className="text-[10px] mt-0.5"
                    style={{ color: coachPersonality === key ? 'var(--gold)' : 'var(--text-muted)' }}>
                    {personalityDescriptions[key]}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveCoach} disabled={saving}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={14} /> {saving ? 'A guardar...' : 'Guardar Coach'}
          </button>
        </div>
      </div>

      {/* Modo de Vida */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Modo de Vida
          </h3>
        </div>
        <div className="space-y-2">
          {Object.entries(modeLabels).map(([key, label]) => (
            <button key={key} onClick={() => handleModeChange(key)}
              className="w-full p-3 rounded-xl text-left transition-all flex items-center gap-3"
              style={{
                background: selectedMode === key ? `${modeColors[key]}15` : 'transparent',
                border: selectedMode === key ? `1px solid ${modeColors[key]}` : '1px solid transparent'
              }}>
              <div className="w-3 h-3 rounded-full" style={{ background: modeColors[key] }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: modeColors[key] }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{modeDescriptions[key]}</p>
              </div>
              {selectedMode === key && (
                <ChevronRight size={14} style={{ color: modeColors[key] }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Privacidade */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Privacidade e Dados
          </h3>
        </div>
        <div className="space-y-2">
          <button onClick={handleExportData} disabled={exporting}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center gap-3 px-4"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            <Download size={16} style={{ color: 'var(--gold)' }} />
            <span className="flex-1 text-left">{exporting ? 'A exportar...' : 'Exportar os meus dados'}</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button onClick={handleDeleteAccount}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center gap-3 px-4"
            style={{
              background: showDeleteConfirm ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: showDeleteConfirm ? '#EF4444' : 'var(--text-muted)',
              border: showDeleteConfirm ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)'
            }}>
            <Trash2 size={16} />
            <span className="flex-1 text-left">
              {showDeleteConfirm ? 'Tens a certeza? Clica novamente para eliminar' : 'Eliminar conta'}
            </span>
          </button>
          {showDeleteConfirm && (
            <button onClick={() => setShowDeleteConfirm(false)}
              className="w-full py-2 rounded-xl text-xs"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Informacoes da App */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sobre o PoupPT
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Versao</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>1.2.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Ambiente</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Producao</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Licenca</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Pessoal</span>
          </div>
          <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <a href="https://poupt.pt/termos" target="_blank" rel="noopener noreferrer"
              className="text-xs flex items-center gap-1 mb-1.5" style={{ color: 'var(--gold)' }}>
              Termos e Condicoes <ChevronRight size={10} />
            </a>
            <a href="https://poupt.pt/privacidade" target="_blank" rel="noopener noreferrer"
              className="text-xs flex items-center gap-1" style={{ color: 'var(--gold)' }}>
              Politica de Privacidade <ChevronRight size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Terminar Sessao */}
      <div className="glass-card p-4">
        <button onClick={handleLogout}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          <LogOut size={14} /> Terminar Sessao
        </button>
      </div>
    </div>
  );
}
