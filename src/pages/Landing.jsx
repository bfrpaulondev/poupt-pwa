import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import {
  Bot, Snowflake, Sparkles, ArrowRight, Shield,
  Apple, Smartphone, Star, Check,
} from 'lucide-react';

/* ============================================================ */
/* Tiny icons                                                   */
/* ============================================================ */

function FlaskIcon({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 9V3h4v6l5 8.5a2 2 0 0 1-1.7 3H6.7a2 2 0 0 1-1.7-3L10 9z" />
    </svg>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function FeatureItem({ icon, title, description, theme, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 14px',
        borderRadius: 14,
        background: `${theme.primary}08`,
        border: `1px solid ${theme.primary}15`,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 12,
          background: `${theme.primary}1F`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(13px, 3.2vw, 15px)',
            fontWeight: 800,
            color: theme.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </p>
        <p
          style={{
            margin: '3px 0 0',
            fontSize: 'clamp(11px, 2.8vw, 13px)',
            color: theme.textMuted,
            lineHeight: 1.35,
            wordBreak: 'break-word',
          }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function TrustPill({ icon, text, theme }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 999,
        background: `${theme.primary}10`,
        border: `1px solid ${theme.primary}25`,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span style={{ fontSize: 12, fontWeight: 700, color: theme.text }}>
        {text}
      </span>
    </div>
  );
}

function StoreBadge({ icon, label, sublabel, theme }) {
  return (
    <button
      type="button"
      style={{
        minHeight: 52,
        padding: '8px 16px',
        borderRadius: 12,
        background: theme.surface,
        color: theme.text,
        border: `1px solid ${theme.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.primary;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {icon}
      <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
        <div style={{ fontSize: 9, fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {sublabel}
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>
          {label}
        </div>
      </div>
    </button>
  );
}

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function Landing() {
  const { setScreen, setOnboardingStep, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;

  const handleStart = () => {
    setOnboardingStep(0);
    setScreen('register');
  };

  const handleLogin = () => setScreen('login');

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: theme.background,
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 'max(env(safe-area-inset-top), 24px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
        paddingLeft: 'max(env(safe-area-inset-left), 16px)',
        paddingRight: 'max(env(safe-area-inset-right), 16px)',
      }}
    >
      {/* ====== Decorative backgrounds ====== */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.primary}22 0%, transparent 60%),
            radial-gradient(circle at 90% 90%, ${theme.primary}10 0%, transparent 45%)
          `,
        }}
      />
      {/* Subtle grid overlay */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.04,
          backgroundImage: `linear-gradient(${theme.text} 1px, transparent 1px), linear-gradient(90deg, ${theme.text} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
        }}
      />

      {/* ====== Centered container ====== */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          margin: '0 auto',
          minHeight: 'calc(100dvh - max(env(safe-area-inset-top), 24px) - max(env(safe-area-inset-bottom), 24px))',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(20px, 4vw, 28px)',
        }}
      >
        {/* ====== HEADER (logo) ====== */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: 'center' }}
        >
          {/* Animated piggy */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              fontSize: 'clamp(48px, 12vw, 64px)',
              lineHeight: 1,
              marginBottom: 12,
              filter: `drop-shadow(0 8px 16px ${theme.primary}40)`,
            }}
          >
            🐷
          </motion.div>

          {/* Brand badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              background: `${theme.primary}15`,
              border: `1px solid ${theme.primary}30`,
              marginBottom: 10,
            }}
          >
            <Sparkles size={12} color={theme.primary} />
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.primary, letterSpacing: '0.05em' }}>
              FEITO EM PORTUGAL
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(30px, 7vw, 38px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            PoupPT
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: 'clamp(13px, 3vw, 15px)',
              color: theme.textMuted,
              fontWeight: 500,
            }}
          >
            O teu treinador financeiro pessoal
          </p>
        </motion.header>

        {/* ====== HERO CARD with features ====== */}
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            borderRadius: 22,
            padding: 'clamp(20px, 4vw, 26px)',
            background: theme.glassBg,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${theme.glassBorder}`,
            boxShadow: `0 20px 50px ${theme.shadow}`,
            minWidth: 0,
          }}
        >
          {/* Card heading */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(18px, 4.5vw, 22px)',
                fontWeight: 900,
                color: theme.text,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Sai da crise.{' '}
              <span style={{ color: theme.primary }}>Toma o controlo.</span>
            </h2>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 'clamp(12px, 2.8vw, 13px)',
                color: theme.textMuted,
                lineHeight: 1.45,
              }}
            >
              Organiza, poupa e elimina dívidas com métodos comprovados.
            </p>
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FeatureItem
              icon={<FlaskIcon color={theme.primary} />}
              title="6 Frascos"
              description="Método de gestão financeira comprovado"
              theme={theme}
              delay={0.15}
            />
            <FeatureItem
              icon={<Bot size={22} color={theme.primary} />}
              title="AI Coach"
              description="Treinador pessoal com 4 personalidades"
              theme={theme}
              delay={0.22}
            />
            <FeatureItem
              icon={<Snowflake size={22} color={theme.primary} />}
              title="Snowball"
              description="Método bola de neve para eliminar dívidas"
              theme={theme}
              delay={0.29}
            />
          </div>
        </motion.section>

        {/* ====== CTA BUTTONS ====== */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <motion.button
            type="button"
            onClick={handleStart}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              minHeight: 58,
              border: 'none',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              color: theme.textInverse,
              fontSize: 16,
              fontWeight: 900,
              boxShadow: `0 14px 32px ${theme.primary}40`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              letterSpacing: '0.01em',
              transition: 'transform 0.15s ease',
            }}
          >
            <Sparkles size={17} />
            Começar grátis
            <ArrowRight size={17} />
          </motion.button>

          <motion.button
            type="button"
            onClick={handleLogin}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              minHeight: 50,
              borderRadius: 14,
              background: 'transparent',
              color: theme.primary,
              border: `1.5px solid ${theme.primary}50`,
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${theme.primary}10`;
              e.currentTarget.style.borderColor = theme.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = `${theme.primary}50`;
            }}
          >
            Já tenho conta
          </motion.button>
        </motion.div>

        {/* ====== TRUST PILLS ====== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <TrustPill
            icon={<Check size={12} color={theme.primary} />}
            text="100% Gratuito"
            theme={theme}
          />
          <TrustPill
            icon={<Shield size={12} color={theme.primary} />}
            text="Sem cartão"
            theme={theme}
          />
          <TrustPill
            icon={<Star size={12} color={theme.primary} fill={theme.primary} />}
            text="+1000 utilizadores"
            theme={theme}
          />
        </motion.div>

        {/* ====== STORE BADGES ====== */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.42 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <StoreBadge
            icon={<Apple size={22} color={theme.text} />}
            sublabel="Em breve"
            label="App Store"
            theme={theme}
          />
          <StoreBadge
            icon={<Smartphone size={22} color={theme.text} />}
            sublabel="Em breve"
            label="Google Play"
            theme={theme}
          />
        </motion.div>

        {/* ====== FOOTER ====== */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            textAlign: 'center',
            fontSize: 11,
            color: theme.textMuted,
            lineHeight: 1.5,
          }}
        >
          Ao continuar, aceitas os{' '}
          <a
            href="#terms"
            style={{ color: theme.primary, textDecoration: 'none', fontWeight: 600 }}
          >
            Termos
          </a>{' '}
          e a{' '}
          <a
            href="#privacy"
            style={{ color: theme.primary, textDecoration: 'none', fontWeight: 600 }}
          >
            Privacidade
          </a>
          .
        </motion.footer>
      </div>
    </div>
  );
}
