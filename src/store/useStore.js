import { create } from 'zustand';

const mockUser = {
  name: 'Ana Silva',
  email: 'ana.silva@email.pt',
  avatar: '\u{1F469}',
  income: 1100,
  poupMoedas: 145,
  streak: 12,
  level: 5,
  xp: 340,
  trophies: ['first_savings', 'week_streak', 'debt_warrior', 'jar_master'],
  plan: 'free',
  coachMode: 'sargento',
};

const mockJars = [
  { name: 'Necessidades', percentage: 50, allocated: 550, spent: 487, icon: '\u{1F3E0}', color: '#FF6B6B' },
  { name: 'Liberdade Financeira', percentage: 10, allocated: 110, spent: 45, icon: '\u{1F3E6}', color: '#4ECDC4' },
  { name: 'Poupança Longo Prazo', percentage: 10, allocated: 110, spent: 0, icon: '\u{1F3DB}\u{FE0F}', color: '#45B7D1' },
  { name: 'Educação', percentage: 10, allocated: 110, spent: 29, icon: '\u{1F4DA}', color: '#96CEB4' },
  { name: 'Lazer', percentage: 10, allocated: 110, spent: 78, icon: '\u{1F3AE}', color: '#FFEAA7' },
  { name: 'Ofertas', percentage: 5, allocated: 55, spent: 15, icon: '\u{1F381}', color: '#DDA0DD' },
];

const mockDebts = [
  { name: 'WiZink Cartão', total: 3200, remaining: 2847, monthlyPayment: 85, interestRate: 21.9, creditor: 'WiZink', daysOverdue: 62 },
  { name: 'Intrum - Telecom', total: 487, remaining: 487, monthlyPayment: 0, interestRate: 0, creditor: 'Intrum', daysOverdue: 120 },
  { name: 'Cofidis Pessoal', total: 4500, remaining: 3890, monthlyPayment: 135, interestRate: 12.5, creditor: 'Cofidis', daysOverdue: 0 },
  { name: 'Renda em atraso', total: 1100, remaining: 550, monthlyPayment: 550, interestRate: 0, creditor: 'Senhorio', daysOverdue: 15 },
];

const mockTransactions = [
  { id: '1', description: 'Salário', amount: 1100, category: 'Salário', jar: 'Necessidades', date: '2026-05-01', type: 'income' },
  { id: '2', description: 'Renda', amount: -550, category: 'Habitação', jar: 'Necessidades', date: '2026-05-02', type: 'expense' },
  { id: '3', description: 'Lidl Compras', amount: -67.3, category: 'Supermercado', jar: 'Necessidades', date: '2026-05-03', type: 'expense' },
  { id: '4', description: 'WiZink Mensalidade', amount: -85, category: 'Dívida', jar: 'Liberdade Financeira', date: '2026-05-04', type: 'expense' },
  { id: '5', description: 'Cofidis Mensalidade', amount: -135, category: 'Dívida', jar: 'Liberdade Financeira', date: '2026-05-04', type: 'expense' },
  { id: '6', description: 'Uber', amount: -12.5, category: 'Transportes', jar: 'Necessidades', date: '2026-05-05', type: 'expense' },
  { id: '7', description: 'Udemy Curso', amount: -29, category: 'Educação', jar: 'Educação', date: '2026-05-06', type: 'expense' },
  { id: '8', description: 'Netflix', amount: -7.99, category: 'Subscrição', jar: 'Lazer', date: '2026-05-07', type: 'expense' },
  { id: '9', description: 'Farmácia', amount: -18.4, category: 'Saúde', jar: 'Necessidades', date: '2026-05-08', type: 'expense' },
  { id: '10', description: 'Pingo Doce', amount: -43.2, category: 'Supermercado', jar: 'Necessidades', date: '2026-05-09', type: 'expense' },
];

const mockNotifications = [
  { id: '1', title: '⚠️ Conta no negativo', message: 'O teu saldo bancário está -€180. Ativa o Modo Sobrevivência.', type: 'alert', read: false, date: '2026-05-10' },
  { id: '2', title: '🏆 Novo Troféu', message: 'Conseguiste o troféu "Guerreiro de Dívidas" — pagaste 3 dívidas este mês.', type: 'achievement', read: false, date: '2026-05-09' },
  { id: '3', title: '📅 Lembrete', message: 'A mensalidade da WiZink vence amanhã. Tens €85 disponíveis?', type: 'reminder', read: true, date: '2026-05-08' },
  { id: '4', title: '💡 Dica do Sargento', message: 'Se cortares 1 café por dia, poupas €30/mês. Isso é €360/ano.', type: 'tip', read: true, date: '2026-05-07' },
];

