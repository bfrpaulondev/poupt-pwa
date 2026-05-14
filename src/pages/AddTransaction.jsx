import { useState } from 'react';
import useStore from '../store/useStore';
import { api } from '../services/api';
import {
  categoryLabels,
  categoryIcons,
  jarLabels,
  jarColors,
  jarIcons,
  formatCurrency,
} from '../utils/helpers';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Save,
  X,
  ShoppingCart,
  Home,
  TrainFront,
  Heart,
  GraduationCap,
  Gamepad2,
  Shirt,
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Banknote,
  Laptop,
  Plus,
  Minus,
  CreditCard,
  Landmark,
  Calendar,
  FileText,
  Coins,
  Repeat,
  Wallet,
} from 'lucide-react';
import { Page, Card, SectionHeader, Button } from '../components/ui';

const iconMap = {
  ShoppingCart,
  Home,
  TrainFront,
  Heart,
  GraduationCap,
  Gamepad2,
  Shirt,
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Banknote,
  Laptop,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Landmark,
};

const incomeCategories = ['salario', 'freelance', 'outro_rendimento', 'emprestimo_recebido'];
const expenseCategories = [
  'alimentacao',
  'habitacao',
  'transportes',
  'saude',
  'educacao',
  'lazer',
  'roupa',
  'divida',
  'investimento',
  'poupanca',
  'pagamento_divida',
  'emprestimo_dado',
  'outro_gasto',
];

