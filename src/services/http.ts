
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'


export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tipbot.qu1nqqy.ru'
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development'


if (ENVIRONMENT === 'development') {
  console.log(`[HTTP] Environment: ${ENVIRONMENT}`)
  console.log(`[HTTP] API URL: ${API_BASE_URL}`)
  console.log(`[HTTP] Frontend URL: ${FRONTEND_URL}`)
}


export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Origin': FRONTEND_URL,
    'X-Environment': ENVIRONMENT,
  },
  timeout: 10000,
  withCredentials: false,
})

// Определяем режим работы: local или miniapp
export const isLocalMode = () => {
  const tgInitData = window.Telegram?.WebApp?.initData
  return !tgInitData || tgInitData === ''
}

// Mock token для локальной разработки
export const MOCK_TOKEN = import.meta.env.VITE_MOCK_TOKEN || 'mock_token_q9830md893sn9msdmafo'

// Request interceptor - только JWT авторизация
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)


http.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as { message?: string } | undefined
    const message = data?.message ?? 'Произошла ошибка'


    if (ENVIRONMENT === 'development') {
      console.error(`[API Error ${status}]`, message)
    }

    if (status === 401) {
      console.warn('Unauthorized: token expired')
      localStorage.removeItem('auth_token')
      // Не делаем редирект здесь — это делает AuthContext
    }
    if (status === 403) {
      console.warn('Forbidden: insufficient permissions')
    }
    if (status === 404) {
      console.warn('Not Found: resource not found')
    }
    if (status === 429) {
      console.warn('Too Many Requests: rate limit exceeded')
    }
    if (status && status >= 500) {
      console.error('Server Error:', status)
    }

    return Promise.reject(error)
  }
)


export const apiRequest = async <T = any>(
  config: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    const response = await http.request<T>(config)
    return response as T
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error
    }
    throw error
  }
}


export const get = <T = any>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'GET' })
}

export const post = <T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'POST', data })
}

export const put = <T = any>(
  url: string, 
  data?: any, 
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'PUT', data })
}

export const del = <T = any>(
  url: string, 
  config?: AxiosRequestConfig
): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'DELETE' })
}


export const isDev = () => ENVIRONMENT === 'development'
export const isProd = () => ENVIRONMENT === 'production'