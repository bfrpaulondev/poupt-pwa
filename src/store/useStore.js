import { create } from 'zustand';
import { themes } from '../themes';

const useStore = create((set, get) => ({
  // Auth state
  user: null,
  token: null,
  isAuthenticated: false,

  // App state
  currentScreen: 'landing',
  currentTheme: localStorage.getItem('poupt_theme') || 'cleanFinance',
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
    avatar: '👩',
  },

  // Default jar percentages (must total 100%)
  defaultJarPercentages: {
    necessities: 50, freedom: 10, savings: 10, education: 10, play: 10, give: 10
  },

  // Data (fetched from API)
  jars: [],
  debts: [],
  transactions: [],
  notifications: [],
  coachMessages: [],
  goals: [],
  investments: [],

  // Auth actions
  login: (user, token) => {
    localStorage.setItem('poupt_token', token);
    localStorage.setItem('poupt_user', JSON.stringify(user));
    if (user.theme && themes[user.theme]) {
      localStorage.setItem('poupt_theme', user.theme);
    }
    set({
      user,
      token,
      isAuthenticated: true,
      currentTheme: (user.theme && themes[user.theme]) ? user.theme : get().currentTheme,
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
      jars: [],
      debts: [],
      transactions: [],
      notifications: [],
      coachMessages: [],
      goals: [],
      investments: [],
    });
  },

  updateUser: (data) => {
    const updated = { ...get().user, ...data };
    localStorage.setItem('poupt_user', JSON.stringify(updated));
    set({ user: updated });
  },

  // Navigation
  setScreen: (screen) => {
    window.location.hash = screen;
    set({ currentScreen: screen, menuOpen: false });
  },

  // Theme (persisted)
  setTheme: (theme) => {
    localStorage.setItem('poupt_theme', theme);
    set({ currentTheme: theme });
  },

  // Menu
  setMenuOpen: (v) => set({ menuOpen: v }),

  // Onboarding
  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
  setOnboardingStep: (v) => set({ onboardingStep: v }),
  setOnboardingData: (d) => set((s) => ({ onboardingData: { ...s.onboardingData, ...d } })),

  // Data actions
  setJars: (jars) => set({ jars }),
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
  setLoading: (isLoading) => set({ isLoading }),

  // PoupMoedas (update user object)
  addPoupMoedas: (amount) => {
    const current = get().user?.poupMoedas || 0;
    get().updateUser({ poupMoedas: current + amount });
  },
  spendPoupMoedas: (amount) => {
    const current = get().user?.poupMoedas || 0;
    if (current >= amount) {
      get().updateUser({ poupMoedas: current - amount });
      return true;
    }
    return false;
  },

  setCoachMessages: (messages) => set({ coachMessages: messages }),
  addCoachMessage: (msg) =>
    set((s) => ({ coachMessages: [...s.coachMessages, msg] })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        (n._id || n.id) === id ? { ...n, read: true } : n
      ),
    })),

  // Session restore
  restoreSession: () => {
    const token = localStorage.getItem('poupt_token');
    const userStr = localStorage.getItem('poupt_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const savedTheme = localStorage.getItem('poupt_theme') || user.theme || 'cleanFinance';

        // Check hash for deep link navigation
        const hash = window.location.hash.slice(1);
        const screen = hash || (user.onboardingComplete ? 'dashboard' : 'onboarding');

        set({
          user,
          token,
          isAuthenticated: true,
          currentTheme: (savedTheme && themes[savedTheme]) ? savedTheme : 'cleanFinance',
          currentScreen: screen
        });
      } catch {
        localStorage.removeItem('poupt_token');
        localStorage.removeItem('poupt_user');
      }
    }
  },
}));

export default useStore;
