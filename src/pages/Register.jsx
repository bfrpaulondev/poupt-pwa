import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function Register() {
  const { setScreen, login } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const res = await api.register(name, email, password);
      login(res.data.user, res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-6" style={{ background: 'var(--bg-primary)' }}>
      <button onClick={() => setScreen('landing')}
        className="mb-6 p-2 rounded-xl w-fit transition-colors"
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <ArrowLeft size={20} style={{ color: 'var(--text-secondary)' }} />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full animate-fade-in">
        {/* Logo */}
        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #FF69B4, #FF85C8)',
            boxShadow: '0 4px 15px rgba(255,105,180,0.25)'
          }}>
          <span className="text-xl font-bold text-white">P</span>
        </div>

        <h1 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
          Criar conta gratuita
        </h1>
        <p className="text-sm mb-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Comeca a tua jornada para a liberdade financeira.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Nome
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="O teu nome" required
                className="input-field !pl-10" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nome@exemplo.pt" required
                className="input-field !pl-10" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
              Palavra-passe
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimo 6 caracteres" required minLength={6}
                className="input-field !pl-10 !pr-12" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1">
                {showPass ? <EyeOff size={16} style={{ color: 'var(--text-muted)' }} /> : <Eye size={16} style={{ color: 'var(--text-muted)' }} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-gold !w-full mt-2 disabled:opacity-50">
            {loading ? 'A criar conta...' : 'Criar Conta'}
          </button>
        </form>

        <p className="mt-4 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          Ao criar conta, aceitas os Termos de Uso e Politica de Privacidade.
        </p>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Ja tens conta?{' '}
            <button onClick={() => setScreen('login')} className="font-semibold" style={{ color: 'var(--gold)' }}>
              Entra
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
