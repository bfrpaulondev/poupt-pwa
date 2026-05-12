import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, modeLabels, modeColors, modeDescriptions, calculateLevel } from '../utils/helpers';
import {
  User, Trophy, Flame, Target, Coins, Settings, ChevronRight, Award,
  Star, Shield, CreditCard, Sparkles, Crown, TrendingUp, MessageCircle,
  Save, Zap, Calendar
} from 'lucide-react';

export default function Profile() {
  const { user, setScreen, getModeColor, getModeLabel, updateUser, transactions, goals, debts } = useStore();
  const levelInfo = calculateLevel(user?.xp || 0);
  const [editingCoach, setEditingCoach] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || '');
  const [coachPersonality, setCoachPersonality] = useState(user?.coachPersonality || 'disciplinado');
  const [savingCoach, setSavingCoach] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.getReportSummary();
      setStats(res.data);
    } catch {}
  };

  const handleSaveCoach = async () => {
    setSavingCoach(true);
    try {
      await api.updateCoach({ coachName, coachPersonality });
      updateUser({ coachName, coachPersonality });
      setEditingCoach(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCoach(false);
    }
  };

  const modeColor = getModeColor();
  const modeLabel = getModeLabel();
  const currentMode = user?.financialMode || 'sobrevivencia';

  const modeOrder = ['sobrevivencia', 'recuperacao', 'estabilidade', 'crescimento', 'prosperidade'];
  const currentModeIdx = modeOrder.indexOf(currentMode);
  const nextMode = currentModeIdx < modeOrder.length - 1 ? modeOrder[currentModeIdx + 1] : null;

  const personalityLabels = {
    disciplinado: 'Disciplinado',
    amigavel: 'Amigavel',
    estrategico: 'Estrategico',
    espiritual: 'Espiritual'
  };

  const inputStyle = {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)'
  };

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      <div className="glass-card p-6 text-center">
        <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl font-bold"
          style={{ background: `${modeColor}20`, color: modeColor }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {user?.name || 'Utilizador'}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {user?.email || ''}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="mode-badge" style={{ background: `${modeColor}20`, color: modeColor }}>
            {modeLabel}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full font-medium"
            style={{
              background: user?.plan === 'premium' ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
              color: user?.plan === 'premium' ? 'var(--gold)' : 'var(--text-muted)',
              border: user?.plan === 'premium' ? '1px solid var(--gold)' : '1px solid var(--border)'
            }}>
            {user?.plan === 'premium' ? 'Premium' : 'Gratuito'}
          </span>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award size={16} style={{ color: 'var(--gold)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
              Nivel {levelInfo.level}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {levelInfo.currentLevelXp}/{levelInfo.xpForNext} XP
          </span>
        </div>
        <div className="w-full rounded-full h-2.5" style={{ background: 'var(--border)' }}>
          <div className="h-2.5 rounded-full transition-all gold-gradient"
            style={{ width: `${levelInfo.progress}%` }} />
        </div>
        <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          {levelInfo.xpForNext - levelInfo.currentLevelXp} XP para o proximo nivel
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="glass-card p-3 text-center">
          <Flame size={16} className="mx-auto mb-1" style={{ color: '#F97316' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.streak || 0}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Streak</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Zap size={16} className="mx-auto mb-1" style={{ color: '#3B82F6' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.xp || 0}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>XP</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Coins size={16} className="mx-auto mb-1" style={{ color: 'var(--gold)' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.poupMoedas || 0}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Moedas</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Trophy size={16} className="mx-auto mb-1" style={{ color: '#F59E0B' }} />
          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user?.trophies?.length || 0}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Trofeus</p>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield size={16} style={{ color: modeColor }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Modo de Vida</h3>
          </div>
          <button onClick={() => setScreen('settings')}
            className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--gold)' }}>
            Alterar <ChevronRight size={12} />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-3">
          {modeOrder.map((mode, idx) => (
            <div key={mode} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-2 rounded-full" style={{
                background: idx <= currentModeIdx ? modeColors[mode] : 'var(--border)'
              }} />
              <span className="text-[8px] font-medium" style={{
                color: idx <= currentModeIdx ? modeColors[mode] : 'var(--text-muted)'
              }}>
                {modeLabels[mode].substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {modeDescriptions[currentMode]}
        </p>
        {nextMode && (
          <div className="mt-3 p-3 rounded-xl flex items-center gap-3"
            style={{ background: `${modeColors[nextMode]}10`, border: `1px solid ${modeColors[nextMode]}30` }}>
            <TrendingUp size={16} style={{ color: modeColors[nextMode] }} />
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: modeColors[nextMode] }}>
                Proximo: {modeLabels[nextMode]}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                {modeDescriptions[nextMode]}
              </p>
            </div>
            <ChevronRight size={14} style={{ color: modeColors[nextMode] }} />
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={16} style={{ color: 'var(--gold)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Coach</h3>
          </div>
          <button onClick={() => setEditingCoach(!editingCoach)}
            className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
            {editingCoach ? 'Fechar' : 'Editar'}
          </button>
        </div>
        {!editingCoach ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(212,160,23,0.15)' }}>
              <Star size={18} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.coachName || 'Coach'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Personalidade: {personalityLabels[user?.coachPersonality] || 'Disciplinado'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Nome do Coach
              </label>
              <input type="text" value={coachName} onChange={e => setCoachName(e.target.value)}
                placeholder="Dá um nome ao teu coach"
                className="w-full px-3 py-2.5 rounded-xl text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Personalidade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(personalityLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setCoachPersonality(key)}
                    className="py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: coachPersonality === key ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                      color: coachPersonality === key ? 'var(--gold)' : 'var(--text-secondary)',
                      border: coachPersonality === key ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSaveCoach} disabled={savingCoach}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white gold-gradient disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={14} /> {savingCoach ? 'A guardar...' : 'Guardar Coach'}
            </button>
          </div>
        )}
      </div>

      {user?.trophies?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold mb-2 uppercase" style={{ color: 'var(--text-muted)' }}>
            <Trophy size={12} className="inline mr-1" /> Trofeus
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {user.trophies.map((trophy, i) => (
              <div key={i} className="glass-card p-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <Trophy size={14} style={{ color: '#F59E0B' }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {trophy.name}
                  </p>
                  {trophy.description && (
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {trophy.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins size={16} style={{ color: 'var(--gold)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>PoupMoedas</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{user?.poupMoedas || 0}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Saldo actual</p>
          </div>
          <button onClick={() => setScreen('moedas')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.3)' }}>
            <Sparkles size={14} /> Loja
          </button>
        </div>
      </div>

      {user?.plan !== 'premium' && (
        <div className="p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))', border: '1px solid rgba(212,160,23,0.3)' }}>
          <div className="flex items-center gap-3">
            <Crown size={24} style={{ color: 'var(--gold)' }} />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--gold)' }}>Upgrade para Premium</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Coach ilimitado, relatorios avancados, temas exclusivos
              </p>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--gold)' }} />
          </div>
        </div>
      )}

      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Resumo Rapido
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1"
              style={{ background: 'rgba(16,185,129,0.1)' }}>
              <TrendingUp size={14} style={{ color: '#10B981' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {transactions?.length || stats?.totalTransactions || 0}
            </p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Transacoes</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1"
              style={{ background: 'rgba(59,130,246,0.1)' }}>
              <Target size={14} style={{ color: '#3B82F6' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {goals?.length || 0}
            </p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Metas</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1"
              style={{ background: 'rgba(239,68,68,0.1)' }}>
              <CreditCard size={14} style={{ color: '#EF4444' }} />
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {debts?.length || 0}
            </p>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Dividas</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={() => setScreen('settings')}
          className="w-full glass-card p-4 flex items-center gap-3 text-left">
          <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
          <div className="flex-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Configuracoes</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button onClick={() => setScreen('coach')}
          className="w-full glass-card p-4 flex items-center gap-3 text-left">
          <MessageCircle size={18} style={{ color: 'var(--gold)' }} />
          <div className="flex-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Falar com Coach</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {user?.createdAt && (
        <p className="text-center text-[10px] pb-4" style={{ color: 'var(--text-muted)' }}>
          Membro desde {new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}
