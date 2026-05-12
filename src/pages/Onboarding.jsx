import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { ChevronRight, ChevronLeft, User, Banknote, CreditCard, MessageCircle, Compass } from 'lucide-react';
import { modeLabels, modeColors, modeDescriptions } from '../utils/helpers';

const steps = [
  { id: 1, title: 'Perfil', icon: User, desc: 'Como te chamas?' },
  { id: 2, title: 'Rendimento', icon: Banknote, desc: 'Quanto ganhas por mes?' },
  { id: 3, title: 'Dividas', icon: CreditCard, desc: 'Tens dividas?' },
  { id: 4, title: 'AI Coach', icon: MessageCircle, desc: 'Personaliza o teu Coach' },
  { id: 5, title: 'Modo de Vida', icon: Compass, desc: 'Onde estas financeiramente?' },
];

export default function Onboarding() {
  const { user, updateUser, setScreen, login } = useStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    income: user?.income || 0,
    hasDebts: false,
    totalDebt: 0,
    coachName: 'Ricardo',
    coachGender: 'm',
    coachPersonality: 'disciplinado',
    financialMode: 'sobrevivencia'
  });

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const suggestMode = () => {
    if (form.income <= 0 || form.totalDebt > form.income * 6) return 'sobrevivencia';
    if (form.totalDebt > form.income * 3) return 'recuperacao';
    if (form.totalDebt > 0) return 'estabilidade';
    return 'crescimento';
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const suggestedMode = suggestMode();
      const data = {
        income: form.income,
        financialMode: suggestedMode,
        coachName: form.coachName,
        coachGender: form.coachGender,
        coachPersonality: form.coachPersonality,
      };
      const res = await api.completeOnboarding(data);
      updateUser(res.data.user);
      setScreen('dashboard');
    } catch (err) {
      console.error(err);
      setScreen('dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Progress */}
      <div className="px-6 pt-6">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full"
              style={{ background: i < step ? 'var(--gold)' : 'var(--border)' }} />
          ))}
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Passo {step} de 5
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-sm mx-auto">
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Como te chamas?
              </h2>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Vamos personalizar a tua experiencia.
              </p>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)}
                  placeholder="O teu nome" autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              </div>
              <div className="mt-6 flex gap-3">
                {['🧑', '👩', '👨', '🧑‍💼', '👩‍💼'].map(emoji => (
                  <button key={emoji} className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Income */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Qual o teu rendimento?
              </h2>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Rendimento liquido mensal em EUR.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: 'var(--gold)' }}>EUR</span>
                <input type="number" value={form.income || ''} onChange={e => updateForm('income', Number(e.target.value))}
                  placeholder="1100" className="w-full pl-14 pr-4 py-3 rounded-xl text-sm"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[800, 1100, 1500, 2000, 3000, 5000].map(val => (
                  <button key={val} onClick={() => updateForm('income', val)}
                    className="py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: form.income === val ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                      color: form.income === val ? 'var(--gold)' : 'var(--text-secondary)',
                      border: form.income === val ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}>
                    {val} EUR
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Debts */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Tens dividas?
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Incluindo emprestimos de amigos e familia.
              </p>
              <div className="flex gap-3 mb-6">
                <button onClick={() => { updateForm('hasDebts', true); updateForm('totalDebt', 5000); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: form.hasDebts ? 'rgba(239,68,68,0.2)' : 'var(--bg-secondary)',
                    color: form.hasDebts ? '#EF4444' : 'var(--text-secondary)',
                    border: form.hasDebts ? '1px solid #EF4444' : '1px solid var(--border)'
                  }}>
                  Sim, tenho dividas
                </button>
                <button onClick={() => { updateForm('hasDebts', false); updateForm('totalDebt', 0); }}
                  className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: !form.hasDebts ? 'rgba(16,185,129,0.2)' : 'var(--bg-secondary)',
                    color: !form.hasDebts ? '#10B981' : 'var(--text-secondary)',
                    border: !form.hasDebts ? '1px solid #10B981' : '1px solid var(--border)'
                  }}>
                  Nao tenho dividas
                </button>
              </div>
              {form.hasDebts && (
                <div className="animate-fade-in">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                    Total aproximado de dividas
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                      style={{ color: '#EF4444' }}>EUR</span>
                    <input type="number" value={form.totalDebt || ''} onChange={e => updateForm('totalDebt', Number(e.target.value))}
                      placeholder="5000" className="w-full pl-14 pr-4 py-3 rounded-xl text-sm"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Coach */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                O teu AI Coach
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                E o teu alter ego financeiro bem-sucedido.
              </p>

              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Nome do Coach
              </label>
              <input type="text" value={form.coachName} onChange={e => updateForm('coachName', e.target.value)}
                placeholder="Ricardo" className="w-full px-4 py-3 rounded-xl text-sm mb-4"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />

              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Genero
              </label>
              <div className="flex gap-2 mb-4">
                {[
                  { value: 'm', label: 'Masculino', emoji: '👨‍💼' },
                  { value: 'f', label: 'Feminino', emoji: '👩‍💼' },
                  { value: 'n', label: 'Neutro', emoji: '🧑‍💼' }
                ].map(g => (
                  <button key={g.value} onClick={() => updateForm('coachGender', g.value)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: form.coachGender === g.value ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                      color: form.coachGender === g.value ? 'var(--gold)' : 'var(--text-secondary)',
                      border: form.coachGender === g.value ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}>
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>

              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                Personalidade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'disciplinado', label: 'Disciplinado', desc: 'Direto e focado' },
                  { value: 'amigavel', label: 'Amigavel', desc: 'Caloroso e encorajador' },
                  { value: 'estrategico', label: 'Estrategico', desc: 'Analitico e planeado' },
                  { value: 'espiritual', label: 'Espiritual', desc: 'Reflexivo e inspirador' }
                ].map(p => (
                  <button key={p.value} onClick={() => updateForm('coachPersonality', p.value)}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      background: form.coachPersonality === p.value ? 'rgba(212,160,23,0.2)' : 'var(--bg-secondary)',
                      border: form.coachPersonality === p.value ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}>
                    <span className="text-sm font-semibold block"
                      style={{ color: form.coachPersonality === p.value ? 'var(--gold)' : 'var(--text-primary)' }}>
                      {p.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Mode */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                O teu Modo de Vida
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Baseado nos teus dados, sugerimos o modo:
              </p>
              <div className="flex flex-col gap-3">
                {Object.entries(modeLabels).map(([key, label]) => {
                  const suggested = key === suggestMode();
                  return (
                    <button key={key} onClick={() => updateForm('financialMode', key)}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: form.financialMode === key ? `${modeColors[key]}20` : 'var(--bg-secondary)',
                        border: form.financialMode === key ? `2px solid ${modeColors[key]}` : '1px solid var(--border)'
                      }}>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ background: modeColors[key] }} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: modeColors[key] }}>{label}</span>
                            {suggested && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${modeColors[key]}20`, color: modeColors[key] }}>
                                SUGERIDO
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {modeDescriptions[key]}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 px-5 py-3 rounded-xl text-sm font-medium"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={16} /> Voltar
          </button>
        )}
        {step < 5 ? (
          <button onClick={() => setStep(step + 1)}
            className="flex-1 flex items-center justify-center gap-1 py-3.5 rounded-2xl text-sm font-bold text-white gold-gradient">
            Continuar <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleComplete} disabled={loading}
            className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-white gold-gradient disabled:opacity-50">
            {loading ? 'A configurar...' : 'Comecar!'}
          </button>
        )}
      </div>
    </div>
  );
}
