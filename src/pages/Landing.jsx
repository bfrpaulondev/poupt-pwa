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

  return (
    <div
      className="flex flex-col min-h-full px-6 py-6 relative overflow-y-auto"
      style={{ background: theme.background }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${theme.gradient[0]}30 0%, transparent 60%)`,
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center pt-6 pb-4"
      >
        <div className="text-6xl mb-3">🐷</div>
        <h1
          className="text-4xl font-extrabold gradient-text"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          PoupPT
        </h1>
        <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
          O teu treinador financeiro pessoal
        </p>
      </motion.div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative z-10 w-full glass rounded-2xl p-5 mt-4"
      >
        <h2
          className="text-xl font-bold mb-4 text-center"
          style={{ color: theme.text }}
        >
          Sai da crise. Toma o controlo.
        </h2>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${theme.primary}20` }}
            >
              <FlaskIcon color={theme.primary} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                6 Frascos
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Metodo de gestao financeira comprovado
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${theme.primary}20` }}
            >
              <Bot size={20} color={theme.primary} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                AI Coach
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Treinador pessoal com 2 personalidades
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${theme.primary}20` }}
            >
              <Snowflake size={20} color={theme.primary} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: theme.text }}>
                Snowball
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>
                Metodo bola de neve para eliminar dividas
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10 w-full flex flex-col gap-3 mt-6"
      >
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-bold text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            color: theme.textInverse,
            boxShadow: `0 8px 24px ${theme.primary}40`,
          }}
        >
          <Sparkles size={16} className="inline mr-2" />
          Comecar Gratis
        </button>

        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-2xl font-semibold text-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'transparent',
            color: theme.primary,
            border: `1.5px solid ${theme.primary}60`,
          }}
        >
          Ja tenho conta
        </button>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 flex items-center justify-center gap-4 mt-6"
      >
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; Gratuito</span>
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; Sem cartao</span>
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; +1000 users</span>
      </motion.div>

      {/* App store badges */}
      <div className="relative z-10 flex items-center justify-center gap-3 mt-4 mb-4">
        <div
          className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
          style={{ background: theme.surface, color: theme.textMuted, border: `1px solid ${theme.border}` }}
        >
          🍎 App Store
        </div>
        <div
          className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1"
          style={{ background: theme.surface, color: theme.textMuted, border: `1px solid ${theme.border}` }}
        >
          ▶️ Google Play
        </div>
      </div>
    </div>
  );
}
