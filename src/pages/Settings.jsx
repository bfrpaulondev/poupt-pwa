import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes, themeKeys } from '../themes';
import {
  Palette, Bell, LogOut, Info, ChevronRight,
  MessageSquare, Sparkles, Crown, Check, Shield, Globe, Lock
} from 'lucide-react';

const coachModes = [
  { id: 'sargento', label: 'Sargento', desc: 'Firme e direto' },
  { id: 'amigavel', label: 'Amigavel', desc: 'Acolhedor e motivador' },
];

export default function Settings() {
  const theme = themes.darkGold;
  const { user, updateUser, logout, setScreen } = useStore();
  const [selectedTheme, setSelectedTheme] = useState('darkGold');
  const [coachMode, setCoachMode] = useState(user?.coachMode || 'sargento');
  const [notifications, setNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(null);

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const showSuccess = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 2000);
  };

  const Toggle = ({ isOn, onToggle }) => (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 20, position: 'relative',
      transition: 'background 0.2s', background: isOn ? theme.primary : theme.border,
      border: 'none', cursor: 'pointer', flexShrink: 0
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, transition: 'left 0.2s',
        left: isOn ? 22 : 2
      }} />
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Success Toast */}
      {saveSuccess && (
        <div style={{
          padding: 12, borderRadius: 12, fontSize: 12, fontWeight: 500, textAlign: 'center',
          background: s('#10B981', 0.15), color: '#10B981'
        }}>
          <Check size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> {saveSuccess}
        </div>
      )}

      {/* Theme Selector */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Palette size={16} style={{ color: theme.primary }} />
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Tema</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {themeKeys.map(key => {
            const t = themes[key];
            const isActive = selectedTheme === key;
            return (
              <button key={key} onClick={() => { setSelectedTheme(key); showSuccess('Tema alterado!'); }} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 8,
                borderRadius: 12, transition: 'all 0.2s', cursor: 'pointer',
                background: isActive ? s(t.primary, 0.1) : 'transparent',
                border: isActive ? `1px solid ${t.primary}` : '1px solid transparent'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', position: 'relative',
                  background: `linear-gradient(135deg, ${t.primary}, ${t.background})`,
                  border: key === 'arcticWhite' ? '1px solid #CBD5E1' : 'none',
                  boxShadow: isActive ? `0 0 12px ${s(t.primary, 0.5)}` : 'none'
                }}>
                  {isActive && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#fff" />
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: isActive ? t.primary : theme.textMuted, textAlign: 'center', lineHeight: 1.2 }}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coach Mode */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Sparkles size={16} style={{ color: theme.primary }} />
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Modo do Coach</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {coachModes.map(mode => (
            <button key={mode.id} onClick={() => { setCoachMode(mode.id); updateUser({ coachMode: mode.id }); showSuccess('Coach actualizado!'); }} style={{
              padding: 12, borderRadius: 12, textAlign: 'left', cursor: 'pointer',
              background: coachMode === mode.id ? s(theme.primary, 0.15) : theme.surface,
              border: coachMode === mode.id ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: coachMode === mode.id ? theme.primary : theme.text, margin: 0 }}>
                {mode.label}
              </p>
              <p style={{ fontSize: 10, color: theme.textMuted, margin: '4px 0 0' }}>{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Bell size={16} style={{ color: theme.primary }} />
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Notificacoes</h3>
        </div>
        {[
          { label: 'Alertas de dividas', desc: 'Avisos de pagamentos proximos' },
          { label: 'Dicas do Coach', desc: 'Sugestoes e motivacao' },
          { label: 'Relatorios semanais', desc: 'Resumo semanal das financas' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              background: notifications ? s(theme.primary, 0.15) : theme.surface
            }}>
              <MessageSquare size={14} style={{ color: notifications ? theme.primary : theme.textMuted }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: theme.text, margin: 0 }}>{item.label}</p>
              <p style={{ fontSize: 10, color: theme.textMuted, margin: 0 }}>{item.desc}</p>
            </div>
            <Toggle isOn={notifications} onToggle={() => { setNotifications(!notifications); showSuccess('Notificacoes actualizadas!'); }} />
          </div>
        ))}
      </div>

      {/* Language */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Globe size={16} style={{ color: theme.primary }} />
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Idioma</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { code: 'pt', label: 'Portugues' },
            { code: 'en', label: 'English' },
            { code: 'es', label: 'Espanol' },
          ].map(lang => (
            <button key={lang.code} style={{
              padding: '10px 0', borderRadius: 12, fontSize: 12, fontWeight: 500, textAlign: 'center', cursor: 'pointer',
              background: lang.code === 'pt' ? s(theme.primary, 0.15) : theme.surface,
              color: lang.code === 'pt' ? theme.primary : theme.textMuted,
              border: lang.code === 'pt' ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`
            }}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Upsell */}
      <div style={{
        padding: 16, borderRadius: 16,
        background: `linear-gradient(135deg, ${s(theme.primary, 0.15)}, ${s(theme.primary, 0.05)})`,
        border: `1px solid ${s(theme.primary, 0.3)}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Crown size={20} style={{ color: theme.primary }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: theme.primary, margin: 0 }}>Premium</p>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Temas exclusivos, coach avancado, relatorios completos</p>
          </div>
          <ChevronRight size={16} style={{ color: theme.primary }} />
        </div>
      </div>

      {/* About */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Info size={16} style={{ color: theme.primary }} />
          <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Sobre o PoupPT</h3>
        </div>
        {[
          { label: 'Versao', value: '1.3.0' },
          { label: 'Ambiente', value: 'Producao' },
          { label: 'Licenca', value: 'Pessoal' },
        ].map(row => (
          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ fontSize: 13, color: theme.textMuted }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: theme.text }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); }} style={{
        width: '100%', padding: 14, borderRadius: 12, fontSize: 13, fontWeight: 500,
        background: s('#EF4444', 0.1), color: '#EF4444',
        border: `1px solid ${s('#EF4444', 0.3)}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        <LogOut size={14} /> Terminar Sessao
      </button>
    </motion.div>
  );
}
