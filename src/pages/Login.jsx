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
      // API returns {success, token, data: {user}} or {data: {token, user}}
      const token = res.token || res.data?.token;
      const user = res.data?.user || res.data;
      login(user, token);
    } catch (err) {
      const msg = err.message || 'Erro ao entrar';
      if (msg.includes('invalid') || msg.includes('incorrect') || msg.includes('credenciais')) {
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
      className="flex flex-col min-h-screen px-5 sm:px-8 py-6 sm:py-8"
      style={{ background: theme.background }}
    >
      {/* Back button */}
      <button
        onClick={() => setScreen('landing')}
        className="flex items-center gap-1 mb-5 sm:mb-6 text-sm font-medium"
        style={{ color: theme.textMuted }}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="text-5xl mb-3">🐷</div>
        <h1
          className="text-3xl font-extrabold gradient-text mb-2"
          style={{
            backgroundImage: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
          }}
        >
          PoupPT
        </h1>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Bem-vindo(a) de volta
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col gap-4 sm:gap-5"
      >
        <div>
          <div className="flex items-center gap-2 px-4 py-3.5 sm:py-4 rounded-xl" style={{ background: theme.surface, border: `1.5px solid ${theme.border}` }}>
            <Mail size={18} style={{ color: theme.textMuted }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Email"
              autoComplete="email"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 px-4 py-3.5 sm:py-4 rounded-xl" style={{ background: theme.surface, border: `1.5px solid ${theme.border}` }}>
            <Lock size={18} style={{ color: theme.textMuted }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Palavra-passe"
              autoComplete="current-password"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: theme.text }}
            />
            <button onClick={() => setShowPassword(!showPassword)} className="p-1">
              {showPassword ? (
                <EyeOff size={16} style={{ color: theme.textMuted }} />
              ) : (
                <Eye size={16} style={{ color: theme.textMuted }} />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-center animate-fade-in" style={{ color: '#FF6B6B' }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 sm:py-4 rounded-2xl font-bold text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            color: theme.textInverse,
            boxShadow: `0 8px 24px ${theme.primary}40`,
          }}
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </motion.div>

      {/* Forgot password */}
      <div className="mt-5 sm:mt-6 text-center">
        <button
          className="text-xs font-medium"
          style={{ color: theme.primary }}
          onClick={() => setScreen('forgotPassword')}
        >
          Esqueceste a palavra-passe?
        </button>
      </div>

      {/* Register link */}
      <div className="mt-5 sm:mt-6 text-center">
        <p className="text-xs" style={{ color: theme.textMuted }}>
          Nao tens conta?{' '}
          <button
            onClick={() => setScreen('register')}
            className="font-semibold"
            style={{ color: theme.primary }}
          >
            Criar conta gratis
          </button>
        </p>
      </div>

      {/* Trust badges */}
      <div className="mt-auto pt-8 flex items-center justify-center gap-6">
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; Gratuito</span>
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; Sem cartao</span>
      </div>
    </div>
  );
}
