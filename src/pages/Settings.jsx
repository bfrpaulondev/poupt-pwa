import { useState } from 'react';
import useStore from '../store/useStore';
import { themes as themeMap } from '../themes';
import { api } from '../services/api';
import { modeLabels, modeColors, modeDescriptions, setCurrencyGlobal, personalityLabels } from '../utils/helpers';
import {
  Save, Shield, Bell, Trash2, LogOut,
  Palette, Download, Info, ChevronRight,
  MessageSquare, Target, FileText, Calendar, Sparkles,
  Euro, Languages, Lock, Eye, Heart, ExternalLink,
  Check
} from 'lucide-react';

const themeList = [
  { id: 'darkGold', label: 'Ouro Escuro', color: themeMap.darkGold.primary, bg: themeMap.darkGold.background },
  { id: 'oceanBlue', label: 'Oceano Azul', color: themeMap.oceanBlue.primary, bg: themeMap.oceanBlue.background },
  { id: 'forestGreen', label: 'Floresta Verde', color: themeMap.forestGreen.primary, bg: themeMap.forestGreen.background },
  { id: 'rosePink', label: 'Rosa Elegante', color: themeMap.rosePink.primary, bg: themeMap.rosePink.background },
  { id: 'royalPurple', label: 'Purpura Real', color: themeMap.royalPurple.primary, bg: themeMap.royalPurple.background },
  { id: 'sunsetOrange', label: 'Por do Sol', color: themeMap.sunsetOrange.primary, bg: themeMap.sunsetOrange.background },
  { id: 'arcticWhite', label: 'Artico Claro', color: themeMap.arcticWhite.primary, bg: themeMap.arcticWhite.background },
  { id: 'midnightNeon', label: 'Neon Midnight', color: themeMap.midnightNeon.primary, bg: themeMap.midnightNeon.background },
];

const personalityDescriptions = {
  disciplinado: 'Firme e direto, foca na disciplina financeira',
  amigavel: 'Acolhedor e motivador, celebra pequenas vitorias',
  estrategico: 'Analitico e pragmatico, planeia cada passo',
  espiritual: 'Conectado com valores, foca na paz financeira',
};

