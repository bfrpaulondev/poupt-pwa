const API_BASE = import.meta.env.VITE_API_URL || 'https://poupt-api-3tyo.onrender.com/api';

const getHeaders = () => {
  const token = localStorage.getItem('poupt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: getHeaders(),
    credentials: 'include',
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisicao');
  }

  return data;
};

export const api = {
  // Auth
  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: { name, email, password } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  googleAuth: (name, email, googleId) =>
    request('/auth/google-auth', { method: 'POST', body: { name, email, googleId } }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  getMe: () => request('/auth/me'),

  updateMe: (data) => request('/auth/me', { method: 'PUT', body: data }),

  updateMode: (financialMode) =>
    request('/auth/me/mode', { method: 'PUT', body: { financialMode } }),

  updateCoach: (data) =>
    request('/auth/me/coach', { method: 'PUT', body: data }),

  completeOnboarding: (data) =>
    request('/auth/me/onboarding', { method: 'PUT', body: data }),

  // Transactions
  getTransactions: (params = '') =>
    request(`/transactions${params}`),

  createTransaction: (data) =>
    request('/transactions', { method: 'POST', body: data }),

  updateTransaction: (id, data) =>
    request(`/transactions/${id}`, { method: 'PUT', body: data }),

  deleteTransaction: (id) =>
    request(`/transactions/${id}`, { method: 'DELETE' }),

  getTransactionSummary: (params = '') =>
    request(`/transactions/summary${params}`),

  // Debts
  getDebts: (params = '') => request(`/debts${params}`),
  createDebt: (data) => request('/debts', { method: 'POST', body: data }),
  updateDebt: (id, data) => request(`/debts/${id}`, { method: 'PUT', body: data }),
  deleteDebt: (id) => request(`/debts/${id}`, { method: 'DELETE' }),
  addDebtPayment: (id, amount, notes) =>
    request(`/debts/${id}/payment`, { method: 'POST', body: { amount, notes } }),
  getSnowballOrder: (extraBudget) =>
    request(`/debts/snowball${extraBudget ? `?extraBudget=${extraBudget}` : ''}`),
  getInformalDebts: () => request('/debts/informal'),
  createInformalDebt: (data) =>
    request('/debts/informal', { method: 'POST', body: { ...data, type: 'informal' } }),

  // Goals
  getGoals: () => request('/goals'),
  createGoal: (data) => request('/goals', { method: 'POST', body: data }),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: data }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),

  // Coach
  coachChat: (message) =>
    request('/coach/chat', { method: 'POST', body: { message } }),
  getCoachHistory: () => request('/coach/history'),
  clearCoachHistory: () => request('/coach/history', { method: 'DELETE' }),

  // Investments
  getInvestments: () => request('/investments'),
  createInvestment: (data) =>
    request('/investments', { method: 'POST', body: data }),
  updateInvestment: (id, data) =>
    request(`/investments/${id}`, { method: 'PUT', body: data }),
  deleteInvestment: (id) =>
    request(`/investments/${id}`, { method: 'DELETE' }),

  // PoupMoedas
  getMoedasBalance: () => request('/moedas/balance'),
  earnMoedas: (action, amount) =>
    request('/moedas/earn', { method: 'POST', body: { action, amount } }),
  spendMoedas: (feature) =>
    request('/moedas/spend', { method: 'POST', body: { feature } }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    request('/notifications/read-all', { method: 'PUT' }),

  // Reports
  getReportSummary: () => request('/reports/summary'),
  getReportMonthly: (month, year) =>
    request(`/reports/monthly?month=${month}&year=${year}`),
  getDebtProgress: () => request('/reports/debt-progress'),

  // Mode Detection
  detectMode: () => request('/auth/me/detect-mode', { method: 'POST' }),

  // Creditor Interactions
  getCreditors: () => request('/creditors'),
  createCreditor: (data) => request('/creditors', { method: 'POST', body: data }),
  updateCreditor: (id, data) => request(`/creditors/${id}`, { method: 'PUT', body: data }),

  // Password Reset
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'PUT', body: { token, password } }),

  // Snowball Detailed
  getSnowballDetailed: (extraBudget) =>
    request(`/debts/snowball-detailed${extraBudget ? `?extraBudget=${extraBudget}` : ''}`),

  // Goal Progress
  updateGoalProgress: (id, amount) =>
    request(`/goals/${id}/progress`, { method: 'POST', body: { amount } }),

  // Export data
  exportCSV: (type = 'transactions', month, year) =>
    request(`/reports/export?type=${type}${month ? `&month=${month}` : ''}${year ? `&year=${year}` : ''}`),

  // Recurring transactions
  createRecurringTransaction: (data) =>
    request('/transactions', { method: 'POST', body: { ...data, isRecurring: true } }),
};
