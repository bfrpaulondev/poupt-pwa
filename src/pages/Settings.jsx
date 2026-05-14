import { useState } from 'react';
import useStore from '../store/useStore';
import { themes, themeCatalog } from '../themes';
import { api } from '../services/api';
import { modeLabels, modeColors, modeDescriptions, setCurrencyGlobal } from '../utils/helpers';
import {
  Save,
  Bell,
  Trash2,
  LogOut,
  Palette,
  Download,
  MessageSquare,
  Target,
  FileText,
  Calendar,
  Euro,
  Languages,
  Lock,
  Check,
  Coins,
  Sparkles,
  User,
} from 'lucide-react';

const personalityLabels = {
  disciplinado: 'Disciplinado',
  amigavel: 'Amigável',
  estrategico: 'Estratégico',
  espiritual: 'Espiritual',
};

const personalityDescriptions = {
  disciplinado: 'Firme e direto, focado em disciplina financeira.',
  amigavel: 'Acolhedor e motivador, celebra pequenas vitórias.',
  estrategico: 'Analítico e pragmático, planeia cada passo.',
  espiritual: 'Focado em valores, equilíbrio e paz financeira.',
};

const currencies = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'Dólar', symbol: '$' },
  { code: 'BRL', label: 'Real', symbol: 'R$' },
  { code: 'GBP', label: 'Libra', symbol: '£' },
];

const languages = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

