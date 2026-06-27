import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { modeColors } from '../utils/helpers';
import MarkdownRenderer from '../components/MarkdownRenderer';
import {
  Send, Trash2, Sparkles, Bot, User as UserIcon, ChevronLeft,
  AlertCircle, X, Check, Copy, RefreshCw, Crown, MessageCircle,
  TrendingUp, Target, PiggyBank, Wallet, Zap, Lightbulb,
} from 'lucide-react';

/* ============================================================ */
/* Static data                                                  */
/* ============================================================ */

const SUGGESTED_PROMPTS = [
  {
    icon: PiggyBank,
    title: 'Como poupar mais?',
    prompt: 'Como posso poupar mais dinheiro todos os meses?',
    color: '#10B981',
  },
  {
    icon: Target,
    title: 'Definir metas',
    prompt: 'Ajuda-me a definir metas financeiras realistas para este ano.',
    color: '#3B82F6',
  },
  {
    icon: TrendingUp,
    title: 'Investir com pouco',
    prompt: 'Por onde devo começar a investir se tenho pouco dinheiro?',
    color: '#8B5CF6',
  },
  {
    icon: Wallet,
    title: 'Reduzir gastos',
    prompt: 'Que gastos posso cortar sem prejudicar a minha qualidade de vida?',
    color: '#F59E0B',
  },
  {
    icon: Zap,
    title: 'Eliminar dívidas',
    prompt: 'Qual é a melhor estratégia para eliminar as minhas dívidas?',
    color: '#EF4444',
  },
  {
    icon: Lightbulb,
    title: 'Dica do dia',
    prompt: 'Dá-me uma dica financeira que eu possa aplicar hoje.',
    color: '#EC4899',
  },
];

const MAX_INPUT_HEIGHT = 140;

/* ============================================================ */
/* Helpers                                                      */
/* ============================================================ */

