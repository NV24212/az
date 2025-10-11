import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

export const classService = {};
export const adminService = {};
export const weekService = {};

export default api;
