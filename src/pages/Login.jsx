import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { setScreen, login, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;
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
      // Mock login for prototype
      const mockUser = {
        name: 'Ana Silva',
        email,
        onboardingComplete: true,
        financialMode: 'sobrevivencia',
      };
      const mockToken = 'mock-token-123';
      login(mockUser, mockToken);
    } catch (err) {
      setError('Erro ao entrar. Tenta novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-full px-6 py-4"
      style={{ background: theme.background }}
    >
      {/* Back button */}
      <button
        onClick={() => setScreen('landing')}
        className="flex items-center gap-1 mb-6 text-sm font-medium"
        style={{ color: theme.textMuted }}
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
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
        className="flex flex-col gap-4"
      >
        <div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: theme.surface, border: `1.5px solid ${theme.border}` }}>
            <Mail size={18} style={{ color: theme.textMuted }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: theme.surface, border: `1.5px solid ${theme.border}` }}>
            <Lock size={18} style={{ color: theme.textMuted }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Palavra-passe"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-center" style={{ color: '#FF6B6B' }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            color: theme.textInverse,
            boxShadow: `0 8px 24px ${theme.primary}40`,
          }}
        >
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </motion.div>

      {/* Register link */}
      <div className="mt-6 text-center">
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
    </div>
  );
}
