import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Bot, Snowflake, Sparkles } from 'lucide-react';

function FlaskIcon({ color }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3h6" />
      <path d="M10 9V3h4v6l5 8.5a2 2 0 0 1-1.7 3H6.7a2 2 0 0 1-1.7-3L10 9z" />
    </svg>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: 13,
          background: 'rgba(226, 185, 79, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: '17px',
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          {title}
        </p>

        <p
          style={{
            margin: '3px 0 0',
            fontSize: 12,
            lineHeight: '15px',
            color: '#A8A7D8',
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function TrustItem({ text }) {
  return (
    <span
      style={{
        fontSize: 11,
        lineHeight: '14px',
        color: '#A8A7D8',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
}

function StoreBadge({ icon, text }) {
  return (
    <div
      style={{
        height: 34,
        padding: '0 15px',
        borderRadius: 9,
        background: '#1B1A33',
        color: '#B8B7DA',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
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

  const goldGradient = 'linear-gradient(135deg, #E2B94F 0%, #F5DB86 100%)';

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100dvh',
        background: '#07080F',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% -5%, rgba(226,185,79,0.13) 0%, rgba(226,185,79,0.04) 30%, transparent 60%)',
        }}
      />

      <div
        style={{
          width: 'min(calc(100vw - 26px), 430px)',
          minHeight: '100dvh',
          margin: '0 auto',
          paddingTop: 33,
          paddingBottom: 12,
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
          style={{
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 58,
              lineHeight: '58px',
              height: 58,
              marginBottom: 8,
            }}
          >
            🐷
          </div>

          <h1
            className="gradient-text"
            style={{
              margin: 0,
              fontSize: 35,
              lineHeight: '38px',
              fontWeight: 900,
              letterSpacing: '-1px',
              backgroundImage: goldGradient,
            }}
          >
            PoupPT
          </h1>

          <p
            style={{
              margin: '7px 0 0',
              fontSize: 14,
              lineHeight: '18px',
              color: '#A8A7D8',
            }}
          >
            O teu treinador financeiro pessoal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          style={{
            marginTop: 8,
            width: '100%',
            borderRadius: 15,
            padding: '22px 19px 18px',
            background: 'rgba(255, 255, 255, 0.065)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.28)',
          }}
        >
          <h2
            style={{
              margin: '0 0 19px',
              textAlign: 'center',
              fontSize: 20,
              lineHeight: '24px',
              fontWeight: 900,
              color: '#FFFFFF',
            }}
          >
            Sai da crise. Toma o controlo.
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <FeatureItem
              icon={<FlaskIcon color="#E2B94F" />}
              title="6 Frascos"
              description="Método de gestão financeira comprovado"
            />

            <FeatureItem
              icon={<Bot size={20} color="#E2B94F" />}
              title="AI Coach"
              description="Treinador pessoal com 2 personalidades"
            />

            <FeatureItem
              icon={<Snowflake size={20} color="#E2B94F" />}
              title="Snowball"
              description="Método bola de neve para eliminar dívidas"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          style={{
            marginTop: 25,
            display: 'flex',
            flexDirection: 'column',
            gap: 13,
          }}
        >
          <button
            onClick={handleStart}
            style={{
              width: '100%',
              height: 55,
              border: 'none',
              borderRadius: 15,
              background: goldGradient,
              color: '#05060C',
              fontSize: 16,
              fontWeight: 900,
              boxShadow: '0 12px 30px rgba(226,185,79,0.25)',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={16} />
              Começar Grátis
            </span>
          </button>

          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              height: 46,
              borderRadius: 15,
              background: 'transparent',
              color: '#E2B94F',
              border: '1.5px solid rgba(226,185,79,0.55)',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Já tenho conta
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          style={{
            marginTop: 27,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <TrustItem text="✓ Gratuito" />
          <TrustItem text="✓ Sem cartão" />
          <TrustItem text="✓ +1000 users" />
        </motion.div>

        <div
          style={{
            marginTop: 17,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <StoreBadge icon="🍎" text="App Store" />
          <StoreBadge icon="▶️" text="Google Play" />
        </div>
      </div>
    </div>
  );
}