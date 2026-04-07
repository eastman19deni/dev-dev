import { useState, useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';
import { authApi, userApi } from '../../services/api';
import { isLocalMode, MOCK_TOKEN } from '../../services/http';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useAuth() {
  const telegram = useTelegram();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Проверяем наличие JWT токена
      const existingToken = localStorage.getItem('auth_token');

      if (existingToken) {
        // Токен есть - проверяем валидность через /users/me
        console.log('[Auth] Found existing token, verifying...')
        const userData = await userApi.getMe();
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return;
      }

      // Токена нет - авторизуемся
      console.log('[Auth] No token, authenticating...')

      // Получаем initData напрямую из window.Telegram
      const tgInitData = window.Telegram?.WebApp?.initData;
      const localMode = !tgInitData || tgInitData === '';

      if (localMode) {
        // Локальный режим - используем mock token
        console.log('[Auth] Local mode: authenticating with mock token')
        const { token, user } = await authApi.login(MOCK_TOKEN);
        localStorage.setItem('auth_token', token);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        // Mini App режим - используем Telegram initData
        console.log('[Auth] Mini App mode: authenticating with initData')
        const { token, user } = await authApi.login(tgInitData);
        localStorage.setItem('auth_token', token);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      localStorage.removeItem('auth_token');
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: error?.message || 'Ошибка авторизации',
      });
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    checkAuth,
    logout,
    telegramUser: telegram.user,
    isTelegramReady: telegram.isReady,
  };
}