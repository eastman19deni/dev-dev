import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './pages/AuthPage';

const WELCOME_SEEN_KEY = 'tipbot_welcome_seen';

export default function App() {
  const telegram = useTelegram();
  const { isAuthenticated, isLoading, user, error, checkAuth } = useAuth();
  const [showWelcome, setShowWelcome] = useState(() => {
    // Проверяем, видел ли пользователь приветствие
    const seen = localStorage.getItem(WELCOME_SEEN_KEY);
    return seen !== 'true';
  });

  useEffect(() => {
    // Инициализация Telegram Web App при загрузке
    if (telegram.isReady) {
      console.log('[App] Telegram Web App initialized');
      console.log('[App] User:', telegram.user);
      console.log('[App] Platform:', telegram.platform);
    }
  }, [telegram.isReady]);

  const handleWelcomeComplete = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setShowWelcome(false);
  };

  // Показываем WelcomeScreen только при первом посещении
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  // Показываем AuthPage пока идет аутентификация или при ошибке
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Если не авторизован - показываем AuthPage с возможностью повторной попытки
  if (!isAuthenticated) {
    return (
      <AuthPage 
        error={error}
        isTelegramReady={telegram.isReady}
        telegramUser={telegram.user}
        onRetry={checkAuth}
      />
    );
  }

  // Пользователь авторизован - показываем основное приложение
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-center"
        richColors
        expand={false}
        duration={3000}
      />
    </>
  );
}