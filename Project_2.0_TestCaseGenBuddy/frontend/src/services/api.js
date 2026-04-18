import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.PROD ? 'https://tc-backend-mu.vercel.app/api' : 'http://localhost:5006/api',
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

export const templatesApi = {
  getAll: () => api.get('/templates'),
  save: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  remove: (id) => api.delete(`/templates/${id}`),
};

export const contextApi = {
  getAll: () => api.get('/context'),
  save: (data) => api.post('/context', data),
  update: (id, data) => api.put(`/context/${id}`, data),
  remove: (id) => api.delete(`/context/${id}`),
};

export default api;
