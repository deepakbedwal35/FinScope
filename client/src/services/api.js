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

export const api = axios.create({
  baseURL: BASE_SIGNAL_URL, 
  withCredentials: true
});


export const userApi = axios.create({
  baseURL: BASE_USER_URL, 
  withCredentials: true
});
