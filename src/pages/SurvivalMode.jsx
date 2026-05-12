import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, modeColors, modeLabels, getDaysUntil } from '../utils/helpers';
import {
  Shield, AlertTriangle, Phone, FileText, Heart, ArrowRight, ExternalLink,
  AlertCircle, CheckSquare, Square, Home, Users, CreditCard, Banknote,
  MessageCircle, MapPin, Clock, ChevronDown, ChevronUp, Flame, TrendingDown,
  CircleDollarSign, HandHeart
} from 'lucide-react';

const motivationalMessages = {
  sobrevivencia: [
    '"O homem que encontra um meio de ganhar, por menor que seja, comeca a construir a sua fortuna." - O Homem Mais Rico da Babilonia',
    '"Nao importa onde comecas, mas sim onde decides ir." - Proverbio',
    '"Cada euro que economizas e um euro que te defende." - Seneca',
  ],
  recuperacao: [
    '"A disciplina e a ponte entre objectivos e realizacoes." - Jim Rohn',
    '"Nao e sobre o quao duro batas, mas sim sobre o quao duro podes apanhar e continuar." - Rocky Balboa',
    '"O progresso, nao a perfeicao, e o que importa." - Anne Wilson Schaef',
  ],
  estabilidade: [
    '"A poupanca e a semente da liberdade." - Proverbio',
    '"Nao guardes para amanha o que podes poupar hoje." - Adaptacao',
    '"A estabilidade financeira nao e um destino, e uma viagem." - PoupPT',
  ],
};

const actionChecklist = [
  { id: 'rent', label: 'Priorizar renda/habitacao', desc: 'Garante que tens onde morar primeiro', icon: Home, priority: 'critica' },
  { id: 'contact', label: 'Contactar credores', desc: 'Negocia prazos e valores antes que te contactem', icon: Phone, priority: 'alta' },
  { id: 'minimum', label: 'Pagar minimos essenciais', desc: 'Agua, luz, gasto alimentar basico', icon: Banknote, priority: 'critica' },
  { id: 'cancel', label: 'Cancelar servicos nao essenciais', desc: 'Subscricoes, servicos premium, etc.', icon: TrendingDown, priority: 'alta' },
  { id: 'review', label: 'Rever todos os gastos', desc: 'Lista tudo o que gastas e corta o desnecessario', icon: FileText, priority: 'media' },
  { id: 'informal', label: 'Comunicar com credores informais', desc: 'Seja honesto com amigos/familia', icon: Users, priority: 'media' },
];

const priorityColors = {
  critica: '#EF4444',
  alta: '#F97316',
  media: '#F59E0B',
  baixa: '#10B981'
};

