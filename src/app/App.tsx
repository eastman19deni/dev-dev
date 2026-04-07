import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';
import { useTelegram } from './hooks/useTelegram';
import { useAuth } from './hooks/useAuth';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AuthPage } from './pages/AuthPage';

export default function App() {
  const telegram = useTelegram();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Инициализация Telegram Web App при загрузке
    if (telegram.isReady) {
      console.log('Telegram Web App initialized');
      console.log('User:', telegram.user);
      console.log('Platform:', telegram.platform);
    }
  }, [telegram.isReady]);

  // Показываем WelcomeScreen при первой загрузке
  if (showWelcome) {
    return <WelcomeScreen onComplete={() => setShowWelcome(false)} />;
  }

  // Показываем AuthPage пока идет аутентификация или при ошибке
  if (isLoading || !isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}