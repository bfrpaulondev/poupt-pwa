import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';

const avatars = ['👩', '👨', '🧑', '👩‍🦰', '👨‍🦱', '👩‍🦳', '🧔', '👱‍♀️'];

export default function Onboarding() {
  const {
    onboardingStep,
    setOnboardingStep,
    onboardingData,
    setOnboardingData,
    setOnboardingComplete,
    setScreen,
  } = useStore();

  const theme = themes.darkGold;

  const steps = 4;
  const progress = ((onboardingStep + 1) / steps) * 100;

  const handleNext = () => {
    if (onboardingStep < steps - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setOnboardingComplete(true);
      setScreen('dashboard');
    }
  };

  const handlePrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  return (
    <div
      className="flex flex-col min-h-full px-5 py-4 poupt-scroll"
      style={{ background: theme.background }}
    >
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
            Passo {onboardingStep + 1} de {steps}
          </span>
          {onboardingStep > 0 && (
            <button
              onClick={handlePrev}
              className="text-xs font-bold"
              style={{ color: theme.primary }}
            >
              ← Anterior
            </button>
          )}
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: theme.surface }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence mode="wait">
        <motion.div
          key={onboardingStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="flex-1"
        >
          {onboardingStep === 0 && <Step1Name theme={theme} />}
          {onboardingStep === 1 && <Step2Income theme={theme} />}
          {onboardingStep === 2 && <Step2Debts theme={theme} />}
          {onboardingStep === 3 && <Step4Coach theme={theme} />}
        </motion.div>
      </AnimatePresence>

      {/* Next button */}
      <div className="mt-6 pb-2">
        <button
          onClick={handleNext}
          className="btn-gold w-full"
        >
          {onboardingStep === steps - 1 ? '🎉 Comecar!' : 'Proximo →'}
        </button>
      </div>
    </div>
  );
}

