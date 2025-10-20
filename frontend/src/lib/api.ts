import axios from 'axios'
import { getToken } from './auth'

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://api.azhar.store'

export const api = axios.create({ baseURL: API_BASE })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
