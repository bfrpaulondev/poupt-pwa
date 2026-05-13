import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import { themes } from '../themes';
import { Save, RotateCcw, Info } from 'lucide-react';

const jarConfig = [
  { key: 'necessities', label: 'Necessidades', icon: '🏠', color: '#FF6B6B', defaultPct: 50 },
  { key: 'freedom', label: 'Liberdade Financeira', icon: '🏛️', color: '#4ECDC4', defaultPct: 10 },
  { key: 'savings', label: 'Poupanca Longo Prazo', icon: '🏗️', color: '#45B7D1', defaultPct: 10 },
  { key: 'education', label: 'Educacao', icon: '📚', color: '#96CEB4', defaultPct: 10 },
  { key: 'play', label: 'Lazer', icon: '🎮', color: '#FFEAA7', defaultPct: 10 },
  { key: 'give', label: 'Ofertas', icon: '🎁', color: '#DDA0DD', defaultPct: 5 },
];

export default function Jars() {
  const { jars, mockUser } = useStore();
  const theme = themes.darkGold;
  const income = mockUser?.income || 1100;

  const defaultPercentages = {};
  jarConfig.forEach(j => { defaultPercentages[j.key] = j.defaultPct; });

  const [percentages, setPercentages] = useState(defaultPercentages);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const total = Object.values(percentages).reduce((sum, v) => sum + v, 0);
  const isValid = total === 100;

  const handleChange = (key, value) => {
    const num = Math.max(0, Math.min(100, Number(value)));
    setPercentages(prev => ({ ...prev, [key]: num }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const handleReset = () => {
    setPercentages(defaultPercentages);
    setSaved(false);
  };

  return (
    <div className="px-4 py-4 poupt-scroll" style={{ background: theme.background }}>
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: theme.text }}>
          6 Frascos
        </h2>
        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
          Distribui o teu rendimento de forma inteligente
        </p>
      </div>

      {/* Donut-like visual summary */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {jarConfig.map(j => (
            <div key={j.key} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: `${j.color}15` }}>
              <span className="text-xs">{j.icon}</span>
              <span className="text-[11px] font-bold" style={{ color: j.color }}>{percentages[j.key]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total indicator */}
      <div className="text-center mb-4">
        <span className="text-sm font-bold" style={{ color: isValid ? '#10B981' : '#EF4444' }}>
          Total: {total}% {isValid ? '✓ Perfeito!' : '— Deve somar 100%'}
        </span>
      </div>

      {/* Jar Sliders */}
      <div className="flex flex-col gap-3 mb-4">
        {jarConfig.map(j => {
          const amount = (income * percentages[j.key]) / 100;
          return (
            <motion.div
              key={j.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="feature-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{j.icon}</span>
                  <span className="text-sm font-bold" style={{ color: j.color }}>
                    {j.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold" style={{ color: theme.text }}>
                    {percentages[j.key]}%
                  </span>
                  <span className="text-xs ml-2 font-medium" style={{ color: theme.textMuted }}>
                    €{amount.toFixed(0)}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={percentages[j.key]}
                onChange={e => handleChange(j.key, e.target.value)}
                className="w-full"
                style={{
                  accentColor: j.color,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handleReset}
          className="btn-gold-outline flex items-center gap-2 px-4 py-3"
        >
          <RotateCcw size={14} /> Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid || saving}
          className="btn-gold flex-1 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Save size={14} /> {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar'}
        </button>
      </div>

      {/* Info */}
      <div className="glass-card p-4 flex gap-3">
        <Info size={16} className="mt-0.5 shrink-0" style={{ color: theme.primary }} />
        <p className="text-xs leading-relaxed" style={{ color: theme.textMuted }}>
          Baseado no metodo de T. Harv Eker. Os 6 Frascos ajudam-te a alocar o rendimento de forma equilibrada.
          Ajusta as percentagens ao teu contexto e modo de vida atual.
        </p>
      </div>
    </div>
  );
}