function Step1Name({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-5xl mb-4 select-none">👋</div>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.text }}>
        Como te chamas?
      </h2>
      <p className="text-sm mb-6 text-center" style={{ color: theme.textMuted }}>
        Vamos personalizar a tua experiencia
      </p>

      {/* Avatar picker */}
      <div className="flex flex-wrap gap-2.5 mb-6 justify-center">
        {avatars.map((a) => (
          <button
            key={a}
            onClick={() => setOnboardingData({ avatar: a })}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200"
            style={{
              background: onboardingData.avatar === a ? 'rgba(255,215,0,0.15)' : theme.surface,
              border: onboardingData.avatar === a ? '2px solid #FFD700' : `2px solid ${theme.border}`,
              transform: onboardingData.avatar === a ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Name input */}
      <input
        type="text"
        value={onboardingData.name}
        onChange={(e) => setOnboardingData({ name: e.target.value })}
        placeholder="O teu nome..."
        className="w-full px-4 py-3.5 rounded-xl text-base font-medium outline-none transition-all duration-200"
        style={{
          background: theme.surface,
          color: theme.text,
          border: `1.5px solid ${theme.border}`,
        }}
      />
    </div>
  );
}

function Step2Income({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-5xl mb-4 select-none">💰</div>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.text }}>
        Qual o teu rendimento?
      </h2>
      <p className="text-sm mb-6 text-center" style={{ color: theme.textMuted }}>
        Mensal, apos impostos
      </p>

      <div
        className="text-4xl font-extrabold mb-6"
        style={{ color: theme.primary }}
      >
        €{onboardingData.income}
      </div>

      <input
        type="range"
        min={500}
        max={3000}
        step={50}
        value={onboardingData.income}
        onChange={(e) => setOnboardingData({ income: parseInt(e.target.value) })}
        className="w-full mb-4"
      />

      <div className="flex justify-between w-full text-xs" style={{ color: theme.textMuted }}>
        <span>€500</span>
        <span>€3000</span>
      </div>

      <input
        type="number"
        value={onboardingData.income}
        onChange={(e) => setOnboardingData({ income: parseInt(e.target.value) || 500 })}
        className="w-full px-4 py-3.5 rounded-xl text-base font-medium outline-none mt-4"
        style={{
          background: theme.surface,
          color: theme.text,
          border: `1.5px solid ${theme.border}`,
        }}
      />
    </div>
  );
}

function Step2Debts({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-5xl mb-4 select-none">💳</div>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.text }}>
        Tens dividas?
      </h2>
      <p className="text-sm mb-6 text-center" style={{ color: theme.textMuted }}>
        Sem julgamentos. Vamos resolver isso.
      </p>

      <div className="flex gap-4 mb-6 w-full">
        <button
          onClick={() => setOnboardingData({ hasDebts: true })}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
          style={{
            background: onboardingData.hasDebts ? 'rgba(255,215,0,0.15)' : theme.surface,
            color: onboardingData.hasDebts ? theme.primary : theme.textMuted,
            border: `1.5px solid ${onboardingData.hasDebts ? theme.primary : theme.border}`,
          }}
        >
          😔 Sim
        </button>
        <button
          onClick={() => setOnboardingData({ hasDebts: false })}
          className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
          style={{
            background: !onboardingData.hasDebts ? 'rgba(255,215,0,0.15)' : theme.surface,
            color: !onboardingData.hasDebts ? theme.primary : theme.textMuted,
            border: `1.5px solid ${!onboardingData.hasDebts ? theme.primary : theme.border}`,
          }}
        >
          😊 Nao
        </button>
      </div>

      {onboardingData.hasDebts && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full glass rounded-xl p-4"
        >
          <p className="text-xs font-medium mb-3" style={{ color: theme.textMuted }}>
            Nao te preocupes — o PoupPT vai ajudar-te a eliminar cada uma delas com o metodo Snowball.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(255,215,0,0.06)' }}>
            <span>❄️</span>
            <span className="text-xs font-bold" style={{ color: theme.primary }}>
              Metodo Snowball: pagar a menor divida primeiro
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Step4Coach({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <div className="flex flex-col items-center pt-6">
      <div className="text-5xl mb-4 select-none">🤖</div>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: theme.text }}>
        Escolhe o teu treinador
      </h2>
      <p className="text-sm mb-6 text-center" style={{ color: theme.textMuted }}>
        Podes mudar a qualquer momento
      </p>

      <div className="flex gap-3 w-full">
        <button
          onClick={() => setOnboardingData({ coachMode: 'sargento' })}
          className="flex-1 p-4 rounded-2xl transition-all duration-200"
          style={{
            background: onboardingData.coachMode === 'sargento' ? 'rgba(239,68,68,0.08)' : theme.surface,
            border: `2px solid ${onboardingData.coachMode === 'sargento' ? '#EF4444' : theme.border}`,
          }}
        >
          <div className="text-4xl mb-2">💪</div>
          <h3 className="font-bold text-base mb-1" style={{ color: '#EF4444' }}>
            Sargento
          </h3>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Disciplina e resultados!
          </p>
          <div className="mt-2 text-xs px-2 py-1 rounded-full inline-block" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
            Militar
          </div>
        </button>

        <button
          onClick={() => setOnboardingData({ coachMode: 'amigavel' })}
          className="flex-1 p-4 rounded-2xl transition-all duration-200"
          style={{
            background: onboardingData.coachMode === 'amigavel' ? 'rgba(16,185,129,0.08)' : theme.surface,
            border: `2px solid ${onboardingData.coachMode === 'amigavel' ? '#10B981' : theme.border}`,
          }}
        >
          <div className="text-4xl mb-2">🤗</div>
          <h3 className="font-bold text-base mb-1" style={{ color: '#10B981' }}>
            Amigavel
          </h3>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            Apoio e compreensao!
          </p>
          <div className="mt-2 text-xs px-2 py-1 rounded-full inline-block" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
            Amigo
          </div>
        </button>
      </div>

      {/* Welcome preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full mt-6 glass rounded-xl p-4"
      >
        <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
          {onboardingData.coachMode === 'sargento'
            ? '💬 "Bem-vindo(a), recruta! A partir de hoje, as tuas financas sao a tua missao. Sem desculpas!"'
            : '💬 "Ola! Estou aqui para te ajudar. Vamos juntos construir um futuro financeiro melhor!"'}
        </p>
      </motion.div>
    </div>
  );
}
