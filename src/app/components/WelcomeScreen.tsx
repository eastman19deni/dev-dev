import { motion } from 'motion/react';
import { Button } from './ui/button';
import { ArrowRight, Gift, Zap, Shield } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-6"
          >
            <img
              src="/snack.webp"
              alt="TipBot"
              className="w-full h-full rounded-full object-cover"
            />
          </motion.div>

          <h1 className="text-3xl font-bold mb-2 text-gray-800">
            Добро пожаловать в TipBot!
          </h1>
          <p className="text-gray-600 mb-8">
            Поддерживай любимых стримеров и получай награды
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Отправляй донаты</p>
                <p className="text-sm text-gray-500">Поддерживай стримеров во время эфира</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Пассивный доход</p>
                <p className="text-sm text-gray-500">Получай монеты просто за просмотр</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Безопасность</p>
                <p className="text-sm text-gray-500">Авторизация через Telegram</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onComplete}
            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Начать
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-xs text-gray-400 mt-4">
            Нажимая "Начать", вы принимаете условия использования
          </p>
        </div>
      </motion.div>
    </div>
  );
}