export default function AddTransaction() {
  const { user, addTransaction, setScreen, updateUser } = useStore();
  const [type, setType] = useState('despesa');
  const [form, setForm] = useState({
    amount: '',
    category: 'alimentacao',
    description: '',
    jar: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [moedasEarned, setMoedasEarned] = useState(null);

  const categories = type === 'receita' ? incomeCategories : expenseCategories;
  const isIncome = type === 'receita';
  const toneColor = isIncome ? '#16A34A' : '#DC2626';
  const amountValue = Number(form.amount || 0);

  const updateForm = (data) => {
    setForm((prev) => ({ ...prev, ...data }));
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    updateForm({
      category: newType === 'receita' ? 'salario' : 'alimentacao',
      jar: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Indica um valor válido.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await api.createTransaction({
        ...form,
        type,
        amount: Number(form.amount),
        jar: form.jar || null,
        isRecurring: form.isRecurring || undefined,
        recurringFrequency: form.isRecurring ? form.recurringFrequency : undefined,
      });

      addTransaction(res.data.transaction);
      window.dispatchEvent(new CustomEvent('poupt-refresh-dashboard'));

      try {
        const moedasRes = await api.earnMoedas('add_transaction', 5);
        updateUser({ poupMoedas: moedasRes.data.balance });
        setMoedasEarned(moedasRes.data.earned || 5);
        setTimeout(() => setMoedasEarned(null), 3000);
      } catch {}

      setScreen('dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao guardar transação.');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (cat) => {
    const iconName = categoryIcons[cat];
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={16} /> : <Plus size={16} />;
  };

  const getJarIcon = (key) => {
    const iconName = jarIcons[key];
    const Icon = iconMap[iconName];
    return Icon ? <Icon size={15} /> : <Wallet size={15} />;
  };

  return (
    <Page
      eyebrow="Nova transação"
      title={isIncome ? 'Adicionar receita' : 'Adicionar despesa'}
      description="Regista movimentos de forma simples para manter o orçamento atualizado."
    >
      {moedasEarned && (
        <div
          className="mb-4 flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-extrabold animate-fade-in"
          style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}
        >
          <Coins size={16} /> +{moedasEarned} PoupMoedas ganhos
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-2xl border p-3 text-center text-sm font-bold animate-fade-in"
          style={{ background: 'rgba(220, 38, 38, 0.08)', borderColor: 'rgba(220, 38, 38, 0.22)', color: 'var(--danger)' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <TypeButton
              active={!isIncome}
              icon={ArrowDownLeft}
              label="Despesa"
              color="#DC2626"
              onClick={() => handleTypeChange('despesa')}
            />
            <TypeButton
              active={isIncome}
              icon={ArrowUpRight}
              label="Receita"
              color="#16A34A"
              onClick={() => handleTypeChange('receita')}
            />
          </div>

          <div className="rounded-3xl border p-5 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
            <p className="text-xs font-extrabold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
              Valor
            </p>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-base font-extrabold" style={{ color: toneColor }}>
                {user?.currency || 'EUR'}
              </span>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => updateForm({ amount: e.target.value })}
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
                className="w-full max-w-[190px] bg-transparent text-center text-4xl font-extrabold tracking-[-0.06em] outline-none"
                style={{ color: toneColor }}
              />
            </div>

            {amountValue > 0 && (
              <p className="mt-2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                {formatCurrency(amountValue, user?.currency || 'EUR')}
              </p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <FieldLabel icon={FileText} label="Descrição" />
          <input
            type="text"
            value={form.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder={isIncome ? 'Ex: Salário mensal' : 'Ex: Compras no supermercado'}
            required
            className="input-field"
          />

          <div className="pt-1">
            <FieldLabel label="Categoria" />
            <div className="mt-3 grid grid-cols-2 xs:grid-cols-3 gap-2.5">
              {categories.map((cat) => (
                <OptionButton
                  key={cat}
                  active={form.category === cat}
                  icon={getCategoryIcon(cat)}
                  label={categoryLabels[cat] || cat}
                  color={toneColor}
                  onClick={() => updateForm({ category: cat })}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader
            title="Frasco"
            description="Opcional. Associa esta transação a uma área do orçamento."
            className="!mt-0 !mb-0"
          />

          <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5">
            {Object.entries(jarLabels).map(([key, label]) => {
              const active = form.jar === key;
              const color = jarColors[key] || 'var(--gold)';

              return (
                <OptionButton
                  key={key}
                  active={active}
                  icon={getJarIcon(key)}
                  label={label.split(' ')[0]}
                  color={color}
                  onClick={() => updateForm({ jar: active ? '' : key })}
                />
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <div>
            <FieldLabel icon={Calendar} label="Data" />
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateForm({ date: e.target.value })}
              className="input-field mt-2"
            />
          </div>

          <div>
            <FieldLabel icon={FileText} label="Notas" optional />
            <textarea
              value={form.notes}
              onChange={(e) => updateForm({ notes: e.target.value })}
              placeholder="Adiciona detalhes úteis sobre este movimento."
              rows={3}
              className="input-field mt-2 resize-none"
            />
          </div>

          <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl" style={{ background: 'color-mix(in srgb, var(--gold) 10%, transparent)', color: 'var(--gold)' }}>
                  <Repeat size={18} />
                </div>
                <div>
                  <p className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Transação recorrente
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Útil para salários, rendas ou subscrições.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => updateForm({ isRecurring: !form.isRecurring })}
                className="relative h-8 w-14 shrink-0 rounded-full transition-all"
                style={{ background: form.isRecurring ? 'var(--gold)' : 'var(--border)' }}
                aria-label="Alternar recorrência"
              >
                <span
                  className="absolute top-1 h-6 w-6 rounded-full bg-white transition-all"
                  style={{ left: form.isRecurring ? 26 : 4 }}
                />
              </button>
            </div>

            {form.isRecurring && (
              <select
                value={form.recurringFrequency || 'monthly'}
                onChange={(e) => updateForm({ recurringFrequency: e.target.value })}
                className="input-field mt-4"
              >
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-[0.7fr_1fr] gap-3">
          <Button type="button" variant="secondary" size="lg" onClick={() => setScreen('dashboard')}>
            <X size={17} /> Cancelar
          </Button>
          <Button type="submit" variant="primary" size="lg" disabled={saving}>
            <Save size={17} /> {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Page>
  );
}

function TypeButton({ active, icon: Icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[58px] rounded-2xl border px-4 text-sm font-extrabold transition-all flex items-center justify-center gap-2"
      style={{
        background: active ? `${color}14` : 'var(--bg-primary)',
        color: active ? color : 'var(--text-muted)',
        borderColor: active ? color : 'var(--border)',
      }}
    >
      <Icon size={18} /> {label}
    </button>
  );
}

function FieldLabel({ icon: Icon, label, optional = false }) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>
      {Icon && <Icon size={13} />}
      {label}
      {optional && <span className="normal-case tracking-normal font-bold">(opcional)</span>}
    </label>
  );
}

function OptionButton({ active, icon, label, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[74px] rounded-2xl border px-3 py-3 text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1.5"
      style={{
        background: active ? `${color}14` : 'var(--bg-primary)',
        color: active ? color : 'var(--text-muted)',
        borderColor: active ? color : 'var(--border)',
      }}
    >
      <span>{icon}</span>
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
}
