import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import {
  ArrowLeft, FileText, ChevronRight, Copy, Check, Sparkles, Mail, X,
} from 'lucide-react';

const TEMPLATES_INFO = {
  reestruturacao: {
    icon: '🔄',
    color: '#3B82F6',
    shortDesc: 'Reduzir prestação mensal',
  },
  acordo_pagamento: {
    icon: '📅',
    color: '#10B981',
    shortDesc: 'Pagamento parcelado',
  },
  reducao_juros: {
    icon: '📉',
    color: '#F59E0B',
    shortDesc: 'Pedir redução de juro',
  },
  dificuldade_financeira: {
    icon: '🆘',
    color: '#EF4444',
    shortDesc: 'Moratória temporária',
  },
};

export default function DebtTemplates() {
  const { setScreen, user } = useStore();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [generatedLetter, setGeneratedLetter] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await api.getDebtTemplates();
      const list = res?.data?.templates || res?.templates || [];
      setTemplates(list);
    } catch (err) {
      setError(err?.message || 'Erro ao carregar templates.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (id) => {
    setError('');
    setGeneratedLetter(null);
    setFormData({});
    try {
      const res = await api.getDebtTemplate(id);
      const template = res?.data?.template || res?.template;
      if (template) {
        // Pré-preencher campos conhecidos do user
        const initial = {};
        template.fields.forEach((f) => {
          if (f.key === 'userName') initial[f.key] = user?.name || '';
          else if (f.key === 'userEmail') initial[f.key] = user?.email || '';
          else initial[f.key] = '';
        });
        setFormData(initial);
        setSelectedTemplate(template);
      }
    } catch (err) {
      setError(err?.message || 'Erro ao carregar template.');
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    try {
      const res = await api.generateDebtLetter(selectedTemplate.id, formData);
      const letter = res?.data?.letter || res?.letter;
      if (letter) {
        setGeneratedLetter(letter);
      } else {
        setError('Resposta inválida do servidor.');
      }
    } catch (err) {
      setError(err?.message || 'Erro ao gerar carta.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) return;
    const text = `Assunto: ${generatedLetter.subject}\n\n${generatedLetter.body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Não foi possível copiar.');
    }
  };

  const handleBack = () => {
    if (generatedLetter) {
      setGeneratedLetter(null);
    } else if (selectedTemplate) {
      setSelectedTemplate(null);
    } else {
      setScreen('debts');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        A carregar templates...
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 900,
      margin: '0 auto',
      padding: 'clamp(16px, 3vw, 28px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(14px, 2.5vw, 20px)',
      minWidth: 0,
    }}>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #D4AF37 0%, #B8941F 100%)',
          borderRadius: 20,
          padding: 'clamp(20px, 4vw, 28px)',
          color: '#0B0B0B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <button
            type="button"
            onClick={handleBack}
            aria-label="Voltar"
            style={{
              background: 'rgba(0,0,0,0.15)',
              border: 'none',
              borderRadius: 10,
              minWidth: 36,
              minHeight: 36,
              cursor: 'pointer',
              color: '#0B0B0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 800 }}>
              📜 Renegociar Dívidas
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85, fontWeight: 600 }}>
              Templates profissionais para contactar credores
            </p>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12, opacity: 0.9, fontWeight: 500, lineHeight: 1.5 }}>
          Escolhe um template, preenche os teus dados e gera uma carta formal para enviar ao credor.
          Podes copiar e colar no email ou imprimir e enviar por correio.
        </p>
      </motion.div>

      {/* ERROR */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              padding: '12px 14px',
              color: '#FCA5A5',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <X size={14} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', color: '#FCA5A5', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LISTA DE TEMPLATES */}
      {!selectedTemplate && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {templates.map((t, idx) => {
            const info = TEMPLATES_INFO[t.id] || { icon: '📄', color: '#64748B', shortDesc: t.description };
            return (
              <motion.button
                key={t.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelectTemplate(t.id)}
                style={{
                  background: 'var(--card, #1a1a1a)',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  borderRadius: 16,
                  padding: 'clamp(16px, 3vw, 20px)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  textAlign: 'left',
                  minWidth: 0,
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = info.color + '60';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border, rgba(255,255,255,0.08))';
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: info.color + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  {info.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'clamp(15px, 3vw, 17px)',
                    fontWeight: 800,
                    color: 'var(--text, #fff)',
                    marginBottom: 4,
                  }}>
                    {t.name}
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-secondary, #9CA3AF)',
                    lineHeight: 1.4,
                  }}>
                    {info.shortDesc} · {t.fieldsCount} campos para preencher
                  </div>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--text-muted, #6B7280)', flexShrink: 0 }} />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* FORMULÁRIO DO TEMPLATE */}
      {selectedTemplate && !generatedLetter && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card, #1a1a1a)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 16,
            padding: 'clamp(16px, 3vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minWidth: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text, #fff)' }}>
              {selectedTemplate.name}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>
              {selectedTemplate.description}
            </p>
          </div>

          {selectedTemplate.fields.map((field) => (
            <label
              key={field.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                minWidth: 0,
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--text-secondary, #9CA3AF)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                {field.label}
                {field.required && <span style={{ color: '#EF4444' }}>*</span>}
              </span>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  rows={3}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border, rgba(255,255,255,0.08))',
                    borderRadius: 10,
                    padding: '12px 14px',
                    color: 'var(--text, #fff)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    minWidth: 0,
                    resize: 'vertical',
                  }}
                />
              ) : (
                <input
                  type={field.key.includes('amount') || field.key.includes('Payment') ||
                        field.key.includes('Income') || field.key.includes('Expenses') ||
                        field.key.includes('Debts') || field.key.includes('Rate') ||
                        field.key.includes('Months') ? 'number' : 'text'}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border, rgba(255,255,255,0.08))',
                    borderRadius: 10,
                    padding: '12px 14px',
                    color: 'var(--text, #fff)',
                    fontSize: 14,
                    minWidth: 0,
                  }}
                />
              )}
            </label>
          ))}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            style={{
              marginTop: 8,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: generating
                ? 'rgba(212,175,55,0.5)'
                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
              color: '#0B0B0B',
              fontWeight: 800,
              fontSize: 15,
              cursor: generating ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={16} />
            {generating ? 'A gerar carta...' : 'Gerar carta'}
          </button>
        </motion.div>
      )}

      {/* CARTA GERADA */}
      {generatedLetter && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'var(--card, #1a1a1a)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 16,
            padding: 'clamp(16px, 3vw, 24px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={20} style={{ color: '#D4AF37', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text, #fff)' }}>
                Carta gerada
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-secondary, #9CA3AF)' }}>
                {generatedLetter.name}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: 'none',
                background: copied ? '#10B981' : 'rgba(212,175,55,0.15)',
                color: copied ? '#fff' : '#D4AF37',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 12,
            color: 'var(--text-secondary, #9CA3AF)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <Mail size={14} style={{ flexShrink: 0 }} />
            <strong>Assunto:</strong>
            <span style={{ flex: 1, color: 'var(--text, #fff)', fontWeight: 600 }}>
              {generatedLetter.subject}
            </span>
          </div>

          <pre style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border, rgba(255,255,255,0.08))',
            borderRadius: 10,
            padding: '16px 18px',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text, #fff)',
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            margin: 0,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}>
{generatedLetter.body}
          </pre>

          <div style={{
            fontSize: 11,
            color: 'var(--text-muted, #6B7280)',
            textAlign: 'center',
            paddingTop: 4,
          }}>
            💡 Dica: Adapta a carta à tua situação específica antes de enviar.
            Envia por email registado ou correio com aviso de receção.
          </div>
        </motion.div>
      )}
    </div>
  );
}
