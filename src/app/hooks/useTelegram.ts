import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Инициализация Telegram Web App (без падения в браузере/эмуляторе)
    if (!WebApp || typeof WebApp.ready !== 'function') return;

    try {
      WebApp.ready();

      // Расширяем на весь экран
      if (typeof WebApp.expand === 'function') {
        WebApp.expand();
      }

      // Устанавливаем цвета
      if (typeof WebApp.setHeaderColor === 'function') {
        WebApp.setHeaderColor('#6366f1');
      }
      if (typeof WebApp.setBackgroundColor === 'function') {
        WebApp.setBackgroundColor('#f9fafb');
      }

      setIsReady(true);

      console.log('Telegram Web App initialized');
      console.log('User:', WebApp.initDataUnsafe?.user);
      console.log('Platform:', WebApp.platform);
      console.log('InitData:', WebApp.initData);
    } catch (error) {
      console.error('Telegram Web App init error:', error);
      setIsReady(false);
    }
  }, []);

  return {
    // Основные данные
    webApp: WebApp,
    isReady,
    user: WebApp?.initDataUnsafe?.user,
    initData: WebApp?.initData,
    initDataUnsafe: WebApp?.initDataUnsafe,

    // Утилиты
    showAlert: (message: string) => WebApp?.showAlert?.(message),
    showConfirm: (message: string) => WebApp?.showConfirm?.(message),
    showPopup: (params: { title?: string; message: string; buttons?: any[] }) =>
      WebApp?.showPopup?.(params),

    // Haptic feedback
    hapticFeedback: {
      impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') =>
        WebApp?.HapticFeedback?.impactOccurred?.(style),
      notificationOccurred: (type: 'error' | 'success' | 'warning') =>
        WebApp?.HapticFeedback?.notificationOccurred?.(type),
      selectionChanged: () => WebApp?.HapticFeedback?.selectionChanged?.(),
    },

    // Управление
    close: () => WebApp?.close?.(),
    openLink: (
      url: string,
      options?: Parameters<typeof WebApp.openLink>[1],
    ) => WebApp?.openLink?.(url, options),
    openTelegramLink: (url: string) => WebApp?.openTelegramLink?.(url),

    // Main Button
    MainButton: {
      show: () => WebApp?.MainButton?.show?.(),
      hide: () => WebApp?.MainButton?.hide?.(),
      setText: (text: string) => WebApp?.MainButton?.setText?.(text),
      onClick: (callback: () => void) => WebApp?.MainButton?.onClick?.(callback),
      offClick: (callback: () => void) => WebApp?.MainButton?.offClick?.(callback),
      enable: () => WebApp?.MainButton?.enable?.(),
      disable: () => WebApp?.MainButton?.disable?.(),
      showProgress: () => WebApp?.MainButton?.showProgress?.(),
      hideProgress: () => WebApp?.MainButton?.hideProgress?.(),
    },

    // Back Button
    BackButton: {
      show: () => WebApp?.BackButton?.show?.(),
      hide: () => WebApp?.BackButton?.hide?.(),
      onClick: (callback: () => void) => WebApp?.BackButton?.onClick?.(callback),
      offClick: (callback: () => void) => WebApp?.BackButton?.offClick?.(callback),
    },

    // Cloud Storage (для сохранения данных)
    CloudStorage: {
      setItem: (key: string, value: string) =>
        WebApp?.CloudStorage?.setItem?.(key, value),
      getItem: (key: string) =>
        WebApp?.CloudStorage?.getItem?.(key),
      removeItem: (key: string) =>
        WebApp?.CloudStorage?.removeItem?.(key),
    },

    // Проверка платформы
    platform: WebApp?.platform || 'unknown',
    version: WebApp?.version || '0.0',
    colorScheme: WebApp?.colorScheme || 'light',
  };
}