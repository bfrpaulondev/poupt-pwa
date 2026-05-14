import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { api } from '../services/api';
import { ArrowLeft, Check } from 'lucide-react';

const avatars = ['👩', '👨', '🧑', '👩‍🦰', '👨‍🦱', '👩‍🦳', '🧔', '👱‍♀️'];

export default function Onboarding() {
  const {
    onboardingStep,
    setOnboardingStep,
    onboardingData,
    setOnboardingData,
    setOnboardingComplete,
    setScreen,
    currentTheme,
    updateUser,
  } = useStore();

  const theme = themes[currentTheme] || themes.darkGold;
  const [saving, setSaving] = useState(false);

  const steps = 4;
  const progress = ((onboardingStep + 1) / steps) * 100;
  const isLastStep = onboardingStep === steps - 1;

  const handleNext = async () => {
    if (onboardingStep < steps - 1) {
      setOnboardingStep(onboardingStep + 1);
      return;
    }

    setSaving(true);
    try {
      const coachName = onboardingData.coachMode === 'sargento' ? 'Sargento' : 'Amigo';
      const coachPersonality = onboardingData.coachMode === 'sargento' ? 'disciplinado' : 'amigavel';
      const defaultJars = useStore.getState().defaultJarPercentages;

      const onboardingPayload = {
        name: onboardingData.name,
        income: onboardingData.income,
        hasDebts: onboardingData.hasDebts,
        coachName,
        coachPersonality,
        coachGender: 'm',
        avatar: onboardingData.avatar,
        jarPercentages: defaultJars,
        financialMode: onboardingData.hasDebts ? 'sobrevivencia' : 'estabilidade',
        onboardingComplete: true,
      };

      const res = await api.completeOnboarding(onboardingPayload);
      const apiUser = res.data?.user;

      updateUser({
        onboardingComplete: true,
        name: apiUser?.name || onboardingData.name,
        income: apiUser?.income || onboardingData.income,
        coachName: apiUser?.coachName || coachName,
        coachPersonality: apiUser?.coachPersonality || coachPersonality,
        jarPercentages: apiUser?.jarPercentages || defaultJars,
        financialMode:
          apiUser?.financialMode ||
          (onboardingData.hasDebts ? 'sobrevivencia' : 'estabilidade'),
        avatar: apiUser?.avatar || onboardingData.avatar,
        currency: apiUser?.currency || 'EUR',
        theme: apiUser?.theme || 'darkGold',
      });
    } catch (err) {
      console.error('Onboarding save error:', err);
      updateUser({ onboardingComplete: true, name: onboardingData.name });
    } finally {
      setSaving(false);
    }

    setOnboardingComplete(true);
    setScreen('dashboard');
  };

  const handlePrev = () => {
    if (onboardingStep > 0) setOnboardingStep(onboardingStep - 1);
  };

  // Validação por passo
  const canProceed = () => {
    if (saving) return false;
    if (onboardingStep === 0) return onboardingData.name?.trim().length > 0;
    if (onboardingStep === 1) return onboardingData.income > 0;
    if (onboardingStep === 2) return typeof onboardingData.hasDebts === 'boolean';
    if (onboardingStep === 3) return !!onboardingData.coachMode;
    return true;
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: theme.background,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          minHeight: '100dvh',
          margin: '0 auto',
          padding: '20px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header: voltar + step */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginBottom: 18,
          }}
        >
          {onboardingStep > 0 ? (
            <button
              type="button"
              onClick={handlePrev}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                color: theme.primary,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 4px',
                minHeight: 44,
              }}
            >
              <ArrowLeft size={16} />
              Anterior
            </button>
          ) : (
            <span style={{ minHeight: 44 }} />
          )}

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: theme.textMuted,
              padding: '6px 12px',
              borderRadius: 999,
              background: theme.surface,
              border: `1px solid ${theme.border}`,
            }}
          >
            Passo {onboardingStep + 1} de {steps}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: '100%',
            height: 8,
            borderRadius: 999,
            background: theme.surface,
            overflow: 'hidden',
            marginBottom: 28,
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              boxShadow: `0 0 12px ${theme.primary}50`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Steps */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingStep}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              {onboardingStep === 0 && <Step1Name theme={theme} />}
              {onboardingStep === 1 && <Step2Income theme={theme} />}
              {onboardingStep === 2 && <Step3Debts theme={theme} />}
              {onboardingStep === 3 && <Step4Coach theme={theme} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next button */}
        <div style={{ marginTop: 28 }}>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            style={{
              width: '100%',
              minHeight: 58,
              borderRadius: 16,
              fontWeight: 800,
              fontSize: 15,
              border: 'none',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              opacity: canProceed() ? 1 : 0.5,
              background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
              color: theme.textInverse,
              boxShadow: `0 10px 28px ${theme.primary}45`,
              transition: 'transform 0.15s, filter 0.15s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
            onMouseDown={(e) => {
              if (canProceed()) e.currentTarget.style.transform = 'scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {saving
              ? 'A guardar...'
              : isLastStep
              ? '🎉 Começar a poupar'
              : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 1 — Nome + Avatar
   ============================================================ */
function Step1Name({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();

  return (
    <div style={{ paddingTop: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 'clamp(44px, 11vw, 56px)', lineHeight: 1, marginBottom: 10 }}>
          👋
        </div>
        <h2
          style={{
            fontSize: 'clamp(22px, 5.5vw, 28px)',
            fontWeight: 800,
            color: theme.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Como te chamas?
        </h2>
        <p style={{ fontSize: 14, color: theme.textMuted, margin: 0 }}>
          Vamos personalizar a tua experiência
        </p>
      </div>

      {/* Avatar picker */}
      <div style={{ marginBottom: 24 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: theme.textMuted,
            margin: '0 0 12px',
            textAlign: 'center',
          }}
        >
          Escolhe um avatar
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(56px, 1fr))',
            gap: 10,
            maxWidth: 420,
            margin: '0 auto',
          }}
        >
          {avatars.map((a) => {
            const active = onboardingData.avatar === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setOnboardingData({ avatar: a })}
                style={{
                  aspectRatio: '1 / 1',
                  minHeight: 56,
                  borderRadius: 14,
                  fontSize: 26,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  background: active ? `${theme.primary}25` : theme.surface,
                  border: `2px solid ${active ? theme.primary : theme.border}`,
                  transform: active ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                }}
              >
                {a}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: theme.primary,
                      color: theme.textInverse,
                      display: 'grid',
                      placeItems: 'center',
                      border: `2px solid ${theme.background}`,
                    }}
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name input */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: theme.textMuted,
            margin: '0 0 8px',
          }}
        >
          O teu nome
        </p>
        <input
          type="text"
          value={onboardingData.name || ''}
          onChange={(e) => setOnboardingData({ name: e.target.value })}
          placeholder="Ex: Maria"
          autoComplete="given-name"
          style={{
            width: '100%',
            minHeight: 56,
            padding: '0 16px',
            borderRadius: 14,
            fontSize: 16,
            fontWeight: 600,
            outline: 'none',
            background: theme.surface,
            color: theme.text,
            border: `1.5px solid ${theme.border}`,
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.primary}25`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border;
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   STEP 2 — Rendimento
   ============================================================ */
function Step2Income({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();
  const income = Number(onboardingData.income) || 0;

  const quickValues = [800, 1200, 1800, 2500, 3500, 5000];

  return (
    <div style={{ paddingTop: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 'clamp(44px, 11vw, 56px)', lineHeight: 1, marginBottom: 10 }}>
          💰
        </div>
        <h2
          style={{
            fontSize: 'clamp(22px, 5.5vw, 28px)',
            fontWeight: 800,
            color: theme.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Qual o teu rendimento?
        </h2>
        <p style={{ fontSize: 14, color: theme.textMuted, margin: 0 }}>
          Mensal, após impostos
        </p>
      </div>

      {/* Display value */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px 16px',
          borderRadius: 20,
          background: `linear-gradient(135deg, ${theme.primary}18, ${theme.primary}06)`,
          border: `1.5px solid ${theme.primary}33`,
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: theme.textMuted,
            margin: '0 0 6px',
          }}
        >
          Rendimento mensal
        </p>
        <div
          style={{
            fontSize: 'clamp(36px, 9vw, 52px)',
            fontWeight: 800,
            color: theme.primary,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            wordBreak: 'break-word',
          }}
        >
          €{income.toLocaleString('pt-PT')}
        </div>
      </div>

      {/* Slider */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="range"
          min={0}
          max={10000}
          step={50}
          value={income}
          onChange={(e) =>
            setOnboardingData({ income: parseInt(e.target.value, 10) })
          }
          style={{
            width: '100%',
            accentColor: theme.primary,
            cursor: 'pointer',
            height: 32,
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            fontWeight: 600,
            color: theme.textMuted,
            marginTop: 4,
          }}
        >
          <span>€0</span>
          <span>€10.000</span>
        </div>
      </div>

      {/* Quick chips */}
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: theme.textMuted,
            margin: '0 0 10px',
          }}
        >
          Valores rápidos
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 8,
          }}
        >
          {quickValues.map((v) => {
            const active = income === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setOnboardingData({ income: v })}
                style={{
                  minHeight: 44,
                  padding: '8px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: active ? `${theme.primary}25` : theme.surface,
                  color: active ? theme.primary : theme.text,
                  border: `1.5px solid ${active ? theme.primary : theme.border}`,
                  transition: 'all 0.15s',
                }}
              >
                €{v.toLocaleString('pt-PT')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual input */}
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: theme.textMuted,
            margin: '0 0 8px',
          }}
        >
          Ou introduz manualmente
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 16px',
            minHeight: 56,
            borderRadius: 14,
            background: theme.surface,
            border: `1.5px solid ${theme.border}`,
          }}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: theme.primary,
            }}
          >
            €
          </span>
          <input
            type="number"
            min={0}
            max={100000}
            value={income || ''}
            onChange={(e) =>
              setOnboardingData({
                income: Math.max(0, parseInt(e.target.value, 10) || 0),
              })
            }
            placeholder="0"
            inputMode="numeric"
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 16,
              fontWeight: 700,
              color: theme.text,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STEP 3 — Dívidas
   ============================================================ */
function Step3Debts({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();
  const hasDebts = onboardingData.hasDebts;

  return (
    <div style={{ paddingTop: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 'clamp(44px, 11vw, 56px)', lineHeight: 1, marginBottom: 10 }}>
          💳
        </div>
        <h2
          style={{
            fontSize: 'clamp(22px, 5.5vw, 28px)',
            fontWeight: 800,
            color: theme.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Tens dívidas?
        </h2>
        <p
          style={{
            fontSize: 14,
            color: theme.textMuted,
            margin: 0,
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.5,
          }}
        >
          Sem julgamentos. Vamos resolver isso juntos.
        </p>
      </div>

      {/* Opções */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <DebtOption
          theme={theme}
          active={hasDebts === true}
          icon="😔"
          label="Sim, tenho"
          color="#EF4444"
          onClick={() => setOnboardingData({ hasDebts: true })}
        />
        <DebtOption
          theme={theme}
          active={hasDebts === false}
          icon="😊"
          label="Não tenho"
          color="#10B981"
          onClick={() => setOnboardingData({ hasDebts: false })}
        />
      </div>

      {/* Info card */}
      <AnimatePresence mode="wait">
        {hasDebts === true && (
          <motion.div
            key="snowball"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: 18,
                borderRadius: 16,
                background: theme.surface,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: theme.textMuted,
                  margin: '0 0 12px',
                  lineHeight: 1.55,
                }}
              >
                Não te preocupes — o PoupPT vai ajudar-te a eliminar cada uma com o método Snowball.
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: `${theme.primary}15`,
                  border: `1px solid ${theme.primary}30`,
                }}
              >
                <span style={{ fontSize: 18 }}>❄️</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: theme.primary,
                    lineHeight: 1.4,
                  }}
                >
                  Snowball: pagar a menor dívida primeiro
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {hasDebts === false && (
          <motion.div
            key="celebrate"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: 18,
                borderRadius: 16,
                background: theme.surface,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.28)',
                }}
              >
                <span style={{ fontSize: 18 }}>🎯</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#10B981',
                    lineHeight: 1.4,
                  }}
                >
                  Excelente! Vamos focar em poupança e investimento.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DebtOption({ theme, active, icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '20px 12px',
        minHeight: 110,
        borderRadius: 18,
        cursor: 'pointer',
        background: active ? `${color}15` : theme.surface,
        border: `2px solid ${active ? color : theme.border}`,
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        transform: active ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <span style={{ fontSize: 32, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: active ? color : theme.text,
        }}
      >
        {label}
      </span>
    </button>
  );
}

/* ============================================================
   STEP 4 — Coach
   ============================================================ */
function Step4Coach({ theme }) {
  const { onboardingData, setOnboardingData } = useStore();
  const mode = onboardingData.coachMode;

  return (
    <div style={{ paddingTop: 'clamp(16px, 4vw, 32px)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 'clamp(44px, 11vw, 56px)', lineHeight: 1, marginBottom: 10 }}>
          🤖
        </div>
        <h2
          style={{
            fontSize: 'clamp(22px, 5.5vw, 28px)',
            fontWeight: 800,
            color: theme.text,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Escolhe o teu treinador
        </h2>
        <p style={{ fontSize: 14, color: theme.textMuted, margin: 0 }}>
          Podes mudar a qualquer momento
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <CoachCard
          theme={theme}
          active={mode === 'sargento'}
          icon="💪"
          name="Sargento"
          description="Disciplina e resultados sem desculpas."
          badge="Militar"
          color="#EF4444"
          onClick={() => setOnboardingData({ coachMode: 'sargento' })}
        />
        <CoachCard
          theme={theme}
          active={mode === 'amigavel'}
          icon="🤗"
          name="Amigável"
          description="Apoio, compreensão e motivação."
          badge="Amigo"
          color="#10B981"
          onClick={() => setOnboardingData({ coachMode: 'amigavel' })}
        />
      </div>

      {/* Welcome preview */}
      <AnimatePresence mode="wait">
        {mode && (
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div
              style={{
                padding: 18,
                borderRadius: 16,
                background: theme.surface,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: theme.textMuted,
                  margin: '0 0 8px',
                }}
              >
                Mensagem de boas-vindas
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: theme.text,
                  margin: 0,
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                }}
              >
                {mode === 'sargento'
                  ? '💬 "Bem-vindo(a), recruta! A partir de hoje, as tuas finanças são a tua missão. Sem desculpas!"'
                  : '💬 "Olá! Estou aqui para te ajudar. Vamos juntos construir um futuro financeiro melhor!"'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CoachCard({ theme, active, icon, name, description, badge, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '20px 16px',
        minHeight: 180,
        borderRadius: 20,
        cursor: 'pointer',
        background: active ? `${color}12` : theme.surface,
        border: `2px solid ${active ? color : theme.border}`,
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 8,
        transform: active ? 'scale(1.02)' : 'scale(1)',
        position: 'relative',
      }}
    >
      {active && (
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 22,
            height: 22,
            borderRadius: 999,
            background: color,
            color: 'white',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <span style={{ fontSize: 38, lineHeight: 1 }}>{icon}</span>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: active ? color : theme.text,
          margin: 0,
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontSize: 12,
          color: theme.textMuted,
          margin: 0,
          lineHeight: 1.45,
          maxWidth: 200,
        }}
      >
        {description}
      </p>
      <span
        style={{
          marginTop: 4,
          fontSize: 11,
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: 999,
          background: `${color}22`,
          color,
        }}
      >
        {badge}
      </span>
    </button>
  );
}
