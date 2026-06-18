import axios from 'axios';

export const api = axios.create({
  baseURL:
    (import.meta as any).env.VITE_API_BASE_URL ||
    'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});