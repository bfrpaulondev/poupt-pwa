import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, modeColors, modeLabels, getDaysUntil } from '../utils/helpers';
import {
  Shield, AlertTriangle, Phone, FileText, Heart, ArrowRight, ExternalLink,
  AlertCircle, CheckSquare, Square, Home, Users, CreditCard, Banknote,
  MessageCircle, MapPin, Clock, ChevronDown, ChevronUp, Flame, TrendingDown,
  CircleDollarSign, HandHeart, Copy, Check, Mail, BookOpen, Target,
  BarChart3, TrendingUp
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
  { id: 'contact', label: 'Contactar credores para negociacao', desc: 'Negocia prazos e valores antes que te contactem', icon: Phone, priority: 'alta' },
  { id: 'list_debts', label: 'Listar todas as dividas e priorizar', desc: 'Sabe exactamente quanto deves e a quem', icon: FileText, priority: 'critica' },
  { id: 'minimum', label: 'Pagar minimos essenciais', desc: 'Agua, luz, gasto alimentar basico', icon: Banknote, priority: 'critica' },
  { id: 'cut', label: 'Cortar despesas nao essenciais', desc: 'Cancela subscricoes, servicos premium, etc.', icon: TrendingDown, priority: 'alta' },
  { id: 'income', label: 'Encontrar fontes de rendimento extra', desc: 'Freelance, venda de itens, trabalho parcial', icon: CircleDollarSign, priority: 'media' },
  { id: 'food_bank', label: 'Usar banco alimentar / apoio social', desc: 'Sem vergonha - existem para ajudar', icon: HandHeart, priority: 'media' },
];

const priorityColors = {
  critica: '#EF4444',
  alta: '#F97316',
  media: '#F59E0B',
  baixa: '#10B981'
};

const creditorTemplates = [
  {
    id: 'email_negotiation',
    title: 'Email de Negociacao',
    type: 'email',
    icon: Mail,
    content: `Exmo. Sr(a),\n\nEu, [NOME], titular da conta [NUMERO], venho por este meio solicitar a renegotiacao das condicoes do meu credito, devido a dificuldades financeiras temporarias.\n\nPropo o seguinte plano de pagamento:\n- Valor mensal: [VALOR] EUR\n- Revisao em: [DATA]\n\nAgradeço a compreensao e ficarei aguardar resposta.\n\nCom os melhores cumprimentos,\n[NOME]\n[NIF]\n[CONTACTO]`
  },
  {
    id: 'letter_hardship',
    title: 'Carta de Dificuldade',
    type: 'letter',
    icon: FileText,
    content: `Exmo. Sr(a),\n\nEu, [NOME], residente em [MORADA], com NIF [NIF], venho comunicar a minha situacao de sobreendividamento.\n\nActualmente, o meu rendimento mensal e de [RENDA] EUR e as minhas despesas essenciais totalizam [DESPESAS] EUR.\n\nSolicito:\n1. Reestruturacao da divida\n2. Reducao temporal da prestacao\n3. Prazo de graca de [MESES] meses\n\nDocumentos anexos: [LISTA]\n\nCom os melhores cumprimentos,\n[NOME]`
  },
  {
    id: 'phone_script',
    title: 'Script Telefonico',
    type: 'phone',
    icon: Phone,
    content: `Olá, o meu nome é [NOME] e sou cliente com o número [NUMERO].\n\nEstou a contactar porque estou a enfrentar dificuldades financeiras e gostaria de discutir opções de renegotiacao do meu crédito.\n\nO meu rendimento atual é de [VALOR] EUR e consigo pagar mensalmente [VALOR] EUR.\n\nGostaria de saber:\n1. É possível reduzir a prestação?\n2. Há opção de prazo de carência?\n3. Qual o procedimento para reestruturação?\n\nPosso enviar documentação comprobativa.`
  }
];

