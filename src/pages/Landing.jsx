import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { Bot, Snowflake, Sparkles } from 'lucide-react';

function FlaskIcon({ color = '#E4B94F', size = 21 }) {
  return (
    <svg
      width={size}
      height={size}
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

export default function Landing() {
  const { setScreen, setOnboardingStep } = useStore();

  const handleStart = () => {
    setOnboardingStep(0);
    setScreen('onboarding');
  };

  const handleLogin = () => {
    setScreen('login');
  };

  const features = [
    {
      icon: <FlaskIcon />,
      title: '6 Frascos',
      desc: 'Método de gestão financeira comprovado',
    },
    {
      icon: <Bot size={21} color="#E4B94F" />,
      title: 'AI Coach',
      desc: 'Treinador pessoal com 2 personalidades',
    },
    {
      icon: <Snowflake size={21} color="#E4B94F" />,
      title: 'Snowball',
      desc: 'Método bola de neve para eliminar dívidas',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background:
          'radial-gradient(circle at 50% 0%, rgba(228,185,79,0.06) 0%, rgba(7,7,12,0) 38%), #07070C',
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      <main
        style={{
          width: '100%',
          maxWidth: 361,
          padding: '74px 15px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 54,
              lineHeight: '54px',
              marginBottom: 13,
              userSelect: 'none',
            }}
          >
            🐷
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: '38px',
              fontWeight: 800,
              letterSpacing: '-0.7px',
              color: '#E4B94F',
            }}
          >
            PoupPT
          </h1>

          <p
            style={{
              margin: '5px 0 0',
              fontSize: 13,
              lineHeight: '18px',
              fontWeight: 400,
              color: '#A8A4D6',
            }}
          >
            O teu treinador financeiro pessoal
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{
            width: '100%',
            marginTop: 2,
            padding: '22px 23px 24px',
            borderRadius: 15,
            background: 'rgba(255,255,255,0.055)',
            border: '1px solid rgba(255,255,255,0.11)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px',
              fontSize: 20,
              lineHeight: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.35px',
            }}
          >
            Sai da crise. Toma o controlo.
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 41,
                    height: 41,
                    borderRadius: 13,
                    background: 'rgba(228,185,79,0.13)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {feature.icon}
                </div>

                <div
                  style={{
                    minWidth: 0,
                    textAlign: 'left',
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: '17px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                    }}
                  >
                    {feature.title}
                  </p>

                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: 12,
                      lineHeight: '16px',
                      fontWeight: 400,
                      color: '#A8A4D6',
                    }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          style={{
            width: '100%',
            marginTop: 25,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <button
            type="button"
            onClick={handleStart}
            style={{
              width: '100%',
              height: 55,
              border: 'none',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #DFAF3C 0%, #F5D77B 100%)',
              color: '#000000',
              fontSize: 15,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 8px 26px rgba(228,185,79,0.18)',
            }}
          >
            <Sparkles size={17} strokeWidth={2.4} />
            Começar Grátis
          </button>

          <button
            type="button"
            onClick={handleLogin}
            style={{
              width: '100%',
              height: 46,
              borderRadius: 15,
              background: 'transparent',
              border: '1px solid rgba(228,185,79,0.58)',
              color: '#E4B94F',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Já tenho conta
          </button>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          style={{
            marginTop: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            width: '100%',
          }}
        >
          {['Gratuito', 'Sem cartão', '+1000 users'].map((item) => (
            <span
              key={item}
              style={{
                fontSize: 11,
                lineHeight: '14px',
                fontWeight: 400,
                color: '#A8A4D6',
                whiteSpace: 'nowrap',
              }}
            >
              ✓ {item}
            </span>
          ))}
        </motion.section>

        <section
          style={{
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 11,
            width: '100%',
          }}
        >
          <div
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 9,
              background: 'rgba(42,39,78,0.72)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#A8A4D6',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            🍎 App Store
          </div>

          <div
            style={{
              height: 34,
              padding: '0 14px',
              borderRadius: 9,
              background: 'rgba(42,39,78,0.72)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#A8A4D6',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            ▶️ Google Play
          </div>
        </section>
      </main>
    </div>
  );
}