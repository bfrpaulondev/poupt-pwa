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

      // Robust token/user extraction from various API response shapes
      const token = res.token || res.data?.token || res.data?.accessToken || null;
      const user = res.data?.user || (res.data && !res.data.token ? res.data : null) || res.user || null;

      if (!token || !user) {
        setError('Erro ao processar login. Tenta novamente.');
        return;
      }

      login(user, token);
    } catch (err) {
      const msg = err.message || 'Erro ao entrar';

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
      }}
    >
      <div
        className="flex flex-col min-h-screen px-5 xs:px-6 py-6"
        style={{
          width: '100%',
          maxWidth: 430,
          margin: '0 auto',
        }}
      >
        <button
          onClick={() => setScreen('landing')}
          className="flex items-center gap-1 mb-8 text-sm font-semibold"
          style={{ color: theme.primary }}
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-7"
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
            Bem-vindo(a) de volta
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.12 }}
          className="glass rounded-2xl p-6"
        >
          <h2
            className="text-2xl font-extrabold text-center mb-2"
            style={{ color: theme.text }}
          >
            Entrar na conta
          </h2>

          <p
            className="text-sm text-center mb-6"
            style={{ color: theme.textMuted }}
          >
            Continua o teu controlo financeiro
          </p>

          <div className="flex flex-col gap-5">
            <div
              className="flex items-center gap-3 px-4 h-[54px] rounded-2xl"
              style={{
                background: theme.surface,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <Mail size={18} style={{ color: theme.textMuted }} />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Email"
                autoComplete="email"
                className="flex-1 bg-transparent outline-none text-sm font-semibold"
                style={{ color: theme.text }}
              />
            </div>

            <div
              className="flex items-center gap-3 px-4 h-[54px] rounded-2xl"
              style={{
                background: theme.surface,
                border: `1.5px solid ${theme.border}`,
              }}
            >
              <Lock size={18} style={{ color: theme.textMuted }} />

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Palavra-passe"
                autoComplete="current-password"
                className="flex-1 bg-transparent outline-none text-sm font-semibold"
                style={{ color: theme.text }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ color: theme.textMuted }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {error && (
              <p
                className="text-xs text-center font-semibold"
                style={{ color: '#FF6B6B' }}
              >
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-[58px] rounded-2xl font-extrabold text-base transition-transform duration-200 active:scale-[0.98] disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                color: theme.textInverse,
                boxShadow: `0 8px 24px ${theme.primary}35`,
              }}
            >
              {loading ? 'A entrar...' : 'Entrar'}
            </button>
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setScreen('register')}
            className="text-sm font-bold"
            style={{ color: theme.primary }}
          >
            Criar conta grátis
          </button>
        </div>

        <div className="mt-auto pt-8 flex items-center justify-center gap-5">
          <span className="text-xs" style={{ color: theme.textMuted }}>
            ✓ Gratuito
          </span>

          <span className="text-xs" style={{ color: theme.textMuted }}>
            ✓ Sem cartão
          </span>
        </div>
      </div>
    </div>
  );
}