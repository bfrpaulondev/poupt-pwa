import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import useThemeColors from '../utils/useThemeColors';
import {
  TrendingUp, BarChart3, Building2, Bitcoin, Landmark, Home, PiggyBank,
  Lock, Crown, Shield, BookOpen, Sparkles, ChevronRight, Star
} from 'lucide-react';

const investTypes = [
  { value: 'stock', label: 'Acoes', icon: TrendingUp, color: '#3B82F6', desc: 'Acoes individuais na bolsa' },
  { value: 'etf', label: 'ETFs', icon: BarChart3, color: '#10B981', desc: 'Fundos negociados na bolsa' },
  { value: 'fund', label: 'Fundos', icon: Landmark, color: '#8B5CF6', desc: 'Fundos de investimento' },
  { value: 'crypto', label: 'Crypto', icon: Bitcoin, color: '#F59E0B', desc: 'Criptomoedas' },
  { value: 'real_estate', label: 'Imoveis', icon: Home, color: '#EF4444', desc: 'Investimento imobiliario' },
  { value: 'ppr', label: 'PPR', icon: PiggyBank, color: '#EC4899', desc: 'Plano Poupanca Reforma' },
];

const tips = [
  { title: 'Diversificacao e a chave', desc: 'Nao coloques todos os ovos no mesmo cesto. Distribui entre acoes, ETFs e obrigacoes.', icon: Shield },
  { title: 'Pensa a longo prazo', desc: 'Investimentos de longo prazo tendem a superar oscilacoes de curto prazo.', icon: TrendingUp },
  { title: 'Comeca com pouco', desc: 'Mesmo 50€ por mes fazem diferenca composta ao longo dos anos.', icon: PiggyBank },
  { title: 'Educacao financeira primeiro', desc: 'Antes de investir, aprende os basicos sobre risco e diversificacao.', icon: BookOpen },
];

export default function Investments() {
  const { theme } = useThemeColors();
  const { user } = useStore();

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const isPremium = user?.plan === 'premium';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Premium Notice */}
      {!isPremium && (
        <div style={{
          padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12,
          background: s(theme.primary, 0.1), border: `1px solid ${s(theme.primary, 0.3)}`
        }}>
          <Crown size={20} style={{ color: theme.primary }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: theme.primary, margin: 0 }}>Funcionalidade Premium</p>
            <p style={{ fontSize: 11, color: theme.textMuted, margin: 0 }}>Investimentos avancados disponiveis no plano Premium</p>
          </div>
          <Lock size={16} style={{ color: theme.primary }} />
        </div>
      )}

      {/* Coming Soon Header */}
      <div style={{
        padding: 32, borderRadius: 16, textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${s(theme.primary, 0.15)}, ${s(theme.primary, 0.05)})`,
        border: `1px solid ${s(theme.primary, 0.3)}`
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: s(theme.primary, 0.15)
        }}>
          <BarChart3 size={28} style={{ color: theme.primary }} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: theme.text, margin: '0 0 4px' }}>Investimentos</h2>
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>Em breve: acompanha o teu portfolio completo</p>
        <div style={{
          marginTop: 16, padding: '6px 12px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 6,
          background: s(theme.primary, 0.2), color: theme.primary, fontSize: 11, fontWeight: 600
        }}>
          <Sparkles size={12} /> Coming Soon
        </div>
      </div>

      {/* Investment Types Grid */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', margin: '0 0 12px' }}>Tipos de Investimento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {investTypes.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.value} className="glass-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  background: s(t.color, 0.15)
                }}>
                  <Icon size={18} style={{ color: t.color }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>{t.label}</p>
                  <p style={{ fontSize: 10, color: theme.textMuted, margin: '2px 0 0', lineHeight: 1.3 }}>{t.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', margin: '0 0 12px' }}>Dicas de Investimento</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div key={idx} className="glass-card" style={{ padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: s(theme.primary, 0.15)
                }}>
                  <Icon size={16} style={{ color: theme.primary }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>{tip.title}</p>
                  <p style={{ fontSize: 11, color: theme.textMuted, margin: '4px 0 0', lineHeight: 1.4 }}>{tip.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Teaser */}
      <div style={{
        padding: 20, borderRadius: 16, textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.gradient[0]}20, ${theme.gradient[1]}10)`,
        border: `1px solid ${s(theme.primary, 0.3)}`
      }}>
        <Star size={24} style={{ color: theme.primary, margin: '0 auto 8px' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: theme.primary, margin: '0 0 4px' }}>Upgrade para Premium</p>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: 0 }}>Desbloqueia portfolio completo, dividendos e analytics avancados</p>
      </div>
    </motion.div>
  );
}
