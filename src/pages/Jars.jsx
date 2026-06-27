import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, jarLabels, jarColors } from '../utils/helpers';
import JarDonut from '../components/JarDonut';
import {
  Save, RotateCcw, Check, AlertCircle, BookOpen, Sparkles,
} from 'lucide-react';

/* ============================================================ */
/* Constants                                                    */
/* ============================================================ */

const JAR_ORDER = ['necessities', 'freedom', 'savings', 'education', 'play', 'give'];

// Emojis fixos — sempre funcionam, sem depender de jarIcons
const JAR_EMOJI = {
  necessities: '🏠',
  freedom:     '🚀',
  savings:     '🐷',
  education:   '📚',
  play:        '🎉',
  give:        '❤️',
};

const JAR_HINTS = {
  necessities: 'Habitação, comida, transportes',
  freedom:     'Investimentos para o futuro',
  savings:     'Compras de médio prazo',
  education:   'Livros, cursos, formação',
  play:        'Lazer e diversão',
  give:        'Doações e oferendas',
};

const RECOMMENDED = {
  necessities: 55, freedom: 10, savings: 10,
  education: 10,  play: 10,    give: 5,
};

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

/* ============================================================ */
/* Layout primitives                                            */
/* ============================================================ */

const Shell = ({ children }) => (
  <div
    style={{
      width: '100%',
      maxWidth: 1100,
      margin: '0 auto',
      padding: 'clamp(16px, 3vw, 28px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(14px, 2.5vw, 20px)',
      minWidth: 0,
      boxSizing: 'border-box',
    }}
  >
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: 'var(--card, #1a1a1a)',
      border: '1px solid var(--border, rgba(255,255,255,0.08))',
      borderRadius: 16,
      minWidth: 0,
      boxSizing: 'border-box',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ============================================================ */
/* Main                                                         */
/* ============================================================ */

export default function Jars() {
  const { user, updateUser, defaultJarPercentages } = useStore();
  const defaultJars = defaultJarPercentages || RECOMMENDED;

  const [percentages, setPercentages] = useState(user?.jarPercentages || defaultJars);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [jarBalances, setJarBalances] = useState(null);
  const [loadingBalances, setLoadingBalances] = useState(true);

  /* ---------- Fetch real jar balances from backend ---------- */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.getJars();
        if (alive && res?.data?.frascos) {
          // Converte array de frascos para objeto { necessities: 425, freedom: 250, ... }
          const balances = {};
          res.data.frascos.forEach((f) => {
            balances[f.key] = f.saldo || 0;
          });
          setJarBalances(balances);
        }
      } catch (err) {
        // Falha silenciosa — a UI funciona sem saldos
        if (alive) console.error('Erro ao carregar saldos dos frascos:', err?.message);
      } finally {
        if (alive) setLoadingBalances(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* ---------- Derived ---------- */
  const total = useMemo(
    () => Object.values(percentages).reduce((s, v) => s + Number(v || 0), 0),
    [percentages]
  );
  const isValid = total === 100;
  const income = user?.income || 0;
  const diff = total - 100;
  const totalColor = isValid ? '#10B981' : Math.abs(diff) <= 5 ? '#F59E0B' : '#EF4444';

  /* ---------- Handlers ---------- */
  const handleChange = (key, value) => {
    const num = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    setPercentages((p) => ({ ...p, [key]: num }));
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true); setError('');
    try {
      await api.updateMe({ jarPercentages: percentages });
      updateUser({ jarPercentages: percentages });
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      // Recarrega saldos após salvar
      try {
        const res = await api.getJars();
        if (res?.data?.frascos) {
          const balances = {};
          res.data.frascos.forEach((f) => { balances[f.key] = f.saldo || 0; });
          setJarBalances(balances);
        }
      } catch {}
    } catch (err) {
      setError(err?.message || 'Não foi possível guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPercentages(defaultJars);
    setSaved(false); setError('');
  };

  const handleAutoBalance = () => {
    if (total === 0) {
      setPercentages(RECOMMENDED);
      setSaved(false);
      return;
    }
    const factor = 100 / total;
    const next = {};
    let acc = 0;
    JAR_ORDER.forEach((k, i) => {
      if (i === JAR_ORDER.length - 1) {
        next[k] = Math.max(0, 100 - acc);
      } else {
        next[k] = Math.round((percentages[k] || 0) * factor);
        acc += next[k];
      }
    });
    setPercentages(next);
    setSaved(false);
  };

  /* ============================================================ */
  return (
    <Shell>
      {/* ============== HEADER ============== */}
      <Card style={{ padding: 'clamp(16px, 3vw, 22px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flexWrap: 'wrap',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: 'rgba(212,175,55,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: 26,
              lineHeight: 1,
            }}
          >
            🫙
          </div>

          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(18px, 4vw, 22px)',
                fontWeight: 800,
                color: 'var(--text, #fff)',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              6 Frascos
            </h1>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                color: 'var(--text-secondary, #9CA3AF)',
                lineHeight: 1.4,
              }}
            >
              Rendimento mensal:{' '}
              <strong style={{ color: 'var(--text, #fff)' }}>
                {formatCurrency(income)}
              </strong>
            </p>
          </div>

          {/* Total badge */}
          <motion.div
            key={total}
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 16px',
              borderRadius: 999,
              background: hexToRgba(totalColor, 0.15),
              border: `1.5px solid ${hexToRgba(totalColor, 0.45)}`,
              color: totalColor,
              fontWeight: 800,
              fontSize: 15,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {isValid ? <Check size={15} /> : <AlertCircle size={15} />}
            {total}%
          </motion.div>
        </div>
      </Card>

      {/* ============== DONUT CARD ============== */}
<Card style={{ padding: 'clamp(24px, 5vw, 36px) clamp(16px, 4vw, 28px)' }}>
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0, // controlado por margens internas
    }}
  >
    {/* Donut wrapper — clip rígido para esconder texto interno */}
    <div
      style={{
        width: 240,
        height: 240,
        maxWidth: '70vw',
        maxHeight: '70vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',     // 🔑 corta qualquer texto que saia do donut
        borderRadius: '50%',    // 🔑 mantém clip circular
        marginBottom: 28,       // espaço seguro abaixo
      }}
    >
      <JarDonut percentages={percentages} size={220} />
    </div>

    {/* Status texts — bloco totalmente separado */}
    <div
      style={{
        textAlign: 'center',
        maxWidth: 380,
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 800,
          color: totalColor,
          lineHeight: 1.2,
        }}
      >
        {isValid
          ? '✓ Distribuição perfeita'
          : diff > 0
            ? `Excesso de ${diff}%`
            : `Faltam ${Math.abs(diff)}% para 100%`}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: 'var(--text-secondary, #9CA3AF)',
          lineHeight: 1.4,
        }}
      >
        {isValid
          ? 'Podes guardar as alterações.'
          : 'Ajusta as percentagens ou usa o auto-balancear.'}
      </p>

      {!isValid && (
        <button
          type="button"
          onClick={handleAutoBalance}
          style={{
            marginTop: 10,
            alignSelf: 'center',
            background: 'rgba(212,175,55,0.18)',
            color: '#D4AF37',
            border: '1px solid rgba(212,175,55,0.4)',
            padding: '10px 18px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            minHeight: 40,
          }}
        >
          <Sparkles size={14} /> Auto-balancear
        </button>
      )}
    </div>
  </div>
