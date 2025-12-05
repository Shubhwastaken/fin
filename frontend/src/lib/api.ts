import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests (commented out for demo)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/api/auth/login', new URLSearchParams({ username: email, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (email: string, password: string, full_name: string) =>
    api.post('/api/auth/register', { email, password, full_name }),
  getCurrentUser: () => api.get('/api/auth/me'),
};

// Dashboard APIs
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getAssetAllocation: () => api.get('/api/dashboard/asset-allocation'),
  getMemberAllocation: () => api.get('/api/dashboard/member-allocation'),
  getTopPerformers: (limit = 5) => api.get(`/api/dashboard/top-performers?limit=${limit}`),
  getWorstPerformers: (limit = 5) => api.get(`/api/dashboard/worst-performers?limit=${limit}`),
};

// Goals APIs
export const goalsAPI = {
  getAllGoals: () => api.get('/api/goals/'),
  getGoalDetails: (goalId: number) => api.get(`/api/goals/${goalId}`),
  createGoal: (goalData: any) => api.post('/api/goals/', goalData),
  updateGoal: (goalId: number, goalData: any) => api.put(`/api/goals/${goalId}`, goalData),
  deleteGoal: (goalId: number) => api.delete(`/api/goals/${goalId}`),
  getGoalHistory: (goalId: number) => api.get(`/api/goals/${goalId}/history`),
  runSimulation: (goalId: number, numSimulations = 5000) =>
    api.post(`/api/goals/${goalId}/simulate`, { goal_id: goalId, num_simulations: numSimulations }),
  getRescueStrategies: (goalId: number) => api.get(`/api/goals/${goalId}/rescue-strategies`),
};

// Portfolio APIs
export const portfolioAPI = {
  getSummary: () => api.get('/api/portfolio/summary'),
  getAllInvestments: () => api.get('/api/portfolio/investments'),
  getAllPortfolios: () => api.get('/api/family/portfolios'),
  getInvestmentDetails: (investmentId: number) =>
    api.get(`/api/portfolio/investments/${investmentId}`),
  createInvestment: (investmentData: any) => api.post('/api/portfolio/investments', investmentData),
  updateInvestment: (investmentId: number, investmentData: any) =>
    api.put(`/api/portfolio/investments/${investmentId}`, investmentData),
  deleteInvestment: (investmentId: number) =>
    api.delete(`/api/portfolio/investments/${investmentId}`),
  getInvestmentTransactions: (investmentId: number) =>
    api.get(`/api/portfolio/investments/${investmentId}/transactions`),
  createTransaction: (transactionData: any) =>
    api.post('/api/portfolio/transactions', transactionData),
  getAssetClasses: () => api.get('/api/portfolio/asset-classes'),
};

// Family APIs
export const familyAPI = {
  getAllMembers: () => api.get('/api/family/members'),
  getMembers: () => api.get('/api/family/members'),
  getMemberDetails: (memberId: number) => api.get(`/api/family/members/${memberId}`),
  createMember: (memberData: any) => api.post('/api/family/members', memberData),
  updateMember: (memberId: number, memberData: any) =>
    api.put(`/api/family/members/${memberId}`, memberData),
  deleteMember: (memberId: number) => api.delete(`/api/family/members/${memberId}`),
  getPortfolios: () => api.get('/api/family/portfolios'),
  createPortfolio: (portfolioData: any) => api.post('/api/family/portfolios', portfolioData),
};

// Market Data APIs - Real-time stock prices
export const marketAPI = {
  getIndices: (indices: string = 'NIFTY50,SENSEX,BANKNIFTY') => 
    api.get(`/api/market/indices?indices=${indices}`),
  getStockPrice: (symbol: string, exchange: string = 'NS') => 
    api.get(`/api/market/stock/${symbol}?exchange=${exchange}`),
  getMutualFundNav: (schemeCode: string) => 
    api.get(`/api/market/mutual-fund/${schemeCode}`),
  getPortfolioRealtime: () => 
    api.get('/api/market/portfolio/realtime'),
  getMultipleStocks: (symbols: string[], exchange: string = 'NS') => 
    api.post('/api/market/stocks/batch', symbols, { params: { exchange } }),
};

export default api;
