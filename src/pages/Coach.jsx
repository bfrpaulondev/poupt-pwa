import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { Send, Trash2, Sparkles, Bot } from 'lucide-react';
import useThemeColors, { alpha } from '../utils/useThemeColors';

export default function Coach() {
  const { mockUser, chatMessages, addChatMessage } = useStore();
  const { colors } = useThemeColors();

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const coachName = mockUser?.coachMode === 'sargento' ? 'Sargento' : 'Amigável';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, typing]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const message = input.trim();

    addChatMessage({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    setInput('');
    setSending(true);
    setTyping(true);

    setTimeout(() => {
      const isSargento = mockUser?.coachMode === 'sargento';

      const responses = isSargento
        ? [
            'Cada euro conta. Corta o que não é essencial e foca-te no próximo pagamento.',
            'Disciplina financeira primeiro. Revê as despesas pequenas antes de pensares nas grandes.',
            'Atenção às dívidas ativas. Começa pela mais pequena e mantém consistência.',
            'Se poupares 5€ por dia, no fim do mês tens cerca de 150€ para atacar uma dívida.',
          ]
        : [
            'Vais no caminho certo. Pequenas decisões repetidas todos os dias mudam o teu mês.',
            'Já fizeste progresso. Agora mantém o foco numa meta simples e realista.',
            'Poupar não é castigo. É criar margem para viver com menos pressão.',
            'Define uma meta pequena para esta semana e acompanha todos os gastos.',
          ];

      const reply = responses[Math.floor(Math.random() * responses.length)];

      addChatMessage({
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      });

      setSending(false);
      setTyping(false);
    }, 1200);
  };

  const handleClear = () => {
    useStore.setState({ chatMessages: [] });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        width: '100%',
        background: colors.background,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          width: '100%',
          maxWidth: 361,
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            padding: '15px 15px 14px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 43,
                height: 43,
                borderRadius: 14,
                background: alpha(colors.gold, 0.12),
                border: `1px solid ${alpha(colors.gold, 0.18)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={22} color={colors.gold} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 16,
                  lineHeight: '20px',
                  fontWeight: 900,
                }}
              >
                {coachName}
              </h1>

              <p
                style={{
                  margin: '2px 0 0',
                  color: colors.gold,
                  fontSize: 12,
                  lineHeight: '15px',
                  fontWeight: 700,
                }}
              >
                O teu alter ego financeiro
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            style={{
              width: 38,
              height: 38,
              border: 'none',
              borderRadius: 12,
              background: colors.surface,
              color: colors.muted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={17} />
          </button>
        </header>

        <section
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 15px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {chatMessages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                paddingTop: 48,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 67,
                  height: 67,
                  margin: '0 auto 16px',
                  borderRadius: 20,
                  background: alpha(colors.gold, 0.1),
                  border: `1px solid ${alpha(colors.gold, 0.16)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={30} color={colors.gold} />
              </div>

              <h2
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: 21,
                  lineHeight: '26px',
                  fontWeight: 900,
                  letterSpacing: '-0.4px',
                }}
              >
                Olá, {mockUser?.name || 'amigo'}!
              </h2>

              <p
                style={{
                  maxWidth: 282,
                  margin: '9px auto 0',
                  color: colors.muted,
                  fontSize: 14,
                  lineHeight: '20px',
                  fontWeight: 500,
                }}
              >
                Eu sou o {coachName}, o teu treinador financeiro. Pergunta-me
                qualquer coisa sobre as tuas finanças.
              </p>
            </motion.div>
          )}

          {chatMessages.map((message, index) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={`${message.timestamp}-${index}`}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '84%',
                    padding: '12px 14px',
                    borderRadius: isUser
                      ? '17px 17px 5px 17px'
                      : '17px 17px 17px 5px',
                    background: isUser
                      ? `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`
                      : colors.surface,
                    border: isUser ? 'none' : `1.5px solid ${colors.border}`,
                    color: isUser ? colors.inverse : colors.text,
                    boxShadow: isUser
                      ? `0 8px 22px ${alpha(colors.gold, 0.16)}`
                      : 'none',
                  }}
                >
                  {!isUser && (
                    <p
                      style={{
                        margin: '0 0 5px',
                        color: colors.gold,
                        fontSize: 10,
                        lineHeight: '13px',
                        fontWeight: 900,
                      }}
                    >
                      {coachName}
                    </p>
                  )}

                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: '20px',
                      fontWeight: 600,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {message.content}
                  </p>
                </div>
              </div>
            );
          })}

          {typing && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div
                style={{
                  padding: '13px 15px',
                  borderRadius: '17px 17px 17px 5px',
                  background: colors.surface,
                  border: `1.5px solid ${colors.border}`,
                }}
              >
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="typing-dot" style={typingDotStyle(colors)} />
                  <span className="typing-dot" style={typingDotStyle(colors)} />
                  <span className="typing-dot" style={typingDotStyle(colors)} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        <footer
          style={{
            padding: '12px 15px 14px',
            borderTop: `1px solid ${colors.border}`,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 9,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunta ao ${coachName}...`}
              style={{
                flex: 1,
                height: 51,
                borderRadius: 15,
                border: `1.5px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                padding: '0 15px',
                fontSize: 14,
                fontWeight: 700,
                outline: 'none',
              }}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                width: 51,
                height: 51,
                borderRadius: 15,
                border: 'none',
                background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                color: colors.inverse,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !input.trim() || sending ? 'not-allowed' : 'pointer',
                opacity: !input.trim() || sending ? 0.45 : 1,
                boxShadow: `0 10px 26px ${alpha(colors.gold, 0.18)}`,
              }}
            >
              <Send size={19} strokeWidth={2.5} />
            </button>
          </div>

          <p
            style={{
              margin: '7px 0 0',
              color: colors.muted,
              fontSize: 10,
              lineHeight: '13px',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {mockUser?.plan === 'premium'
              ? 'Mensagens ilimitadas'
              : '3 mensagens/dia no plano gratuito'}
          </p>
        </footer>
      </motion.main>
    </div>
  );
}

function typingDotStyle(colors) {
  return {
    width: 8,
    height: 8,
    borderRadius: 999,
    background: colors.gold,
    display: 'block',
  };
}