</Card>

      {/* ============== SECTION TITLE ============== */}
      <div style={{ padding: '0 4px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-secondary, #9CA3AF)',
          }}
        >
          Distribuição por frasco
        </h2>
      </div>

      {/* ============== JAR SLIDERS ============== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {JAR_ORDER.map((key) => {
          const pct = Number(percentages[key] || 0);
          const amount = (income * pct) / 100;
          const recommended = RECOMMENDED[key] ?? 0;
          const color = jarColors?.[key] || '#D4AF37';
          const isRecommended = pct === recommended;
          const emoji = JAR_EMOJI[key] || '🫙';
          const realBalance = jarBalances?.[key];
          const showBalance = realBalance !== undefined && realBalance !== null;

          return (
            <motion.div
              key={key}
              layout
              style={{
                background: 'var(--card, #1a1a1a)',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                borderLeft: `4px solid ${color}`,
                borderRadius: 14,
                padding: 'clamp(14px, 2.5vw, 18px)',
                minWidth: 0,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              {/* ===== TOP ROW ===== */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 16,
                  minWidth: 0,
                }}
              >
                {/* LEFT: emoji + labels */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  {/* Emoji circle */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: hexToRgba(color, 0.18),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 22,
                      lineHeight: 1,
                    }}
                  >
                    {emoji}
                  </div>

                  {/* Texts */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: 'var(--text, #fff)',
                        lineHeight: 1.25,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {jarLabels?.[key] || key}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontSize: 11,
                        color: 'var(--text-muted, #6B7280)',
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {JAR_HINTS[key]}
                    </div>
                  </div>
                </div>

                {/* RIGHT: percentage + amount */}
                <div
                  style={{
                    textAlign: 'right',
                    flexShrink: 0,
                    minWidth: 70,
                  }}
                >
                  <div
                    style={{
                      fontSize: 'clamp(20px, 4.5vw, 24px)',
                      fontWeight: 900,
                      color,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {pct}%
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-secondary, #9CA3AF)',
                      marginTop: 4,
                      fontWeight: 600,
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatCurrency(amount)}
                  </div>
                </div>
              </div>

              {/* ===== SLIDER ===== */}
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={pct}
                onChange={(e) => handleChange(key, e.target.value)}
                aria-label={`Percentagem ${jarLabels?.[key] || key}`}
                className="jar-slider"
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 999,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
                  margin: 0,
                  padding: 0,
                  display: 'block',
                  ['--thumb-color']: color,
                }}
              />

              {/* ===== QUICK CHIPS + RECOMMENDED ===== */}
              {showBalance && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: realBalance >= 0
                      ? hexToRgba('#10B981', 0.08)
                      : hexToRgba('#EF4444', 0.08),
                    color: realBalance >= 0 ? '#10B981' : '#EF4444',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}
                >
                  <span>Saldo atual neste frasco:</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency(realBalance)}
                  </span>
                </div>
              )}

              {/* ===== QUICK CHIPS + RECOMMENDED ===== */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginTop: 14,
                  flexWrap: 'wrap',
                  minWidth: 0,
                }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[0, 10, 25, 50].map((v) => {
                    const active = pct === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleChange(key, v)}
                        style={{
                          minWidth: 42,
                          minHeight: 32,
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: active
                            ? hexToRgba(color, 0.22)
                            : 'rgba(255,255,255,0.04)',
                          color: active ? color : 'var(--text-secondary, #9CA3AF)',
                          border: `1px solid ${
                            active ? hexToRgba(color, 0.55) : 'var(--border, rgba(255,255,255,0.08))'
                          }`,
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {v}%
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleChange(key, recommended)}
                  disabled={isRecommended}
                  style={{
                    background: isRecommended ? 'rgba(16,185,129,0.12)' : 'transparent',
                    border: `1px solid ${
                      isRecommended ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'
                    }`,
                    color: isRecommended ? '#10B981' : 'var(--text-muted, #6B7280)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: isRecommended ? 'default' : 'pointer',
                    padding: '6px 12px',
                    borderRadius: 8,
                    minHeight: 32,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isRecommended ? (
                    <><Check size={11} /> Recomendado</>
                  ) : (
                    <>Usar {recommended}%</>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ============== ERROR ============== */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              color: '#FCA5A5',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== ACTIONS ============== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 10,
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={handleReset}
          style={{
            minHeight: 52,
            padding: '0 18px',
            borderRadius: 14,
            background: 'transparent',
            border: '1px solid var(--border, rgba(255,255,255,0.12))',
            color: 'var(--text, #fff)',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
          }}
        >
          <RotateCcw size={15} /> Reset
        </button>

        <motion.button
          type="button"
          onClick={handleSave}
          disabled={!isValid || saving}
          whileTap={!isValid || saving ? {} : { scale: 0.98 }}
          style={{
            minHeight: 52,
            borderRadius: 14,
            border: 'none',
            background: !isValid
              ? 'rgba(255,255,255,0.06)'
              : saved
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #D4AF37, #B8941F)',
            color: !isValid ? 'var(--text-muted, #6B7280)' : '#0B0B0B',
            fontWeight: 800,
            fontSize: 14,
            cursor: !isValid || saving ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: !isValid || saving ? 0.7 : 1,
            transition: 'all 0.2s ease',
            boxShadow:
              isValid && !saving ? '0 8px 20px rgba(212,175,55,0.25)' : 'none',
          }}
        >
          {saved ? (
            <><Check size={16} /> Guardado!</>
          ) : saving ? (
            'A guardar…'
          ) : (
            <><Save size={16} /> Guardar alterações</>
          )}
        </motion.button>
      </div>

      {/* ============== INFO CARD ============== */}
      <Card
        style={{
          padding: 'clamp(16px, 3vw, 20px)',
          background:
            'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))',
          borderColor: 'rgba(212,175,55,0.25)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
          <div
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              background: 'rgba(212,175,55,0.18)',
              color: '#D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 800,
                color: 'var(--text, #fff)',
              }}
            >
              Método dos 6 Frascos
            </p>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: 12,
                lineHeight: 1.55,
                color: 'var(--text-secondary, #9CA3AF)',
                wordBreak: 'break-word',
              }}
            >
              Baseado no método de{' '}
              <strong style={{ color: 'var(--text, #fff)' }}>T. Harv Eker</strong>, os 6 Frascos
              ajudam-te a alocar o rendimento de forma equilibrada. As percentagens devem
              totalizar <strong style={{ color: 'var(--text, #fff)' }}>100%</strong>.
            </p>
          </div>
        </div>
      </Card>

      {/* ============== Slider thumb styles ============== */}
      <style>{`
        .jar-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid var(--thumb-color, #D4AF37);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          transition: transform 0.15s ease;
        }
        .jar-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .jar-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid var(--thumb-color, #D4AF37);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .jar-slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </Shell>
  );
}
