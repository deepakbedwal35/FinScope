import axios from 'axios';


const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';


const BASE_SIGNAL_URL = isLocalhost
  ? 'http://localhost:3001/api/signals'
  : 'https://finscope-w5th.onrender.com/api/signals';

const BASE_USER_URL = isLocalhost 
  ? 'http://localhost:3001'             
  : 'https://finscope-w5th.onrender.com';

// 🟢 Access Token storage helpers
export const getAccessToken = () => {
  return localStorage.getItem("accessToken") || localStorage.getItem("token") || null;
};

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("token", token);
  } else {
    removeAccessToken();
  }
};

export const removeAccessToken = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("token");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("token");
};

export const api = axios.create({
  baseURL: BASE_SIGNAL_URL, 
  withCredentials: true
});


export const userApi = axios.create({
  baseURL: BASE_USER_URL, 
  withCredentials: true
});

// 🟢 Request interceptor: attach Access Token as Bearer token to all outgoing requests
const attachAuthToken = (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
userApi.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));

// 🟢 Response interceptor: handle 401 unauthenticated session expiry
const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    const url = error.config?.url || '';
    if (url.includes('/user/check-auth')) {
      removeAccessToken();
    }
  }
  return Promise.reject(error);
};

api.interceptors.response.use((res) => res, handleAuthError);
userApi.interceptors.response.use((res) => res, handleAuthError);
