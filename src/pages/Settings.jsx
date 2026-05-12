import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { modeLabels, modeColors, modeDescriptions } from '../utils/helpers';
import { Save, Moon, Sun, Globe, Shield, Bell, Trash2, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, updateUser, logout, setScreen, updateMode } = useStore();
  const [saving, setSaving] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || '');
  const [coachPersonality, setCoachPersonality] = useState(user?.coachPersonality || 'disciplinado');
  const [selectedMode, setSelectedMode] = useState(user?.financialMode || 'sobrevivencia');

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

  const handleLogout = () => {
    api.logout().catch(() => {});
    logout();
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tens a certeza? Todos os dados serao eliminados permanentemente.')) return;
    try {
      await fetch('/api/auth/me', { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('poupt_token')}` } });
      logout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Coach Settings */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          AI Coach
        </h3>
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
              {['disciplinado', 'amigavel', 'estrategico', 'espiritual'].map(p => (
                <button key={p} onClick={() => setCoachPersonality(p)}
                  className="py-2 rounded-xl text-xs font-medium capitalize"
                  style={{
                    background: coachPersonality === p ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                    color: coachPersonality === p ? 'var(--gold)' : 'var(--text-secondary)',
                    border: coachPersonality === p ? '1px solid var(--gold)' : '1px solid var(--border)'
                  }}>
                  {p}
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

      {/* Financial Mode */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Modo de Vida
        </h3>
        <div className="space-y-2">
          {Object.entries(modeLabels).map(([key, label]) => (
            <button key={key} onClick={() => handleModeChange(key)}
              className="w-full p-3 rounded-xl text-left transition-all flex items-center gap-3"
              style={{
                background: selectedMode === key ? `${modeColors[key]}15` : 'transparent',
                border: selectedMode === key ? `1px solid ${modeColors[key]}` : '1px solid transparent'
              }}>
              <div className="w-3 h-3 rounded-full" style={{ background: modeColors[key] }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: modeColors[key] }}>{label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{modeDescriptions[key]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#EF4444' }}>Zona de Perigo</h3>
        <div className="space-y-2">
          <button onClick={handleLogout}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            <LogOut size={14} /> Terminar Sessao
          </button>
          <button onClick={handleDeleteAccount}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <Trash2 size={14} /> Eliminar Conta
          </button>
        </div>
      </div>
    </div>
  );
}
