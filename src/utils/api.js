import axios from 'axios'

const api = axios.create({
  // baseURL: process.env.REACT_APP_BASE_URL, works for CRA not typescript or vite
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
})
