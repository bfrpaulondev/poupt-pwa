import { create } from 'zustand';

const useStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  transactions: [],
  debts: [],
  goals: [],
  investments: [],
  notifications: [],
  chatMessages: [],

  currentScreen: 'landing',
  theme: 'ouro-escuro',
  isLoading: false,

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
      transactions: [],
      debts: [],
      goals: [],
      investments: [],
      notifications: [],
      chatMessages: [],
      currentScreen: 'landing'
    });
  },

  updateUser: (data) => {
    const updated = { ...get().user, ...data };
    localStorage.setItem('poupt_user', JSON.stringify(updated));
    set({ user: updated });
  },

  setScreen: (screen) => set({ currentScreen: screen }),

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

  getModeColor: () => {
    const mode = get().user?.financialMode;
    const colors = {
      sobrevivencia: 'var(--mode-sobrevivencia)',
      recuperacao: 'var(--mode-recuperacao)',
      estabilidade: 'var(--mode-estabilidade)',
      crescimento: 'var(--mode-crescimento)',
      prosperidade: 'var(--mode-prosperidade)'
    };
    return colors[mode] || 'var(--gold)';
  },

  getModeLabel: () => {
    const mode = get().user?.financialMode;
    const labels = {
      sobrevivencia: 'Sobrevivencia',
      recuperacao: 'Recuperacao',
      estabilidade: 'Estabilidade',
      crescimento: 'Crescimento',
      prosperidade: 'Prosperidade'
    };
    return labels[mode] || 'Sobrevivencia';
  }
}));

export default useStore;
