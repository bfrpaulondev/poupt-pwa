import React from 'react';

/**
 * Renderizador de Markdown leve (sem dependências externas)
 * Suporta: negrito, itálico, código inline, listas, citações, headings, links
 * NÃO usa dangerouslySetInnerHTML — converte para React elements seguros
 */
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
          paddingLeft: 20,
          fontSize: 'clamp(13px, 3vw, 14px)',
          lineHeight: 1.55,
        }}>
          {listItems.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`ul-${key}`} style={{
          margin: '8px 0',
          paddingLeft: 20,
          fontSize: 'clamp(13px, 3vw, 14px)',
          lineHeight: 1.55,
          listStyleType: 'disc',
        }}>
          {listItems.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
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
        margin: '8px 0',
        padding: '8px 12px',
        borderLeft: `3px solid ${isUser ? 'rgba(0,0,0,0.3)' : '#D4AF37'}`,
        background: isUser ? 'rgba(0,0,0,0.08)' : 'rgba(212,175,55,0.08)',
        borderRadius: '0 8px 8px 0',
        fontStyle: 'italic',
        fontSize: 'clamp(12px, 2.8vw, 13px)',
        lineHeight: 1.5,
      }}>
        {quoteItems.map((line, i) => <div key={i}>{line}</div>)}
      </blockquote>
    );
    quoteItems = [];
  };

  // Renderiza texto inline com negrito, itálico, código
  const renderInline = (text, keyPrefix = '') => {
    if (!text) return null;

    const parts = [];
    let remaining = text;
    let idx = 0;

    // Regex combinada para: **negrito**, *itálico*, `código`, [link](url)
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/;

    while (remaining.length > 0) {
      const match = remaining.match(regex);
      if (!match) {
        parts.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining}</span>);
        break;
      }

      const matchIdx = match.index;
      if (matchIdx > 0) {
        parts.push(<span key={`${keyPrefix}-t-${idx++}`}>{remaining.substring(0, matchIdx)}</span>);
      }

      if (match[2]) {
        // **negrito**
        parts.push(<strong key={`${keyPrefix}-b-${idx++}`} style={{ fontWeight: 800 }}>{match[2]}</strong>);
      } else if (match[3]) {
        // *itálico*
        parts.push(<em key={`${keyPrefix}-i-${idx++}`} style={{ fontStyle: 'italic' }}>{match[3]}</em>);
      } else if (match[4]) {
        // `código`
        parts.push(
          <code key={`${keyPrefix}-c-${idx++}`} style={{
            background: isUser ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: 4,
            fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
            fontSize: '0.9em',
            fontWeight: 600,
          }}>{match[4]}</code>
        );
      } else if (match[5] && match[6]) {
        // [link](url)
        parts.push(
          <a key={`${keyPrefix}-a-${idx++}`} href={match[6]} target="_blank" rel="noopener noreferrer" style={{
            color: isUser ? '#0B0B0B' : '#D4AF37',
            textDecoration: 'underline',
            fontWeight: 600,
          }}>{match[5]}</a>
        );
      }

      remaining = remaining.substring(matchIdx + match[0].length);
    }

    return <span>{parts}</span>;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Linha vazia — flush lists
    if (trimmed === '') {
      flushList(lineIdx);
      flushQuote(lineIdx);
      return;
    }

    // Headings (## e #)
    if (trimmed.startsWith('### ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h4 key={`h-${lineIdx}`} style={{
          margin: '10px 0 6px',
          fontSize: 'clamp(13px, 3vw, 14px)',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
        }}>{renderInline(trimmed.substring(4), `h-${lineIdx}`)}</h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h3 key={`h-${lineIdx}`} style={{
          margin: '12px 0 8px',
          fontSize: 'clamp(14px, 3.2vw, 16px)',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
        }}>{renderInline(trimmed.substring(3), `h-${lineIdx}`)}</h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList(lineIdx);
      flushQuote(lineIdx);
      elements.push(
        <h2 key={`h-${lineIdx}`} style={{
          margin: '14px 0 8px',
          fontSize: 'clamp(15px, 3.5vw, 17px)',
          fontWeight: 800,
          color: isUser ? '#0B0B0B' : '#D4AF37',
        }}>{renderInline(trimmed.substring(2), `h-${lineIdx}`)}</h2>
      );
      return;
    }

    // Citação >
    if (trimmed.startsWith('> ')) {
      flushList(lineIdx);
      quoteItems.push(renderInline(trimmed.substring(2), `q-${lineIdx}`));
      return;
    } else {
      flushQuote(lineIdx);
    }

    // Lista ordenada (1. 2. 3.)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (listType && listType !== 'ol') flushList(lineIdx);
      listType = 'ol';
      listItems.push(renderInline(olMatch[2], `ol-${lineIdx}`));
      return;
    }

    // Lista não ordenada (- ou *)
    const ulMatch = trimmed.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      if (listType && listType !== 'ul') flushList(lineIdx);
      listType = 'ul';
      listItems.push(renderInline(ulMatch[1], `ul-${lineIdx}`));
      return;
    }

    // Linha normal
    flushList(lineIdx);
    flushQuote(lineIdx);
    elements.push(
      <p key={`p-${lineIdx}`} style={{
        margin: '6px 0',
        fontSize: 'clamp(13px, 3vw, 14px)',
        lineHeight: 1.55,
      }}>{renderInline(trimmed, `p-${lineIdx}`)}</p>
    );
  });

  // Flush final
  flushList('final');
  flushQuote('final');

  return <div>{elements}</div>;
};

export default MarkdownRenderer;
