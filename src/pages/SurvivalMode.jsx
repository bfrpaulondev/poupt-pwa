import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, modeColors, modeLabels, getDaysUntil } from '../utils/helpers';
import {
  Shield, AlertTriangle, Phone, FileText, Heart, ArrowRight, ArrowLeft,
  ExternalLink, AlertCircle, CheckSquare, Square, Home, Users, CreditCard,
  Banknote, MessageCircle, ChevronDown, ChevronUp, Flame, TrendingDown,
  CircleDollarSign, HandHeart, Copy, Check, Mail, BookOpen, Target,
  BarChart3,
} from 'lucide-react';

/* ============================================================
   DADOS
   ============================================================ */
const motivationalMessages = {
  sobrevivencia: [
    '"O homem que encontra um meio de ganhar, por menor que seja, começa a construir a sua fortuna." — O Homem Mais Rico da Babilónia',
    '"Não importa onde começas, mas sim onde decides ir." — Provérbio',
    '"Cada euro que economizas é um euro que te defende." — Séneca',
  ],
  recuperacao: [
    '"A disciplina é a ponte entre objetivos e realizações." — Jim Rohn',
    '"Não é sobre o quão duro bates, mas sim sobre o quão duro podes apanhar e continuar." — Rocky Balboa',
    '"O progresso, não a perfeição, é o que importa." — Anne Wilson Schaef',
  ],
  estabilidade: [
    '"A poupança é a semente da liberdade." — Provérbio',
    '"Não guardes para amanhã o que podes poupar hoje." — Adaptação',
    '"A estabilidade financeira não é um destino, é uma viagem." — PoupPT',
  ],
};

const actionChecklist = [
  { id: 'rent', label: 'Priorizar renda / habitação', desc: 'Garante onde morar primeiro', icon: Home, priority: 'critica' },
  { id: 'list_debts', label: 'Listar todas as dívidas', desc: 'Sabe exatamente quanto deves e a quem', icon: FileText, priority: 'critica' },
  { id: 'minimum', label: 'Pagar mínimos essenciais', desc: 'Água, luz, alimentação básica', icon: Banknote, priority: 'critica' },
  { id: 'contact', label: 'Contactar credores', desc: 'Negocia antes que te contactem', icon: Phone, priority: 'alta' },
  { id: 'cut', label: 'Cortar despesas não essenciais', desc: 'Cancela subscrições, premium, etc.', icon: TrendingDown, priority: 'alta' },
  { id: 'income', label: 'Fontes de rendimento extra', desc: 'Freelance, venda de itens, parcial', icon: CircleDollarSign, priority: 'media' },
  { id: 'food_bank', label: 'Banco alimentar / apoio social', desc: 'Sem vergonha — existem para ajudar', icon: HandHeart, priority: 'media' },
];

const priorityConfig = {
  critica: { color: '#EF4444', label: 'Crítica' },
  alta: { color: '#F97316', label: 'Alta' },
  media: { color: '#F59E0B', label: 'Média' },
  baixa: { color: '#10B981', label: 'Baixa' },
};

const creditorTemplates = [
  {
    id: 'email_negotiation',
    title: 'Email de negociação',
    type: 'Email',
    icon: Mail,
    content: `Exmo. Sr(a),

Eu, [NOME], titular da conta [NÚMERO], venho por este meio solicitar a renegociação das condições do meu crédito, devido a dificuldades financeiras temporárias.

Proponho o seguinte plano de pagamento:
• Valor mensal: [VALOR] EUR
• Revisão em: [DATA]

Agradeço a compreensão e ficarei a aguardar resposta.

Com os melhores cumprimentos,
[NOME]
[NIF]
[CONTACTO]`,
  },
  {
    id: 'letter_hardship',
    title: 'Carta de dificuldade',
    type: 'Carta',
    icon: FileText,
    content: `Exmo. Sr(a),

Eu, [NOME], residente em [MORADA], com NIF [NIF], venho comunicar a minha situação de sobreendividamento.

Atualmente, o meu rendimento mensal é de [RENDA] EUR e as despesas essenciais totalizam [DESPESAS] EUR.

Solicito:
1. Reestruturação da dívida
2. Redução temporária da prestação
3. Prazo de graça de [MESES] meses

Documentos anexos: [LISTA]

Com os melhores cumprimentos,
[NOME]`,
  },
  {
    id: 'phone_script',
    title: 'Script telefónico',
    type: 'Telefone',
    icon: Phone,
    content: `Olá, o meu nome é [NOME] e sou cliente com o número [NÚMERO].

Estou a contactar porque enfrento dificuldades financeiras e gostaria de discutir opções de renegociação do meu crédito.

O meu rendimento atual é de [VALOR] EUR e consigo pagar mensalmente [VALOR] EUR.

Gostaria de saber:
1. É possível reduzir a prestação?
2. Há opção de prazo de carência?
3. Qual o procedimento para reestruturação?

Posso enviar documentação comprobativa.`,
  },
];

