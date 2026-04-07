import { motion } from 'motion/react';
import { Lock, AlertCircle, RefreshCw, Monitor } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AuthPage() {
  const { error, checkAuth, isTelegramReady, telegramUser } = useAuth();

  const handleRetry = () => {
    checkAuth();
  };

  const isLocalMode = () => {
    const tgInitData = window.Telegram?.WebApp?.initData
    return !tgInitData || tgInitData === ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          animate={{
            rotate: 720,
          }}
          transition={{
            duration: 2,
            ease: 'linear',
          }}
          className="inline-flex items-center justify-center w-32 h-32 bg-white/50 backdrop-blur-sm rounded-full mb-6 overflow-hidden shadow-lg"
        >
          <img
            src="/snack.webp"
            alt="Логотип"
            className="w-32 h-32 rounded-full object-cover object-[50%_100%]"
          />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Донаты для стримеров</h1>
        <p className="text-gray-600 mb-8">Загрузка...</p>

        {/* Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {isLocalMode() ? (
            // Локальный режим
            <>
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-4">
                <Monitor className="w-5 h-5" />
                <span className="font-medium">Локальный режим (mock token)</span>
              </div>
              <p className="text-sm text-gray-500">
                Используется токен для локальной разработки
              </p>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-3">
                  {error}
                </p>
              )}
              {error && (
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-3"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Повторить</span>
                </button>
              )}
            </>
          ) : isTelegramReady && telegramUser ? (
            // Mini App режим - Telegram подключен
            <>
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <Lock className="w-5 h-5" />
                <span className="font-medium">Telegram подключен</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                {telegramUser.photo_url && (
                  <img
                    src={telegramUser.photo_url}
                    alt={telegramUser.first_name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="text-left">
                  <p className="font-semibold">
                    {telegramUser.first_name} {telegramUser.last_name}
                  </p>
                  {telegramUser.username && (
                    <p className="text-sm text-gray-500">@{telegramUser.username}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Mini App режим - ошибка или ожидание
            <div className="flex flex-col items-center gap-4">
              {!isTelegramReady ? (
                <>
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Ожидание Telegram...</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Откройте это приложение в Telegram для авторизации
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Ошибка авторизации</span>
                  </div>
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Повторить</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-sm text-gray-500">
          <p>
            {isLocalMode()
              ? 'Локальная разработка с mock токеном'
              : 'Автоматическая авторизация через Telegram'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}