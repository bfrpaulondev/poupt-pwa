import { create } from 'zustand';
import { themes } from '../themes';

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
  { name: 'Poupanca Longo Prazo', percentage: 10, allocated: 110, spent: 0, icon: '\u{1F3DB}\u{FE0F}', color: '#45B7D1' },
  { name: 'Educacao', percentage: 10, allocated: 110, spent: 29, icon: '\u{1F4DA}', color: '#96CEB4' },
  { name: 'Lazer', percentage: 10, allocated: 110, spent: 78, icon: '\u{1F3AE}', color: '#FFEAA7' },
  { name: 'Ofertas', percentage: 5, allocated: 55, spent: 15, icon: '\u{1F381}', color: '#DDA0DD' },
];

const mockDebts = [
  { name: 'WiZink Cartao', total: 3200, remaining: 2847, monthlyPayment: 85, interestRate: 21.9, creditor: 'WiZink', daysOverdue: 62 },
  { name: 'Intrum - Telecom', total: 487, remaining: 487, monthlyPayment: 0, interestRate: 0, creditor: 'Intrum', daysOverdue: 120 },
  { name: 'Cofidis Pessoal', total: 4500, remaining: 3890, monthlyPayment: 135, interestRate: 12.5, creditor: 'Cofidis', daysOverdue: 0 },
  { name: 'Renda em atraso', total: 1100, remaining: 550, monthlyPayment: 550, interestRate: 0, creditor: 'Senhorio', daysOverdue: 15 },
];

const mockTransactions = [
  { id: '1', description: 'Salario', amount: 1100, category: 'Salario', jar: 'Necessidades', date: '2026-05-01', type: 'income' },
  { id: '2', description: 'Renda', amount: -550, category: 'Habitacao', jar: 'Necessidades', date: '2026-05-02', type: 'expense' },
  { id: '3', description: 'Lidl Compras', amount: -67.30, category: 'Supermercado', jar: 'Necessidades', date: '2026-05-03', type: 'expense' },
  { id: '4', description: 'WiZink Mensalidade', amount: -85, category: 'Divida', jar: 'Liberdade Financeira', date: '2026-05-04', type: 'expense' },
  { id: '5', description: 'Cofidis Mensalidade', amount: -135, category: 'Divida', jar: 'Liberdade Financeira', date: '2026-05-04', type: 'expense' },
  { id: '6', description: 'Uber', amount: -12.50, category: 'Transportes', jar: 'Necessidades', date: '2026-05-05', type: 'expense' },
  { id: '7', description: 'Udemy Curso', amount: -29, category: 'Educacao', jar: 'Educacao', date: '2026-05-06', type: 'expense' },
  { id: '8', description: 'Netflix', amount: -7.99, category: 'Subscricao', jar: 'Lazer', date: '2026-05-07', type: 'expense' },
  { id: '9', description: 'Farmacia', amount: -18.40, category: 'Saude', jar: 'Necessidades', date: '2026-05-08', type: 'expense' },
  { id: '10', description: 'Pingo Doce', amount: -43.20, category: 'Supermercado', jar: 'Necessidades', date: '2026-05-09', type: 'expense' },
];

const mockNotifications = [
  { id: '1', title: '\u26A0\uFE0F Conta no negativo', message: 'O teu saldo bancario esta -\u20AC180. Ativa o Modo Sobrevivencia!', type: 'alert', read: false, date: '2026-05-10' },
  { id: '2', title: '\u{1F3C6} Novo Trofeu!', message: 'Conseguiste o trofeu "Guerreiro de Dividas" - pagaste 3 dividas este mes!', type: 'achievement', read: false, date: '2026-05-09' },
  { id: '3', title: '\u{1F4C5} Lembrete', message: 'A mensalidade da WiZink vence amanha. Tens \u20AC85 disponiveis?', type: 'reminder', read: true, date: '2026-05-08' },
  { id: '4', title: '\u{1F4A1} Dica do Sargento', message: 'Se cortares 1 cafe por dia, poupas \u20AC30/mes. Isso e \u20AC360/ano, soldado!', type: 'tip', read: true, date: '2026-05-07' },
];

