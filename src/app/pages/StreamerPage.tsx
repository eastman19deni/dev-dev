import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { streamerApi, donationApi, balanceApi, stopWordsApi, alertApi } from '../../services/api';
import type { StreamerProfile, AlertSettings, StopWord } from '../types';

const PRESET_AMOUNTS = [10, 50, 100, 500];

export function StreamerPage() {
  const { streamerId } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'toxic'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [streamer, setStreamer] = useState<StreamerProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [stopWords, setStopWords] = useState<StopWord[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (streamerId) {
      loadData();
    }
  }, [streamerId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [streamerData, balanceData, stopWordsData, alertData] = await Promise.all([
        streamerApi.getById(Number(streamerId)),
        balanceApi.get(),
        stopWordsApi.getAll().catch(() => []), // Может быть ошибка если пользователь не стример
        alertApi.getSettings().catch(() => null),
      ]);
      
      setStreamer(streamerData);
      setBalance(balanceData.balance);
      setStopWords(stopWordsData);
      setAlertSettings(alertData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Не удалось загрузить данные стримера');
    } finally {
      setIsLoading(false);
    }
  };

  const checkStopWords = (text: string): boolean => {
    const lowerText = text.toLowerCase();
    return stopWords.some(stopWord => 
      lowerText.includes(stopWord.word.toLowerCase())
    );
  };

  const handleSendDonation = async () => {
    const donationAmount = amount || Number(customAmount);

    if (donationAmount <= 0) {
      toast.error('Выберите сумму доната');
      return;
    }

    // Проверка баланса
    if (donationAmount > balance) {
      setStatus('error');
      toast.error('Недостаточно средств на балансе');
      return;
    }

    // Проверка стоп-слов
    if (message && checkStopWords(message)) {
      setStatus('toxic');
      toast.error('Ваше сообщение содержит запрещённые слова');
      return;
    }

    setIsSending(true);
    try {
      const response = await donationApi.send({
        streamer_id: Number(streamerId),
        amount: donationAmount,
        message: message || undefined,
      });

      // Обновляем баланс
      const newBalance = await balanceApi.get();
      setBalance(newBalance.balance);

      setStatus('success');
      toast.success(`Донат ${donationAmount} coins успешно отправлен!`);
      
      // Сбрасываем форму через 3 секунды
      setTimeout(() => {
        setStatus('idle');
        setAmount(null);
        setCustomAmount('');
        setMessage('');
      }, 3000);
    } catch (error: any) {
      console.error('Failed to send donation:', error);
      setStatus('error');
      toast.error(error?.message || 'Ошибка при отправке доната');
    } finally {
      setIsSending(false);
    }
  };

  const selectedAmount = amount || Number(customAmount) || 0;
  const characterCount = message.length;
  const maxCharacters = 200;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!streamer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Стример не найден</p>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  // Используем настройки алертов стримера или значения по умолчанию
  const previewSettings = alertSettings || {
    bg_color: '#6366f1',
    text_color: '#ffffff',
    font: 'Arial',
    duration_sec: 5,
    image_enabled: false,
    tts_enabled: false,
    tts_voice: 'default',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Streamer Info */}
      <div className="px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="relative">
              <img
                src={streamer.avatar_url || '/default-avatar.png'}
                alt={streamer.display_name || streamer.username || 'Streamer'}
                className="w-20 h-20 rounded-full"
              />
              {streamer.is_live && (
                <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-white">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {streamer.display_name || streamer.username || 'Аноним'}
              </h1>
              <p className="text-gray-600">{streamer.description || 'Стример'}</p>
            </div>
          </div>

          {/* Goal Progress */}
          {streamer.goal && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-700">
                  🎯 {streamer.goal.title || 'Цель'}
                </p>
                <p className="text-sm font-semibold text-blue-600">
                  {Math.round((streamer.goal.current_amount / streamer.goal.target_amount) * 100)}%
                </p>
              </div>
              <Progress
                value={(streamer.goal.current_amount / streamer.goal.target_amount) * 100}
                className="h-3 mb-2"
              />
              <p className="text-sm text-gray-600 text-right">
                {streamer.goal.current_amount} / {streamer.goal.target_amount} coins
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Donation Form */}
      <div className="px-6 py-6 space-y-6">
        {/* Amount Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Выберите сумму</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset}
                variant={amount === preset ? 'default' : 'outline'}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount('');
                }}
                className="h-16"
                disabled={isSending}
              >
                <div className="text-center">
                  <div className="text-lg font-bold">{preset}</div>
                  <div className="text-xs">coins</div>
                </div>
              </Button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Своя сумма"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setAmount(null);
            }}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            disabled={isSending}
          />
        </div>

        {/* Message */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Ваше сообщение (необязательно)</h2>
            <span className={`text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
              {characterCount}/{maxCharacters}
            </span>
          </div>
          <Textarea
            placeholder="Напишите сообщение стримеру..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-24 resize-none"
            maxLength={maxCharacters}
            disabled={isSending}
          />
        </div>

        {/* Preview */}
        {(selectedAmount > 0 || message) && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold mb-4">Предпросмотр алерта</h2>
            <div
              className="rounded-lg p-4 text-center"
              style={{
                backgroundColor: previewSettings.bg_color,
                color: previewSettings.text_color,
                fontFamily: previewSettings.font,
              }}
            >
              <p className="text-2xl font-bold mb-2">Вы</p>
              <p className="text-4xl font-bold mb-2">{selectedAmount} coins</p>
              {message && <p className="text-lg">{message}</p>}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Донат успешно отправлен! Ожидайте реакцию стримера.
            </AlertDescription>
          </Alert>
        )}

        {status === 'toxic' && (
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Ваше сообщение нарушает правила и было отклонено.
            </AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Недостаточно средств на балансе.
            </AlertDescription>
          </Alert>
        )}

        {/* Send Button */}
        <Button
          className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={handleSendDonation}
          disabled={selectedAmount <= 0 || status !== 'idle' || isSending}
        >
          <Send className="w-5 h-5 mr-2" />
          {isSending ? 'Отправка...' : 'Отправить донат'}
        </Button>

        <p className="text-sm text-gray-500 text-center">
          Ваш баланс: {balance} coins
        </p>
      </div>
    </div>
  );
}