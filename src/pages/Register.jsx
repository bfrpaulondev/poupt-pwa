import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react';
import useThemeColors, { alpha } from '../utils/useThemeColors';

export default function Register() {
  const { setScreen, login } = useStore();
  const { colors } = useThemeColors();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Preenche todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mockUser = {
        name,
        email,
        onboardingComplete: false,
        financialMode: 'sobrevivencia',
      };

      login(mockUser, 'mock-token-123');
    } catch {
      setError('Erro ao criar conta. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        background: `radial-gradient(circle at 50% 0%, ${alpha(colors.gold, 0.06)} 0%, transparent 38%), ${colors.background}`,
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
        <button
          type="button"
          onClick={() => setScreen('landing')}
          style={{
            width: 'fit-content',
            border: 'none',
            background: 'transparent',
            color: colors.gold,
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} />
          Voltar
        </button>

        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            marginTop: 48,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 58,
              lineHeight: '58px',
              marginBottom: 14,
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
              fontWeight: 900,
              letterSpacing: '-0.7px',
              color: colors.gold,
            }}
          >
            Criar Conta
          </h1>

          <p
            style={{
              margin: '7px 0 0',
              fontSize: 14,
              lineHeight: '18px',
              fontWeight: 500,
              color: colors.muted,
            }}
          >
            Começa a tua jornada financeira
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{
            marginTop: 35,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Field
            icon={<User size={18} />}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome"
            autoComplete="name"
            colors={colors}
          />

          <Field
            icon={<Mail size={18} />}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            autoComplete="email"
            colors={colors}
          />

          <Field
            icon={<Lock size={18} />}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Palavra-passe"
            autoComplete="new-password"
            colors={colors}
          />

          {error && (
            <p
              style={{
                margin: 0,
                color: colors.danger,
                fontSize: 12,
                lineHeight: '16px',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%',
              height: 58,
              marginTop: 8,
              border: 'none',
              borderRadius: 29,
              background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
              color: colors.inverse,
              fontSize: 16,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: `0 12px 32px ${alpha(colors.gold, 0.22)}`,
            }}
          >
            {loading ? 'A criar conta...' : 'Começar Grátis'}
            {!loading && <ArrowRight size={17} strokeWidth={2.5} />}
          </button>
        </motion.section>

        <div
          style={{
            marginTop: 18,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              color: colors.muted,
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 500,
            }}
          >
            Já tens conta?{' '}
            <button
              type="button"
              onClick={() => setScreen('login')}
              style={{
                border: 'none',
                background: 'transparent',
                color: colors.gold,
                fontSize: 12,
                lineHeight: '16px',
                fontWeight: 900,
                padding: 0,
                cursor: 'pointer',
              }}
            >
              Entrar
            </button>
          </p>
        </div>

        <div
          style={{
            marginTop: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 19,
          }}
        >
          <span style={badgeStyle(colors)}>✓ Gratuito</span>
          <span style={badgeStyle(colors)}>✓ Sem cartão</span>
        </div>
      </main>
    </div>
  );
}

function Field({ icon, colors, ...props }) {
  return (
    <div
      style={{
        width: '100%',
        height: 51,
        borderRadius: 13,
        border: `1.5px solid ${colors.border}`,
        background: colors.surface,
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '0 15px',
      }}
    >
      <span
        style={{
          color: colors.muted,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </span>

      <input
        {...props}
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          color: colors.text,
          fontSize: 15,
          fontWeight: 700,
        }}
      />
    </div>
  );
}

function badgeStyle(colors) {
  return {
    color: colors.muted,
    fontSize: 11,
    lineHeight: '14px',
    fontWeight: 400,
  };
}