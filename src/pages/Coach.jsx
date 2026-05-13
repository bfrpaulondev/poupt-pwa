import { useState, useEffect, useRef } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { modeColors } from '../utils/helpers';
import { Send, Trash2, Sparkles, Bot, User as UserIcon } from 'lucide-react';

export default function Coach() {
  const { user, coachMessages, setCoachMessages, addCoachMessage } = useStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [coachMessages, typing]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    const token = localStorage.getItem('poupt_token');
    if (!token) {
      // Not authenticated yet, show welcome without error
      return;
    }
    try {
      const res = await api.getCoachHistory();
      if (res.data?.messages?.length) {
        setCoachMessages(res.data.messages);
      }
    } catch (err) {
      // Only log if it's not an auth error (first session may not have history)
      if (!err.message?.includes('401') && !err.message?.includes('autenticado')) {
        console.error(err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    addCoachMessage(userMessage);
    setInput('');
    setSending(true);
    setTyping(true);

    try {
      const res = await api.coachChat(userMessage.content);
      const assistantMessage = {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date()
      };
      addCoachMessage(assistantMessage);
    } catch (err) {
      addCoachMessage({
        role: 'assistant',
        content: err.message || 'Erro ao comunicar com o Coach.',
        timestamp: new Date()
      });
    } finally {
      setSending(false);
      setTyping(false);
    }
  };

  const handleClear = async () => {
    try {
      await api.clearCoachHistory();
      setCoachMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modeColor = modeColors[user?.financialMode] || modeColors.sobrevivencia;

  return (
    <div className="flex flex-col h-full">
      {/* Coach Header */}
      <div className="px-5 sm:px-8 py-3 sm:py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `${modeColor}20` }}>
            <Bot size={20} style={{ color: modeColor }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {user?.coachName || 'Coach'}
            </p>
            <p className="text-xs" style={{ color: modeColor }}>
              O teu alter ego financeiro
            </p>
          </div>
        </div>
        <button onClick={handleClear} className="p-2 rounded-lg hover:bg-white/10">
          <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-4 sm:py-6 space-y-4">
        {coachMessages.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center"
              style={{ background: `${modeColor}20` }}>
              <Sparkles size={28} style={{ color: modeColor }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ola, {user?.name || 'amigo'}!
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Eu sou o {user?.coachName || 'Coach'}, o teu alter ego financeiro.
              Pergunta-me qualquer coisa sobre as tuas financas.
            </p>
          </div>
        )}

        {coachMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl ${
              msg.role === 'user'
                ? 'rounded-br-md'
                : 'rounded-bl-md'
            }`}
              style={{
                background: msg.role === 'user' ? 'var(--gold)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none'
              }}>
              {msg.role === 'assistant' && (
                <p className="text-[10px] font-semibold mb-1" style={{ color: modeColor }}>
                  {user?.coachName}
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--gold)' }} />
                <div className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--gold)' }} />
                <div className="w-2 h-2 rounded-full typing-dot" style={{ background: 'var(--gold)' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-5 sm:px-8 py-3 sm:py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pergunta ao ${user?.coachName || 'Coach'}...`}
            className="flex-1 input-field" />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center gold-gradient disabled:opacity-40">
            <Send size={18} color="#000" />
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
          {user?.plan === 'premium' ? 'Mensagens ilimitadas' : `3 mensagens/dia (gratuito)`}
        </p>
      </div>
    </div>
  );
}
