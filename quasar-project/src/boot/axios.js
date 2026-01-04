import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Create Axios instance
export const api = axios.create({
  baseURL: 'http://localhost:3000/api' // your Express backend
})

// Attach JWT automatically to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token') // or sessionStorage, wherever you store JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default boot(({ app }) => {
  // optional: make api available globally
  app.config.globalProperties.$api = api
})