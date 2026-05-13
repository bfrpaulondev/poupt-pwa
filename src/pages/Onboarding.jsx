import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import useThemeColors, { alpha } from '../utils/useThemeColors';

const avatars = ['👩', '👨', '🧑', '👩‍🦰', '👨‍🦱', '👩‍🦳', '🧔', '👱‍♀️'];

const getProgress = (step, total) => ((step + 1) / total) * 100;

const getRangeProgress = (value, min, max) => {
  return ((Number(value) - min) / (max - min)) * 100;
};

export default function Onboarding() {
  const {
    onboardingStep,
    setOnboardingStep,
    setOnboardingComplete,
    setScreen,
  } = useStore();

  const { colors } = useThemeColors();

  const steps = 4;
  const progress = getProgress(onboardingStep, steps);

  const handleNext = () => {
    if (onboardingStep < steps - 1) {
      setOnboardingStep(onboardingStep + 1);
      return;
    }

    setOnboardingComplete(true);
    setScreen('dashboard');
  };

  const handlePrev = () => {
    if (onboardingStep > 0) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const buttonTop = [25, 23, 22, 23][onboardingStep];

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: colors.background,
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      <main
        style={{
          width: '100%',
          maxWidth: 361,
          minHeight: '100dvh',
          padding: '18px 15px 22px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 7,
            }}
          >
            <span
              style={{
                fontSize: 12,
                lineHeight: '15px',
                fontWeight: 500,
                color: colors.muted,
              }}
            >
              Passo {onboardingStep + 1} de {steps}
            </span>

            {onboardingStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: colors.gold,
                  fontSize: 12,
                  lineHeight: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Anterior
              </button>
            )}
          </div>

          <div
            style={{
              width: '100%',
              height: 7,
              borderRadius: 999,
              background: colors.surface,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35 }}
              style={{
                height: '100%',
                borderRadius: 999,
                background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldLight})`,
              }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingStep}
            initial={{ opacity: 0, x: 26 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -26 }}
            transition={{ duration: 0.22 }}
          >
            {onboardingStep === 0 && <StepName colors={colors} />}
            {onboardingStep === 1 && <StepIncome colors={colors} />}
            {onboardingStep === 2 && <StepDebts colors={colors} />}
            {onboardingStep === 3 && <StepCoach colors={colors} />}
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={handleNext}
          style={{
            width: '100%',
            height: 59,
            marginTop: buttonTop,
            borderRadius: 15,
            border: '2px solid rgba(255,255,255,0.92)',
            background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
            color: colors.inverse,
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: `0 13px 30px ${alpha(colors.gold, 0.22)}`,
          }}
        >
          {onboardingStep === steps - 1 ? 'Começar!' : 'Próximo →'}
        </button>
      </main>
    </div>
  );
}

function StepName({ colors }) {
  const { onboardingData, setOnboardingData } = useStore();

  const firstRow = avatars.slice(0, 5);
  const secondRow = avatars.slice(5);

  const renderAvatar = (avatar) => {
    const isSelected = onboardingData.avatar === avatar;

    return (
      <button
        key={avatar}
        type="button"
        onClick={() => setOnboardingData({ avatar })}
        style={{
          width: 47,
          height: 47,
          borderRadius: 12,
          border: isSelected ? `2px solid ${colors.gold}` : `2px solid ${colors.border}`,
          background: isSelected ? alpha(colors.gold, 0.13) : colors.surface,
          color: colors.text,
          fontSize: 25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transform: isSelected ? 'scale(1.04)' : 'scale(1)',
          transition: 'all 0.18s ease',
        }}
      >
        {avatar}
      </button>
    );
  };

  return (
    <section
      style={{
        paddingTop: 65,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={stepIconStyle}>👋</div>

      <Title colors={colors}>Como te chamas?</Title>

      <Subtitle colors={colors}>Vamos personalizar a tua experiência</Subtitle>

      <div
        style={{
          marginTop: 27,
          display: 'flex',
          flexDirection: 'column',
          gap: 13,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>{firstRow.map(renderAvatar)}</div>
        <div style={{ display: 'flex', gap: 12 }}>{secondRow.map(renderAvatar)}</div>
      </div>

      <input
        type="text"
        value={onboardingData.name}
        onChange={(event) => setOnboardingData({ name: event.target.value })}
        placeholder="O teu nome..."
        style={{
          width: '100%',
          height: 50,
          marginTop: 25,
          padding: '0 16px',
          borderRadius: 13,
          border: `1.5px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          fontSize: 15,
          fontWeight: 700,
          outline: 'none',
        }}
      />
    </section>
  );
}

