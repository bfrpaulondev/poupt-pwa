import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { setScreen, login, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;
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
      // Mock register for prototype
      const mockUser = {
        name,
        email,
        onboardingComplete: false,
        financialMode: 'sobrevivencia',
      };
      const mockToken = 'mock-token-123';
      login(mockUser, mockToken);
    } catch (err) {
      setError('Erro ao criar conta. Tenta novamente.');
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
          Criar Conta
        </h1>
        <p className="text-sm" style={{ color: theme.textMuted }}>
          Comeca a tua jornada financeira
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
            <User size={18} style={{ color: theme.textMuted }} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: theme.text }}
            />
          </div>
        </div>

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
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
            color: theme.textInverse,
            boxShadow: `0 8px 24px ${theme.primary}40`,
          }}
        >
          {loading ? 'A criar conta...' : 'Comecar Gratis'}
        </button>
      </motion.div>

      {/* Login link */}
      <div className="mt-6 text-center">
        <p className="text-xs" style={{ color: theme.textMuted }}>
          Ja tens conta?{' '}
          <button
            onClick={() => setScreen('login')}
            className="font-semibold"
            style={{ color: theme.primary }}
          >
            Entrar
          </button>
        </p>
      </div>

      {/* Trust badges */}
      <div className="mt-auto pt-6 flex items-center justify-center gap-4">
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; Gratuito</span>
        <span className="text-xs" style={{ color: theme.textMuted }}>&#10003; Sem cartao</span>
      </div>
    </div>
  );
}
