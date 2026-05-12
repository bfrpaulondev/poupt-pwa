import useStore from '../store/useStore';
import { Shield, TrendingUp, MessageCircle, Coins, ChevronRight, Star } from 'lucide-react';

export default function Landing() {
  const { setScreen } = useStore();

  const features = [
    { icon: Shield, title: '6 Frascos', desc: 'Metodo comprovado de alocacao financeira' },
    { icon: TrendingUp, title: '5 Modos de Vida', desc: 'Da sobrevivencia a prosperidade' },
    { icon: MessageCircle, title: 'AI Coach', desc: 'O teu alter ego financeiro pessoal' },
    { icon: Coins, title: 'PoupMoedas', desc: 'Funcionalidades premium com anuncios' },
  ];

  const testimonials = [
    { name: 'Ana S.', text: 'Passei de -180 EUR na conta a positivo em 30 dias!', mode: 'Sobrevivencia' },
    { name: 'Miguel R.', text: 'O meu Coach ajuda-me a investir com confianca.', mode: 'Crescimento' },
    { name: 'Sofia L.', text: 'Finalmente controlei as dividas com o Snowball.', mode: 'Recuperacao' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at 50% 30%, var(--gold) 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gold-gradient flex items-center justify-center shadow-lg animate-pulse-gold">
            <span className="text-3xl font-extrabold text-white">P</span>
          </div>
          <h1 className="text-4xl font-extrabold mb-3" style={{ color: 'var(--text-primary)' }}>
            Poup<span style={{ color: 'var(--gold)' }}>PT</span>
          </h1>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--gold)' }}>
            Gestao Financeira Inteligente
          </p>
          <p className="text-sm max-w-xs mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
            Para todos os portugueses. Desde a crise financeira ate a prosperidade. O teu companheiro financeiro que evolui contigo.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button onClick={() => setScreen('register')}
              className="w-full py-3.5 rounded-2xl text-base font-bold text-white gold-gradient shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">
              Comecar Gratuitamente
            </button>
            <button onClick={() => setScreen('login')}
              className="w-full py-3 rounded-2xl text-sm font-medium transition-all"
              style={{ color: 'var(--gold)', border: '1px solid var(--gold)', background: 'transparent' }}>
              Ja tenho conta
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-10">
        <h2 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
          Tudo o que precisas
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card p-4">
              <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: 'rgba(212,160,23,0.15)' }}>
                <Icon size={20} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Modes */}
      <section className="px-6 py-10">
        <h2 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
          5 Modos de Vida
        </h2>
        <div className="flex flex-col gap-3">
          {[
            { name: 'Sobrevivencia', color: '#EF4444', desc: 'Crisis financeira ativa' },
            { name: 'Recuperacao', color: '#F97316', desc: 'Eliminacao de dividas' },
            { name: 'Estabilidade', color: '#F59E0B', desc: 'Fundo emergencia' },
            { name: 'Crescimento', color: '#10B981', desc: 'Investimentos e ativos' },
            { name: 'Prosperidade', color: '#3B82F6', desc: 'Independencia financeira' },
          ].map(mode => (
            <div key={mode.name} className="flex items-center gap-3 glass-card p-3">
              <div className="w-3 h-3 rounded-full" style={{ background: mode.color }} />
              <div className="flex-1">
                <span className="text-sm font-semibold" style={{ color: mode.color }}>{mode.name}</span>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{mode.desc}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-10">
        <h2 className="text-lg font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
          O que dizem os utilizadores
        </h2>
        <div className="flex flex-col gap-4">
          {testimonials.map(t => (
            <div key={t.name} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                <span className="text-xs mode-badge" style={{ background: 'rgba(212,160,23,0.15)', color: 'var(--gold)' }}>
                  {t.mode}
                </span>
              </div>
              <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-12 text-center">
        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Pronto para transformar as tuas financas?
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Gratuito para sempre. Sem cartao de credito.
        </p>
        <button onClick={() => setScreen('register')}
          className="px-8 py-3.5 rounded-2xl text-base font-bold text-white gold-gradient shadow-lg">
          Comecar Agora
        </button>
        <p className="mt-8 text-xs" style={{ color: 'var(--text-muted)' }}>
          Feito em Portugal para portugueses
        </p>
      </section>
    </div>
  );
}