const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string') return `rgba(212,175,55,${alpha})`;
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return `rgba(212,175,55,${alpha})`;
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return `rgba(212,175,55,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
};

const formatTime = (date) => {
  try {
    const d = new Date(date);
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const formatDayLabel = (date) => {
  try {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(d, today)) return 'Hoje';
    if (isSameDay(d, yesterday)) return 'Ontem';
    return d.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return '';
  }
};

const getDayKey = (date) => {
  try {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  } catch {
    return 'unknown';
  }
};

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function Coach() {
  const {
    user, coachMessages, setCoachMessages, addCoachMessage, setScreen,
  } = useStore();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dailyUsed, setDailyUsed] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(15);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const modeColor = modeColors?.[user?.financialMode] || '#D4AF37';
  const coachName = user?.coachName || 'Coach';
  const userName = user?.name || 'amigo';
  const isPremium = user?.plan === 'premium' || user?.plan === 'pro';

  /* ---------- Load history ---------- */
  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const token = localStorage.getItem('poupt_token');
    if (!token) {
      setLoadingHistory(false);
      return;
    }
    try {
      const res = await api.getCoachHistory();
      // Backend retorna { success, data: { messages: [...] } }
      // Cada message: { role, content, timestamp, _id }
      const messages = res?.data?.messages || res?.messages || [];
      if (Array.isArray(messages) && messages.length > 0) {
        // Garante que cada message tem timestamp (fallback para createdAt do ChatLog)
        const normalized = messages.map((m, i) => ({
          role: m.role || 'assistant',
          content: m.content || '',
          timestamp: m.timestamp || m.createdAt || new Date().toISOString(),
        }));
        setCoachMessages(normalized);
      }
    } catch (err) {
      // 429 = rate limit. Não mostrar erro para não assustar o utilizador.
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('demasiados') || msg.includes('rate') || msg.includes('429')) {
        // Tentar novamente em 30s silenciosamente
        setTimeout(() => loadHistory(), 30000);
      } else if (
        !msg.includes('401') &&
        !msg.includes('autenticado')
      ) {
        console.error('Erro ao carregar histórico:', err?.message);
      }
    } finally {
      setLoadingHistory(false);
    }
  };

  /* ---------- Scroll ---------- */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => scrollToBottom(true), 60);
    return () => clearTimeout(t);
  }, [coachMessages, typing, scrollToBottom]);

  /* ---------- Auto-resize input ---------- */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_INPUT_HEIGHT)}px`;
  }, [input]);

  /* ---------- Send ---------- */
  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || sending) return;

    setErrorMsg('');
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    addCoachMessage(userMessage);
    setInput('');
    setSending(true);
    setTyping(true);

    try {
      const res = await api.coachChat(userMessage.content);
      const assistantMessage = {
        role: 'assistant',
        content: res?.data?.reply || 'Sem resposta.',
        timestamp: new Date().toISOString(),
        blocked: res?.data?.blocked || false,
        motivo: res?.data?.motivo || null,
      };
      addCoachMessage(assistantMessage);
      // Atualiza contadores de uso diário retornados pelo backend
      if (res?.data?.dailyLimit) setDailyLimit(res.data.dailyLimit);
      if (typeof res?.data?.dailyUsed === 'number') setDailyUsed(res.data.dailyUsed);
    } catch (err) {
      const msg = err?.message || 'Erro ao comunicar com o Coach.';
      setErrorMsg(msg);
      addCoachMessage({
        role: 'assistant',
        content: `⚠️ ${msg}`,
        timestamp: new Date().toISOString(),
        isError: true,
      });
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  /* ---------- Clear ---------- */
  const handleClear = async () => {
    if (!showClearConfirm) {
      setShowClearConfirm(true);
      return;
    }
    try {
      await api.clearCoachHistory();
      setCoachMessages([]);
      setShowClearConfirm(false);
    } catch (err) {
      setErrorMsg(err?.message || 'Não foi possível limpar o histórico.');
    }
  };

  /* ---------- Copy ---------- */
  const handleCopy = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      setErrorMsg('Não foi possível copiar.');
    }
  };

  /* ---------- Key down ---------- */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------- Group messages by day ---------- */
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDay = null;
    coachMessages.forEach((msg) => {
      const key = getDayKey(msg.timestamp);
      if (key !== currentDay) {
        groups.push({ type: 'day', label: formatDayLabel(msg.timestamp), key });
        currentDay = key;
      }
      groups.push({ type: 'msg', data: msg });
    });
    return groups;
  }, [coachMessages]);

  const canSend = input.trim().length > 0 && !sending;
  const hasMessages = coachMessages.length > 0;

  /* ============================================================ */
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg, #0B0B0B)',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      {/* ============== HEADER ============== */}
      <header
        style={{
          flexShrink: 0,
          background: 'var(--card, #1a1a1a)',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
          padding: 'clamp(10px, 2.5vw, 16px) clamp(14px, 3vw, 24px)',
          paddingTop: 'max(clamp(10px, 2.5vw, 16px), env(safe-area-inset-top))',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            minWidth: 0,
          }}
        >
          {/* Back button */}
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            aria-label="Voltar"
            style={{
              width: 40, height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #9CA3AF)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Avatar + Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                position: 'relative',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44, height: 44,
                  borderRadius: 14,
                  background: `linear-gradient(135deg, ${hexToRgba(modeColor, 0.3)}, ${hexToRgba(modeColor, 0.12)})`,
                  border: `1px solid ${hexToRgba(modeColor, 0.4)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: modeColor,
                }}
              >
                <Bot size={22} />
              </div>
              {/* Online indicator */}
              <span
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid var(--card, #1a1a1a)',
                  boxShadow: '0 0 0 1px rgba(16,185,129,0.4)',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    fontWeight: 800,
                    color: 'var(--text, #fff)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {coachName}
                </p>
                {isPremium && (
                  <Crown
                    size={12}
                    color="#D4AF37"
                    style={{ flexShrink: 0 }}
                    aria-label="Premium"
                  />
                )}
              </div>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: 11,
                  color: modeColor,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#10B981',
                    flexShrink: 0,
                  }}
                />
                {typing ? 'A escrever…' : 'O teu alter ego financeiro'}
              </p>
            </div>
          </div>

          {/* Clear button */}
          {hasMessages && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={showClearConfirm ? 'Confirmar limpar histórico' : 'Limpar histórico'}
              style={{
                minWidth: 44,
                minHeight: 44,
                padding: showClearConfirm ? '0 12px' : 0,
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: showClearConfirm
                  ? 'rgba(239,68,68,0.15)'
                  : 'transparent',
                color: showClearConfirm ? '#EF4444' : 'var(--text-muted, #6B7280)',
                border: showClearConfirm
                  ? '1px solid rgba(239,68,68,0.3)'
                  : '1px solid transparent',
                cursor: 'pointer',
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Trash2 size={16} />
              {showClearConfirm && <span>Confirmar?</span>}
            </button>
          )}
          {hasMessages && showClearConfirm && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              aria-label="Cancelar"
              style={{
                minWidth: 36,
                minHeight: 44,
                borderRadius: 10,
                background: 'transparent',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                color: 'var(--text-secondary, #9CA3AF)',
                cursor: 'pointer',
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      {/* ============== ERROR BANNER ============== */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            onClick={() => setErrorMsg('')}
            style={{
              flexShrink: 0,
              overflow: 'hidden',
              borderBottom: '1px solid rgba(239,68,68,0.2)',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                maxWidth: 1100,
                margin: '0 auto',
                padding: '10px clamp(14px, 3vw, 24px)',
                background: 'rgba(239,68,68,0.1)',
                color: '#FCA5A5',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>{errorMsg}</span>
              <X size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== MESSAGES AREA ============== */}
      <main
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          minHeight: 0,
          background: 'var(--bg, #0B0B0B)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1100,
            margin: '0 auto',
            padding: 'clamp(16px, 3vw, 28px) clamp(14px, 3vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(10px, 2vw, 14px)',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          {/* ===== Loading history ===== */}
          {loadingHistory && !hasMessages ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                padding: 'clamp(60px, 12vw, 100px) 20px',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${modeColor}, ${hexToRgba(modeColor, 0.5)})`,
                }}
              />
              <p style={{ color: 'var(--text-secondary, #9CA3AF)', fontSize: 13 }}>
                A carregar conversa…
              </p>
            </div>
          ) : !hasMessages ? (
            /* ===== Empty state with suggested prompts ===== */
            <EmptyState
              coachName={coachName}
              userName={userName}
              modeColor={modeColor}
              onPromptClick={(p) => handleSend(p)}
              isPremium={isPremium}
            />
          ) : (
            /* ===== Messages list ===== */
            <>
              <AnimatePresence initial={false}>
                {groupedMessages.map((item, idx) => {
                  if (item.type === 'day') {
                    return (
                      <DayDivider key={`day-${item.key}`} label={item.label} />
                    );
                  }
                  const msg = item.data;
                  const isUser = msg.role === 'user';
                  return (
                    <MessageBubble
                      key={`msg-${idx}`}
                      msg={msg}
                      isUser={isUser}
                      coachName={coachName}
                      modeColor={modeColor}
                      onCopy={() => handleCopy(msg.content, idx)}
                      copied={copiedIdx === idx}
                    />
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && <TypingIndicator modeColor={modeColor} coachName={coachName} />}
              </AnimatePresence>
            </>
          )}

          <div ref={messagesEndRef} style={{ height: 1 }} />
        </div>
      </main>

      {/* ============== INPUT AREA ============== */}
      <footer
        style={{
          flexShrink: 0,
          background: 'var(--card, #1a1a1a)',
          borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
          padding: 'clamp(10px, 2vw, 14px) clamp(14px, 3vw, 24px)',
          paddingBottom: 'max(clamp(10px, 2vw, 14px), env(safe-area-inset-bottom))',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${input.trim() ? hexToRgba(modeColor, 0.4) : 'var(--border, rgba(255,255,255,0.1))'}`,
              borderRadius: 16,
              padding: '6px 6px 6px 14px',
              transition: 'border-color 0.2s ease',
              minWidth: 0,
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunta ao ${coachName}…`}
              rows={1}
              disabled={sending}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text, #fff)',
                fontSize: 15,
                fontFamily: 'inherit',
                resize: 'none',
                padding: '10px 0',
                lineHeight: 1.4,
                maxHeight: MAX_INPUT_HEIGHT,
                overflow: 'auto',
                minWidth: 0,
              }}
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!canSend}
              aria-label="Enviar"
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: canSend
                  ? 'linear-gradient(135deg, #D4AF37, #B8941F)'
                  : 'rgba(255,255,255,0.06)',
                color: canSend ? '#0B0B0B' : 'var(--text-muted, #6B7280)',
                border: 'none',
                cursor: canSend ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                boxShadow: canSend ? '0 4px 12px rgba(212,175,55,0.3)' : 'none',
              }}
            >
              {sending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  style={{ display: 'flex' }}
                >
                  <RefreshCw size={16} />
                </motion.div>
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          <p
            style={{
              margin: 0,
              textAlign: 'center',
              fontSize: 10,
              color: 'var(--text-muted, #6B7280)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              flexWrap: 'wrap',
            }}
          >
            {isPremium ? (
              <>
                <Crown size={10} color="#D4AF37" />
                <span>Mensagens ilimitadas</span>
              </>
            ) : (
              <>
                <MessageCircle size={10} />
                <span>{dailyUsed}/{dailyLimit} mensagens/dia (gratuito)</span>
              </>
            )}
            <span style={{ opacity: 0.5 }}>·</span>
            <span>Enter para enviar, Shift+Enter para nova linha</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ============================================================ */
/* Sub-components                                               */
/* ============================================================ */

function DayDivider({ label }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        margin: '8px 0 4px',
      }}
    >
      <span
        style={{
          flex: 1,
          height: 1,
          background: 'var(--border, rgba(255,255,255,0.08))',
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted, #6B7280)',
          padding: '4px 12px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border, rgba(255,255,255,0.06))',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1,
          height: 1,
          background: 'var(--border, rgba(255,255,255,0.08))',
        }}
      />
    </motion.div>
  );
}