const resourceLinks = [
  { name: 'DECO Proteste', phone: '213 710 200', desc: 'Associacao de defesa do consumidor', url: 'https://www.deco.proteste.pt', icon: Shield },
  { name: 'Linha Sobreendividado', phone: '213 880 600', desc: 'Apoio gratuito do Banco de Portugal', url: 'https://www.bportugal.pt', icon: Phone },
  { name: 'Central de Responsabilidades', phone: '213 213 000', desc: 'Consultar registo de credito', url: 'https://www.bportugal.pt/page/central-de-responsabilidades-de-credito', icon: FileText },
  { name: 'Seguranca Social', phone: '300 500 800', desc: 'Apoio social, RSI, subsidios', url: 'https://www.seg-social.pt', icon: Heart },
  { name: 'MNE - Energia', phone: '211 550 410', desc: 'Apoio em conflitos de energia', url: 'https://www.erse.pt', icon: CircleDollarSign },
  { name: 'GACE - Consumidor', phone: '219 246 010', desc: 'Apoio juridico gratuito em Lisboa', url: '', icon: Users },
];

export default function SurvivalMode() {
  const { user, debts, setScreen } = useStore();
  const [checkedItems, setCheckedItems] = useState({});
  const [showAllResources, setShowAllResources] = useState(false);
  const [debtSummary, setDebtSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(null);

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

  const copyTemplate = async (templateId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    }
  };

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalActions = actionChecklist.length;
  const progressPercent = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;

  // Calculate emergency score
  const overdueDebts = (debts || []).filter(d => {
    if (!d.dueDate || d.status === 'pago') return false;
    return getDaysUntil(d.dueDate) < 0;
  });

  const totalDebt = (debts || []).reduce((sum, d) => sum + (d.remainingAmount || d.amount || 0), 0);
  const income = user?.income || 0;
  const debtToIncomeRatio = income > 0 ? totalDebt / income : 0;

  let emergencyScore = 100;
  if (debtToIncomeRatio > 0.5) emergencyScore -= 30;
  if (debtToIncomeRatio > 0.8) emergencyScore -= 20;
  if (overdueDebts.length > 0) emergencyScore -= overdueDebts.length * 10;
  if ((user?.balance || 0) < 0) emergencyScore -= 15;
  emergencyScore = Math.max(0, Math.min(100, emergencyScore));

  const scoreColor = emergencyScore >= 70 ? '#10B981' : emergencyScore >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel = emergencyScore >= 70 ? 'Estavel' : emergencyScore >= 40 ? 'Atencao' : 'Critico';

  const visibleResources = showAllResources ? resourceLinks : resourceLinks.slice(0, 3);

  const currentMotivation = motivationalMessages[user?.financialMode] || motivationalMessages.sobrevivencia;
  const motivationIdx = Math.floor(Date.now() / 86400000) % currentMotivation.length;

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

      {/* Emergency Assessment Score */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <BarChart3 size={16} style={{ color: scoreColor }} /> Avaliacao de Emergencia
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                strokeDasharray={`${emergencyScore * 2.14} 214`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold" style={{ color: scoreColor }}>{emergencyScore}</span>
              <span className="text-[8px] font-medium" style={{ color: 'var(--text-muted)' }}>SCORE</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] mb-0.5">
                <span style={{ color: 'var(--text-muted)' }}>Divida/Rendimento</span>
                <span className="font-medium" style={{ color: debtToIncomeRatio > 0.5 ? '#EF4444' : '#10B981' }}>
                  {(debtToIncomeRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: 'var(--border)' }}>
                <div className="h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, debtToIncomeRatio * 100)}%`, background: debtToIncomeRatio > 0.5 ? '#EF4444' : '#10B981' }} />
              </div>
            </div>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: 'var(--text-muted)' }}>Dividas em atraso</span>
              <span className="font-medium" style={{ color: overdueDebts.length > 0 ? '#EF4444' : '#10B981' }}>
                {overdueDebts.length}
              </span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className="font-semibold" style={{ color: scoreColor }}>{scoreLabel}</span>
            </div>
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

      {/* Progress Tracker: Survival to Recovery */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Target size={16} style={{ color: 'var(--gold)' }} /> De Sobrevivencia a Recuperacao
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${progressPercent}%`, background: '#10B981' }} />
              </div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#10B981' }}>
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between">
            <div className="text-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center"
                style={{ background: '#EF4444' }}>
                <AlertTriangle size={10} className="text-white" />
              </div>
              <span className="text-[8px]" style={{ color: '#EF4444' }}>Sobrevivencia</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center"
                style={{ background: progressPercent >= 30 ? '#F97316' : 'var(--border)' }}>
                <Flame size={10} className="text-white" />
              </div>
              <span className="text-[8px]" style={{ color: progressPercent >= 30 ? '#F97316' : 'var(--text-muted)' }}>Recuperacao</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center"
                style={{ background: progressPercent >= 70 ? '#F59E0B' : 'var(--border)' }}>
                <Shield size={10} className="text-white" />
              </div>
              <span className="text-[8px]" style={{ color: progressPercent >= 70 ? '#F59E0B' : 'var(--text-muted)' }}>Estabilidade</span>
            </div>
            <div className="text-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1 flex items-center justify-center"
                style={{ background: progressPercent >= 100 ? '#10B981' : 'var(--border)' }}>
                <CheckSquare size={10} className="text-white" />
              </div>
              <span className="text-[8px]" style={{ color: progressPercent >= 100 ? '#10B981' : 'var(--text-muted)' }}>Liberdade</span>
            </div>
          </div>
        </div>
      </div>

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
            style={{ width: `${progressPercent}%`, background: '#10B981' }} />
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

      {/* Creditor Contact Templates */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <MessageCircle size={16} style={{ color: 'var(--gold)' }} /> Templates para Credores
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          Copia e adapta estas mensagens para contactar os teus credores
        </p>
        <div className="space-y-2">
          {creditorTemplates.map(template => {
            const Icon = template.icon;
            const isExpanded = expandedTemplate === template.id;
            const isCopied = copiedTemplate === template.id;
            return (
              <div key={template.id} className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <button onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                  className="w-full p-3 flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,215,0,0.15)' }}>
                    <Icon size={16} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {template.title}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {template.type === 'email' ? 'Email' : template.type === 'letter' ? 'Carta' : 'Telefone'}
                    </p>
                  </div>
                  {isExpanded
                    ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                  }
                </button>
                {isExpanded && (
                  <div className="p-3 pt-0 animate-fade-in">
                    <pre className="text-[10px] whitespace-pre-wrap p-3 rounded-xl mb-2"
                      style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {template.content}
                    </pre>
                    <button onClick={() => copyTemplate(template.id, template.content)}
                      className="w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                      style={{
                        background: isCopied ? 'rgba(16,185,129,0.15)' : 'rgba(255,215,0,0.15)',
                        color: isCopied ? '#10B981' : 'var(--gold)',
                        border: `1px solid ${isCopied ? 'rgba(16,185,129,0.3)' : 'rgba(255,215,0,0.3)'}`
                      }}>
                      {isCopied ? <Check size={12} /> : <Copy size={12} />}
                      {isCopied ? 'Copiado!' : 'Copiar template'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Atalhos Rapidos
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: AlertTriangle, title: 'Ver dividas', desc: 'Prioriza o que esta vencido', screen: 'debts' },
            { icon: CreditCard, title: 'Registar pagamento', desc: 'Actualiza progresso', screen: 'add-transaction' },
            { icon: FileText, title: 'Ver relatorios', desc: 'Analisa as tuas financas', screen: 'reports' },
            { icon: HandHeart, title: 'Recursos de apoio', desc: 'DECO, Linha Sobreendividado', action: 'resources' },
          ].map(({ icon: Icon, title, desc, screen, action }) => (
            <button key={title}
              onClick={() => { if (screen) setScreen(screen); if (action === 'resources') document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' }); }}
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
      <div id="resources-section">
        <h3 className="text-xs font-semibold mb-3 uppercase" style={{ color: 'var(--text-muted)' }}>
          Recursos de Emergencia
        </h3>
        <div className="space-y-2">
          {visibleResources.map(r => {
            const ResIcon = r.icon || Phone;
            return (
              <div key={r.name} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ResIcon size={14} style={{ color: 'var(--gold)' }} />
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
            );
          })}
        </div>
        {resourceLinks.length > 3 && (
          <button onClick={() => setShowAllResources(!showAllResources)}
            className="w-full py-2 mt-2 text-xs font-medium flex items-center justify-center gap-1"
            style={{ color: 'var(--text-secondary)' }}>
            {showAllResources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showAllResources ? 'Ver menos' : `Ver mais ${resourceLinks.length - 3} recursos`}
          </button>
        )}
      </div>

      {/* Motivational */}
      <div className="p-4 rounded-2xl text-center" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)' }}>
        <BookOpen size={20} className="mx-auto mb-2" style={{ color: 'var(--gold)' }} />
        <p className="text-sm italic" style={{ color: 'var(--gold)' }}>
          {currentMotivation[motivationIdx]}
        </p>
      </div>
    </div>
  );
}
