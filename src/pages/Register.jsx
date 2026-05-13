import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { api } from '../services/api';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { setScreen, login, currentTheme } = useStore();
  const theme = themes[currentTheme] || themes.darkGold;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Preenche todos os campos');
      return;
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.register(name, email, password);
      const { token, user } = res.data || res;
      login(user, token);
    } catch (err) {
      const msg = err.message || 'Erro ao criar conta';
      if (msg.includes('exist') || msg.includes('ja existe') || msg.includes('already')) {
        setError('Este email ja esta registado');
      } else {
        setError('Erro ao criar conta. Tenta novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRegister();
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
              onKeyDown={handleKeyDown}
              placeholder="Nome"
              autoComplete="name"
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
              onKeyDown={handleKeyDown}
              placeholder="Email"
              autoComplete="email"
              className="flex-1 bg-transparent outline-none text-sm font-medium"
              style={{ color: theme.text }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: theme.surface, border: `1.5px solid ${theme.border}` }}>
            <Lock size={18} style={{ color: theme.textMuted }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Palavra-passe (min. 6 caracteres)"
              autoComplete="new-password"
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
