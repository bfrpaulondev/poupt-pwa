export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  }).format(value || 0);
};

export const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date));
};

export const formatDateShort = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short'
  }).format(new Date(date));
};

export const categoryLabels = {
  alimentacao: 'Alimentacao',
  habitacao: 'Habitacao',
  transportes: 'Transportes',
  saude: 'Saude',
  educacao: 'Educacao',
  lazer: 'Lazer',
  roupa: 'Roupa',
  divida: 'Divida',
  investimento: 'Investimento',
  poupanca: 'Poupanca',
  salario: 'Salario',
  freelance: 'Freelance',
  outro_rendimento: 'Outro Rendimento',
  outro_gasto: 'Outro Gasto',
  emprestimo_dado: 'Emprestimo Dado',
  emprestimo_recebido: 'Emprestimo Recebido',
  pagamento_divida: 'Pagamento Divida'
};

export const categoryIcons = {
  alimentacao: 'ShoppingCart',
  habitacao: 'Home',
  transportes: 'TrainFront',
  saude: 'Heart',
  educacao: 'GraduationCap',
  lazer: 'Gamepad2',
  roupa: 'Shirt',
  divida: 'AlertTriangle',
  investimento: 'TrendingUp',
  poupanca: 'PiggyBank',
  salario: 'Banknote',
  freelance: 'Laptop',
  outro_rendimento: 'Plus',
  outro_gasto: 'Minus',
  emprestimo_dado: 'ArrowUpRight',
  emprestimo_recebido: 'ArrowDownLeft',
  pagamento_divida: 'CreditCard'
};

export const jarLabels = {
  necessities: 'Necessidades',
  freedom: 'Liberdade Financeira',
  savings: 'Poupanca Longo Prazo',
  education: 'Educacao',
  play: 'Lazer',
  give: 'Doar'
};

export const jarColors = {
  necessities: '#3B82F6',
  freedom: '#10B981',
  savings: '#F59E0B',
  education: '#8B5CF6',
  play: '#EF4444',
  give: '#EC4899'
};

export const jarIcons = {
  necessities: 'Home',
  freedom: 'Landmark',
  savings: 'PiggyBank',
  education: 'GraduationCap',
  play: 'Gamepad2',
  give: 'Heart'
};

export const modeLabels = {
  sobrevivencia: 'Sobrevivencia',
  recuperacao: 'Recuperacao',
  estabilidade: 'Estabilidade',
  crescimento: 'Crescimento',
  prosperidade: 'Prosperidade'
};

export const modeColors = {
  sobrevivencia: '#EF4444',
  recuperacao: '#F97316',
  estabilidade: '#F59E0B',
  crescimento: '#10B981',
  prosperidade: '#3B82F6'
};

export const modeDescriptions = {
  sobrevivencia: 'Conta negativa, dividas vencidas, credores a ligar',
  recuperacao: 'Dividas em pagamento, conta estavel mas apertada',
  estabilidade: 'Sem dividas problematicas, a construir fundo emergencia',
  crescimento: 'Fundo emergencia completo, inicio de investimentos',
  prosperidade: 'Independencia financeira, rendimento passivo cobre despesas'
};

export const calculateLevel = (xp) => {
  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const xpForNext = 100;
  return { level, currentLevelXp, xpForNext, progress: currentLevelXp / xpForNext * 100 };
};

export const getDaysUntil = (date) => {
  if (!date) return null;
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
