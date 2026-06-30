import axios from 'axios'


export const api = axios.create({
  baseURL: 'http://localhost:3001/api/signals',
  withCredentials: true

  
})

export const userApi = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true
})