const mockCoachMessages = [
  {
    id: '1',
    role: 'coach',
    content: 'Bom dia, Soldado Silva. O teu relatório diário: ontem gastaste €67 no Lidl e €12 no Uber. Ainda estás dentro do orçamento de Necessidades, mas apertado. A WiZink vence em 3 dias.',
    timestamp: '2026-05-10T08:00:00',
  },
  {
    id: '2',
    role: 'coach',
    content: 'Dica: se cancelares a Netflix (€7.99) e usares o RTP Play, aplicas esses €8 na dívida do Intrum.',
    timestamp: '2026-05-10T08:01:00',
  },
];

const useStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  currentScreen: 'landing',
  currentTheme: localStorage.getItem('poupt_theme') || 'darkGold',
  menuOpen: false,
  isLoading: false,

  onboardingComplete: false,
  onboardingStep: 0,
  onboardingData: {
    name: '',
    income: 1100,
    hasDebts: true,
    coachMode: 'sargento',
    avatar: '\u{1F469}',
  },

  mockUser,
  jars: mockJars,
  debts: mockDebts,
  transactions: mockTransactions,
  notifications: mockNotifications,
  coachMessages: mockCoachMessages,
  chatMessages: [],
  goals: [],

  getModeColor: () => {
    const modeColors = {
      sobrevivencia: '#EF4444',
      recuperacao: '#F97316',
      estabilidade: '#F59E0B',
      crescimento: '#10B981',
      prosperidade: '#D4A843',
    };

    const user = get().user;
    return modeColors[user?.financialMode] || modeColors.sobrevivencia;
  },

  getModeLabel: () => {
    const modeLabels = {
      sobrevivencia: 'Sobrevivência',
      recuperacao: 'Recuperação',
      estabilidade: 'Estabilidade',
      crescimento: 'Crescimento',
      prosperidade: 'Prosperidade',
    };

    const user = get().user;
    return modeLabels[user?.financialMode] || 'Sobrevivência';
  },

  login: (user, token) => {
    localStorage.setItem('poupt_token', token);
    localStorage.setItem('poupt_user', JSON.stringify(user));

    set({
      user,
      token,
      isAuthenticated: true,
      currentScreen: user.onboardingComplete ? 'dashboard' : 'onboarding',
    });
  },

  logout: () => {
    localStorage.removeItem('poupt_token');
    localStorage.removeItem('poupt_user');

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      currentScreen: 'landing',
      onboardingComplete: false,
      onboardingStep: 0,
    });
  },

  updateUser: (data) => {
    const updated = { ...get().user, ...data };
    localStorage.setItem('poupt_user', JSON.stringify(updated));
    set({ user: updated });
  },

  setScreen: (screen) => set({ currentScreen: screen, menuOpen: false }),

  setTheme: (theme) => {
    localStorage.setItem('poupt_theme', theme);
    set({ currentTheme: theme });
  },

  setMenuOpen: (value) => set({ menuOpen: value }),

  setOnboardingComplete: (value) => {
    const user = get().user;

    if (user) {
      const updatedUser = { ...user, onboardingComplete: value };
      localStorage.setItem('poupt_user', JSON.stringify(updatedUser));

      set({
        onboardingComplete: value,
        user: updatedUser,
      });

      return;
    }

    set({ onboardingComplete: value });
  },

  setOnboardingStep: (value) => set({ onboardingStep: value }),

  setOnboardingData: (data) =>
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        ...data,
      },
    })),

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  setDebts: (debts) => set({ debts }),

  addDebt: (debt) =>
    set((state) => ({
      debts: [...state.debts, debt],
    })),

  setGoals: (goals) => set({ goals }),

  addGoal: (goal) =>
    set((state) => ({
      goals: [...state.goals, goal],
    })),

  setInvestments: (investments) => set({ investments }),

  setNotifications: (notifications) => set({ notifications }),

  setChatMessages: (messages) => set({ chatMessages: messages }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  setLoading: (isLoading) => set({ isLoading }),

  addPoupMoedas: (amount) =>
    set((state) => ({
      mockUser: {
        ...state.mockUser,
        poupMoedas: state.mockUser.poupMoedas + amount,
      },
    })),

  spendPoupMoedas: (amount) => {
    const state = get();

    if (state.mockUser.poupMoedas >= amount) {
      set((current) => ({
        mockUser: {
          ...current.mockUser,
          poupMoedas: current.mockUser.poupMoedas - amount,
        },
      }));

      return true;
    }

    return false;
  },

  addCoachMessage: (message) =>
    set((state) => ({
      coachMessages: [...state.coachMessages, message],
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      ),
    })),

  restoreSession: () => {
    const savedTheme = localStorage.getItem('poupt_theme');

    if (savedTheme) {
      set({ currentTheme: savedTheme });
    }

    const token = localStorage.getItem('poupt_token');
    const userStr = localStorage.getItem('poupt_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        set({
          user,
          token,
          isAuthenticated: true,
          currentScreen: user.onboardingComplete ? 'dashboard' : 'onboarding',
        });
      } catch {
        localStorage.removeItem('poupt_token');
        localStorage.removeItem('poupt_user');
      }
    }
  },
}));

export default useStore;