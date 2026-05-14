import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { api } from '../services/api';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { setScreen, login, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Preenche todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login(email, password);

      const token =
        res.token || res.data?.token || res.data?.accessToken || null;
      const user =
        res.data?.user ||
        (res.data && !res.data.token ? res.data : null) ||
        res.user ||
        null;

      if (!token || !user) {
        setError('Erro ao processar login. Tenta novamente.');
        return;
      }

      login(user, token);
    } catch (err) {
      const msg = (err.message || '').toLowerCase();

      if (
        msg.includes('invalid') ||
        msg.includes('incorrect') ||
        msg.includes('credenciais')
      ) {
        setError('Email ou palavra-passe incorretos');
      } else {
        setError('Erro ao entrar. Tenta novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
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
          maxWidth: 460,
          minHeight: '100dvh',
          margin: '0 auto',
          padding: '24px 20px 32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Voltar */}
        <button
          type="button"
          onClick={() => setScreen('landing')}
          className="flex items-center gap-1.5 text-sm font-semibold transition-opacity active:opacity-70"
          style={{
            color: theme.primary,
            alignSelf: 'flex-start',
            marginBottom: 24,
            minHeight: 44,
            padding: '8px 4px',
          }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* Logo header */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 28 }}
        >
          <div style={{ fontSize: 'clamp(48px, 12vw, 64px)', lineHeight: 1, marginBottom: 12 }}>
            🐷
          </div>

          <h1
            className="gradient-text"
            style={{
              fontSize: 'clamp(28px, 7vw, 38px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            }}
          >
            PoupPT
          </h1>

          <p
            style={{
              fontSize: 14,
              marginTop: 8,
              color: theme.textMuted,
            }}
          >
            Bem-vindo(a) de volta
          </p>
        </motion.div>

        {/* Card form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 20,
            padding: 'clamp(20px, 5vw, 28px)',
            boxShadow: `0 10px 30px ${theme.shadow}`,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(20px, 5vw, 24px)',
              fontWeight: 800,
              textAlign: 'center',
              color: theme.text,
              margin: '0 0 8px',
            }}
          >
            Entrar na conta
          </h2>

          <p
            style={{
              fontSize: 13,
              textAlign: 'center',
              color: theme.textMuted,
              margin: '0 0 24px',
            }}
          >
            Continua o teu controlo financeiro
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 14px',
                minHeight: 54,
                borderRadius: 14,
                background: theme.background,
                border: `1.5px solid ${theme.border}`,
                transition: 'border-color 0.15s',
              }}
            >
              <Mail size={18} style={{ color: theme.textMuted, flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Email"
                autoComplete="email"
                inputMode="email"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.text,
                }}
              />
            </div>

            {/* Password */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '0 6px 0 14px',
                minHeight: 54,
                borderRadius: 14,
                background: theme.background,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <Lock size={18} style={{ color: theme.textMuted, flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Palavra-passe"
                autoComplete="current-password"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  fontWeight: 600,
                  color: theme.text,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Esconder palavra-passe' : 'Mostrar palavra-passe'}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  display: 'grid',
                  placeItems: 'center',
                  color: theme.textMuted,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 10,
                  flexShrink: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Erro */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  fontSize: 12,
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#FF6B6B',
                  margin: 0,
                  padding: '8px 12px',
                  background: 'rgba(255, 107, 107, 0.08)',
                  borderRadius: 10,
                }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                minHeight: 56,
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 15,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                color: theme.textInverse,
                boxShadow: `0 8px 24px ${theme.primary}40`,
                transition: 'transform 0.15s, filter 0.15s',
              }}
              onMouseDown={(e) => {
                if (!loading) e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </motion.div>

        {/* Criar conta */}
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <button
            type="button"
            onClick={() => setScreen('register')}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: theme.primary,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 16px',
              minHeight: 44,
            }}
          >
            Criar conta grátis
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>
            ✓ Gratuito
          </span>
          <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>
            ✓ Sem cartão
          </span>
          <span style={{ fontSize: 12, color: theme.textMuted, fontWeight: 600 }}>
            ✓ Seguro
          </span>
        </div>
      </div>
    </div>
  );
}
