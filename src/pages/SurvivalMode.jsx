import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import {
  Shield, AlertTriangle, Phone, FileText, Heart, ArrowRight,
  AlertCircle, CheckSquare, Square, Home, CreditCard, Banknote,
  MessageCircle, CircleDollarSign, HandHeart, Copy, Check,
  BookOpen, Target, BarChart3, TrendingDown, ChevronDown, ChevronUp
} from 'lucide-react';

const motivationalMessages = [
  '"O homem que encontra um meio de ganhar, por menor que seja, comeca a construir a sua fortuna." - O Homem Mais Rico da Babilonia',
  '"Nao importa onde comecas, mas sim onde decides ir." - Proverbio',
  '"Cada euro que economizas e um euro que te defende." - Seneca',
  '"A disciplina e a ponte entre objectivos e realizacoes." - Jim Rohn',
];

const actionChecklist = [
  { id: 'rent', label: 'Priorizar renda/habitacao', desc: 'Garante que tens onde morar primeiro', icon: Home, priority: 'critica' },
  { id: 'contact', label: 'Contactar credores', desc: 'Negocia prazos e valores', icon: Phone, priority: 'alta' },
  { id: 'list_debts', label: 'Listar todas as dividas', desc: 'Sabe exactamente quanto deves', icon: FileText, priority: 'critica' },
  { id: 'minimum', label: 'Pagar minimos essenciais', desc: 'Agua, luz, gasto alimentar basico', icon: Banknote, priority: 'critica' },
  { id: 'cut', label: 'Cortar despesas nao essenciais', desc: 'Cancela subscricoes, servicos premium', icon: TrendingDown, priority: 'alta' },
  { id: 'income', label: 'Rendimento extra', desc: 'Freelance, venda de itens', icon: CircleDollarSign, priority: 'media' },
  { id: 'food_bank', label: 'Banco alimentar / apoio social', desc: 'Sem vergonha - existem para ajudar', icon: HandHeart, priority: 'media' },
];

const priorityColors = { critica: '#EF4444', alta: '#F97316', media: '#F59E0B', baixa: '#10B981' };

const resourceLinks = [
  { name: 'DECO Proteste', phone: '213 710 200', desc: 'Associacao de defesa do consumidor', icon: Shield },
  { name: 'Linha Sobreendividado', phone: '213 880 600', desc: 'Apoio gratuito do Banco de Portugal', icon: Phone },
  { name: 'Seguranca Social', phone: '300 500 800', desc: 'Apoio social, RSI, subsidios', icon: Heart },
];