function Toggle({ isOn, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-12 h-7 rounded-full relative transition-all shrink-0"
      style={{ background: isOn ? 'var(--gold)' : 'var(--border)' }}
    >
      <span
        className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all"
        style={{ left: isOn ? 24 : 4 }}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="glass-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={17} style={{ color: 'var(--gold)' }} />
        <h3 className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

export default function Settings() {
  const {
    user,
    updateUser,
    logout,
    setScreen,
    setTheme,
    currentTheme,
    isThemeOwned,
    ownedThemes,
  } = useStore();

  const [saving, setSaving] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || 'Coach');
  const [coachPersonality, setCoachPersonality] = useState(user?.coachPersonality || 'disciplinado');
  const [selectedMode, setSelectedMode] = useState(user?.financialMode || 'sobrevivencia');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
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

  const showSuccess = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 2200);
  };

  const handleSaveCoach = async () => {
    setSaving(true);
    try {
      await api.updateCoach({ coachName, coachPersonality });
      updateUser({ coachName, coachPersonality });
      showSuccess('Coach atualizado.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleModeChange = async (mode) => {
    setSelectedMode(mode);
    updateUser({ financialMode: mode });
    try {
      await api.updateMode(mode);
      showSuccess('Modo financeiro atualizado.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleThemeChange = async (themeId) => {
    if (!isThemeOwned(themeId)) {
      setScreen('poupMoedas');
      return;
    }

    const applied = setTheme(themeId);
    if (!applied) return;

    updateUser({ theme: themeId });
    try {
      await api.updateMe({ theme: themeId, ownedThemes });
      showSuccess('Tema aplicado.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCurrencyChange = async (curr) => {
    setCurrency(curr);
    setCurrencyGlobal(curr);
    updateUser({ currency: curr });
    try {
      await api.updateMe({ currency: curr });
      showSuccess('Moeda atualizada.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    updateUser({ language: lang });
    try {
      await api.updateMe({ language: lang });
      showSuccess('Idioma atualizado.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationToggle = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateUser({ notificationSettings: updated });
    try {
      await api.updateMe({ notificationSettings: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrivacyToggle = async (key) => {
    const updated = { ...privacySettings, [key]: !privacySettings[key] };
    setPrivacySettings(updated);
    updateUser({ privacySettings: updated });
    try {
      await api.updateMe({ privacySettings: updated });
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
      showSuccess('Dados exportados.');
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
      await fetch(`${import.meta.env.VITE_API_URL || 'https://poupt-api.onrender.com/api'}/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('poupt_token')}` },
      });
      logout();
    } catch (err) {
      console.error(err);
    }
  };

  const notificationItems = [
    { key: 'debtReminders', label: 'Lembretes de dívidas', desc: 'Avisos quando dívidas estão prestes a vencer.', icon: FileText },
    { key: 'goalAlerts', label: 'Alertas de metas', desc: 'Notificação ao atingir marcos de objetivos.', icon: Target },
    { key: 'coachTips', label: 'Dicas do Coach', desc: 'Sugestões e motivação do teu Coach.', icon: MessageSquare },
    { key: 'weeklyReports', label: 'Relatórios semanais', desc: 'Resumo semanal das tuas finanças.', icon: Calendar },
  ];

  return (
    <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5 animate-fade-in">
      {saveSuccess && (
        <div className="p-3 rounded-xl text-sm font-semibold text-center animate-fade-in" style={{ background: 'rgba(16,185,129,0.14)', color: '#10B981', border: '1px solid rgba(16,185,129,0.28)' }}>
          {saveSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="space-y-5">
          <Section title="Conta" icon={User}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black" style={{ background: 'rgba(255,215,0,0.16)', color: 'var(--gold)' }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'Utilizador'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || ''}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--gold)' }}>{user?.poupMoedas || 0} PoupMoedas</p>
              </div>
            </div>
          </Section>

          <Section title="Temas" icon={Palette}>
            <div className="theme-grid">
              {themeCatalog.map((theme) => {
                const owned = isThemeOwned(theme.id);
                const active = currentTheme === theme.id;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleThemeChange(theme.id)}
                    className="theme-card text-left"
                    style={{
                      '--theme-a': theme.gradient[0],
                      '--theme-b': theme.gradient[1],
                      background: theme.surface,
                      color: theme.text,
                      borderColor: active ? theme.primary : theme.border,
                    }}
                  >
                    <div className="theme-card-header">
                      <div>
                        <p className="text-sm font-black">{theme.name}</p>
                        <p className="text-xs mt-1 opacity-70">{owned ? 'Disponível' : `${theme.price} PoupMoedas`}</p>
                      </div>
                      <span style={{ color: owned ? theme.primary : theme.textMuted }}>
                        {active ? <Check size={17} /> : owned ? <Sparkles size={17} /> : <Lock size={17} />}
                      </span>
                    </div>
                    <div className="theme-preview-dots">
                      <span style={{ background: theme.primary }} />
                      <span style={{ background: theme.primaryLight }} />
                      <span style={{ background: theme.surfaceHover }} />
                      <span style={{ background: theme.border }} />
                    </div>
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setScreen('poupMoedas')} className="btn-gold w-full flex items-center justify-center gap-2">
              <Coins size={15} /> Abrir loja de temas
            </button>
          </Section>

          <Section title="Coach" icon={MessageSquare}>
            <div className="space-y-3">
              <input value={coachName} onChange={(e) => setCoachName(e.target.value)} className="input-field" placeholder="Nome do Coach" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(personalityLabels).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCoachPersonality(key)}
                    className="p-3 rounded-xl text-left border transition-all"
                    style={{
                      background: coachPersonality === key ? 'rgba(255,215,0,0.14)' : 'var(--bg-secondary)',
                      borderColor: coachPersonality === key ? 'var(--gold)' : 'var(--border)',
                      color: coachPersonality === key ? 'var(--gold)' : 'var(--text-primary)',
                    }}
                  >
                    <p className="text-xs font-black">{label}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{personalityDescriptions[key]}</p>
                  </button>
                ))}
              </div>
              <button type="button" onClick={handleSaveCoach} disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
                <Save size={15} /> {saving ? 'A guardar...' : 'Guardar Coach'}
              </button>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Modo financeiro" icon={Target}>
            <div className="space-y-2">
              {Object.entries(modeLabels).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleModeChange(mode)}
                  className="w-full p-3 rounded-xl text-left border flex items-center justify-between gap-3"
                  style={{
                    background: selectedMode === mode ? `${modeColors[mode]}18` : 'var(--bg-secondary)',
                    color: selectedMode === mode ? modeColors[mode] : 'var(--text-primary)',
                    borderColor: selectedMode === mode ? modeColors[mode] : 'var(--border)',
                  }}
                >
                  <span>
                    <strong className="block text-xs">{label}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{modeDescriptions[mode]}</small>
                  </span>
                  {selectedMode === mode && <Check size={16} />}
                </button>
              ))}
            </div>
          </Section>

          <Section title="Moeda e idioma" icon={Euro}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Moeda</label>
                <select value={currency} onChange={(e) => handleCurrencyChange(e.target.value)} className="input-field">
                  {currencies.map((item) => <option key={item.code} value={item.code}>{item.symbol} {item.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold mb-2 block" style={{ color: 'var(--text-muted)' }}>Idioma</label>
                <select value={language} onChange={(e) => handleLanguageChange(e.target.value)} className="input-field">
                  {languages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
                </select>
              </div>
            </div>
          </Section>

          <Section title="Notificações" icon={Bell}>
            <div className="space-y-3">
              {notificationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="flex items-center gap-3 justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon size={16} style={{ color: 'var(--gold)' }} />
                      <div className="min-w-0">
                        <p className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                    </div>
                    <Toggle isOn={notifications[item.key]} onToggle={() => handleNotificationToggle(item.key)} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="Privacidade e dados" icon={Languages}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>Analytics</span>
                <Toggle isOn={privacySettings.analytics} onToggle={() => handlePrivacyToggle('analytics')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <span className="text-xs font-black" style={{ color: 'var(--text-primary)' }}>Dicas personalizadas</span>
                <Toggle isOn={privacySettings.personalizedTips} onToggle={() => handlePrivacyToggle('personalizedTips')} />
              </div>
              <button type="button" onClick={handleExportData} disabled={exporting} className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <Download size={15} /> {exporting ? 'A exportar...' : 'Exportar dados'}
              </button>
            </div>
          </Section>

          <Section title="Sessão" icon={LogOut}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={handleLogout} className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <LogOut size={15} /> Terminar sessão
              </button>
              <button type="button" onClick={handleDeleteAccount} className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.32)' }}>
                <Trash2 size={15} /> {showDeleteConfirm ? 'Confirmar eliminação' : 'Eliminar conta'}
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