export default function SurvivalMode() {
  const { user, debts, setScreen } = useStore();
  const [checkedItems, setCheckedItems] = useState({});
  const [showAllResources, setShowAllResources] = useState(false);
  const [debtSummary, setDebtSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const modeColor = modeColors[user?.financialMode] || modeColors.sobrevivencia;
  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivencia';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.getDebtProgress();
      setDebtSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalActions = actionChecklist.length;

  const emergencyActions = [
    { icon: AlertTriangle, title: 'Ver dividas em atraso', desc: 'Prioriza o que esta vencido', screen: 'debts' },
    { icon: FileText, title: 'Negociar com credores', desc: 'Templates de negociacao prontos', screen: 'debts' },
    { icon: CreditCard, title: 'Registar pagamento', desc: 'Actualiza o progresso das dividas', screen: 'add-transaction' },
    { icon: HandHeart, title: 'Recursos de apoio', desc: 'DECO, Linha Sobreendividado', action: 'resources' },
  ];

  const allResources = [
    { name: 'DECO Proteste', phone: '213 710 200', desc: 'Associacao de defesa do consumidor', url: 'https://www.deco.proteste.pt' },
    { name: 'Linha de Apoio ao Sobreendividado', phone: '213 880 600', desc: 'Apoio gratuito do Banco de Portugal', url: 'https://www.bportugal.pt' },
    { name: 'Banco de Portugal - Central de Responsabilidades', phone: '213 213 000', desc: 'Consultar registo de credito', url: 'https://www.bportugal.pt/page/central-de-responsabilidades-de-credito' },
    { name: 'MNE - Mediator Nacional de Energia', phone: '211 550 410', desc: 'Apoio em conflitos de energia', url: 'https://www.erse.pt' },
    { name: 'GABINETE DE APOIO AO CONSUMIDOR ENDIVIDADO', phone: '219 246 010', desc: 'Apoio juridico gratuito em Lisboa', url: '' },
  ];

  const visibleResources = showAllResources ? allResources : allResources.slice(0, 3);

  const currentMotivation = motivationalMessages[user?.financialMode] || motivationalMessages.sobrevivencia;
  const motivationIdx = Math.floor(Date.now() / 86400000) % currentMotivation.length;

  const overdueDebts = (debts || []).filter(d => {
    if (!d.dueDate || d.status === 'pago') return false;
    return getDaysUntil(d.dueDate) < 0;
  });

  return (
    <div className="px-4 py-4 space-y-4 animate-fade-in">
      {/* Emergency Header */}
      <div className="p-5 rounded-2xl" style={{ background: `linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))`, border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield size={24} style={{ color: '#EF4444' }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#EF4444' }}>Modo {modeLabel}</h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Foca-te nas acoes imediatas. Um passo de cada vez.</p>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {overdueDebts.length > 0 && (
        <div className="glass-card p-4" style={{ border: '1px solid rgba(239,68,68,0.4)' }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} style={{ color: '#EF4444' }} />
            <h3 className="text-sm font-semibold" style={{ color: '#EF4444' }}>Alertas Criticos</h3>
          </div>
          <div className="space-y-2">
            {overdueDebts.map(d => (
              <div key={d._id} className="flex items-center gap-2 p-2 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                <AlertTriangle size={14} style={{ color: '#EF4444' }} />
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {d.creditorName} - {formatCurrency(d.remainingAmount || d.amount)}
                  </p>
                  <p className="text-[10px]" style={{ color: '#EF4444' }}>
                    Vencida ha {Math.abs(getDaysUntil(d.dueDate))} dia{Math.abs(getDaysUntil(d.dueDate)) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
            <button onClick={() => setScreen('debts')}
              className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              Ver todas as dividas <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Negative Balance Warning */}
      {(user?.balance || 0) < 0 && (
        <div className="p-3 rounded-xl flex items-center gap-2"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <AlertCircle size={16} style={{ color: '#F59E0B' }} />
          <div>
            <p className="text-xs font-medium" style={{ color: '#F59E0B' }}>Saldo negativo</p>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
              O teu saldo esta negativo. Prioriza despesas essenciais.
            </p>
          </div>
        </div>
      )}

      {/* Acoes Imediatas - Checklist */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#EF4444' }}>
            <CheckSquare size={16} /> Acoes Imediatas
          </h3>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{totalActions}
          </span>
        </div>
        <div className="w-full rounded-full h-1.5 mb-3" style={{ background: 'var(--border)' }}>
          <div className="h-1.5 rounded-full transition-all"
            style={{ width: `${(completedCount / totalActions) * 100}%`, background: '#10B981' }} />
        </div>
        <div className="space-y-2">
          {actionChecklist.map(({ id, label, desc, icon: Icon, priority }) => (
            <button key={id} onClick={() => toggleCheck(id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
              style={{
                background: checkedItems[id] ? 'rgba(16,185,129,0.05)' : 'transparent',
                opacity: checkedItems[id] ? 0.6 : 1
              }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: checkedItems[id] ? 'rgba(16,185,129,0.15)' : `${priorityColors[priority]}15` }}>
                {checkedItems[id]
                  ? <CheckSquare size={16} style={{ color: '#10B981' }} />
                  : <Square size={16} style={{ color: priorityColors[priority] }} />
                }
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{
                  color: checkedItems[id] ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: checkedItems[id] ? 'line-through' : 'none'
                }}>
                  {label}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: `${priorityColors[priority]}15`, color: priorityColors[priority] }}>
                {priority}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Atalhos Rapidos
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {emergencyActions.map(({ icon: Icon, title, desc, screen }) => (
            <button key={title} onClick={() => screen && setScreen(screen)}
              className="glass-card p-3 flex flex-col items-center gap-2 text-center">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Icon size={18} style={{ color: '#EF4444' }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Budget Minimalista */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#EF4444' }}>
          <CircleDollarSign size={16} /> Orcamento Minimalista
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Em modo {modeLabel}, so o essencial conta
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: 'var(--text-secondary)' }}>Rendimento</span>
              <span className="font-semibold" style={{ color: '#10B981' }}>
                {formatCurrency(user?.income || 0)}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Home size={12} style={{ color: '#EF4444' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Sobrevivencia (50%)</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency((user?.income || 0) * 0.5)}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full" style={{ width: '50%', background: '#EF4444' }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <CreditCard size={12} style={{ color: '#F97316' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Dividas (40%)</span>
              </div>
              <span className="font-semibold" style={{ color: '#F97316' }}>
                {formatCurrency((user?.income || 0) * 0.4)}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full" style={{ width: '40%', background: '#F97316' }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Banknote size={12} style={{ color: 'var(--gold)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Reserva (10%)</span>
              </div>
              <span className="font-semibold" style={{ color: 'var(--gold)' }}>
                {formatCurrency((user?.income || 0) * 0.1)}
              </span>
            </div>
            <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
              <div className="h-2 rounded-full" style={{ width: '10%', background: 'var(--gold)' }} />
            </div>
          </div>
        </div>
        <div className="mt-3 p-2 rounded-xl text-center"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Lazer, restaurantes e compras nao essenciais = 0%
          </p>
        </div>
      </div>

      {/* Emergency Resources */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Recursos de Emergencia
        </h3>
        <div className="space-y-2">
          {visibleResources.map(r => (
            <div key={r.name} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <Phone size={14} style={{ color: 'var(--gold)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{r.name}</p>
              </div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-mono" style={{ color: 'var(--gold)' }}>{r.phone}</p>
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] flex items-center gap-1"
                    style={{ color: 'var(--text-muted)' }}>
                    Website <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {allResources.length > 3 && (
          <button onClick={() => setShowAllResources(!showAllResources)}
            className="w-full py-2 mt-2 text-xs font-medium flex items-center justify-center gap-1"
            style={{ color: 'var(--text-secondary)' }}>
            {showAllResources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showAllResources ? 'Ver menos' : `Ver mais ${allResources.length - 3} recursos`}
          </button>
        )}
      </div>

      {/* Creditor Management Shortcuts */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <MessageCircle size={16} style={{ color: 'var(--gold)' }} /> Gestao de Credores
        </h3>
        <div className="space-y-2">
          <button onClick={() => setScreen('debts')}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            <CreditCard size={14} /> Ver todas as dividas
          </button>
          <button onClick={() => setScreen('moedas-store')}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
            style={{ background: 'rgba(212,160,23,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,160,23,0.3)' }}>
            <FileText size={14} /> Obter template para credores
          </button>
        </div>
      </div>

      {/* Motivational */}
      <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(212,160,23,0.1)', border: '1px solid rgba(212,160,23,0.3)' }}>
        <Flame size={20} className="mx-auto mb-2" style={{ color: 'var(--gold)' }} />
        <p className="text-sm italic" style={{ color: 'var(--gold)' }}>
          {currentMotivation[motivationIdx]}
        </p>
      </div>
    </div>
  );
}