const resourceLinks = [
  { name: 'DECO Proteste', phone: '213 710 200', desc: 'Defesa do consumidor', url: 'https://www.deco.proteste.pt', icon: Shield },
  { name: 'Linha Sobreendividado', phone: '213 880 600', desc: 'Apoio gratuito do Banco de Portugal', url: 'https://www.bportugal.pt', icon: Phone },
  { name: 'Central de Responsabilidades', phone: '213 213 000', desc: 'Consultar registo de crédito', url: 'https://www.bportugal.pt/page/central-de-responsabilidades-de-credito', icon: FileText },
  { name: 'Segurança Social', phone: '300 500 800', desc: 'Apoio social, RSI, subsídios', url: 'https://www.seg-social.pt', icon: Heart },
  { name: 'ERSE - Energia', phone: '211 550 410', desc: 'Conflitos com fornecedores de energia', url: 'https://www.erse.pt', icon: CircleDollarSign },
  { name: 'GACE - Consumidor', phone: '219 246 010', desc: 'Apoio jurídico gratuito em Lisboa', url: '', icon: Users },
];

/* ============================================================
   SHELL
   ============================================================ */
function Shell({ children }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1180,
        margin: '0 auto',
        padding: 'clamp(16px, 3vw, 32px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'clamp(14px, 2vw, 20px)',
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, tone = 'default', style = {}, ...props }) {
  const borders = {
    default: 'var(--border)',
    danger: 'rgba(239,68,68,0.32)',
    warning: 'rgba(245,158,11,0.32)',
    success: 'rgba(16,185,129,0.32)',
    gold: 'rgba(212,168,67,0.32)',
  };
  return (
    <section
      style={{
        padding: 'clamp(16px, 2.4vw, 22px)',
        borderRadius: 20,
        background: 'var(--card)',
        border: `1px solid ${borders[tone]}`,
        minWidth: 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </section>
  );
}

function SectionTitle({ icon: Icon, color, children, action }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 14,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {Icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              display: 'grid',
              placeItems: 'center',
              background: `${color || 'var(--gold)'}18`,
              color: color || 'var(--gold)',
              flexShrink: 0,
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <h3
          style={{
            fontSize: 'clamp(14px, 1.8vw, 16px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {children}
        </h3>
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   EMERGENCY HEADER
   ============================================================ */
function EmergencyHeader({ modeLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(20px, 3vw, 28px)',
        borderRadius: 24,
        background:
          'linear-gradient(135deg, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0.04) 100%)',
        border: '1px solid rgba(239,68,68,0.28)',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.18), transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(239,68,68,0.18)',
            color: '#EF4444',
            flexShrink: 0,
          }}
        >
          <Shield size={26} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#EF4444',
              margin: 0,
            }}
          >
            Modo ativo
          </p>
          <h2
            style={{
              marginTop: 4,
              fontSize: 'clamp(20px, 3vw, 26px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              margin: '4px 0 0',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {modeLabel}
          </h2>
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Foca-te nas ações imediatas. Um passo de cada vez.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   EMERGENCY SCORE
   ============================================================ */
function EmergencyScore({ score, scoreColor, scoreLabel, debtToIncomeRatio, overdueCount }) {
  const dashOffset = 214 - (score / 100) * 214;

  return (
    <Card>
      <SectionTitle icon={BarChart3} color={scoreColor}>
        Avaliação de emergência
      </SectionTitle>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: 20,
          alignItems: 'center',
          minWidth: 0,
        }}
        className="emergency-score-grid"
      >
        {/* Score circle */}
        <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto' }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="55" cy="55" r="44" fill="none" stroke="var(--border)" strokeWidth="8" />
            <motion.circle
              cx="55"
              cy="55"
              r="44"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeDasharray="276"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (score / 100) * 276 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {score}
            </span>
            <span
              style={{
                marginTop: 2,
                fontSize: 10,
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Score
            </span>
          </div>
        </div>

        {/* Métricas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <ScoreMetric
            label="Dívida / Rendimento"
            value={`${(debtToIncomeRatio * 100).toFixed(0)}%`}
            barValue={Math.min(100, debtToIncomeRatio * 100)}
            color={debtToIncomeRatio > 0.5 ? '#EF4444' : '#10B981'}
          />
          <ScoreMetric
            label="Dívidas em atraso"
            value={String(overdueCount)}
            color={overdueCount > 0 ? '#EF4444' : '#10B981'}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 10,
              background: `${scoreColor}10`,
              border: `1px solid ${scoreColor}22`,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Status
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>
              {scoreLabel}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .emergency-score-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
        }
      `}</style>
    </Card>
  );
}

function ScoreMetric({ label, value, barValue, color }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 10,
          marginBottom: barValue !== undefined ? 6 : 0,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
      </div>
      {barValue !== undefined && (
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: 'var(--border)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${barValue}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: color }}
          />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ALERTAS CRÍTICOS
   ============================================================ */
function CriticalAlerts({ overdueDebts, onViewDebts }) {
  if (overdueDebts.length === 0) return null;

  return (
    <Card tone="danger">
      <SectionTitle icon={AlertCircle} color="#EF4444">
        Alertas críticos
      </SectionTitle>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {overdueDebts.slice(0, 4).map((d) => {
          const days = Math.abs(getDaysUntil(d.dueDate));
          return (
            <div
              key={d._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 12,
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(239,68,68,0.2)',
                  color: '#EF4444',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.creditorName}
                </p>
                <p style={{ marginTop: 2, fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                  Vencida há {days} dia{days !== 1 ? 's' : ''}
                </p>
              </div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#EF4444',
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(d.remainingAmount || d.amount)}
              </p>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onViewDebts}
          style={{
            marginTop: 4,
            padding: '10px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            background: 'rgba(239,68,68,0.12)',
            color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.3)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minHeight: 44,
          }}
        >
          Ver todas as dívidas <ArrowRight size={14} />
        </button>
      </div>
    </Card>
  );
}

/* ============================================================
   PROGRESS TRACKER (Sobrevivência → Liberdade)
   ============================================================ */
function ProgressTracker({ progressPercent }) {
  const stages = [
    { icon: AlertTriangle, label: 'Sobrevivência', threshold: 0, color: '#EF4444' },
    { icon: Flame, label: 'Recuperação', threshold: 30, color: '#F97316' },
    { icon: Shield, label: 'Estabilidade', threshold: 70, color: '#F59E0B' },
    { icon: CheckSquare, label: 'Liberdade', threshold: 100, color: '#10B981' },
  ];

  return (
    <Card>
      <SectionTitle icon={Target} color="var(--gold)">
        Caminho para a recuperação
      </SectionTitle>

      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progresso geral</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: '#10B981',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {progressPercent.toFixed(0)}%
          </span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: 'var(--border)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #EF4444, #F97316, #F59E0B, #10B981)',
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}
      >
        {stages.map(({ icon: Icon, label, threshold, color }) => {
          const reached = progressPercent >= threshold;
          return (
            <div key={label} style={{ textAlign: 'center', minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  margin: '0 auto 6px',
                  display: 'grid',
                  placeItems: 'center',
                  background: reached ? color : 'var(--border)',
                  color: 'white',
                  transition: 'background 0.3s',
                }}
              >
                <Icon size={14} />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: reached ? color : 'var(--text-muted)',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ============================================================
   CHECKLIST DE AÇÕES
   ============================================================ */
function ActionChecklist({ checkedItems, onToggle, completedCount, totalActions, progressPercent }) {
  return (
    <Card>
      <SectionTitle
        icon={CheckSquare}
        color="#EF4444"
        action={
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: 'var(--text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {completedCount}/{totalActions}
          </span>
        }
      >
        Ações imediatas
      </SectionTitle>

      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: 'var(--border)',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.6 }}
          style={{ height: '100%', background: '#10B981' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actionChecklist.map(({ id, label, desc, icon: Icon, priority }) => {
          const checked = !!checkedItems[id];
          const p = priorityConfig[priority];

          return (
            <button
              key={id}
              type="button"
              onClick={() => onToggle(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 14,
                borderRadius: 14,
                background: checked ? 'rgba(16,185,129,0.06)' : 'var(--bg-primary)',
                border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.18s',
                minHeight: 64,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  display: 'grid',
                  placeItems: 'center',
                  background: checked ? 'rgba(16,185,129,0.16)' : `${p.color}15`,
                  color: checked ? '#10B981' : p.color,
                  flexShrink: 0,
                }}
              >
                {checked ? <CheckSquare size={18} /> : <Icon size={18} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: checked ? 'var(--text-muted)' : 'var(--text-primary)',
                    textDecoration: checked ? 'line-through' : 'none',
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {desc}
                </p>
              </div>

              <span
                style={{
                  flexShrink: 0,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '4px 8px',
                  borderRadius: 999,
                  background: `${p.color}18`,
                  color: p.color,
                }}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ============================================================
   TEMPLATES PARA CREDORES
   ============================================================ */
function CreditorTemplates({ expandedTemplate, setExpandedTemplate, copiedTemplate, onCopy }) {
  return (
    <Card>
      <SectionTitle icon={MessageCircle} color="var(--gold)">
        Templates para credores
      </SectionTitle>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
        Copia e adapta estas mensagens para contactar os teus credores.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {creditorTemplates.map((template) => {
          const Icon = template.icon;
          const isExpanded = expandedTemplate === template.id;
          const isCopied = copiedTemplate === template.id;

          return (
            <div
              key={template.id}
              style={{
                borderRadius: 14,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                style={{
                  width: '100%',
                  padding: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minHeight: 56,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(212,168,67,0.15)',
                    color: 'var(--gold)',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {template.title}
                  </p>
                  <p style={{ marginTop: 2, fontSize: 11, color: 'var(--text-muted)' }}>
                    {template.type}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                ) : (
                  <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 14px 14px' }}>
                      <pre
                        style={{
                          fontSize: 12,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          padding: 14,
                          borderRadius: 12,
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.6,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          marginBottom: 10,
                          maxHeight: 280,
                          overflowY: 'auto',
                        }}
                        className="poupt-scroll"
                      >
                        {template.content}
                      </pre>
                      <button
                        type="button"
                        onClick={() => onCopy(template.id, template.content)}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: 12,
                          fontSize: 13,
                          fontWeight: 700,
                          background: isCopied
                            ? 'rgba(16,185,129,0.15)'
                            : 'rgba(212,168,67,0.15)',
                          color: isCopied ? '#10B981' : 'var(--gold)',
                          border: `1px solid ${
                            isCopied ? 'rgba(16,185,129,0.3)' : 'rgba(212,168,67,0.3)'
                          }`,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          minHeight: 44,
                        }}
                      >
                        {isCopied ? <Check size={14} /> : <Copy size={14} />}
                        {isCopied ? 'Copiado!' : 'Copiar template'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ============================================================
   ATALHOS RÁPIDOS
   ============================================================ */
function QuickShortcuts({ setScreen, scrollToResources }) {
  const shortcuts = [
    { icon: AlertTriangle, title: 'Ver dívidas', desc: 'Prioriza o que está vencido', action: () => setScreen('debts') },
    { icon: CreditCard, title: 'Registar pagamento', desc: 'Atualiza progresso', action: () => setScreen('addTransaction') },
    { icon: FileText, title: 'Relatórios', desc: 'Analisa as tuas finanças', action: () => setScreen('reports') },
    { icon: HandHeart, title: 'Apoios', desc: 'DECO, Linha Sobreendividado', action: scrollToResources },
  ];

  return (
    <div>
      <SectionTitle icon={Target} color="#EF4444">
        Atalhos rápidos
      </SectionTitle>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10,
        }}
      >
        {shortcuts.map(({ icon: Icon, title, desc, action }) => (
          <button
            key={title}
            type="button"
            onClick={action}
            style={{
              padding: 16,
              borderRadius: 16,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10,
              textAlign: 'left',
              minHeight: 110,
              transition: 'border-color 0.18s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(239,68,68,0.15)',
                color: '#EF4444',
              }}
            >
              <Icon size={18} />
            </div>
            <div style={{ minWidth: 0, width: '100%' }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {title}
              </p>
              <p
                style={{
                  marginTop: 2,
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  lineHeight: 1.4,
                }}
              >
                {desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   ORÇAMENTO MINIMALISTA
   ============================================================ */
function MinimalistBudget({ income, modeLabel }) {
  const allocations = [
    { icon: Home, label: 'Sobrevivência', pct: 50, color: '#EF4444', desc: 'Habitação, alimentação, transporte' },
    { icon: CreditCard, label: 'Dívidas', pct: 40, color: '#F97316', desc: 'Pagamento mínimo + extra possível' },
    { icon: Banknote, label: 'Reserva', pct: 10, color: 'var(--gold)', desc: 'Emergências e imprevistos' },
  ];

  return (
    <Card>
      <SectionTitle icon={CircleDollarSign} color="#EF4444">
        Orçamento minimalista
      </SectionTitle>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
        Em modo <strong style={{ color: '#EF4444' }}>{modeLabel}</strong>, só o essencial conta.
      </p>

      {/* Rendimento total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 14,
          borderRadius: 12,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          marginBottom: 14,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            Rendimento mensal
          </p>
          <p
            style={{
              marginTop: 2,
              fontSize: 18,
              fontWeight: 800,
              color: '#10B981',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatCurrency(income)}
          </p>
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(16,185,129,0.18)',
            color: '#10B981',
          }}
        >
          <Banknote size={18} />
        </div>
      </div>

      {/* Distribuição */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {allocations.map(({ icon: Icon, label, pct, color, desc }) => (
          <div key={label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <Icon size={14} style={{ color, flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                  }}
                >
                  · {pct}%
                </span>
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color,
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(income * (pct / 100))}
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: 'var(--border)',
                overflow: 'hidden',
                marginBottom: 4,
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                style={{ height: '100%', background: color }}
              />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{desc}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 10,
          borderRadius: 10,
          textAlign: 'center',
          background: 'rgba(239,68,68,0.08)',
          border: '1px dashed rgba(239,68,68,0.28)',
        }}
      >
        <p style={{ fontSize: 11, color: '#EF4444', margin: 0, fontWeight: 600 }}>
          Lazer, restaurantes e compras não essenciais = 0%
        </p>
      </div>
    </Card>
  );
}

/* ============================================================
   RECURSOS DE EMERGÊNCIA
   ============================================================ */
function EmergencyResources({ visibleResources, showAll, setShowAll, total }) {
  return (
    <div id="resources-section">
      <SectionTitle icon={HandHeart} color="var(--gold)">
        Recursos de apoio
      </SectionTitle>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 10,
        }}
      >
        {visibleResources.map((r) => {
          const ResIcon = r.icon || Phone;
          return (
            <div
              key={r.name}
              style={{
                padding: 16,
                borderRadius: 16,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(212,168,67,0.15)',
                    color: 'var(--gold)',
                    flexShrink: 0,
                  }}
                >
                  <ResIcon size={16} />
                </div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {r.name}
                </p>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {r.desc}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginTop: 'auto',
                  paddingTop: 8,
                  borderTop: '1px solid var(--border)',
                }}
              >
                <a
                  href={`tel:${r.phone.replace(/\s/g, '')}`}
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--gold)',
                    textDecoration: 'none',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  }}
                >
                  {r.phone}
                </a>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    Website <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {total > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '10px 16px',
            fontSize: 12,
            fontWeight: 700,
            background: 'transparent',
            color: 'var(--text-secondary)',
            border: '1px dashed var(--border)',
            borderRadius: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minHeight: 44,
          }}
        >
          {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showAll ? 'Ver menos' : `Ver mais ${total - 3} recursos`}
        </button>
      )}
    </div>
  );
}

/* ============================================================
   MOTIVACIONAL
   ============================================================ */
function MotivationalQuote({ quote }) {
  return (
    <div
      style={{
        padding: 'clamp(18px, 2.5vw, 24px)',
        borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(212,168,67,0.15), rgba(212,168,67,0.05))',
        border: '1px solid rgba(212,168,67,0.32)',
        textAlign: 'center',
      }}
    >
      <BookOpen
        size={22}
        style={{ color: 'var(--gold)', margin: '0 auto 10px', display: 'block' }}
      />
      <p
        style={{
          fontSize: 13,
          fontStyle: 'italic',
          color: 'var(--text-primary)',
          margin: 0,
          lineHeight: 1.6,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {quote}
      </p>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function SurvivalMode() {
  const { user, debts, setScreen } = useStore();
  const [checkedItems, setCheckedItems] = useState({});
  const [showAllResources, setShowAllResources] = useState(false);
  const [, setDebtSummary] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(null);

  const modeLabel = modeLabels[user?.financialMode] || 'Sobrevivência';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDebtProgress();
        setDebtSummary(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  // Persistir checklist em localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('poupt_survival_checklist');
      if (saved) setCheckedItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('poupt_survival_checklist', JSON.stringify(checkedItems));
    } catch {}
  }, [checkedItems]);

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyTemplate = async (templateId, content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedTemplate(templateId);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch {
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

  const overdueDebts = useMemo(
    () =>
      (debts || []).filter((d) => {
        if (!d.dueDate || d.status === 'pago') return false;
        return getDaysUntil(d.dueDate) < 0;
      }),
    [debts]
  );

  const totalDebt = useMemo(
    () => (debts || []).reduce((sum, d) => sum + (d.remainingAmount || d.amount || 0), 0),
    [debts]
  );

  const income = user?.income || 0;
  const debtToIncomeRatio = income > 0 ? totalDebt / income : 0;

  const emergencyScore = useMemo(() => {
    let score = 100;
    if (debtToIncomeRatio > 0.5) score -= 30;
    if (debtToIncomeRatio > 0.8) score -= 20;
    if (overdueDebts.length > 0) score -= overdueDebts.length * 10;
    if ((user?.balance || 0) < 0) score -= 15;
    return Math.max(0, Math.min(100, score));
  }, [debtToIncomeRatio, overdueDebts.length, user?.balance]);

  const scoreColor =
    emergencyScore >= 70 ? '#10B981' : emergencyScore >= 40 ? '#F59E0B' : '#EF4444';
  const scoreLabel =
    emergencyScore >= 70 ? 'Estável' : emergencyScore >= 40 ? 'Atenção' : 'Crítico';

  const visibleResources = showAllResources ? resourceLinks : resourceLinks.slice(0, 3);

  const currentMotivation =
    motivationalMessages[user?.financialMode] || motivationalMessages.sobrevivencia;
  const motivationIdx = Math.floor(Date.now() / 86400000) % currentMotivation.length;

  const scrollToResources = () => {
    document
      .getElementById('resources-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Shell>
      {/* Voltar */}
      <button
        type="button"
        onClick={() => setScreen('dashboard')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          minHeight: 36,
          alignSelf: 'flex-start',
        }}
      >
        <ArrowLeft size={16} />
        Voltar ao painel
      </button>

      {/* HEADER URGENTE */}
      <EmergencyHeader modeLabel={modeLabel} />

      {/* GRID: SCORE + ALERTAS CRÍTICOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(14px, 2vw, 18px)',
        }}
        className="survival-top-grid"
      >
        <EmergencyScore
          score={emergencyScore}
          scoreColor={scoreColor}
          scoreLabel={scoreLabel}
          debtToIncomeRatio={debtToIncomeRatio}
          overdueCount={overdueDebts.length}
        />
        <CriticalAlerts overdueDebts={overdueDebts} onViewDebts={() => setScreen('debts')} />
      </div>

      {/* SALDO NEGATIVO */}
      {(user?.balance || 0) < 0 && (
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.32)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <AlertCircle size={20} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B', margin: 0 }}>
              Saldo negativo
            </p>
            <p style={{ marginTop: 2, fontSize: 12, color: 'var(--text-secondary)' }}>
              O teu saldo está negativo. Prioriza despesas essenciais.
            </p>
          </div>
        </div>
      )}

      {/* PROGRESS TRACKER */}
      <ProgressTracker progressPercent={progressPercent} />

      {/* CHECKLIST */}
      <ActionChecklist
        checkedItems={checkedItems}
        onToggle={toggleCheck}
        completedCount={completedCount}
        totalActions={totalActions}
        progressPercent={progressPercent}
      />

      {/* GRID: TEMPLATES + ORÇAMENTO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'clamp(14px, 2vw, 18px)',
        }}
        className="survival-mid-grid"
      >
        <CreditorTemplates
          expandedTemplate={expandedTemplate}
          setExpandedTemplate={setExpandedTemplate}
          copiedTemplate={copiedTemplate}
          onCopy={copyTemplate}
        />
        <MinimalistBudget income={income} modeLabel={modeLabel} />
      </div>

      {/* ATALHOS */}
      <QuickShortcuts setScreen={setScreen} scrollToResources={scrollToResources} />

      {/* RECURSOS */}
      <EmergencyResources
        visibleResources={visibleResources}
        showAll={showAllResources}
        setShowAll={setShowAllResources}
        total={resourceLinks.length}
      />

      {/* MOTIVAÇÃO */}
      <MotivationalQuote quote={currentMotivation[motivationIdx]} />

      <style>{`
        @media (min-width: 1024px) {
          .survival-top-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
          .survival-mid-grid {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </Shell>
  );
}
