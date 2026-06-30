import axios from 'axios';

// Automatically toggles between your local machine and production Render server URLs
const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost';

// Define your base URLs for both environments
const BASE_SIGNAL_URL = isProduction 
  ? 'https://onrender.com' // Appended the endpoint path for your live Node service
  : 'http://localhost:3001/api/signals';

const BASE_USER_URL = isProduction 
  ? 'https://finscope-w5th.onrender.com'             // Swapped with your actual Node server live link
  : 'http://localhost:3001';

// Technical Trading Signals Client Ingestion Instance
export const api = axios.create({
  baseURL: BASE_SIGNAL_URL,
  withCredentials: true
});

// User Identity & Watchlist Profiling Account Instance
export const userApi = axios.create({
  baseURL: BASE_USER_URL,
  withCredentials: true
});
