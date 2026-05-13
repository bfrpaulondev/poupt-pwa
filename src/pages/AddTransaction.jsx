import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
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
  Calendar,
  Coins,
} from 'lucide-react';
import useThemeColors, { alpha } from '../utils/useThemeColors';

const categoryConfig = {
  alimentacao: { label: 'Alimentação', icon: ShoppingCart },
  habitacao: { label: 'Habitação', icon: Home },
  transportes: { label: 'Transportes', icon: TrainFront },
  saude: { label: 'Saúde', icon: Heart },
  educacao: { label: 'Educação', icon: GraduationCap },
  lazer: { label: 'Lazer', icon: Gamepad2 },
  roupa: { label: 'Roupa', icon: Shirt },
  divida: { label: 'Dívida', icon: AlertTriangle },
  investimento: { label: 'Investimento', icon: TrendingUp },
  poupanca: { label: 'Poupança', icon: PiggyBank },
  salario: { label: 'Salário', icon: Banknote },
  freelance: { label: 'Freelance', icon: Laptop },
  outro: { label: 'Outro', icon: Plus },
};

const jarFallbackColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
];

export default function AddTransaction() {
  const { addTransaction, setScreen, jars } = useStore();
  const { colors } = useThemeColors();

  const [type, setType] = useState('despesa');
  const [form, setForm] = useState({
    amount: '',
    category: 'alimentacao',
    description: '',
    jar: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [moedasEarned, setMoedasEarned] = useState(null);

  const incomeCategories = ['salario', 'freelance', 'outro'];
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
  ];

  const categories = type === 'receita' ? incomeCategories : expenseCategories;
  const typeColor = type === 'receita' ? colors.success : colors.danger;

  const handleTypeChange = (newType) => {
    setType(newType);
    setForm((current) => ({
      ...current,
      category: newType === 'receita' ? 'salario' : 'alimentacao',
      jar: '',
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) return;

    setSaving(true);

    try {
      addTransaction({
        ...form,
        id: Date.now().toString(),
        amount: type === 'receita' ? Number(form.amount) : -Number(form.amount),
        type: type === 'receita' ? 'income' : 'expense',
      });

      setMoedasEarned(5);

      setTimeout(() => {
        setMoedasEarned(null);
        setScreen('dashboard');
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        width: '100%',
        background: colors.background,
        display: 'flex',
        justifyContent: 'center',
        overflowY: 'auto',
      }}
    >
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          width: '100%',
          maxWidth: 361,
          padding: '18px 15px 24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header style={{ marginBottom: 18 }}>
          <h1
            style={{
              margin: 0,
              color: colors.text,
              fontSize: 25,
              lineHeight: '31px',
              fontWeight: 900,
              letterSpacing: '-0.5px',
            }}
          >
            Nova transação
          </h1>

          <p
            style={{
              margin: '5px 0 0',
              color: colors.muted,
              fontSize: 13,
              lineHeight: '17px',
              fontWeight: 500,
            }}
          >
            Regista uma receita ou despesa
          </p>
        </header>

        {moedasEarned && (
          <div
            style={{
              minHeight: 43,
              marginBottom: 14,
              padding: '0 14px',
              borderRadius: 13,
              background: alpha(colors.gold, 0.14),
              color: colors.gold,
              border: `1px solid ${alpha(colors.gold, 0.28)}`,
              fontSize: 13,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Coins size={15} />
            +{moedasEarned} PoupMoedas ganhos
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 16,
          }}
        >
          <TypeButton
            active={type === 'despesa'}
            label="Despesa"
            icon={<ArrowDownLeft size={15} />}
            color={colors.danger}
            colors={colors}
            onClick={() => handleTypeChange('despesa')}
          />

          <TypeButton
            active={type === 'receita'}
            label="Receita"
            icon={<ArrowUpRight size={15} />}
            color={colors.success}
            colors={colors}
            onClick={() => handleTypeChange('receita')}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <section
            style={{
              padding: '22px 16px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.055)',
              border: '1px solid rgba(255,255,255,0.11)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: colors.muted,
                fontSize: 12,
                lineHeight: '15px',
                fontWeight: 700,
              }}
            >
              {type === 'receita' ? 'Receita' : 'Despesa'}
            </span>

            <div
              style={{
                marginTop: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <span
                style={{
                  color: typeColor,
                  fontSize: 15,
                  fontWeight: 900,
                }}
              >
                EUR
              </span>

              <input
                type="number"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                placeholder="0.00"
                required
                min="0.01"
                step="0.01"
                style={{
                  width: 148,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: typeColor,
                  fontSize: 34,
                  lineHeight: '40px',
                  fontWeight: 900,
                  textAlign: 'center',
                }}
              />
            </div>
          </section>

          <FieldLabel colors={colors}>Descrição</FieldLabel>

          <input
            type="text"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            placeholder={
              type === 'receita'
                ? 'Ex: Salário mensal'
                : 'Ex: Compras no supermercado'
            }
            required
            style={inputStyle(colors)}
          />

          <SectionTitle colors={colors}>Categoria</SectionTitle>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}
          >
            {categories.map((category) => {
              const config = categoryConfig[category] || categoryConfig.outro;
              const Icon = config.icon;
              const isActive = form.category === category;

              return (
                <SmallCardButton
                  key={category}
                  active={isActive}
                  color={colors.gold}
                  colors={colors}
                  onClick={() => setForm({ ...form, category })}
                >
                  <Icon size={16} />
                  <span>{config.label}</span>
                </SmallCardButton>
              );
            })}
          </div>

          <SectionTitle colors={colors}>Frasco opcional</SectionTitle>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}
          >
            {(jars || []).map((jar, index) => {
              const isActive = form.jar === jar.name;
              const jarColor =
                jar.color || jarFallbackColors[index % jarFallbackColors.length];

              return (
                <SmallCardButton
                  key={jar.name}
                  active={isActive}
                  color={jarColor}
                  colors={colors}
                  onClick={() =>
                    setForm({
                      ...form,
                      jar: form.jar === jar.name ? '' : jar.name,
                    })
                  }
                >
                  <span style={{ fontSize: 18 }}>{jar.icon || '🏺'}</span>
                  <span>{jar.name}</span>
                </SmallCardButton>
              );
            })}
          </div>

          <FieldLabel colors={colors}>
            <Calendar size={13} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Data
          </FieldLabel>

          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm({ ...form, date: event.target.value })}
            style={inputStyle(colors)}
          />

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 4,
            }}
          >
            <button
              type="button"
              onClick={() => setScreen('dashboard')}
              style={{
                width: 112,
                height: 54,
                borderRadius: 15,
                border: `1.5px solid ${colors.border}`,
                background: 'transparent',
                color: colors.muted,
                fontSize: 13,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <X size={15} />
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 15,
                border: 'none',
                background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                color: colors.inverse,
                fontSize: 15,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.65 : 1,
                boxShadow: `0 12px 30px ${alpha(colors.gold, 0.2)}`,
              }}
            >
              <Save size={15} />
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.main>
    </div>
  );
}

function TypeButton({ active, label, icon, color, colors, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 48,
        borderRadius: 14,
        border: active ? `1.5px solid ${color}` : `1.5px solid ${colors.border}`,
        background: active ? alpha(color, 0.13) : colors.surface,
        color: active ? color : colors.muted,
        fontSize: 14,
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SmallCardButton({ active, color, colors, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 68,
        padding: '9px 5px',
        borderRadius: 13,
        border: active ? `1.5px solid ${color}` : `1.5px solid ${colors.border}`,
        background: active ? alpha(color, 0.14) : colors.surface,
        color: active ? color : colors.muted,
        fontSize: 11,
        lineHeight: '14px',
        fontWeight: 800,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {children}
    </button>
  );
}

function FieldLabel({ children, colors }) {
  return (
    <label
      style={{
        marginBottom: -8,
        color: colors.muted,
        fontSize: 12,
        lineHeight: '15px',
        fontWeight: 800,
      }}
    >
      {children}
    </label>
  );
}

function SectionTitle({ children, colors }) {
  return (
    <h3
      style={{
        margin: '0 0 -8px',
        color: colors.muted,
        fontSize: 12,
        lineHeight: '15px',
        fontWeight: 800,
      }}
    >
      {children}
    </h3>
  );
}

function inputStyle(colors) {
  return {
    width: '100%',
    height: 51,
    padding: '0 15px',
    borderRadius: 13,
    border: `1.5px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    fontSize: 15,
    fontWeight: 700,
    outline: 'none',
  };
}