function StepIncome({ colors }) {
  const { onboardingData, setOnboardingData } = useStore();

  const min = 500;
  const max = 3000;
  const rangeProgress = getRangeProgress(onboardingData.income, min, max);

  return (
    <section
      style={{
        paddingTop: 57,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={stepIconStyle}>💰</div>

      <Title colors={colors}>Qual o teu rendimento?</Title>

      <Subtitle colors={colors}>Mensal, após impostos</Subtitle>

      <div
        style={{
          marginTop: 28,
          fontSize: 36,
          lineHeight: '42px',
          fontWeight: 900,
          color: colors.gold,
          letterSpacing: '-1px',
        }}
      >
        €{onboardingData.income}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={50}
        value={onboardingData.income}
        onChange={(event) =>
          setOnboardingData({ income: parseInt(event.target.value, 10) })
        }
        style={{
          width: '100%',
          marginTop: 25,
          background: `linear-gradient(90deg, ${colors.gold} 0%, ${colors.gold} ${rangeProgress}%, rgba(255,255,255,0.45) ${rangeProgress}%, rgba(255,255,255,0.45) 100%)`,
        }}
      />

      <div
        style={{
          width: '100%',
          marginTop: 15,
          display: 'flex',
          justifyContent: 'space-between',
          color: colors.muted,
          fontSize: 12,
          lineHeight: '15px',
        }}
      >
        <span>€500</span>
        <span>€3000</span>
      </div>

      <input
        type="number"
        value={onboardingData.income}
        onChange={(event) =>
          setOnboardingData({ income: parseInt(event.target.value, 10) || 500 })
        }
        style={{
          width: '100%',
          height: 50,
          marginTop: 18,
          padding: '0 16px',
          borderRadius: 13,
          border: `1.5px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          fontSize: 16,
          fontWeight: 800,
          outline: 'none',
        }}
      />
    </section>
  );
}

function StepDebts({ colors }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <section
      style={{
        paddingTop: 68,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={stepIconStyle}>💳</div>

      <Title colors={colors}>Tens dívidas?</Title>

      <Subtitle colors={colors}>Sem julgamentos. Vamos resolver isso.</Subtitle>

      <div
        style={{
          width: '100%',
          marginTop: 25,
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <ChoiceButton
          active={onboardingData.hasDebts}
          onClick={() => setOnboardingData({ hasDebts: true })}
          colors={colors}
        >
          😔 Sim
        </ChoiceButton>

        <ChoiceButton
          active={!onboardingData.hasDebts}
          onClick={() => setOnboardingData({ hasDebts: false })}
          colors={colors}
        >
          😊 Não
        </ChoiceButton>
      </div>

      {onboardingData.hasDebts && (
        <motion.div
          initial={{ opacity: 0, y: 9 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{
            width: '100%',
            marginTop: 25,
            padding: '17px 16px 16px',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.11)',
            background: 'rgba(255,255,255,0.055)',
          }}
        >
          <p
            style={{
              margin: 0,
              color: colors.muted,
              fontSize: 12,
              lineHeight: '17px',
              fontWeight: 600,
            }}
          >
            Não te preocupes - o PoupPT vai ajudar-te a eliminar cada uma delas
            com o método Snowball.
          </p>

          <div
            style={{
              marginTop: 12,
              padding: '13px 14px',
              borderRadius: 9,
              background: alpha(colors.gold, 0.09),
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 17 }}>❄️</span>

            <span
              style={{
                color: colors.gold,
                fontSize: 12,
                lineHeight: '16px',
                fontWeight: 800,
              }}
            >
              Método Snowball: pagar a menor dívida primeiro
            </span>
          </div>
        </motion.div>
      )}
    </section>
  );
}

function StepCoach({ colors }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <section
      style={{
        paddingTop: 58,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={stepIconStyle}>🤖</div>

      <Title colors={colors}>Escolhe o teu treinador</Title>

      <Subtitle colors={colors}>Podes mudar a qualquer momento</Subtitle>

      <div
        style={{
          width: '100%',
          marginTop: 27,
          display: 'flex',
          gap: 13,
        }}
      >
        <CoachCard
          active={onboardingData.coachMode === 'sargento'}
          icon="💪"
          title="Sargento"
          description="Firme e direto"
          color={colors.danger}
          onClick={() => setOnboardingData({ coachMode: 'sargento' })}
          colors={colors}
        />

        <CoachCard
          active={onboardingData.coachMode === 'amigavel'}
          icon="🤗"
          title="Amigável"
          description="Apoio e calma"
          color={colors.success}
          onClick={() => setOnboardingData({ coachMode: 'amigavel' })}
          colors={colors}
        />
      </div>

      <div
        style={{
          width: '100%',
          marginTop: 25,
          padding: 16,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.11)',
          background: 'rgba(255,255,255,0.055)',
        }}
      >
        <p
          style={{
            margin: 0,
            color: colors.muted,
            fontSize: 12,
            lineHeight: '18px',
            fontWeight: 600,
          }}
        >
          {onboardingData.coachMode === 'sargento'
            ? '“A partir de hoje, as tuas finanças são a tua missão. Sem desculpas.”'
            : '“Estou aqui para te ajudar. Vamos construir um futuro financeiro melhor.”'}
        </p>
      </div>
    </section>
  );
}

function Title({ children, colors }) {
  return (
    <h2
      style={{
        margin: 0,
        color: colors.text,
        fontSize: 25,
        lineHeight: '31px',
        fontWeight: 900,
        textAlign: 'center',
        letterSpacing: '-0.6px',
        textShadow: '0 2px 0 rgba(0,0,0,0.45)',
      }}
    >
      {children}
    </h2>
  );
}

function Subtitle({ children, colors }) {
  return (
    <p
      style={{
        margin: '8px 0 0',
        color: colors.muted,
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        textAlign: 'center',
      }}
    >
      {children}
    </p>
  );
}

function ChoiceButton({ active, onClick, children, colors }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: 114,
        height: 46,
        borderRadius: 14,
        border: active ? `1.5px solid ${colors.gold}` : `1.5px solid ${colors.border}`,
        background: active ? alpha(colors.gold, 0.1) : colors.surface,
        color: active ? colors.gold : colors.muted,
        fontSize: 14,
        fontWeight: 800,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function CoachCard({ active, icon, title, description, color, onClick, colors }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 124,
        padding: 14,
        borderRadius: 15,
        border: active ? `2px solid ${color}` : `1.5px solid ${colors.border}`,
        background: active ? alpha(color, 0.09) : colors.surface,
        cursor: 'pointer',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 35, lineHeight: '35px', marginBottom: 10 }}>
        {icon}
      </div>

      <p
        style={{
          margin: 0,
          color,
          fontSize: 15,
          lineHeight: '18px',
          fontWeight: 900,
        }}
      >
        {title}
      </p>

      <p
        style={{
          margin: '5px 0 0',
          color: colors.muted,
          fontSize: 11,
          lineHeight: '15px',
          fontWeight: 500,
        }}
      >
        {description}
      </p>
    </button>
  );
}

const stepIconStyle = {
  fontSize: 46,
  lineHeight: '46px',
  marginBottom: 17,
  userSelect: 'none',
};