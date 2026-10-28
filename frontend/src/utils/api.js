import axios from 'axios';
import Cookies from 'js-cookie';
import { API_URL } from '../host.js';

export const TOKEN_KEY = 'imovies_token';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = Cookies.get(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or invalid session sends the person back to log in.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && Cookies.get(TOKEN_KEY)) {
      Cookies.remove(TOKEN_KEY);
      window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err) => err.response?.data?.message || 'Something went wrong. Please try again.';
export default api;
