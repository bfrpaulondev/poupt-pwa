import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import useThemeColors from '../utils/useThemeColors';
import {
  User, Trophy, Flame, Target, Coins, Settings, ChevronRight, Award,
  Star, Shield, CreditCard, Sparkles, Crown, TrendingUp, MessageCircle,
  Mail, Calendar, Camera, Zap, Edit3
} from 'lucide-react';

const modeConfig = {
  sobrevivencia: { label: 'Sobrevivencia', color: '#EF4444' },
  recuperacao: { label: 'Recuperacao', color: '#F97316' },
  estabilidade: { label: 'Estabilidade', color: '#10B981' },
  crescimento: { label: 'Crescimento', color: '#3B82F6' },
  prosperidade: { label: 'Prosperidade', color: '#FFD700' },
};

function calculateLevel(xp) {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const xpForNext = 100;
  const progress = (currentLevelXp / xpForNext) * 100;
  return { level, currentLevelXp, xpForNext, progress };
}

export default function Profile() {
  const { theme } = useThemeColors();
  const { user, setScreen, updateUser } = useStore();
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const mockUser = user || {
    name: 'Utilizador', email: '', income: 0, poupMoedas: 0,
    streak: 0, level: 1, xp: 0, trophies: [], plan: 'free',
    coachMode: 'sargento', financialMode: 'sobrevivencia',
  };

  const levelInfo = calculateLevel(mockUser.xp || 0);
  const currentMode = mockUser.financialMode || 'sobrevivencia';
  const modeColor = modeConfig[currentMode]?.color || theme.primary;
  const modeLabel = modeConfig[currentMode]?.label || 'Sobrevivencia';
  const modeOrder = Object.keys(modeConfig);
  const currentModeIdx = modeOrder.indexOf(currentMode);

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Avatar & Identity */}
      <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700,
            background: s(modeColor, 0.15), color: modeColor
          }}>
            {mockUser.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button style={{
            position: 'absolute', bottom: -2, right: -2, width: 26, height: 26,
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: theme.primary, color: theme.textInverse, border: 'none', cursor: 'pointer'
          }}>
            <Camera size={12} />
          </button>
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: theme.text, margin: 0 }}>{mockUser.name}</h2>
        <p style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <Mail size={10} /> {mockUser.email || ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <span className="mode-badge" style={{ background: s(modeColor, 0.15), color: modeColor }}>
            {modeLabel}
          </span>
          <span style={{
            fontSize: 10, padding: '4px 8px', borderRadius: 20, fontWeight: 500,
            background: mockUser.plan === 'premium' ? s(theme.primary, 0.2) : theme.surface,
            color: mockUser.plan === 'premium' ? theme.primary : theme.textMuted,
            border: mockUser.plan === 'premium' ? `1px solid ${theme.primary}` : `1px solid ${theme.border}`
          }}>
            {mockUser.plan === 'premium' ? '✨ Premium' : 'Gratuito'}
          </span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Award size={16} style={{ color: theme.primary }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: theme.primary }}>Nivel {levelInfo.level}</span>
          </div>
          <span style={{ fontSize: 11, color: theme.textMuted }}>{levelInfo.currentLevelXp}/{levelInfo.xpForNext} XP</span>
        </div>
        <div style={{ width: '100%', borderRadius: 20, height: 10, background: theme.border }}>
          <div style={{
            height: 10, borderRadius: 20, transition: 'width 0.5s',
            width: `${levelInfo.progress}%`,
            background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`
          }} />
        </div>
        <p style={{ fontSize: 10, color: theme.textMuted, marginTop: 4, textAlign: 'right' }}>
          {levelInfo.xpForNext - levelInfo.currentLevelXp} XP para o proximo nivel
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { icon: Flame, value: mockUser.streak || 0, label: 'Streak', color: '#F97316' },
          { icon: Zap, value: mockUser.xp || 0, label: 'XP', color: '#3B82F6' },
          { icon: Coins, value: mockUser.poupMoedas || 0, label: 'Moedas', color: theme.primary },
          { icon: Trophy, value: mockUser.trophies?.length || 0, label: 'Trofeus', color: '#F59E0B' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="glass-card" style={{ padding: 12, textAlign: 'center' }}>
            <Icon size={16} style={{ color, margin: '0 auto 4px' }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: theme.text, margin: 0 }}>{value}</p>
            <p style={{ fontSize: 9, color: theme.textMuted, margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Mode Progress */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={16} style={{ color: modeColor }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>Modo de Vida</h3>
          </div>
          <button onClick={() => setScreen('settings')} style={{
            fontSize: 11, fontWeight: 500, color: theme.primary, background: 'none',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2
          }}>
            Alterar <ChevronRight size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {modeOrder.map((mode, idx) => (
            <div key={mode} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%', height: 6, borderRadius: 20,
                background: idx <= currentModeIdx ? modeConfig[mode].color : theme.border
              }} />
              <span style={{ fontSize: 8, fontWeight: 500, color: idx <= currentModeIdx ? modeConfig[mode].color : theme.textMuted }}>
                {modeConfig[mode].label.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trophies */}
      {mockUser.trophies?.length > 0 && (
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
            <Trophy size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} /> Trofeus
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {mockUser.trophies.map((trophy, i) => (
              <div key={i} className="glass-card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: s('#F59E0B', 0.15)
                }}>
                  <Trophy size={14} style={{ color: '#F59E0B' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: theme.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trophy.name || trophy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PoupMoedas */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Coins size={16} style={{ color: theme.primary }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>PoupMoedas</h3>
            </div>
            <p style={{ fontSize: 24, fontWeight: 700, color: theme.primary, margin: 0 }}>{mockUser.poupMoedas || 0}</p>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Saldo actual</p>
          </div>
          <button onClick={() => setScreen('moedas')} style={{
            padding: '10px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500,
            background: s(theme.primary, 0.15), color: theme.primary,
            border: `1px solid ${s(theme.primary, 0.3)}`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Sparkles size={14} /> Loja
          </button>
        </div>
      </div>

      {/* Quick Nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { icon: Settings, label: 'Configuracoes', screen: 'settings', color: theme.textMuted },
          { icon: MessageCircle, label: 'Falar com Coach', screen: 'coach', color: theme.primary },
          { icon: TrendingUp, label: 'Ver Relatorios', screen: 'reports', color: '#3B82F6' },
        ].map(({ icon: Icon, label, screen, color }) => (
          <button key={label} onClick={() => setScreen(screen)} className="glass-card" style={{
            width: '100%', padding: 16, display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
          }}>
            <Icon size={18} style={{ color }} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: theme.text }}>{label}</span>
            <ChevronRight size={16} style={{ color: theme.textMuted }} />
          </button>
        ))}
      </div>

      {/* Premium CTA */}
      {mockUser.plan !== 'premium' && (
        <div style={{
          padding: 16, borderRadius: 16,
          background: `linear-gradient(135deg, ${s(theme.primary, 0.15)}, ${s(theme.primary, 0.05)})`,
          border: `1px solid ${s(theme.primary, 0.3)}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Crown size={24} style={{ color: theme.primary }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: theme.primary, margin: 0 }}>Upgrade para Premium</p>
              <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Coach ilimitado, relatorios avancados, temas exclusivos</p>
            </div>
            <ChevronRight size={16} style={{ color: theme.primary }} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
