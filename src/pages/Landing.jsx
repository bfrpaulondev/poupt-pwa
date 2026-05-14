import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Bot, Snowflake, Sparkles } from 'lucide-react';

function FlaskIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 9V3h4v6l5 8.5a2 2 0 0 1-1.7 3H6.7a2 2 0 0 1-1.7-3L10 9z" />
    </svg>
  );
}

function FeatureItem({ icon, title, description, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 52, height: 52, flexShrink: 0, borderRadius: 14,
          background: `${theme.primary}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: '17px', fontWeight: 800, color: theme.text }}>
          {title}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 12, lineHeight: '15px', color: theme.textMuted }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function TrustItem({ text, theme }) {
  return (
    <span style={{ fontSize: 11, lineHeight: '14px', color: theme.textMuted, whiteSpace: 'nowrap' }}>
      {text}
    </span>
  );
}

function StoreBadge({ icon, text, theme }) {
  return (
    <div
      style={{
        height: 48, padding: '0 16px', borderRadius: 11,
        background: theme.surface, color: theme.textMuted,
        border: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
      }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function Landing() {
  const { setScreen, setOnboardingStep, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;

  const handleStart = () => {
    setOnboardingStep(0);
    setScreen('register');
  };

  const handleLogin = () => {
    setScreen('login');
  };

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100dvh',
        background: theme.background,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse at 50% -5%, ${theme.primary}20 0%, ${theme.primary}08 30%, transparent 60%)`,
        }}
      />

      <div
        style={{
          width: 'min(calc(100vw - 32px), 480px)',
          minHeight: '100dvh',
          margin: '0 auto',
          paddingTop: 40,
          paddingBottom: 28,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: 'center' }}
        >
          <div style={{ fontSize: 52, lineHeight: '52px', height: 52, marginBottom: 10 }}>
            🐷
          </div>

          <h1
            className="gradient-text"
            style={{
              margin: 0, fontSize: 30, lineHeight: '34px', fontWeight: 900, letterSpacing: '-1px',
              backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            }}
          >
            PoupPT
          </h1>

          <p style={{ margin: '7px 0 0', fontSize: 14, lineHeight: '18px', color: theme.textMuted }}>
            O teu treinador financeiro pessoal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          style={{
            marginTop: 16, width: '100%', borderRadius: 18,
            padding: '26px 22px 22px',
            background: theme.glassBg,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${theme.glassBorder}`,
            boxShadow: `0 16px 50px ${theme.shadow}`,
          }}
        >
          <h2
            style={{
              margin: '0 0 22px', textAlign: 'center', fontSize: 20, lineHeight: '24px',
              fontWeight: 900, color: theme.text,
            }}
          >
            Sai da crise. Toma o controlo.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FeatureItem
              icon={<FlaskIcon color={theme.primary} />}
              title="6 Frascos"
              description="Metodo de gestao financeira comprovado"
              theme={theme}
            />
            <FeatureItem
              icon={<Bot size={20} color={theme.primary} />}
              title="AI Coach"
              description="Treinador pessoal com 4 personalidades"
              theme={theme}
            />
            <FeatureItem
              icon={<Snowflake size={20} color={theme.primary} />}
              title="Snowball"
              description="Metodo bola de neve para eliminar dividas"
              theme={theme}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <button
            onClick={handleStart}
            style={{
              width: '100%', height: 58, border: 'none', borderRadius: 16,
              background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              color: theme.textInverse, fontSize: 16, fontWeight: 900,
              boxShadow: `0 12px 30px ${theme.primary}35`, cursor: 'pointer',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Sparkles size={16} />
              Comecar Gratis
            </span>
          </button>

          <button
            onClick={handleLogin}
            style={{
              width: '100%', height: 50, borderRadius: 16,
              background: 'transparent', color: theme.primary,
              border: `1.5px solid ${theme.primary}60`,
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
            }}
          >
            Ja tenho conta
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          style={{ marginTop: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}
        >
          <TrustItem text="Gratuito" theme={theme} />
          <TrustItem text="Sem cartao" theme={theme} />
          <TrustItem text="+1000 users" theme={theme} />
        </motion.div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <StoreBadge icon="Apple" text="App Store" theme={theme} />
          <StoreBadge icon="Play" text="Google Play" theme={theme} />
        </div>
      </div>
    </div>
  );
}
