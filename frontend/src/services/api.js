import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const historyApi = {
  getAll: () => api.get('/history'),
  save: (data) => api.post('/history', data),
  remove: (id) => api.delete(`/history/${id}`),
};

export const llmApi = {
  testConnection: (provider) => api.post('/llm/test-connection', { provider }),
  generate: (data) => api.post('/llm/generate', data),
  chat: (data) => api.post('/llm/chat', data),
};

export default api;
