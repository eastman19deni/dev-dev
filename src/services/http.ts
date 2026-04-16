import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://dev.api.tipbot.qu1nqqy.ru'
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin
export const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'development'

if (ENVIRONMENT === 'development') {
  console.log(`[HTTP] Environment: ${ENVIRONMENT}`)
  console.log(`[HTTP] API URL: ${API_BASE_URL}`)
  console.log(`[HTTP] Frontend URL: ${FRONTEND_URL}`)
}

// Создаем экземпляр axios с включенной передачей кук
export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Origin': FRONTEND_URL,
    'X-Environment': ENVIRONMENT,
  },
  timeout: 10000,
  withCredentials: true, // 🔥 КРИТИЧНО: включаем передачу кук
})

// Определяем режим работы
export const isLocalMode = () => {
  const tgInitData = window.Telegram?.WebApp?.initData
  return !tgInitData || tgInitData === ''
}

// Mock token для локальной разработки
export const MOCK_TOKEN = import.meta.env.VITE_MOCK_TOKEN || 'mock_token_q9830md893sn9msdmafo'

// Request interceptor - больше НЕ добавляем Authorization заголовок
// Куки будут отправляться автоматически браузером
http.interceptors.request.use(
  (config) => {
    // При куках токен в заголовке не нужен
    // Браузер сам отправит куки
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor - обрабатываем ошибки
http.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const status = error.response?.status
    const data = error.response?.data as { message?: string } | undefined
    const message = data?.message ?? 'Произошла ошибка'

    if (ENVIRONMENT === 'development') {
      console.error(`[API Error ${status}]`, message)
    }

    // При 401 просто логируем, редирект должен быть на уровне приложения
    if (status === 401) {
      console.warn('Unauthorized: session expired or not authenticated')
      // Не трогаем localStorage, куки управляются сервером
    }
    if (status === 403) {
      console.warn('Forbidden: insufficient permissions')
    }
    if (status === 404) {
      console.warn('Not Found:', error.config?.url)
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

// Вспомогательные функции
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig = {}
): Promise<T> => {
  return http.request<T>(config) as Promise<T>
}

export const get = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'GET' })
}

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'POST', data })
}

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'PUT', data })
}

export const del = <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return apiRequest<T>({ ...config, url, method: 'DELETE' })
}

export const isDev = () => ENVIRONMENT === 'development'
export const isProd = () => ENVIRONMENT === 'production'