export default function SurvivalMode() {
  const theme = themes.darkGold;
  const { user, debts, setScreen } = useStore();
  const [checkedItems, setCheckedItems] = useState({});
  const [showAllResources, setShowAllResources] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(null);

  const s = (color, alpha) => `${color}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalActions = actionChecklist.length;
  const progressPercent = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;

  const totalDebt = (debts || []).reduce((sum, d) => sum + (d.remaining || d.total || 0), 0);
  const income = user?.income || 0;
  const debtToIncomeRatio = income > 0 ? totalDebt / income : 0;
  const overdueDebts = (debts || []).filter(d => d.daysOverdue > 0);

  let emergencyScore = 100;
  if (debtToIncomeRatio > 0.5) emergencyScore -= 30;
  if (debtToIncomeRatio > 0.8) emergencyScore -= 20;
  if (overdueDebts.length > 0) emergencyScore -= overdueDebts.length * 10;
  emergencyScore = Math.max(0, Math.min(100, emergencyScore));
  const scoreColor = emergencyScore >= 70 ? '#10B981' : emergencyScore >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel = emergencyScore >= 70 ? 'Estavel' : emergencyScore >= 40 ? 'Atencao' : 'Critico';

  const motivationIdx = Math.floor(Date.now() / 86400000) % motivationalMessages.length;

  const creditorTemplates = [
    { id: 'email', title: 'Email de Negociacao', icon: MessageCircle, content: 'Exmo. Sr(a),\n\nEu, [NOME], venho solicitar a renegotiacao das condicoes do meu credito.\n\nPropo o seguinte plano:\n- Valor mensal: [VALOR] EUR\n- Revisao em: [DATA]\n\nCom os melhores cumprimentos,\n[NOME]' },
    { id: 'phone', title: 'Script Telefonico', icon: Phone, content: 'Ola, o meu nome e [NOME] e sou cliente com o numero [NUMERO].\n\nEstou a contactar porque gostaria de discutir opcoes de renegotiacao.\n\nO meu rendimento atual e de [VALOR] EUR e consigo pagar mensalmente [VALOR] EUR.' },
  ];

  const copyTemplate = async (id, content) => {
    try { await navigator.clipboard.writeText(content); } catch { /* fallback */ }
    setCopiedTemplate(id);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, overflowX: 'hidden' }}
    >
      {/* Emergency Header */}
      <div className="survival-pulse" style={{
        padding: 20, borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
        border: '1px solid rgba(239,68,68,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={24} style={{ color: '#EF4444' }} />
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#EF4444', margin: 0 }}>Modo Sobrevivencia</h2>
            <p style={{ fontSize: 12, color: theme.textMuted, margin: '2px 0 0' }}>Foca-te nas acoes imediatas. Um passo de cada vez.</p>
          </div>
        </div>
      </div>

      {/* Emergency Score */}
      <div className="glass-card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 size={16} style={{ color: scoreColor }} /> Avaliacao de Emergencia
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="34" fill="none" stroke={theme.border} strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="6"
                strokeDasharray={`${emergencyScore * 2.14} 214`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor }}>{emergencyScore}</span>
              <span style={{ fontSize: 7, fontWeight: 500, color: theme.textMuted }}>SCORE</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: theme.textMuted }}>Divida/Rendimento</span>
              <span style={{ fontWeight: 500, color: debtToIncomeRatio > 0.5 ? '#EF4444' : '#10B981' }}>{(debtToIncomeRatio * 100).toFixed(0)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span style={{ color: theme.textMuted }}>Status</span>
              <span style={{ fontWeight: 600, color: scoreColor }}>{scoreLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {overdueDebts.length > 0 && (
        <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(239,68,68,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertCircle size={16} style={{ color: '#EF4444' }} />
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', margin: 0 }}>Alertas Criticos</h3>
          </div>
          {overdueDebts.slice(0, 3).map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 12, background: s('#EF4444', 0.08), marginBottom: 4 }}>
              <AlertTriangle size={14} style={{ color: '#EF4444' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: theme.text, margin: 0 }}>{d.creditor || d.name} - €{(d.remaining || d.total || 0).toFixed(2)}</p>
                <p style={{ fontSize: 10, color: '#EF4444', margin: 0 }}>Vencida ha {d.daysOverdue} dia{d.daysOverdue !== 1 ? 's' : ''}</p>
              </div>
            </div>
          ))}
          <button onClick={() => setScreen('debts')} style={{
            width: '100%', padding: 8, borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8,
            background: s('#EF4444', 0.1), color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)'
          }}>
            Ver todas as dividas <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Progress Tracker */}
      <div className="glass-card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={16} style={{ color: theme.primary }} /> De Sobrevivencia a Recuperacao
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ width: '100%', borderRadius: 20, height: 8, background: theme.border }}>
              <div style={{ height: 8, borderRadius: 20, width: `${progressPercent}%`, background: '#10B981', transition: 'width 0.3s' }} />
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{progressPercent.toFixed(0)}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {[
            { label: 'Sobrevivencia', color: '#EF4444', icon: AlertTriangle, threshold: 0 },
            { label: 'Recuperacao', color: '#F97316', icon: Shield, threshold: 30 },
            { label: 'Estabilidade', color: '#F59E0B', icon: CheckSquare, threshold: 70 },
            { label: 'Liberdade', color: '#10B981', icon: Heart, threshold: 100 },
          ].map(({ label, color, icon: Icon, threshold }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', margin: '0 auto 4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: progressPercent >= threshold ? color : theme.border
              }}>
                <Icon size={10} color="#fff" />
              </div>
              <span style={{ fontSize: 8, color: progressPercent >= threshold ? color : theme.textMuted }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Checklist */}
      <div className="glass-card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckSquare size={16} /> Acoes Imediatas
          </h3>
          <span style={{ fontSize: 11, fontWeight: 500, color: theme.textMuted }}>{completedCount}/{totalActions}</span>
        </div>
        <div style={{ width: '100%', borderRadius: 20, height: 6, background: theme.border, marginBottom: 12 }}>
          <div style={{ height: 6, borderRadius: 20, width: `${progressPercent}%`, background: '#10B981', transition: 'width 0.3s' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {actionChecklist.map(({ id, label, desc, icon: Icon, priority }) => (
            <button key={id} onClick={() => setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }))} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12,
              textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent',
              opacity: checkedItems[id] ? 0.5 : 1
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: checkedItems[id] ? s('#10B981', 0.15) : s(priorityColors[priority], 0.1)
              }}>
                {checkedItems[id] ? <CheckSquare size={16} style={{ color: '#10B981' }} /> : <Square size={16} style={{ color: priorityColors[priority] }} />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: checkedItems[id] ? theme.textMuted : theme.text, margin: 0, textDecoration: checkedItems[id] ? 'line-through' : 'none' }}>{label}</p>
                <p style={{ fontSize: 10, color: theme.textMuted, margin: 0 }}>{desc}</p>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 20, background: s(priorityColors[priority], 0.15), color: priorityColors[priority] }}>
                {priority}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Creditor Templates */}
      <div className="glass-card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={16} style={{ color: theme.primary }} /> Templates para Credores
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {creditorTemplates.map(template => {
            const Icon = template.icon;
            const isExpanded = expandedTemplate === template.id;
            const isCopied = copiedTemplate === template.id;
            return (
              <div key={template.id} style={{ borderRadius: 12, overflow: 'hidden', background: theme.surface, border: `1px solid ${theme.border}` }}>
                <button onClick={() => setExpandedTemplate(isExpanded ? null : template.id)} style={{
                  width: '100%', padding: 12, display: 'flex', alignItems: 'center', gap: 12,
                  textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent'
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s(theme.primary, 0.15) }}>
                    <Icon size={16} style={{ color: theme.primary }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: theme.text, margin: 0 }}>{template.title}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={14} style={{ color: theme.textMuted }} /> : <ChevronDown size={14} style={{ color: theme.textMuted }} />}
                </button>
                {isExpanded && (
                  <div style={{ padding: '0 12px 12px' }}>
                    <pre style={{
                      fontSize: 10, whiteSpace: 'pre-wrap', padding: 12, borderRadius: 12, marginBottom: 8, lineHeight: 1.5,
                      background: theme.background, color: theme.textMuted
                    }}>
                      {template.content}
                    </pre>
                    <button onClick={() => copyTemplate(template.id, template.content)} style={{
                      width: '100%', padding: 8, borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      background: isCopied ? s('#10B981', 0.15) : s(theme.primary, 0.15),
                      color: isCopied ? '#10B981' : theme.primary,
                      border: `1px solid ${isCopied ? s('#10B981', 0.3) : s(theme.primary, 0.3)}`
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

      {/* Minimalist Budget */}
      <div className="glass-card" style={{ padding: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CircleDollarSign size={16} /> Orcamento Minimalista
        </h3>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: theme.textMuted }}>Rendimento</span>
            <span style={{ fontWeight: 600, color: '#10B981' }}>€{(income).toFixed(2)}</span>
          </div>
        </div>
        {[
          { label: 'Sobrevivencia (50%)', pct: 50, color: '#EF4444', icon: Home },
          { label: 'Dividas (40%)', pct: 40, color: '#F97316', icon: CreditCard },
          { label: 'Reserva (10%)', pct: 10, color: theme.primary, icon: Banknote },
        ].map(({ label, pct, color, icon: Icon }) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={12} style={{ color }} />
                <span style={{ color: theme.textMuted }}>{label}</span>
              </div>
              <span style={{ fontWeight: 600, color: color === theme.primary ? theme.primary : color }}>€{(income * pct / 100).toFixed(2)}</span>
            </div>
            <div style={{ width: '100%', borderRadius: 20, height: 8, background: theme.border, marginTop: 4 }}>
              <div style={{ height: 8, borderRadius: 20, width: `${pct}%`, background: color }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: 12, padding: 8, borderRadius: 12, textAlign: 'center', background: s('#EF4444', 0.08) }}>
          <p style={{ fontSize: 10, color: theme.textMuted, margin: 0 }}>Lazer e compras nao essenciais = 0%</p>
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, textTransform: 'uppercase', marginBottom: 12 }}>Recursos de Emergencia</h3>
        {(showAllResources ? resourceLinks : resourceLinks.slice(0, 3)).map(r => {
          const RIcon = r.icon || Phone;
          return (
            <div key={r.name} className="glass-card" style={{ padding: 16, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <RIcon size={14} style={{ color: theme.primary }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: theme.text, margin: 0 }}>{r.name}</p>
              </div>
              <p style={{ fontSize: 11, color: theme.textMuted, margin: '0 0 4px' }}>{r.desc}</p>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: theme.primary, margin: 0 }}>{r.phone}</p>
            </div>
          );
        })}
      </div>

      {/* Motivational */}
      <div style={{
        padding: 16, borderRadius: 16, textAlign: 'center',
        background: s(theme.primary, 0.1), border: `1px solid ${s(theme.primary, 0.3)}`
      }}>
        <BookOpen size={20} style={{ color: theme.primary, margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13, fontStyle: 'italic', color: theme.primary, margin: 0 }}>{motivationalMessages[motivationIdx]}</p>
      </div>
    </motion.div>
  );
}
