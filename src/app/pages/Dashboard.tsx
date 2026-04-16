import { useState, useEffect } from 'react';
import { Power, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { streamApi } from '../../services/api';
import { donationApi } from '../../services/api';
import type { SessionStats, StreamStatusResponse } from '../types';

export function Dashboard() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamStatus, setStreamStatus] = useState<StreamStatusResponse | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [widgetUrl, setWidgetUrl] = useState('');

  // Загрузка статуса стрима при монтировании
  useEffect(() => {
    loadStreamStatus();
    loadSessionStats();
  }, []);

  const loadStreamStatus = async () => {
    try {
      const status = await streamApi.getStatus();
      setStreamStatus(status);
      setIsStreaming(status.is_live);
      if (status.widget_url) {
        setWidgetUrl(status.widget_url);
      }
    } catch (error) {
      console.error('Failed to load stream status:', error);
      toast.error('Не удалось загрузить статус стрима');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionStats = async () => {
    try {
      const stats = await donationApi.getSessionStats();
      setSessionStats(stats);
    } catch (error) {
      console.error('Failed to load session stats:', error);
    }
  };

  const handleCopyWidget = () => {
    if (widgetUrl) {
      navigator.clipboard.writeText(widgetUrl);
      setCopied(true);
      toast.success('Ссылка скопирована в буфер обмена!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleStream = async () => {
    try {
      if (isStreaming) {
        // Завершаем стрим
        const response = await streamApi.stop();
        toast.success(`Стрим завершён! Собрано: ${response.total_collected} coins`);
        setIsStreaming(false);
        setStreamStatus(null);
        setWidgetUrl('');
      } else {
        // Начинаем стрим
        const response = await streamApi.start();
        setWidgetUrl(response.widget_url);
        setStreamStatus({
          is_live: true,
          session_id: response.session_id,
          started_at: response.started_at,
          widget_url: response.widget_url,
        });
        toast.success('Стрим запущен!');
        setIsStreaming(true);
        
        // Загружаем статистику после запуска
        setTimeout(() => loadSessionStats(), 1000);
      }
      
      // Обновляем статистику
      await loadSessionStats();
    } catch (error: any) {
      console.error('Failed to toggle stream:', error);
      toast.error(error?.message || 'Ошибка при управлении стримом');
    }
  };

  const formatDuration = () => {
    if (!streamStatus?.started_at) return '0ч 0м';
    
    const now = new Date();
    const startTime = new Date(streamStatus.started_at);
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  // Подготовка данных для графика
  const chartData = sessionStats?.timeline.map(item => ({
    time: new Date(item.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    amount: item.amount,
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Dashboard Стримера</h1>
        <p className="text-green-100">Управление стримом</p>
      </div>

      <div className="px-6 -mt-4 space-y-6">
        {/* Stream Control */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Статус стрима</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">Текущий статус</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                  <p className="text-xl font-bold">
                    {isStreaming ? 'В ЭФИРЕ' : 'Офлайн'}
                  </p>
                </div>
                {isStreaming && (
                  <p className="text-sm text-gray-600 mt-1">
                    Время в эфире: {formatDuration()}
                  </p>
                )}
              </div>
              <Button
                size="lg"
                variant={isStreaming ? 'destructive' : 'default'}
                onClick={handleToggleStream}
                className="gap-2"
              >
                <Power className="w-5 h-5" />
                {isStreaming ? 'Завершить' : 'Начать'}
              </Button>
            </div>

            {/* Widget URL */}
            {widgetUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Ссылка на виджет для OBS</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={widgetUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border rounded-lg text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyWidget}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(widgetUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Собрано за сессию</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {sessionStats?.total_collected || 0} coins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Количество донатов</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {sessionStats?.donations_count || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Топ донатер</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold truncate">
                {sessionStats?.top_donator?.username || '—'}
              </p>
              <p className="text-xl font-bold text-purple-600">
                {sessionStats?.top_donator?.total_amount || 0} coins
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>График поступлений</CardTitle>
              <CardDescription>Доходы за текущую сессию</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Donations - можно добавить позже через отдельный API запрос */}
        {!isStreaming && sessionStats?.donations_count === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-gray-500">
                {isStreaming 
                  ? 'Ожидайте донаты...' 
                  : 'Запустите стрим, чтобы начать получать донаты'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}