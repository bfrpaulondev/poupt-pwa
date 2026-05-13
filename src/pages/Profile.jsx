import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, modeLabels, modeColors, modeDescriptions, calculateLevel } from '../utils/helpers';
import {
  User, Trophy, Flame, Target, Coins, Settings, ChevronRight, Award,
  Star, Shield, CreditCard, Sparkles, Crown, TrendingUp, MessageCircle,
  Save, Zap, Calendar, Camera, Mail, Clock, AlertCircle, Check,
  Edit3, Lock, Trash2, Eye, EyeOff
} from 'lucide-react';

export default function Profile() {
  const { user, setScreen, updateUser, transactions, goals, debts, logout } = useStore();
  const levelInfo = calculateLevel(user?.xp || 0);
  const [editingCoach, setEditingCoach] = useState(false);
  const [coachName, setCoachName] = useState(user?.coachName || '');
  const [coachPersonality, setCoachPersonality] = useState(user?.coachPersonality || 'disciplinado');
  const [coachGender, setCoachGender] = useState(user?.coachGender || 'masculino');
  const [savingCoach, setSavingCoach] = useState(false);
  const [stats, setStats] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
      await api.updateCoach({ coachName, coachPersonality, coachGender });
      updateUser({ coachName, coachPersonality, coachGender });
      setEditingCoach(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingCoach(false);
    }
  };

  const handleDetectMode = async () => {
    setDetecting(true);
    try {
      const res = await api.detectMode();
      if (res.data?.financialMode) {
        updateUser({ financialMode: res.data.financialMode });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetecting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'https://poupt-api.onrender.com/api'}/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('poupt_token')}` }
      });
      logout();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingAccount(false);
    }
  };

  const modeColor = modeColors[user?.financialMode] || modeColors.sobrevivencia;
  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivencia';
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

  const genderLabels = {
    masculino: 'Masculino',
    feminino: 'Feminino',
    neutro: 'Neutro'
  };



  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Avatar & Identity Card */}
      <div className="glass-card p-6 text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold"
            style={{ background: `${modeColor}20`, color: modeColor }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gold)', color: '#fff' }}>
            <Camera size={12} />
          </button>
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {user?.name || 'Utilizador'}
        </h2>
        <p className="text-xs mt-0.5 flex items-center justify-center gap-1" style={{ color: 'var(--text-secondary)' }}>
          <Mail size={10} /> {user?.email || ''}
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="mode-badge" style={{ background: `${modeColor}20`, color: modeColor }}>
            {modeLabel}
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full font-medium"
            style={{
              background: user?.plan === 'premium' ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
              color: user?.plan === 'premium' ? 'var(--gold)' : 'var(--text-muted)',
              border: user?.plan === 'premium' ? '1px solid var(--gold)' : '1px solid var(--border)'
            }}>
            {user?.plan === 'premium' ? '✨ Premium' : 'Gratuito'}
          </span>
        </div>
      </div>

      {/* Gamification Stats */}
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
        <div className="w-full rounded-full h-3" style={{ background: 'var(--border)' }}>
          <div className="h-3 rounded-full transition-all gold-gradient relative"
            style={{ width: `${levelInfo.progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-lg" />
          </div>
        </div>
        <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
          {levelInfo.xpForNext - levelInfo.currentLevelXp} XP para o proximo nivel
        </p>
      </div>

      {/* Stats Grid */}
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

      {/* Financial Mode */}
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

      {/* Change Mode Section */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Edit3 size={14} style={{ color: 'var(--gold)' }} /> Alterar Modo
          </h3>
          <button onClick={handleDetectMode} disabled={detecting}
            className="text-[10px] font-medium px-2 py-1 rounded-lg"
            style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.3)' }}>
            {detecting ? 'A detectar...' : 'Auto-detectar'}
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {modeOrder.map((mode) => (
            <button key={mode} onClick={async () => {
              try {
                await api.updateMode(mode);
                updateUser({ financialMode: mode });
              } catch (err) { console.error(err); }
            }}
              className="py-2 rounded-xl text-center transition-all"
              style={{
                background: currentMode === mode ? `${modeColors[mode]}20` : 'var(--bg-secondary)',
                border: currentMode === mode ? `1px solid ${modeColors[mode]}` : '1px solid var(--border)'
              }}>
              <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: modeColors[mode] }} />
              <span className="text-[8px] font-medium" style={{
                color: currentMode === mode ? modeColors[mode] : 'var(--text-muted)'
              }}>
                {modeLabels[mode].substring(0, 4)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Coach Settings */}
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
              style={{ background: 'rgba(255,215,0,0.15)' }}>
              <Star size={18} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.coachName || 'Coach'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {personalityLabels[user?.coachPersonality] || 'Disciplinado'} • {genderLabels[user?.coachGender] || 'Masculino'}
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
                placeholder="Da um nome ao teu coach"
                className="w-full input-field" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>
                Genero
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(genderLabels).map(([key, label]) => (
                  <button key={key} onClick={() => setCoachGender(key)}
                    className="py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: coachGender === key ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
                      color: coachGender === key ? 'var(--gold)' : 'var(--text-secondary)',
                      border: coachGender === key ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}>
                    {label}
                  </button>
                ))}
              </div>
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
                      background: coachPersonality === key ? 'rgba(255,215,0,0.2)' : 'var(--bg-secondary)',
                      color: coachPersonality === key ? 'var(--gold)' : 'var(--text-secondary)',
                      border: coachPersonality === key ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSaveCoach} disabled={savingCoach}
              className="btn-gold w-full py-2.5 disabled:opacity-50 flex items-center justify-center gap-2">
              <Save size={14} /> {savingCoach ? 'A guardar...' : 'Guardar Coach'}
            </button>
          </div>
        )}
      </div>

      {/* Trophies */}
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

      {/* PoupMoedas */}
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
          <button type="button" onClick={() => setScreen('poupMoedas')}
            className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer"
            style={{ background: 'rgba(255,215,0,0.15)', color: 'var(--gold)', border: '1px solid rgba(255,215,0,0.3)' }}>
            <Sparkles size={14} /> Loja
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Informacoes da Conta
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail size={14} style={{ color: 'var(--text-muted)' }} />
            <div className="flex-1">
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Email</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{user?.email || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Crown size={14} style={{ color: user?.plan === 'premium' ? 'var(--gold)' : 'var(--text-muted)' }} />
            <div className="flex-1">
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Plano</p>
              <p className="text-sm" style={{ color: user?.plan === 'premium' ? 'var(--gold)' : 'var(--text-primary)' }}>
                {user?.plan === 'premium' ? 'Premium' : 'Gratuito'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <div className="flex-1">
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Membro desde</p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium CTA */}
      {user?.plan !== 'premium' && (
        <div className="p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))', border: '1px solid rgba(255,215,0,0.3)' }}>
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

      {/* Quick Summary */}
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

      {/* Quick Navigation */}
      <div className="space-y-2">
        <button type="button" onClick={() => setScreen('settings')}
          className="w-full glass-card p-4 flex items-center gap-3 text-left cursor-pointer"
          style={{ minHeight: '48px' }}>
          <Settings size={18} style={{ color: 'var(--text-secondary)' }} />
          <div className="flex-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Configuracoes</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button type="button" onClick={() => setScreen('coach')}
          className="w-full glass-card p-4 flex items-center gap-3 text-left cursor-pointer"
          style={{ minHeight: '48px' }}>
          <MessageCircle size={18} style={{ color: 'var(--gold)' }} />
          <div className="flex-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Falar com Coach</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button type="button" onClick={() => setScreen('reports')}
          className="w-full glass-card p-4 flex items-center gap-3 text-left cursor-pointer"
          style={{ minHeight: '48px' }}>
          <TrendingUp size={18} style={{ color: '#3B82F6' }} />
          <div className="flex-1">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Ver Relatorios</span>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold mb-3 uppercase flex items-center gap-1" style={{ color: '#EF4444' }}>
          <AlertCircle size={12} /> Zona de Perigo
        </h3>
        {!showDeleteAccount ? (
          <button onClick={() => setShowDeleteAccount(true)}
            className="w-full py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            <Trash2 size={12} /> Eliminar conta
          </button>
        ) : (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs" style={{ color: '#EF4444' }}>
              Tens a certeza? Esta accao e irreversivel e todos os teus dados serao eliminados permanentemente.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteAccount(false)}
                className="flex-1 py-2 rounded-xl text-xs"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancelar
              </button>
              <button onClick={handleDeleteAccount} disabled={deletingAccount}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {deletingAccount ? 'A eliminar...' : 'Eliminar permanentemente'}
              </button>
            </div>
          </div>
        )}
      </div>

      {user?.createdAt && (
        <p className="text-center text-[10px] pb-4" style={{ color: 'var(--text-muted)' }}>
          Membro desde {new Date(user.createdAt).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  );
}