const mockCoachMessages = [
  { id: '1', role: 'coach', content: 'Bom dia, Soldado Silva! \u{1F4AA} O teu relatorio diario: ontem gastaste \u20AC67 no Lidl e \u20AC12 no Uber. Ainda estas dentro do orcamento de Necessidades, mas apertado. A WiZink vence em 3 dias. Tens os \u20AC85?', timestamp: '2026-05-10T08:00:00' },
  { id: '2', role: 'coach', content: 'Dica: Se cancelares a Netflix (\u20AC7.99) e usares o RTP Play, aplicas esses \u20AC8 na divida do Intrum. Cada euro conta na guerra, soldado!', timestamp: '2026-05-10T08:01:00' },
];

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: null,
  isAuthenticated: false,

  // App state
  currentScreen: 'landing',
  currentTheme: 'darkGold',
  menuOpen: false,
  isLoading: false,

  // Onboarding state
  onboardingComplete: false,
  onboardingStep: 0,
  onboardingData: {
    name: '',
    income: 1100,
    hasDebts: true,
    coachMode: 'sargento',
    avatar: '\u{1F469}',
  },

  // Mock data
  mockUser,
  jars: mockJars,
  debts: mockDebts,
  transactions: mockTransactions,
  notifications: mockNotifications,
  coachMessages: mockCoachMessages,

  // Auth actions
  login: (user, token) => {
    localStorage.setItem('poupt_token', token);
    localStorage.setItem('poupt_user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      currentScreen: user.onboardingComplete ? 'dashboard' : 'onboarding'
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
    });
  },

  updateUser: (data) => {
    const updated = { ...get().user, ...data };
    localStorage.setItem('poupt_user', JSON.stringify(updated));
    set({ user: updated });
  },

  // Navigation
  setScreen: (screen) => set({ currentScreen: screen, menuOpen: false }),

  // Theme
  setTheme: (theme) => set({ currentTheme: theme }),

  // Menu
  setMenuOpen: (v) => set({ menuOpen: v }),

  // Onboarding
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
  setOnboardingStep: (v) => set({ onboardingStep: v }),
  setOnboardingData: (d) => set((s) => ({ onboardingData: { ...s.onboardingData, ...d } })),

  // Data actions
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((s) => ({
    transactions: [transaction, ...s.transactions]
  })),
  setDebts: (debts) => set({ debts }),
  addDebt: (debt) => set((s) => ({ debts: [...s.debts, debt] })),
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
  setInvestments: (investments) => set({ investments }),
  setNotifications: (notifications) => set({ notifications }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) => set((s) => ({
    chatMessages: [...s.chatMessages, message]
  })),
  setLoading: (isLoading) => set({ isLoading }),

  // PoupMoedas
  addPoupMoedas: (amount) =>
    set((s) => ({ mockUser: { ...s.mockUser, poupMoedas: s.mockUser.poupMoedas + amount } })),
  spendPoupMoedas: (amount) => {
    const state = get();
    if (state.mockUser.poupMoedas >= amount) {
      set((s) => ({ mockUser: { ...s.mockUser, poupMoedas: s.mockUser.poupMoedas - amount } }));
      return true;
    }
    return false;
  },

  addCoachMessage: (msg) =>
    set((s) => ({ coachMessages: [...s.coachMessages, msg] })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  // Session
  restoreSession: () => {
    const token = localStorage.getItem('poupt_token');
    const userStr = localStorage.getItem('poupt_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          currentScreen: user.onboardingComplete ? 'dashboard' : 'onboarding'
        });
      } catch {
        localStorage.removeItem('poupt_token');
        localStorage.removeItem('poupt_user');
      }
    }
  },
}));

export default useStore;
