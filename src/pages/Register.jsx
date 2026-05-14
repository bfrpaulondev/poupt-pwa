import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { api } from '../services/api';
import { Mail, Lock, ArrowLeft, Eye, EyeOff, User, Check } from 'lucide-react';

export default function Register() {
  const { setScreen, login, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.dark;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------- Password strength ----------
  const getStrength = (pwd) => {
    if (!pwd) return { level: 0, label: '', color: '#374151', pct: 0 };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { level: 1, label: 'Fraca', color: '#EF4444', pct: 33 };
    if (score <= 3) return { level: 2, label: 'Média', color: '#F59E0B', pct: 66 };
    return { level: 3, label: 'Forte', color: '#10B981', pct: 100 };
  };
  const strength = getStrength(password);

  // ---------- Submit ----------
  const handleRegister = async (e) => {
    e?.preventDefault?.();
    setError('');

    if (!name.trim()) return setError('Por favor insere o teu nome.');
    if (!email.trim()) return setError('Por favor insere o teu email.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Email inválido.');
    if (!password) return setError('Por favor insere uma palavra-passe.');
    if (password.length < 6) return setError('A palavra-passe deve ter pelo menos 6 caracteres.');

    setLoading(true);
    try {
      const res = await api.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      const token = res?.token || res?.data?.token || res?.accessToken;
      const user = res?.user || res?.data?.user || res?.data || { name, email };

      if (!token) throw new Error('Resposta inválida do servidor.');
      login(user, token);
    } catch (err) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('exist') || msg.includes('duplicate') || msg.includes('já')) {
        setError('Este email já está registado.');
      } else {
        setError(err?.message || 'Não foi possível criar a conta. Tenta novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        background: theme.background,
        color: theme.text,
        paddingTop: 'max(env(safe-area-inset-top), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        paddingLeft: 'max(env(safe-area-inset-left), 16px)',
        paddingRight: 'max(env(safe-area-inset-right), 16px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: '100%',
          maxWidth: 460,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(16px, 3vw, 24px)',
        }}
      >
        {/* Back */}
        <button
          type="button"
          onClick={() => setScreen('welcome')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            color: theme.textSecondary || '#9CA3AF',
            cursor: 'pointer',
            padding: 8,
            margin: '-8px 0 0 -8px',
            fontSize: 14,
            minHeight: 44,
          }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #D4AF37, #B8941F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(212,175,55,0.35)',
            }}
          >
            <User size={28} color="#0B0B0B" strokeWidth={2.5} />
          </div>
          <h1
            style={{
              fontSize: 'clamp(22px, 5vw, 28px)',
              fontWeight: 800,
              margin: 0,
              color: theme.text,
              letterSpacing: '-0.02em',
            }}
          >
            Cria a tua conta
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              color: theme.textSecondary || '#9CA3AF',
              fontSize: 'clamp(13px, 3vw, 15px)',
            }}
          >
            Começa a tua jornada financeira em segundos.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleRegister}
          style={{
            background: theme.card || 'rgba(255,255,255,0.04)',
            border: `1px solid ${theme.border || 'rgba(255,255,255,0.08)'}`,
            borderRadius: 20,
            padding: 'clamp(20px, 4vw, 28px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minWidth: 0,
          }}
        >
          {/* Name */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 13, color: theme.textSecondary || '#9CA3AF', fontWeight: 600 }}>
              Nome
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: theme.background === '#000' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${theme.border || 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                padding: '0 14px',
                minHeight: 52,
                minWidth: 0,
              }}
            >
              <User size={18} color={theme.textSecondary || '#9CA3AF'} style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                autoComplete="name"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: theme.text,
                  fontSize: 16,
                  padding: '14px 0',
                }}
              />
            </div>
          </label>

          {/* Email */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 13, color: theme.textSecondary || '#9CA3AF', fontWeight: 600 }}>
              Email
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: theme.background === '#000' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${theme.border || 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                padding: '0 14px',
                minHeight: 52,
                minWidth: 0,
              }}
            >
              <Mail size={18} color={theme.textSecondary || '#9CA3AF'} style={{ flexShrink: 0 }} />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teu@email.com"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: theme.text,
                  fontSize: 16,
                  padding: '14px 0',
                }}
              />
            </div>
          </label>

          {/* Password */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 13, color: theme.textSecondary || '#9CA3AF', fontWeight: 600 }}>
              Palavra-passe
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: theme.background === '#000' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${theme.border || 'rgba(255,255,255,0.08)'}`,
                borderRadius: 12,
                padding: '0 6px 0 14px',
                minHeight: 52,
                minWidth: 0,
              }}
            >
              <Lock size={18} color={theme.textSecondary || '#9CA3AF'} style={{ flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: theme.text,
                  fontSize: 16,
                  padding: '14px 0',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.textSecondary || '#9CA3AF',
                  padding: 10,
                  minWidth: 44,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength bar */}
            <AnimatePresence>
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${strength.pct}%` }}
                        transition={{ duration: 0.3 }}
                        style={{
                          height: '100%',
                          background: strength.color,
                          borderRadius: 999,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: strength.color, minWidth: 50, textAlign: 'right' }}>
                      {strength.label}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </label>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  margin: 0,
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#FCA5A5',
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            style={{
              marginTop: 4,
              width: '100%',
              minHeight: 56,
              border: 'none',
              borderRadius: 14,
              background: loading
                ? 'rgba(212,175,55,0.5)'
                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
              color: '#0B0B0B',
              fontSize: 16,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.01em',
              transition: 'transform 0.12s ease, opacity 0.2s ease',
              opacity: loading ? 0.85 : 1,
              boxShadow: '0 10px 24px rgba(212,175,55,0.28)',
            }}
          >
            {loading ? 'A criar conta…' : 'Criar conta'}
          </button>

          {/* Terms */}
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 12,
              color: theme.textSecondary || '#9CA3AF',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            Ao criares conta aceitas os{' '}
            <span style={{ color: '#D4AF37', fontWeight: 600 }}>Termos</span> e a{' '}
            <span style={{ color: '#D4AF37', fontWeight: 600 }}>Política de Privacidade</span>.
          </p>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', fontSize: 14, color: theme.textSecondary || '#9CA3AF' }}>
          Já tens conta?{' '}
          <button
            type="button"
            onClick={() => setScreen('login')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#D4AF37',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 4,
              fontSize: 14,
            }}
          >
            Inicia sessão
          </button>
        </div>
      </motion.div>
    </div>
  );
}
