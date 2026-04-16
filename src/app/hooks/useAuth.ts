import { useState, useEffect, useCallback } from 'react'
import { useTelegram } from './useTelegram'
import { authApi, userApi } from '../../services/api'
import { isLocalMode, MOCK_TOKEN } from '../../services/http'
import type { User } from '../../app/types' // 🔥 Используем правильные типы

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export function useAuth() {
  const telegram = useTelegram()
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Пробуем получить данные пользователя
      // Если кука есть - сервер вернет данные, если нет - 401
      try {
        const userData = await userApi.getMe()
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        })
        return
      } catch (error: any) {
        // 401 - нужно авторизоваться
        if (error.response?.status !== 401) {
          throw error
        }
      }

      // Авторизуемся
      console.log('[Auth] Authenticating...')
      
      const tgInitData = window.Telegram?.WebApp?.initData
      const localMode = !tgInitData || tgInitData === ''

      const authData = localMode ? MOCK_TOKEN : tgInitData
      const mode = localMode ? 'Local' : 'Mini App'
      
      console.log(`[Auth] ${mode} mode: authenticating`)
      const response = await authApi.login(authData)
      
      // После успешной авторизации получаем данные пользователя
      const userData = await userApi.getMe()
      
      setState({
        user: userData,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      })
    } catch (error: any) {
      console.error('Auth error:', error)
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error?.message || 'Ошибка авторизации',
      })
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      // Вызываем endpoint логаута если есть
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(() => {})
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      })
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    ...state,
    checkAuth,
    logout,
    telegramUser: telegram.user,
    isTelegramReady: telegram.isReady,
  }
}