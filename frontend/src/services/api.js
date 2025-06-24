import axios from 'axios';
import { store } from '../store/store'; // Import the store

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'; // Your backend URL

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include the token on every request
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;