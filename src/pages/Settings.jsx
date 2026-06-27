import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { themeCatalog } from '../themes';
import { api } from '../services/api';
import {
  modeLabels,
  modeColors,
  modeDescriptions,
  setCurrencyGlobal,
} from '../utils/helpers';
import {
  Save, Bell, Trash2, LogOut, Palette, Download, MessageSquare,
  Target, FileText, Calendar, Euro, Languages, Lock, Check,
  Coins, Sparkles, User, Shield, AlertTriangle, X, ChevronRight,
} from 'lucide-react';

/* ============================================================
   CONFIG
   ============================================================ */
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

const personalityIcons = {
  disciplinado: '🎯',
  amigavel: '🤗',
  estrategico: '🧠',
  espiritual: '🧘',
};

const currencies = [
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'USD', label: 'Dólar', symbol: '$' },
  { code: 'BRL', label: 'Real', symbol: 'R$' },
  { code: 'GBP', label: 'Libra', symbol: '£' },
];

const languages = [
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

const notificationItems = [
  { key: 'debtReminders', label: 'Lembretes de dívidas', desc: 'Avisos quando dívidas estão prestes a vencer.', icon: FileText },
  { key: 'goalAlerts', label: 'Alertas de metas', desc: 'Notificação ao atingir marcos de objetivos.', icon: Target },
  { key: 'coachTips', label: 'Dicas do Coach', desc: 'Sugestões e motivação do teu Coach.', icon: MessageSquare },
  { key: 'weeklyReports', label: 'Relatórios semanais', desc: 'Resumo semanal das tuas finanças.', icon: Calendar },
];

const privacyItems = [
  { key: 'analytics', label: 'Analytics', desc: 'Permite recolha de dados anónimos para melhorar a app.', icon: Shield },
  { key: 'personalizedTips', label: 'Dicas personalizadas', desc: 'Sugestões baseadas no teu perfil financeiro.', icon: Sparkles },
];

/* ============================================================
   UTILS / SUB-COMPONENTES
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

function Section({ title, description, icon: Icon, accent = 'var(--gold)', children, action }) {
  return (
    <section
      style={{
        padding: 'clamp(18px, 2.4vw, 24px)',
        borderRadius: 22,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
          {Icon && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                display: 'grid',
                placeItems: 'center',
                background: `${accent}18`,
                color: accent,
                flexShrink: 0,
              }}
            >
              <Icon size={18} />
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3
              style={{
                fontSize: 'clamp(15px, 1.8vw, 17px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h3>
            {description && (
              <p
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          display: 'block',
        }}
      >
        {children}
      </label>
      {hint && (
        <p style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>{hint}</p>
      )}
    </div>
  );
}

function Toggle({ isOn, onToggle, ariaLabel }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      aria-label={ariaLabel}
      onClick={onToggle}
      style={{
        position: 'relative',
        width: 46,
        height: 26,
        borderRadius: 999,
        background: isOn ? 'var(--gold)' : 'var(--border)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <motion.span
        animate={{ left: isOn ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
        }}
      />
    </button>
  );
}

function PrimaryButton({ children, onClick, disabled, icon: Icon, tone = 'gold', type = 'button' }) {
  const styles = {
    gold: {
      background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
      color: 'var(--text-inverse)',
      shadow: '0 6px 16px rgba(212,168,67,0.28)',
    },
    danger: {
      background: '#EF4444',
      color: 'white',
      shadow: '0 6px 16px rgba(239,68,68,0.32)',
    },
    neutral: {
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      shadow: 'none',
      border: '1px solid var(--border)',
    },
  };
  const s = styles[tone];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        minHeight: 48,
        padding: '0 18px',
        borderRadius: 14,
        fontSize: 13,
        fontWeight: 800,
        background: s.background,
        color: s.color,
        border: s.border || 'none',
        boxShadow: s.shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transition: 'transform 0.1s, filter 0.15s',
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}

function ListRow({ icon: Icon, label, desc, action, accent = 'var(--gold)' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderRadius: 14,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        minWidth: 0,
      }}
    >
      {Icon && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: `${accent}18`,
            color: accent,
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {label}
        </p>
        {desc && (
          <p
            style={{
              marginTop: 2,
              fontSize: 11,
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            {desc}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   TOAST DE SUCESSO
   ============================================================ */
function SuccessToast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            padding: '10px 16px',
            borderRadius: 12,
            background: 'rgba(16,185,129,0.95)',
            color: 'white',
            fontSize: 13,
            fontWeight: 800,
            boxShadow: '0 10px 32px rgba(0,0,0,0.28)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <Check size={16} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   MODAL DE ELIMINAÇÃO
   ============================================================ */
function DeleteAccountModal({ open, onClose, onConfirm, deleting }) {
  const [confirmText, setConfirmText] = useState('');

  if (!open) return null;

  const canDelete = confirmText.trim().toUpperCase() === 'ELIMINAR';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 200,
          display: 'grid',
          placeItems: 'center',
          padding: 16,
          backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 440,
            padding: 24,
            borderRadius: 22,
            background: 'var(--card)',
            border: '1px solid rgba(239,68,68,0.32)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(239,68,68,0.16)',
                color: '#EF4444',
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              style={{
                width: 32,
                height: 32,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <h3
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '0 0 8px',
              letterSpacing: '-0.01em',
            }}
          >
            Eliminar conta
          </h3>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              margin: '0 0 16px',
              lineHeight: 1.55,
            }}
          >
            Esta ação é <strong style={{ color: '#EF4444' }}>permanente</strong>. Todos os teus dados (transações, dívidas, metas, PoupMoedas) serão eliminados e não podem ser recuperados.
          </p>

          <FieldLabel>
            Escreve <strong style={{ color: '#EF4444' }}>ELIMINAR</strong> para confirmar
          </FieldLabel>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR"
            style={{
              width: '100%',
              minHeight: 48,
              padding: '0 14px',
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: `1.5px solid ${canDelete ? '#EF4444' : 'var(--border)'}`,
              outline: 'none',
              marginBottom: 16,
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PrimaryButton tone="neutral" onClick={onClose}>
              Cancelar
            </PrimaryButton>
            <PrimaryButton
              tone="danger"
              icon={Trash2}
              onClick={onConfirm}
              disabled={!canDelete || deleting}
            >
              {deleting ? 'A eliminar...' : 'Eliminar'}
            </PrimaryButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
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
  const [coachPersonality, setCoachPersonality] = useState(
    user?.coachPersonality || 'disciplinado'
  );
  const [selectedMode, setSelectedMode] = useState(user?.financialMode || 'sobrevivencia');
  const [currency, setCurrency] = useState(user?.currency || 'EUR');
  const [language, setLanguage] = useState(user?.language || 'pt');
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    setTimeout(() => setSaveSuccess(null), 2400);
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

  const confirmDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteAccount();
      logout();
    } catch (err) {
      console.error(err);
      alert('Não foi possível eliminar a conta. Tenta novamente.');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <Shell>
      <SuccessToast message={saveSuccess} />

      {/* HEADER PERFIL */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(20px, 3vw, 28px)',
          borderRadius: 24,
          background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              display: 'grid',
              placeItems: 'center',
              fontSize: 26,
              fontWeight: 800,
              background: 'rgba(0,0,0,0.18)',
              color: '#000',
              flexShrink: 0,
              backdropFilter: 'blur(8px)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(0,0,0,0.6)',
                margin: 0,
              }}
            >
              Definições
            </p>
            <h2
              style={{
                marginTop: 4,
                fontSize: 'clamp(20px, 3vw, 26px)',
                fontWeight: 800,
                color: '#000',
                margin: '4px 0 4px',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Utilizador'}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(0,0,0,0.7)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.email || 'sem email'}
            </p>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.18)',
              color: '#000',
              fontSize: 13,
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            <Coins size={14} />
            {user?.poupMoedas || 0}
          </div>
        </div>
      </motion.section>

      {/* GRID 2 COLUNAS (desktop) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(14px, 2vw, 18px)',
          alignItems: 'start',
          minWidth: 0,
        }}
        className="settings-grid"
      >
        {/* ============ COLUNA 1 ============ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 18px)', minWidth: 0 }}>
          {/* TEMAS */}
          <Section
            title="Aparência"
            description="Personaliza o visual da app."
            icon={Palette}
            action={
              <button
                type="button"
                onClick={() => setScreen('poupMoedas')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 800,
                  background: 'rgba(212,168,67,0.14)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(212,168,67,0.28)',
                  cursor: 'pointer',
                  minHeight: 32,
                }}
              >
                Loja <ChevronRight size={12} />
              </button>
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10,
              }}
            >
              {themeCatalog.map((t) => {
                const owned = isThemeOwned(t.id);
                const active = currentTheme === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleThemeChange(t.id)}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: t.surface,
                      color: t.text,
                      border: `2px solid ${active ? t.primary : 'transparent'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'transform 0.15s, border-color 0.15s',
                      minHeight: 130,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                      overflow: 'hidden',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {/* gradiente decorativo */}
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 40,
                        background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})`,
                        opacity: 0.18,
                      }}
                    />

                    <div
                      style={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {t.name}
                        </p>
                        <p
                          style={{
                            marginTop: 2,
                            fontSize: 11,
                            opacity: 0.7,
                          }}
                        >
                          {owned ? 'Disponível' : `${t.price} moedas`}
                        </p>
                      </div>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          display: 'grid',
                          placeItems: 'center',
                          background: active
                            ? t.primary
                            : owned
                            ? `${t.primary}22`
                            : 'rgba(0,0,0,0.18)',
                          color: active ? t.textInverse : owned ? t.primary : t.textMuted,
                          flexShrink: 0,
                        }}
                      >
                        {active ? (
                          <Check size={14} strokeWidth={3} />
                        ) : owned ? (
                          <Sparkles size={14} />
                        ) : (
                          <Lock size={13} />
                        )}
                      </div>
                    </div>

                    {/* preview dots */}
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[t.primary, t.primaryLight, t.accent, t.surfaceHover, t.border].map((c, i) => (
                        <span
                          key={i}
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 5,
                            background: c,
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* COACH */}
          <Section
            title="Coach"
            description="Personalidade e nome do teu assistente financeiro."
            icon={MessageSquare}
          >
            <div>
              <FieldLabel>Nome do Coach</FieldLabel>
              <input
                value={coachName}
                onChange={(e) => setCoachName(e.target.value)}
                placeholder="Ex: Sargento, Amigo, Mentor"
                style={{
                  width: '100%',
                  minHeight: 48,
                  padding: '0 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1.5px solid var(--border)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <FieldLabel>Personalidade</FieldLabel>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {Object.entries(personalityLabels).map(([key, label]) => {
                  const active = coachPersonality === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCoachPersonality(key)}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: active
                          ? 'rgba(212,168,67,0.14)'
                          : 'var(--bg-primary)',
                        border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start',
                        minHeight: 64,
                      }}
                    >
                      <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
                        {personalityIcons[key]}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color: active ? 'var(--gold)' : 'var(--text-primary)',
                            margin: 0,
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            marginTop: 2,
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            lineHeight: 1.4,
                          }}
                        >
                          {personalityDescriptions[key]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <PrimaryButton onClick={handleSaveCoach} disabled={saving} icon={Save}>
              {saving ? 'A guardar...' : 'Guardar Coach'}
            </PrimaryButton>
          </Section>

          {/* MODO FINANCEIRO */}
          <Section
            title="Modo financeiro"
            description="Define o foco da app de acordo com a tua fase atual."
            icon={Target}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(modeLabels).map(([mode, label]) => {
                const active = selectedMode === mode;
                const color = modeColors[mode];
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleModeChange(mode)}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 14,
                      background: active ? `${color}15` : 'var(--bg-primary)',
                      border: `1.5px solid ${active ? color : 'var(--border)'}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      minHeight: 64,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: active ? color : 'var(--text-primary)',
                          margin: 0,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          marginTop: 2,
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                        }}
                      >
                        {modeDescriptions[mode]}
                      </p>
                    </div>
                    {active && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 8,
                          display: 'grid',
                          placeItems: 'center',
                          background: color,
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        {/* ============ COLUNA 2 ============ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 18px)', minWidth: 0 }}>
          {/* MOEDA E IDIOMA */}
          <Section
            title="Regional"
            description="Moeda e idioma da aplicação."
            icon={Euro}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 12,
              }}
            >
              <div>
                <FieldLabel>Moeda</FieldLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {currencies.map((c) => {
                    const active = currency === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCurrencyChange(c.code)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: active ? 'rgba(212,168,67,0.14)' : 'var(--bg-primary)',
                          border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          minHeight: 44,
                          textAlign: 'left',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: active ? 'var(--gold)' : 'var(--text-primary)',
                            minWidth: 24,
                          }}
                        >
                          {c.symbol}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: active ? 'var(--gold)' : 'var(--text-primary)',
                            flex: 1,
                          }}
                        >
                          {c.label}
                        </span>
                        {active && <Check size={14} style={{ color: 'var(--gold)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>Idioma</FieldLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {languages.map((l) => {
                    const active = language === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleLanguageChange(l.code)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 12,
                          background: active ? 'rgba(212,168,67,0.14)' : 'var(--bg-primary)',
                          border: `1.5px solid ${active ? 'var(--gold)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          minHeight: 44,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 18, lineHeight: 1, minWidth: 24 }}>
                          {l.flag}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: active ? 'var(--gold)' : 'var(--text-primary)',
                            flex: 1,
                          }}
                        >
                          {l.label}
                        </span>
                        {active && <Check size={14} style={{ color: 'var(--gold)' }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* NOTIFICAÇÕES */}
          <Section
            title="Notificações"
            description="Escolhe que avisos queres receber."
            icon={Bell}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notificationItems.map((item) => (
                <ListRow
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  desc={item.desc}
                  action={
                    <Toggle
                      isOn={notifications[item.key]}
                      onToggle={() => handleNotificationToggle(item.key)}
                      ariaLabel={item.label}
                    />
                  }
                />
              ))}
            </div>
          </Section>

          {/* PRIVACIDADE */}
          <Section
            title="Privacidade e dados"
            description="Controla como os teus dados são usados."
            icon={Shield}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {privacyItems.map((item) => (
                <ListRow
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  desc={item.desc}
                  action={
                    <Toggle
                      isOn={privacySettings[item.key]}
                      onToggle={() => handlePrivacyToggle(item.key)}
                      ariaLabel={item.label}
                    />
                  }
                />
              ))}
              <PrimaryButton
                tone="neutral"
                onClick={handleExportData}
                disabled={exporting}
                icon={Download}
              >
                {exporting ? 'A exportar...' : 'Exportar os meus dados (JSON)'}
              </PrimaryButton>
            </div>
          </Section>

          {/* SESSÃO */}
          <Section
            title="Sessão"
            description="Gestão da tua conta."
            icon={LogOut}
            accent="#EF4444"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 10,
              }}
            >
              <PrimaryButton tone="neutral" onClick={handleLogout} icon={LogOut}>
                Terminar sessão
              </PrimaryButton>
              <PrimaryButton
                tone="danger"
                onClick={() => setShowDeleteModal(true)}
                icon={Trash2}
              >
                Eliminar conta
              </PrimaryButton>
            </div>
            <p
              style={{
                marginTop: 4,
                fontSize: 11,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              Eliminar a conta é permanente e não pode ser desfeito.
            </p>
          </Section>
        </div>
      </div>

      {/* Modal de eliminar */}
      <DeleteAccountModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteAccount}
        deleting={deleting}
      />

      <style>{`
        @media (min-width: 1024px) {
          .settings-grid {
            grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr) !important;
          }
        }
      `}</style>
    </Shell>
  );
}
