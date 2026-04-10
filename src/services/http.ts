import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios'

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

export const isLocalMode = (): boolean => {
  const tgInitData = window.Telegram?.WebApp?.initData
  return !tgInitData || tgInitData === ''
}

// ✅ Гарантированный экспорт
export const MOCK_TOKEN = import.meta.env.VITE_MOCK_TOKEN || 'mock_token_q9830md893sn9msdmafo'

// 🔹 REQUEST INTERCEPTOR
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token')
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// 🔹 RESPONSE INTERCEPTOR
http.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status
    const message = error.response?.data?.message ?? 'Произошла ошибка сети'

    if (ENVIRONMENT === 'development') {
      console.error(`[API Error ${status}]`, message)
    }

    switch (status) {
      case 401:
        console.warn('[Auth] Unauthorized: token expired')
        localStorage.removeItem('auth_token')
        window.dispatchEvent(new CustomEvent('auth:logout'))
        break
      case 403:
        console.warn('[Auth] Forbidden')
        break
      case 404:
        console.warn('[API] Not Found')
        break
      case 429:
        console.warn('[API] Rate limit exceeded')
        break
      default:
        if (status && status >= 500) console.error('[API] Server Error:', status)
    }

    return Promise.reject(error)
  }
)

// 🔹 Универсальный wrapper (исправлены типы)
export const apiRequest = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    return (await http.request(config)) as T
  } catch (error) {
    if (axios.isAxiosError(error)) throw error
    throw error
  }
}

export const get = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiRequest<T>({ ...config, url, method: 'GET' })

export const post = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiRequest<T>({ ...config, url, method: 'POST', data })

export const put = <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
  apiRequest<T>({ ...config, url, method: 'PUT', data })

export const del = <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  apiRequest<T>({ ...config, url, method: 'DELETE' })

export const isDev = (): boolean => ENVIRONMENT === 'development'
export const isProd = (): boolean => ENVIRONMENT === 'production'