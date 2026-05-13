import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';

const colors = {
  background: '#07070C',
  gold: '#E4B94F',
  goldLight: '#F4D77B',
  text: '#FFFFFF',
  muted: '#AAA6D8',
  surface: '#18172E',
  border: '#2F2D55',
  danger: '#EF4444',
};

export default function Login() {
  const { setScreen, login } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preenche todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mockUser = {
        name: 'Ana Silva',
        email,
        onboardingComplete: true,
        financialMode: 'sobrevivencia',
      };

      const mockToken = 'mock-token-123';

      login(mockUser, mockToken);
    } catch {
      setError('Erro ao entrar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

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
            marginTop: 54,
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
            PoupPT
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
            Bem-vindo(a) de volta
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          style={{
            marginTop: 38,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Field
            icon={<Mail size={18} />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
          />

          <Field
            icon={<Lock size={18} />}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Palavra-passe"
            autoComplete="current-password"
          />

          {error && (
            <p
              style={{
                margin: '0',
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
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              height: 58,
              marginTop: 8,
              border: 'none',
              borderRadius: 29,
              background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
              color: '#000000',
              fontSize: 16,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.65 : 1,
              boxShadow: '0 12px 32px rgba(228,185,79,0.22)',
            }}
          >
            {loading ? 'A entrar...' : 'Entrar'}
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
            Não tens conta?{' '}
            <button
              type="button"
              onClick={() => setScreen('register')}
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
              Criar conta grátis
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
          <span
            style={{
              color: colors.muted,
              fontSize: 11,
              lineHeight: '14px',
              fontWeight: 400,
            }}
          >
            ✓ Gratuito
          </span>

          <span
            style={{
              color: colors.muted,
              fontSize: 11,
              lineHeight: '14px',
              fontWeight: 400,
            }}
          >
            ✓ Sem cartão
          </span>
        </div>
      </main>
    </div>
  );
}

function Field({ icon, ...props }) {
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