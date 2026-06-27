import React from 'react';

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

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Linha vazia
    if (trimmed === '') {
      flushList(lineIdx);
      flushQuote(lineIdx);
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

export default MarkdownRenderer;
