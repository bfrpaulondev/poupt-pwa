import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Bot, Snowflake, Sparkles, ArrowRight } from 'lucide-react';

function FlaskIcon({ color, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 9V3h4v6l5 8.5a2 2 0 0 1-1.7 3H6.7a2 2 0 0 1-1.7-3L10 9z" />
    </svg>
  );
}

export default function Landing() {
  const { setScreen, setOnboardingStep } = useStore();
  const theme = themes.darkGold;

  const handleStart = () => {
    setOnboardingStep(0);
    setScreen('onboarding');
  };

  const handleLogin = () => {
    setScreen('login');
  };

  const features = [
    {
      icon: <FlaskIcon color="#FFD700" />,
      title: '6 Frascos',
      desc: 'Metodo de gestao financeira comprovado',
    },
    {
      icon: <Bot size={22} color="#FFD700" />,
      title: 'AI Coach',
      desc: 'Treinador pessoal com 2 personalidades',
    },
    {
      icon: <Snowflake size={22} color="#FFD700" />,
      title: 'Snowball',
      desc: 'Metodo bola de neve para eliminar dividas',
    },
  ];

  return (
    <div
      className="flex flex-col items-center min-h-full px-5 py-8 relative overflow-y-auto poupt-scroll"
      style={{ background: theme.background }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 15%, rgba(255,215,0,0.08) 0%, transparent 55%)`,
        }}
      />

      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center pt-4 pb-2"
      >
        <div className="text-7xl mb-4 select-none">🐷</div>
        <h1
          className="text-4xl font-extrabold gradient-text leading-tight"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          PoupPT
        </h1>
        <p className="text-sm mt-2 font-medium" style={{ color: theme.textMuted }}>
          O teu treinador financeiro pessoal
        </p>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 w-full glass rounded-2xl p-5 mt-6"
      >
        <h2
          className="text-xl font-bold mb-5 text-center leading-tight"
          style={{ color: theme.text }}
        >
          Sai da crise.{'\n'}Toma o controlo.
        </h2>

        <div className="flex flex-col gap-4">
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-3.5">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,215,0,0.1)' }}
              >
                {f.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: theme.primary }}>
                  {f.title}
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: theme.textMuted }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 w-full flex flex-col gap-3 mt-8"
      >
        <button
          onClick={handleStart}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          <Sparkles size={18} />
          Comecar Gratis
        </button>

        <button
          onClick={handleLogin}
          className="btn-gold-outline w-full flex items-center justify-center gap-2"
        >
          Ja tenho conta
          <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 flex items-center justify-center gap-5 mt-6"
      >
        {['Gratuito', 'Sem cartao', '+1000 users'].map((t) => (
          <span key={t} className="text-[11px] font-medium" style={{ color: theme.textMuted }}>
            &#10003; {t}
          </span>
        ))}
      </motion.div>

      {/* App store badges */}
      <div className="relative z-10 flex items-center justify-center gap-3 mt-5 mb-4">
        <div
          className="px-4 py-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5"
          style={{ background: theme.surface, color: theme.textMuted, border: `1px solid ${theme.border}` }}
        >
          🍎 App Store
        </div>
        <div
          className="px-4 py-2 rounded-lg text-[11px] font-medium flex items-center gap-1.5"
          style={{ background: theme.surface, color: theme.textMuted, border: `1px solid ${theme.border}` }}
        >
          ▶️ Google Play
        </div>
      </div>
    </div>
  );
}
