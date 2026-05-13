import { useState, useRef } from 'react';
import useStore from '../store/useStore';
import { Send, Trash2, Sparkles, Bot } from 'lucide-react';

export default function Coach() {
  const { user, chatMessages, addChatMessage, getModeColor } = useStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date() };
    addChatMessage(userMessage);
    setInput('');
    setSending(true);
    setTyping(true);

    // Simulate AI coach response (mock)
    setTimeout(() => {
      const modeColor = getModeColor();
      const isSargento = user?.coachMode === 'sargento' || user?.coachName === 'Sargento';
      const responses = isSargento
        ? [
            'Soldado! Cada euro conta na guerra contra as dividas. Corta o desnecessario e foca!',
            'A disciplina financeira nao e opcional, e obrigacao! Mais esforco!',
            'Verifica as tuas dividas - a WiZink precisa de atencao imediata!',
            'Se poupares 5 EUR por dia, sao 150 EUR por mes. Isso paga uma divida!',
          ]
        : [
            'Vais conseguir! Cada passo conta, mesmo os pequenos.',
            'Ja fizeste progresso incrivel! Continua assim!',
            'Lembra-te: poupar nao e privacao, e investimento no teu futuro.',
            'Que tal definires uma meta pequena para esta semana? Vais sentir-te otimo ao cumpri-la!',
          ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage({
        role: 'assistant',
        content: reply,
        timestamp: new Date()
      });
      setSending(false);
      setTyping(false);
      setTimeout(scrollToBottom, 100);
    }, 1500);
  };

  const handleClear = () => {
    // Clear chat messages locally
    useStore.setState({ chatMessages: [] });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modeColor = getModeColor();
  const coachName = user?.coachName || 'Ricardo';

  return (
    <div className="flex flex-col" style={{ minHeight: '100%' }}>
      {/* Coach Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: `${modeColor}20` }}>
            <Bot size={20} style={{ color: modeColor }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {coachName}
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
      <div className="flex-1 overflow-y-auto poupt-scroll px-4 py-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center"
              style={{ background: `${modeColor}20` }}>
              <Sparkles size={28} style={{ color: modeColor }} />
            </div>
            <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Ola, {user?.name || 'amigo'}!
            </h3>
            <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Eu sou o {coachName}, o teu alter ego financeiro.
              Pergunta-me qualquer coisa sobre as tuas financas.
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${
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
                  {coachName}
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
      <div className="px-4 py-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Pergunta ao ${coachName}...`}
            className="flex-1 input-field" />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="w-12 h-12 rounded-xl flex items-center justify-center gold-gradient disabled:opacity-40">
            <Send size={18} color="#000" />
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
          {user?.plan === 'premium' ? 'Mensagens ilimitadas' : '3 mensagens/dia (gratuito)'}
        </p>
      </div>
    </div>
  );
}
