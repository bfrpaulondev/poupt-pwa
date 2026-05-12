import useStore from '../store/useStore';
import { Shield, TrendingUp, MessageCircle, Coins, ChevronRight, Star, Check, Smartphone, Apple } from 'lucide-react';

export default function Landing() {
  const { setScreen } = useStore();

  const features = [
    { icon: Shield, title: '6 Frascos', desc: 'Metodo comprovado de alocacao financeira', accent: '#FFD700' },
    { icon: TrendingUp, title: 'Snowball', desc: 'Elimina dividas passo a passo', accent: '#10B981' },
    { icon: MessageCircle, title: 'AI Coach', desc: 'O teu alter ego financeiro pessoal', accent: '#3B82F6' },
    { icon: Coins, title: 'PoupMoedas', desc: 'Funcionalidades premium com anuncios', accent: '#F59E0B' },
  ];

  const trustItems = [
    'Gratuito para sempre',
    'Sem cartao de credito',
    'Dados protegidos',
  ];

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section className="relative px-6 pt-14 pb-10 text-center overflow-hidden">
        {/* Gold radial glow */}
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ background: 'radial-gradient(circle at 50% 20%, #FFD700 0%, transparent 55%)' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)' }} />

        <div className="relative z-10 animate-fade-in">
          {/* Piggy Bank Logo */}
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #FF69B4, #FF85C8, #FFA6D5)',
              boxShadow: '0 8px 30px rgba(255, 105, 180, 0.3)'
            }}>
            <svg width="42" height="42" viewBox="0 0 48 48" fill="none">
              <ellipse cx="24" cy="26" rx="16" ry="14" fill="#FFF0F5" stroke="#FF1493" strokeWidth="1.5"/>
              <ellipse cx="24" cy="24" rx="14" ry="12" fill="#FFB6C1"/>
              <circle cx="30" cy="22" r="2" fill="#333"/>
              <circle cx="30.7" cy="21.3" r="0.7" fill="#FFF"/>
              <ellipse cx="26" cy="25" rx="1.5" ry="1" fill="#FF69B4"/>
              <path d="M33 24 Q36 22 34 26" stroke="#FF1493" strokeWidth="1.5" fill="none"/>
              <path d="M14 20 L12 14" stroke="#FF1493" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 18 L17 12" stroke="#FF1493" strokeWidth="2" strokeLinecap="round"/>
              <rect x="16" y="34" width="3" height="5" rx="1.5" fill="#FF69B4"/>
              <rect x="27" y="34" width="3" height="5" rx="1.5" fill="#FF69B4"/>
              <ellipse cx="24" cy="17" rx="4" ry="1.5" fill="#FF1493"/>
              <rect x="22" y="13" width="4" height="4" rx="1" fill="#FFD700"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
            <span className="gold-gradient-text">PoupPT</span>
          </h1>
          <p className="text-base font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            O teu treinador financeiro pessoal
          </p>
          <p className="text-sm max-w-[280px] mx-auto mb-8" style={{ color: 'var(--text-muted)' }}>
            Sai da crise, elimina dividas, alcanca a liberdade financeira
          </p>

          {/* Feature Cards */}
          <div className="flex flex-col gap-3 max-w-sm mx-auto mb-8">
            {features.map(({ icon: Icon, title, desc, accent }) => (
              <div key={title} className="feature-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${accent}15` }}>
                  <Icon size={20} style={{ color: accent }} />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button onClick={() => setScreen('register')}
              className="btn-gold flex items-center justify-center gap-2">
              <Star size={18} />
              Comecar Gratis
            </button>
            <button onClick={() => setScreen('login')}
              className="btn-gold-outline">
              Ja tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* 5 Modes Section */}
      <section className="px-6 py-8">
        <h2 className="text-lg font-bold mb-5 text-center" style={{ color: 'var(--text-primary)' }}>
          5 Modos de Vida
        </h2>
        <div className="flex flex-col gap-2.5 max-w-sm mx-auto">
          {[
            { name: 'Sobrevivencia', color: '#EF4444', desc: 'Crisis financeira ativa' },
            { name: 'Recuperacao', color: '#F97316', desc: 'Eliminacao de dividas' },
            { name: 'Estabilidade', color: '#F59E0B', desc: 'Fundo emergencia' },
            { name: 'Crescimento', color: '#10B981', desc: 'Investimentos e ativos' },
            { name: 'Prosperidade', color: '#3B82F6', desc: 'Independencia financeira' },
          ].map(mode => (
            <div key={mode.name} className="flex items-center gap-3 feature-card !p-3.5">
              <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background: mode.color, boxShadow: `0 0 8px ${mode.color}50` }} />
              <div className="flex-1 text-left">
                <span className="text-sm font-semibold" style={{ color: mode.color }}>{mode.name}</span>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{mode.desc}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-8">
        <h2 className="text-lg font-bold mb-5 text-center" style={{ color: 'var(--text-primary)' }}>
          O que dizem os utilizadores
        </h2>
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {[
            { name: 'Ana S.', text: 'Passei de -180 EUR na conta a positivo em 30 dias!', mode: 'Sobrevivencia' },
            { name: 'Miguel R.', text: 'O meu Coach ajuda-me a investir com confianca.', mode: 'Crescimento' },
            { name: 'Sofia L.', text: 'Finalmente controlei as dividas com o Snowball.', mode: 'Recuperacao' },
          ].map(t => (
            <div key={t.name} className="feature-card">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                <span className="text-xs mode-badge"
                  style={{ background: 'rgba(255,215,0,0.1)', color: 'var(--gold)' }}>
                  {t.mode}
                </span>
              </div>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-10 text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Pronto para transformar as tuas financas?
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Gratuito para sempre. Sem cartao de credito.
        </p>
        <button onClick={() => setScreen('register')}
          className="btn-gold inline-flex items-center gap-2">
          <Star size={18} />
          Comecar Agora
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {trustItems.map(item => (
            <div key={item} className="flex items-center gap-1">
              <Check size={12} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Store links placeholder */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <Apple size={16} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>App Store</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <Smartphone size={16} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Google Play</span>
          </div>
        </div>

        <p className="mt-8 pb-8 text-xs" style={{ color: 'var(--text-muted)' }}>
          Feito em Portugal para portugueses
        </p>
      </section>
    </div>
  );
}