function MessageBubble({ msg, isUser, coachName, modeColor, onCopy, copied }) {
  const [showActions, setShowActions] = useState(false);
  const time = formatTime(msg.timestamp);
  const isError = msg.isError;
  const isBlocked = msg.blocked === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        minWidth: 0,
        width: '100%',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUser
            ? 'rgba(212,175,55,0.18)'
            : isBlocked
              ? 'rgba(245,158,11,0.18)'
              : hexToRgba(modeColor, 0.18),
          color: isUser ? '#D4AF37' : isBlocked ? '#F59E0B' : modeColor,
          marginBottom: 2,
        }}
      >
        {isUser ? <UserIcon size={15} /> : isBlocked ? <AlertCircle size={15} /> : <Bot size={15} />}
      </div>

      {/* Bubble + meta */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          gap: 3,
          maxWidth: 'min(85%, 720px)',
          minWidth: 0,
        }}
      >
        <div
          style={{
            padding: 'clamp(10px, 2.2vw, 14px) clamp(12px, 2.5vw, 16px)',
            borderRadius: 16,
            background: isUser
              ? 'linear-gradient(135deg, #D4AF37, #B8941F)'
              : isError
                ? 'rgba(239,68,68,0.1)'
                : isBlocked
                  ? 'rgba(245,158,11,0.08)'
                  : 'var(--card, #1a1a1a)',
            border: isUser
              ? 'none'
              : isError
                ? '1px solid rgba(239,68,68,0.3)'
                : isBlocked
                  ? '1px solid rgba(245,158,11,0.3)'
                  : '1px solid var(--border, rgba(255,255,255,0.08))',
            color: isUser
              ? '#0B0B0B'
              : isError
                ? '#FCA5A5'
                : isBlocked
                  ? '#FCD34D'
                  : 'var(--text, #fff)',
            borderBottomRightRadius: isUser ? 4 : 16,
            borderBottomLeftRadius: isUser ? 16 : 4,
            minWidth: 0,
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            position: 'relative',
            boxShadow: isUser
              ? '0 4px 12px rgba(212,175,55,0.2)'
              : '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {!isUser && !isError && (
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 800,
                color: isBlocked ? '#F59E0B' : modeColor,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isBlocked && <AlertCircle size={10} />}
              {isBlocked ? 'Aviso' : coachName}
            </p>
          )}
          {/* Usar MarkdownRenderer para respostas do coach; texto simples para user */}
          {isUser ? (
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(13px, 3vw, 14px)',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {msg.content}
            </p>
          ) : (
            <div
              style={{
                fontSize: 'clamp(13px, 3vw, 14px)',
                lineHeight: 1.55,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              <MarkdownRenderer content={msg.content} isUser={isUser} />
            </div>
          )}
        </div>

        {/* Meta row: time + copy */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 4px',
            minHeight: 14,
          }}
        >
          {time && (
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-muted, #6B7280)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {time}
            </span>
          )}
          {!isUser && !isError && (
            <button
              type="button"
              onClick={onCopy}
              aria-label="Copiar mensagem"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#10B981' : 'var(--text-muted, #6B7280)',
                padding: 2,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 10,
                fontWeight: 600,
                opacity: showActions || copied ? 1 : 0.5,
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? (
                <>
                  <Check size={11} /> Copiado
                </>
              ) : (
                <>
                  <Copy size={11} /> Copiar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ modeColor, coachName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 10,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: hexToRgba(modeColor, 0.18),
          color: modeColor,
        }}
      >
        <Bot size={15} />
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 16,
          borderBottomLeftRadius: 4,
          background: 'var(--card, #1a1a1a)',
          border: '1px solid var(--border, rgba(255,255,255,0.08))',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minWidth: 0,
        }}
        aria-label={`${coachName} está a escrever`}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
            style={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: modeColor,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function EmptyState({ coachName, userName, modeColor, onPromptClick, isPremium }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(18px, 3vw, 28px)',
        padding: 'clamp(20px, 5vw, 40px) 8px',
        minWidth: 0,
      }}
    >
      {/* Avatar with halo */}
      <div
        style={{
          position: 'relative',
          width: 'clamp(72px, 18vw, 96px)',
          height: 'clamp(72px, 18vw, 96px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${hexToRgba(modeColor, 0.4)}, transparent 70%)`,
          }}
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${hexToRgba(modeColor, 0.35)}, ${hexToRgba(modeColor, 0.1)})`,
            border: `2px solid ${hexToRgba(modeColor, 0.4)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: modeColor,
          }}
        >
          <Sparkles size={32} />
        </div>
      </div>

      {/* Welcome text */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: 460,
          padding: '0 8px',
          minWidth: 0,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(20px, 5vw, 26px)',
            fontWeight: 800,
            color: 'var(--text, #fff)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            wordBreak: 'break-word',
          }}
        >
          Olá, {userName}! 👋
        </h2>
        <p
          style={{
            margin: '8px 0 0',
            fontSize: 'clamp(13px, 3vw, 15px)',
            color: 'var(--text-secondary, #9CA3AF)',
            lineHeight: 1.6,
          }}
        >
          Sou o <strong style={{ color: modeColor }}>{coachName}</strong>, o teu alter ego financeiro.
          Pergunta-me qualquer coisa sobre as tuas finanças.
        </p>
        {!isPremium && (
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 11,
              color: 'var(--text-muted, #6B7280)',
              fontWeight: 600,
            }}
          >
            Tens 3 mensagens gratuitas por dia.
          </p>
        )}
      </div>

      {/* Suggested prompts */}
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          minWidth: 0,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted, #6B7280)',
            textAlign: 'center',
          }}
        >
          Sugestões para começar
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10,
          }}
        >
          {SUGGESTED_PROMPTS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.button
                key={idx}
                type="button"
                onClick={() => onPromptClick(p.prompt)}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                style={{
                  textAlign: 'left',
                  padding: 'clamp(12px, 2.5vw, 14px)',
                  borderRadius: 12,
                  background: 'var(--card, #1a1a1a)',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  minHeight: 64,
                  minWidth: 0,
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = hexToRgba(p.color, 0.4);
                  e.currentTarget.style.background = hexToRgba(p.color, 0.06);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.08))';
                  e.currentTarget.style.background = 'var(--card, #1a1a1a)';
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: hexToRgba(p.color, 0.15),
                    color: p.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 800,
                      color: 'var(--text, #fff)',
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </p>
                  <p
                    style={{
                      margin: '3px 0 0',
                      fontSize: 11,
                      color: 'var(--text-secondary, #9CA3AF)',
                      lineHeight: 1.4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {p.prompt}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
