import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API = axios.create({ baseURL });

// Add token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth
export const login = (credentials) => API.post('/auth/login', credentials);
export const register = (userData) => API.post('/auth/register', userData);

// Items
export const getItems = () => API.get('/items');
export const getItem = (id) => API.get(`/items/${id}`);
export const createItem = (data) => API.post('/items', data);
export const updateItem = (id, data) => API.put(`/items/${id}`, data);
export const deleteItem = (id) => API.delete(`/items/${id}`);
export const scanItem = (data) => API.post('/items/scan', data);
export const searchItems = (query) => API.get(`/items/search?q=${query}`);

// Transactions
export const getTransactions = () => API.get('/transactions');
export const createTransaction = (data) => API.post('/transactions', data);