export default function Settings() {
  const { user, updateUser, logout, setScreen, setTheme, currentTheme } = useStore();
  const [saving, setSaving] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || '');
  const [coachPersonality, setCoachPersonality] = useState(user?.coachPersonality || 'disciplinado');
  const [selectedMode, setSelectedMode] = useState(user?.financialMode || 'sobrevivencia');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || 'darkGold');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [notifications, setNotifications] = useState({
    debtReminders: user?.notificationSettings?.debtReminders ?? true,
    coachTips: user?.notificationSettings?.coachTips ?? true,
    goalAlerts: user?.notificationSettings?.goalAlerts ?? true,
    weeklyReports: user?.notificationSettings?.weeklyReports ?? true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    analytics: user?.privacySettings?.analytics ?? true,
    personalizedTips: user?.privacySettings?.personalizedTips ?? true,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const showSuccess = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const handleSaveCoach = async () => {
    setSaving(true);
    try {
      await api.updateCoach({ coachName, coachPersonality });
      updateUser({ coachName, coachPersonality });
      showSuccess('Coach actualizado!');
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
      showSuccess('Modo actualizado!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleThemeChange = async (themeId) => {
    setSelectedTheme(themeId);
    setTheme(themeId);
    try {
      await api.updateMe({ theme: themeId });
      updateUser({ theme: themeId });
      showSuccess('Tema alterado!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCurrencyChange = async (curr) => {
    setCurrency(curr);
    setCurrencyGlobal(curr);
    try {
      await api.updateMe({ currency: curr });
      updateUser({ currency: curr });
      showSuccess('Moeda actualizada!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    try {
      await api.updateMe({ language: lang });
      updateUser({ language: lang });
      showSuccess('Idioma actualizado!');
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

  const handlePrivacyToggle = async (key) => {
    const updated = { ...privacySettings, [key]: !privacySettings[key] };
    setPrivacySettings(updated);
    try {
      await api.updateMe({ privacySettings: updated });
      updateUser({ privacySettings: updated });
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
      showSuccess('Dados exportados!');
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
      await api.deleteAccount();
      logout();
    } catch (err) {
      console.error(err);
    }
  };

  const notificationItems = [
    { key: 'debtReminders', label: 'Lembretes de dividas', desc: 'Avisos quando dividas estao prestes a vencer', icon: FileText },
    { key: 'goalAlerts', label: 'Alertas de metas', desc: 'Notificacao ao atingir marcos de objetivos', icon: Target },
    { key: 'coachTips', label: 'Dicas do Coach', desc: 'Sugestoes e motivacao do teu AI Coach', icon: MessageSquare },
    { key: 'weeklyReports', label: 'Relatorios semanais', desc: 'Resumo semanal das tuas financas', icon: Calendar },
  ];

  const currencies = [
    { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
    { code: 'USD', label: 'Dolar (USD)', symbol: '$' },
    { code: 'BRL', label: 'Real (BRL)', symbol: 'R$' },
    { code: 'GBP', label: 'Libra (GBP)', symbol: '£' },
  ];

  const languages = [
    { code: 'pt', label: 'Portugues' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Espanol' },
  ];

  const Toggle = ({ isOn, onToggle }) => (
    <button onClick={onToggle} className="w-12 h-7 rounded-full relative transition-all shrink-0"
      style={{ background: isOn ? 'var(--gold)' : 'var(--border)' }}>
      <div className="w-5.5 h-5.5 rounded-full bg-white absolute top-0.5 transition-all"
        style={{ left: isOn ? '22px' : '2px' }} />
    </button>
  );

  return (
    <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5 animate-fade-in">
      <button onClick={() => setScreen('dashboard')}
        className="flex items-center gap-1 mb-3 text-xs font-medium"
        style={{ color: 'var(--text-secondary)' }}>
        ← Voltar
      </button>
      {/* Success Toast */}
      {saveSuccess && (
        <div className="p-3.5 rounded-xl text-xs font-medium text-center animate-fade-in"
          style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
          <Check size={12} className="inline mr-1" /> {saveSuccess}
        </div>
      )}

      {/* Tema */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Palette size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Tema
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {themeList.map(theme => (
            <button key={theme.id} onClick={() => handleThemeChange(theme.id)}
              className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-xl transition-all"
              style={{
                background: selectedTheme === theme.id ? `${theme.color}15` : 'transparent',
                border: selectedTheme === theme.id ? `1px solid ${theme.color}` : '1px solid transparent'
              }}>
              <div className="w-8 h-8 rounded-full relative border"
                style={{ background: `linear-gradient(135deg, ${theme.color}, ${theme.bg})`,
                  boxShadow: selectedTheme === theme.id ? `0 0 12px ${theme.color}50` : 'none',
                  borderColor: theme.id === 'arcticWhite' ? '#CBD5E1' : 'transparent'
                }}>
                {selectedTheme === theme.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs sm:text-xs font-medium text-center leading-tight"
                style={{ color: selectedTheme === theme.id ? theme.color : 'var(--text-muted)' }}>
                {theme.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Notificacoes */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Notificacoes
          </h3>
        </div>
        <div className="space-y-4">
          {notificationItems.map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: notifications[key] ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)' }}>
                <Icon size={16} style={{ color: notifications[key] ? 'var(--gold)' : 'var(--text-muted)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <Toggle isOn={notifications[key]} onToggle={() => handleNotificationToggle(key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Moeda */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Euro size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Moeda de Referencia
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {currencies.map(curr => (
            <button key={curr.code} onClick={() => handleCurrencyChange(curr.code)}
              className="py-3 px-4 rounded-xl text-left transition-all flex items-center gap-2"
              style={{
                background: currency === curr.code ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)',
                border: currency === curr.code ? '1px solid var(--gold)' : '1px solid var(--border)'
              }}>
              <span className="text-base font-bold" style={{
                color: currency === curr.code ? 'var(--gold)' : 'var(--text-primary)'
              }}>
                {curr.symbol}
              </span>
              <span className="text-xs font-medium" style={{
                color: currency === curr.code ? 'var(--gold)' : 'var(--text-secondary)'
              }}>
                {curr.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Idioma */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Languages size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Idioma
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {languages.map(lang => (
            <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
              className="py-3 rounded-xl text-sm font-medium transition-all text-center"
              style={{
                background: language === lang.code ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)',
                color: language === lang.code ? 'var(--gold)' : 'var(--text-secondary)',
                border: language === lang.code ? '1px solid var(--gold)' : '1px solid var(--border)'
              }}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coach Settings */}
      <div className="glass-card p-5 sm:p-6">
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
              className="w-full input-field" />
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
                    background: coachPersonality === key ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
                    border: coachPersonality === key ? '1px solid var(--gold)' : '1px solid var(--border)'
                  }}>
                  <p className="text-xs font-semibold"
                    style={{ color: coachPersonality === key ? 'var(--gold)' : 'var(--text-primary)' }}>
                    {label}
                  </p>
                  <p className="text-xs sm:text-xs mt-0.5"
                    style={{ color: coachPersonality === key ? 'var(--gold)' : 'var(--text-muted)' }}>
                    {personalityDescriptions[key]}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSaveCoach} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-2">
            <Save size={14} /> {saving ? 'A guardar...' : 'Guardar Coach'}
          </button>
        </div>
      </div>

      {/* Modo de Vida */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Shield size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Modo de Vida
          </h3>
        </div>
        <div className="space-y-3">
          {Object.entries(modeLabels).map(([key, label]) => (
            <button key={key} onClick={() => handleModeChange(key)}
              className="w-full p-4 rounded-xl text-left transition-all flex items-center gap-4"
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

      {/* Exportar Dados */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Download size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Exportar Dados
          </h3>
        </div>
        <button onClick={handleExportData} disabled={exporting}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          <Download size={14} style={{ color: 'var(--gold)' }} />
          {exporting ? 'A exportar...' : 'Exportar os meus dados (JSON)'}
        </button>
      </div>

      {/* Privacidade */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Lock size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Privacidade
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: privacySettings.analytics ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)' }}>
              <Eye size={16} style={{ color: privacySettings.analytics ? 'var(--gold)' : 'var(--text-muted)' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Analise de uso</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ajuda-nos a melhorar a app</p>
            </div>
            <Toggle isOn={privacySettings.analytics} onToggle={() => handlePrivacyToggle('analytics')} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: privacySettings.personalizedTips ? 'rgba(255,215,0,0.15)' : 'var(--bg-secondary)' }}>
              <Heart size={16} style={{ color: privacySettings.personalizedTips ? 'var(--gold)' : 'var(--text-muted)' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dicas personalizadas</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Sugestoes baseadas nos teus habitos</p>
            </div>
            <Toggle isOn={privacySettings.personalizedTips} onToggle={() => handlePrivacyToggle('personalizedTips')} />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sobre o PoupPT
          </h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>Versao</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>1.3.0</span>
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
              Termos e Condicoes <ExternalLink size={10} />
            </a>
            <a href="https://poupt.pt/privacidade" target="_blank" rel="noopener noreferrer"
              className="text-xs flex items-center gap-1" style={{ color: 'var(--gold)' }}>
              Politica de Privacidade <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="glass-card p-5 sm:p-6">
        <button onClick={handleLogout}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          <LogOut size={14} /> Terminar Sessao
        </button>
      </div>

      {/* Delete Account */}
      <div className="glass-card p-5 sm:p-6">
        <h3 className="text-xs font-semibold mb-2 uppercase" style={{ color: '#EF4444' }}>
          Zona de Perigo
        </h3>
        <button onClick={handleDeleteAccount}
          className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
          style={{
            background: showDeleteConfirm ? 'rgba(239,68,68,0.1)' : 'transparent',
            color: showDeleteConfirm ? '#EF4444' : 'var(--text-muted)',
            border: showDeleteConfirm ? '1px solid rgba(239,68,68,0.5)' : '1px solid var(--border)'
          }}>
          <Trash2 size={14} />
          {showDeleteConfirm ? 'Tens a certeza? Clica novamente para eliminar' : 'Eliminar conta'}
        </button>
        {showDeleteConfirm && (
          <button onClick={() => setShowDeleteConfirm(false)}
            className="w-full py-2 mt-2 rounded-xl text-xs"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
