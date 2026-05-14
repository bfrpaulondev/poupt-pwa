import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import { formatCurrency, jarLabels, jarColors, jarIcons } from '../utils/helpers';
import JarDonut from '../components/JarDonut';
import { Save, RotateCcw, Info } from 'lucide-react';

export default function Jars() {
  const { user, updateUser, defaultJarPercentages } = useStore();
  const defaultJars = defaultJarPercentages;
  const [percentages, setPercentages] = useState(user?.jarPercentages || defaultJars);
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
    try {
      await api.updateMe({ jarPercentages: percentages });
      updateUser({ jarPercentages: percentages });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPercentages(useStore.getState().defaultJarPercentages);
    setSaved(false);
  };

  const jarOrder = ['necessities', 'freedom', 'savings', 'education', 'play', 'give'];

  return (
    <div className="px-5 xs:px-6 sm:px-8 py-5 xs:py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fade-in">
      {/* Donut Chart */}
      <div className="flex justify-center py-4 sm:py-6">
        <JarDonut percentages={percentages} size={220} />
      </div>

      {/* Total indicator */}
      <div className="text-center">
        <span className="text-sm" style={{ color: isValid ? '#10B981' : '#EF4444' }}>
          Total: {total}% {isValid ? '- Perfeito!' : '- Deve somar 100%'}
        </span>
      </div>

      {/* Jar Sliders */}
      <div className="space-y-4">
        {jarOrder.map(key => {
          const amount = (user?.income || 0) * percentages[key] / 100;
          return (
            <div key={key} className="feature-card p-5 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: jarColors[key] }} />
                  <span className="text-sm font-semibold" style={{ color: jarColors[key] }}>
                    {jarLabels[key]}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {percentages[key]}%
                  </span>
                  <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(amount)}
                  </span>
                </div>
              </div>
              <input type="range" min="0" max="100" value={percentages[key]}
                onChange={e => handleChange(key, e.target.value)}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${jarColors[key]} ${percentages[key]}%, var(--border) ${percentages[key]}%)`
                }} />
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 sm:gap-4">
        <button onClick={handleReset}
          className="btn-gold-outline flex items-center gap-2 px-4 sm:px-5 py-4 sm:py-4.5">
          <RotateCcw size={14} /> Reset
        </button>
        <button onClick={handleSave} disabled={!isValid || saving}
          className="btn-gold flex-1 py-4 sm:py-4.5 disabled:opacity-50 flex items-center justify-center gap-2">
          <Save size={14} /> {saving ? 'A guardar...' : saved ? 'Guardado!' : 'Guardar'}
        </button>
      </div>

      {/* Info */}
      <div className="glass-card p-5 flex gap-4">
        <Info size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Baseado no metodo de T. Harv Eker. Os 6 Frascos ajudam-te a alocar o rendimento de forma equilibrada.
          Ajusta as percentagens ao teu contexto e modo de vida atual.
        </p>
      </div>
    </div>
  );
}
