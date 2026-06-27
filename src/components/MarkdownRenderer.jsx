import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Configurar Mermaid uma vez
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#D4AF37',
    primaryTextColor: '#fff',
    primaryBorderColor: '#B8941F',
    lineColor: '#9CA3AF',
    secondaryColor: '#1a1a1a',
    tertiaryColor: '#0B0B0B',
    fontFamily: 'Inter, sans-serif',
  },
  flowchart: {
    curve: 'basis',
    padding: 20,
  },
});

let mermaidIdCounter = 0;

/**
 * MarkdownRenderer ROBUSTO - converte markdown para React elements.
 * Garantia: NUNCA mostra asteriscos ou caracteres markdown no ecrã.
 *
 * Suporta:
 * - **negrito**, *itálico*, ***negrito itálico***
 * - `código inline`
 * - # ## ### headings
 * - - * + listas não ordenadas
 * - 1. 2. 3. listas ordenadas
 * - > citações
 * - [texto](url) links
 * - --- separador
 * - € símbolos e valores monetários realçados
 */

// Parser inline: converte uma linha de texto em array de React nodes
const parseInline = (text, keyPrefix = '') => {
  if (!text) return [];

  const nodes = [];
  let remaining = text;
  let idx = 0;

  // Padrões para detectar (em ordem de prioridade)
  const patterns = [
    { regex: /^\*\*\*([^*]+)\*\*\*/, type: 'bold-italic' },
    { regex: /^\*\*([^*]+)\*\*/, type: 'bold' },
    { regex: /^\*([^*]+)\*/, type: 'italic' },
    { regex: /^`([^`]+)`/, type: 'code' },
    { regex: /^\[([^\]]+)\]\(([^)]+)\)/, type: 'link' },
    { regex: /^(\*\*|`)/, type: 'literal' }, // asterisco/crase solto
  ];

  while (remaining.length > 0) {
    let matched = false;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (match) {
        if (pattern.type === 'bold-italic') {
          nodes.push(
            <strong key={`${keyPrefix}-bi-${idx++}`} style={{ fontWeight: 800, fontStyle: 'italic' }}>
              {match[1]}
            </strong>
          );
        } else if (pattern.type === 'bold') {
          nodes.push(
            <strong key={`${keyPrefix}-b-${idx++}`} style={{ fontWeight: 700 }}>
              {match[1]}
            </strong>
          );
        } else if (pattern.type === 'italic') {
          nodes.push(
            <em key={`${keyPrefix}-i-${idx++}`} style={{ fontStyle: 'italic' }}>
              {match[1]}
            </em>
          );
        } else if (pattern.type === 'code') {
          // Detectar se é valor monetário (contém EUR ou € ou número)
          const isCurrency = /EUR|€|\d/.test(match[1]);
          nodes.push(
            <code
              key={`${keyPrefix}-c-${idx++}`}
              style={{
                background: isCurrency ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.08)',
                color: isCurrency ? '#10B981' : 'inherit',
                padding: '2px 8px',
                borderRadius: 6,
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontSize: '0.92em',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {match[1]}
            </code>
          );
        } else if (pattern.type === 'link') {
          nodes.push(
            <a
              key={`${keyPrefix}-a-${idx++}`}
              href={match[2]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#D4AF37',
                textDecoration: 'underline',
                fontWeight: 600,
              }}
            >
              {match[1]}
            </a>
          );
        } else if (pattern.type === 'literal') {
          // Asterisco/crase solto - mostrar literalmente
          nodes.push(<span key={`${keyPrefix}-l-${idx++}`}>{match[1]}</span>);
        }
        remaining = remaining.substring(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Pegar próximo caractere e procurar próximo padrão especial
      const nextSpecial = remaining.search(/[\*\[`]/);
      if (nextSpecial === -1) {
        nodes.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining}</span>);
        break;
      } else if (nextSpecial > 0) {
        nodes.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining.substring(0, nextSpecial)}</span>);
        remaining = remaining.substring(nextSpecial);
      } else {
        // nextSpecial === 0, mas nenhum padrão match - pegar 1 char
        nodes.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining[0]}</span>);
        remaining = remaining.substring(1);
      }
    }
  }

  return nodes;
};

// Componente principal
const MarkdownRenderer = ({ content, isUser = false }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null; // 'ul' ou 'ol'
  let quoteItems = [];

  const flushList = (key) => {
    if (listItems.length === 0) return;
    if (listType === 'ol') {
      elements.push(
        <ol key={`ol-${key}`} style={{
          margin: '8px 0',
          paddingLeft: 0,
          listStyle: 'none',
          counterReset: 'item',
        }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              marginBottom: 8,
              paddingLeft: 28,
              position: 'relative',
              lineHeight: 1.55,
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: 22,
                height: 22,
                borderRadius: 6,
                background: isUser ? 'rgba(0,0,0,0.15)' : 'rgba(212,175,55,0.18)',
                color: isUser ? '#0B0B0B' : '#D4AF37',
                fontSize: 11,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>{i + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${key}`} style={{
          margin: '8px 0',
          paddingLeft: 0,
          listStyle: 'none',
        }}>
          {listItems.map((item, i) => (
            <li key={i} style={{
              marginBottom: 8,
              paddingLeft: 22,
              position: 'relative',
              lineHeight: 1.55,
            }}>
              <span style={{
                position: 'absolute',
                left: 4,
                top: 8,
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isUser ? '#0B0B0B' : '#D4AF37',
              }} />
              {item}
            </li>
          ))}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  const flushQuote = (key) => {
    if (quoteItems.length === 0) return;
    elements.push(
      <blockquote key={`bq-${key}`} style={{
        margin: '10px 0',
        padding: '10px 14px',
        borderLeft: `3px solid ${isUser ? 'rgba(0,0,0,0.3)' : '#D4AF37'}`,
        background: isUser ? 'rgba(0,0,0,0.08)' : 'rgba(212,175,55,0.08)',
        borderRadius: '0 10px 10px 0',
        fontStyle: 'italic',
        fontSize: '0.95em',
        lineHeight: 1.5,
      }}>
        {quoteItems.map((line, i) => <div key={i} style={{ marginBottom: 4 }}>{line}</div>)}
      </blockquote>
    );
    quoteItems = [];
  };

  // Primeiro, extrair blocos de código (```...```) antes de processar linhas
  const codeBlocks = [];
  const processedLines = [];
  let inCodeBlock = false;
  let currentCodeBlock = [];
  let currentLang = '';

  lines.forEach((line) => {
    const codeBlockStart = line.match(/^```(\w*)$/);
    if (codeBlockStart && !inCodeBlock) {
      inCodeBlock = true;
      currentLang = codeBlockStart[1] || '';
      currentCodeBlock = [];
      return;
    }
    if (line.trim() === '```' && inCodeBlock) {
      inCodeBlock = false;
      codeBlocks.push({ lang: currentLang, content: currentCodeBlock.join('\n') });
      processedLines.push(`__CODE_BLOCK_${codeBlocks.length - 1}__`);
      return;
    }
    if (inCodeBlock) {
      currentCodeBlock.push(line);
    } else {
      processedLines.push(line);
    }
  });

  processedLines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Linha vazia
    if (trimmed === '') {
      flushList(lineIdx);
      flushQuote(lineIdx);
      return;
    }

    // Bloco de código (placeholder)
    const codeBlockMatch = trimmed.match(/^__CODE_BLOCK_(\d+)__$/);
    if (codeBlockMatch) {
      const blockIdx = parseInt(codeBlockMatch[1]);
      const block = codeBlocks[blockIdx];
      if (block) {
        flushList(lineIdx);
        flushQuote(lineIdx);
        if (block.lang === 'mermaid') {
          elements.push(
            <MermaidBlock key={`mermaid-${lineIdx}`} code={block.content} />
          );
        } else {
          // Bloco de código normal
          elements.push(
            <pre key={`code-${lineIdx}`} style={{
              margin: '10px 0',
              padding: '12px 14px',
              background: isUser ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.3)',
              borderRadius: 10,
              overflowX: 'auto',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <code style={{
                fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                fontSize: '0.88em',
                color: isUser ? '#0B0B0B' : '#10B981',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>{block.content}</code>
            </pre>
          );
        }
      }
      return;
    }

    // Separador ---
    if (trimmed === '---' || trimmed === '***') {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <hr key={`hr-${lineIdx}`} style={{
          border: 'none',
          borderTop: `1px solid ${isUser ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)'}`,
          margin: '12px 0',
        }} />
      );
      return;
    }

    // IMAGEM markdown: ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      const alt = imgMatch[1] || 'imagem';
      const url = imgMatch[2];
      elements.push(
        <div key={`img-${lineIdx}`} style={{
          margin: '12px 0',
          borderRadius: 12,
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <img
            src={url}
            alt={alt}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 12,
            }}
            loading="lazy"
          />
          {alt && alt !== 'imagem' && alt !== 'grafico' && alt !== 'fluxograma' && (
            <p style={{
              margin: 0,
              padding: '6px 12px',
              fontSize: 11,
              color: 'var(--text-muted, #6B7280)',
              textAlign: 'center',
              fontWeight: 600,
            }}>{alt}</p>
          )}
        </div>
      );
      return;
    }

    // Headings
    if (trimmed.startsWith('#### ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h4 key={`h-${lineIdx}`} style={{
          margin: '12px 0 6px',
          fontSize: '0.95em',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
        }}>{parseInline(trimmed.substring(5), `h-${lineIdx}`)}</h4>
      );
      return;
    }
    if (trimmed.startsWith('### ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h3 key={`h-${lineIdx}`} style={{
          margin: '14px 0 8px',
          fontSize: '1.05em',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
          letterSpacing: '-0.01em',
        }}>{parseInline(trimmed.substring(4), `h-${lineIdx}`)}</h3>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h2 key={`h-${lineIdx}`} style={{
          margin: '16px 0 10px',
          fontSize: '1.15em',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
          letterSpacing: '-0.015em',
        }}>{parseInline(trimmed.substring(3), `h-${lineIdx}`)}</h2>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h1 key={`h-${lineIdx}`} style={{
          margin: '18px 0 12px',
          fontSize: '1.3em',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
          letterSpacing: '-0.02em',
        }}>{parseInline(trimmed.substring(2), `h-${lineIdx}`)}</h1>
      );
      return;
    }

    // Citação
    if (trimmed.startsWith('> ')) {
      flushList(lineIdx);
      quoteItems.push(parseInline(trimmed.substring(2), `q-${lineIdx}`));
      return;
    } else {
      flushQuote(lineIdx);
    }

    // Lista ordenada
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (listType && listType !== 'ol') flushList(lineIdx);
      listType = 'ol';
      listItems.push(parseInline(olMatch[2], `ol-${lineIdx}`));
      return;
    }

    // Lista não ordenada
    const ulMatch = trimmed.match(/^[-*+]\s+(.*)/);
    if (ulMatch) {
      if (listType && listType !== 'ul') flushList(lineIdx);
      listType = 'ul';
      listItems.push(parseInline(ulMatch[1], `ul-${lineIdx}`));
      return;
    }

    // Linha normal
    flushList(lineIdx);
    flushQuote(lineIdx);
    elements.push(
      <p key={`p-${lineIdx}`} style={{
        margin: '6px 0',
        lineHeight: 1.6,
      }}>{parseInline(trimmed, `p-${lineIdx}`)}</p>
    );
  });

  flushList('final');
  flushQuote('final');

  return <div>{elements}</div>;
};

// Componente para renderizar Mermaid
function MermaidBlock({ code }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const idRef = useRef(`mermaid-${++mermaidIdCounter}`);

  useEffect(() => {
    const renderMermaid = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(idRef.current, code);
        setSvg(renderedSvg);
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Erro ao renderizar fluxograma');
      }
    };
    renderMermaid();
  }, [code]);

  if (error) {
    return (
      <div style={{
        margin: '12px 0',
        padding: '14px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: 10,
        color: '#FCA5A5',
        fontSize: 12,
      }}>
        ⚠️ Erro ao renderizar fluxograma. Código:
        <pre style={{ marginTop: 8, fontSize: 11, color: '#9CA3AF' }}>{code}</pre>
      </div>
    );
  }

  return (
    <div style={{
      margin: '12px 0',
      padding: '16px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      overflowX: 'auto',
      textAlign: 'center',
    }}>
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div style={{ color: '#9CA3AF', fontSize: 12 }}>A renderizar fluxograma...</div>
      )}
    </div>
  );
}

export default MarkdownRenderer;
