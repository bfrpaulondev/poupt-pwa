import { create } from 'zustand';
import { themes, freeThemeKeys } from '../themes';

const DEFAULT_THEME = 'darkGold';
const TOKEN_KEY = 'poupt_token';
const USER_KEY = 'poupt_user';
const THEME_KEY = 'poupt_theme';
const OWNED_THEMES_KEY = 'poupt_owned_themes';

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeOwnedThemes = (value) => {
  const list = Array.isArray(value) ? value : [];
  return Array.from(new Set([...freeThemeKeys, ...list])).filter((key) => themes[key]);
};

const getStoredOwnedThemes = () => {
  return normalizeOwnedThemes(safeJsonParse(localStorage.getItem(OWNED_THEMES_KEY), freeThemeKeys));
};

const persistOwnedThemes = (ownedThemes) => {
  localStorage.setItem(OWNED_THEMES_KEY, JSON.stringify(normalizeOwnedThemes(ownedThemes)));
};

const getStoredTheme = () => {
  const saved = localStorage.getItem(THEME_KEY);
  return themes[saved] ? saved : DEFAULT_THEME;
};

const persistUser = (user) => {
  if (!user) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const useStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  currentScreen: 'landing',
  currentTheme: getStoredTheme(),
  ownedThemes: getStoredOwnedThemes(),
  menuOpen: false,
  isLoading: false,

  onboardingComplete: false,
  onboardingStep: 0,
  onboardingData: {
    name: '',
    income: 1100,
    hasDebts: true,
    coachMode: 'sargento',
    avatar: '👩',
  },

  defaultJarPercentages: {
    necessities: 50,
    freedom: 10,
    savings: 10,
    education: 10,
    play: 10,
    give: 10,
  },

  jars: [],
  debts: [],
  transactions: [],
  notifications: [],
  coachMessages: [],
  goals: [],
  investments: [],

  login: (user, token) => {
    const userOwnedThemes = normalizeOwnedThemes(user?.ownedThemes || user?.unlockedThemes || getStoredOwnedThemes());
    const preferredTheme = themes[user?.theme] && userOwnedThemes.includes(user.theme) ? user.theme : getStoredTheme();
    const normalizedUser = { ...user, ownedThemes: userOwnedThemes, theme: preferredTheme };

    localStorage.setItem(TOKEN_KEY, token);
    persistUser(normalizedUser);
    localStorage.setItem(THEME_KEY, preferredTheme);
    persistOwnedThemes(userOwnedThemes);

    set({
      user: normalizedUser,
      token,
      isAuthenticated: true,
      ownedThemes: userOwnedThemes,
      currentTheme: preferredTheme,
      currentScreen: normalizedUser.onboardingComplete ? 'dashboard' : 'onboarding',
    });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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
    const currentUser = get().user || {};
    const updated = { ...currentUser, ...data };

    if (data?.ownedThemes || data?.unlockedThemes) {
      updated.ownedThemes = normalizeOwnedThemes(data.ownedThemes || data.unlockedThemes);
      persistOwnedThemes(updated.ownedThemes);
    }

    persistUser(updated);
    set({
      user: updated,
      ownedThemes: normalizeOwnedThemes(updated.ownedThemes || get().ownedThemes),
    });
  },

  setScreen: (screen) => {
    window.location.hash = screen;
    set({ currentScreen: screen, menuOpen: false });
  },

  isThemeOwned: (themeId) => {
    if (!themes[themeId]) return false;
    if (!themes[themeId].premium || themes[themeId].price === 0) return true;
    const user = get().user;
    if (user?.plan === 'premium' || user?.plan === 'pro') return true;
    return get().ownedThemes.includes(themeId);
  },

  setTheme: (themeId) => {
    if (!themes[themeId]) return false;
    if (!get().isThemeOwned(themeId)) return false;

    localStorage.setItem(THEME_KEY, themeId);
    const user = get().user;
    if (user) {
      const updatedUser = { ...user, theme: themeId };
      persistUser(updatedUser);
      set({ user: updatedUser, currentTheme: themeId });
      return true;
    }

    set({ currentTheme: themeId });
    return true;
  },

  unlockTheme: (themeId) => {
    if (!themes[themeId]) return false;
    const ownedThemes = normalizeOwnedThemes([...get().ownedThemes, themeId]);
    persistOwnedThemes(ownedThemes);

    const user = get().user;
    if (user) {
      const updatedUser = { ...user, ownedThemes };
      persistUser(updatedUser);
      set({ user: updatedUser, ownedThemes });
      return true;
    }

    set({ ownedThemes });
    return true;
  },

  buyTheme: (themeId) => {
    const theme = themes[themeId];
    if (!theme) return { ok: false, reason: 'Tema inválido.' };
    if (get().isThemeOwned(themeId)) {
      get().setTheme(themeId);
      return { ok: true, reason: 'Tema aplicado.' };
    }

    const cost = theme.price || 0;
    const balance = get().user?.poupMoedas || 0;

    if (balance < cost) {
      return { ok: false, reason: 'PoupMoedas insuficientes.' };
    }

    get().updateUser({ poupMoedas: balance - cost });
    get().unlockTheme(themeId);
    get().setTheme(themeId);

    return { ok: true, reason: 'Tema comprado e aplicado.' };
  },

  setMenuOpen: (v) => set({ menuOpen: v }),

  setOnboardingComplete: (v) => set({ onboardingComplete: v }),
  setOnboardingStep: (v) => set({ onboardingStep: v }),
  setOnboardingData: (d) => set((s) => ({ onboardingData: { ...s.onboardingData, ...d } })),

  setJars: (jars) => set({ jars }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((s) => ({ transactions: [transaction, ...s.transactions] })),
  setDebts: (debts) => set({ debts }),
  addDebt: (debt) => set((s) => ({ debts: [...s.debts, debt] })),
  setGoals: (goals) => set({ goals }),
  addGoal: (goal) => set((s) => ({ goals: [...s.goals, goal] })),
  setInvestments: (investments) => set({ investments }),
  setNotifications: (notifications) => set({ notifications }),
  setLoading: (isLoading) => set({ isLoading }),

  addPoupMoedas: (amount) => {
    const current = get().user?.poupMoedas || 0;
    get().updateUser({ poupMoedas: current + amount });
  },

  spendPoupMoedas: (amount) => {
    const current = get().user?.poupMoedas || 0;
    if (current < amount) return false;
    get().updateUser({ poupMoedas: current - amount });
    return true;
  },

  setCoachMessages: (messages) => set({ coachMessages: messages }),
  addCoachMessage: (msg) => set((s) => ({ coachMessages: [...s.coachMessages, msg] })),

  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n)),
    })),

  restoreSession: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (!token || !userStr) return;

    try {
      const user = JSON.parse(userStr);
      const ownedThemes = normalizeOwnedThemes(user.ownedThemes || user.unlockedThemes || getStoredOwnedThemes());
      const savedTheme = getStoredTheme();
      const preferredTheme = themes[user.theme] && ownedThemes.includes(user.theme) ? user.theme : savedTheme;
      const currentTheme = ownedThemes.includes(preferredTheme) || !themes[preferredTheme]?.premium ? preferredTheme : DEFAULT_THEME;
      const hash = window.location.hash.slice(1);
      const screen = hash || (user.onboardingComplete ? 'dashboard' : 'onboarding');
      const normalizedUser = { ...user, ownedThemes, theme: currentTheme };

      persistUser(normalizedUser);
      persistOwnedThemes(ownedThemes);
      localStorage.setItem(THEME_KEY, currentTheme);

      set({
        user: normalizedUser,
        token,
        isAuthenticated: true,
        ownedThemes,
        currentTheme,
        currentScreen: screen,
      });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
}));

export default useStore;
