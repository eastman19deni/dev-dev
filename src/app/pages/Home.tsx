import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Plus, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { streamerApi, balanceApi, userApi } from '../../services/api';
import type { StreamerItem, User } from '../types';

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [streamers, setStreamers] = useState<StreamerItem[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

 const loadData = async () => {
  try {
    setIsLoading(true);
    
    // Загружаем пользователя
    let userData = null;
    try {
      userData = await userApi.getMe();
    } catch (err) {
      console.error('Failed to load user:', err);
      toast.error('Не удалось загрузить профиль');
    }
    
    // Загружаем стримеров
    let streamersData = null;
    try {
      streamersData = await streamerApi.getAll({ limit: 50 });
    } catch (err) {
      console.error('Failed to load streamers:', err);
      toast.error('Не удалось загрузить список стримеров');
    }
    
    // Загружаем баланс
    let balanceData = null;
    try {
      balanceData = await balanceApi.get();
    } catch (err) {
      console.error('Failed to load balance:', err);
      toast.error('Не удалось загрузить баланс');
    }
    
    if (userData) setUser(userData);
    if (streamersData) setStreamers(streamersData.items);
    if (balanceData) setBalance(balanceData.balance);
    
  } catch (error) {
    console.error('Failed to load data:', error);
  } finally {
    setIsLoading(false);
  }
};

  const filteredStreamers = streamers.filter(streamer =>
    (streamer.display_name || streamer.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeposit = async (amount: number) => {
    try {
      const response = await balanceApi.topup(amount);
      setBalance(response.new_balance);
      toast.success(`Баланс пополнен на ${amount} coins!`);
      setDepositDialogOpen(false);
      setDepositAmount('');
    } catch (error: any) {
      console.error('Failed to deposit:', error);
      toast.error(error?.message || 'Ошибка при пополнении баланса');
    }
  };

  const handleCustomDeposit = () => {
    const amount = Number(depositAmount);
    if (amount > 0) {
      handleDeposit(amount);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Добро пожаловать,</p>
            <h1 className="text-2xl font-bold">{user?.display_name || user?.username || 'Гость'}</h1>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full"
            onClick={() => setDepositDialogOpen(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-sm opacity-90 mb-1">Ваш баланс</p>
          <p className="text-4xl font-bold">{balance} coins</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 -mt-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Поиск стримеров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 bg-white shadow-lg border-0 rounded-2xl"
          />
        </div>
      </div>

      {/* Streamers List */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Активные стримеры</h2>
          <div className="flex items-center gap-1 text-red-500">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">LIVE</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStreamers.map((streamer) => (
            <div
              key={streamer.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={streamer.avatar_url || '/default-avatar.png'}
                      alt={streamer.display_name || streamer.username || 'Streamer'}
                      className="w-16 h-16 rounded-full"
                    />
                    {streamer.is_live && (
                      <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-white px-2 py-0 text-xs">
                        LIVE
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {streamer.display_name || streamer.username || 'Аноним'}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">Стример</p>
                    
                    {streamer.goal && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>{streamer.goal.title || 'Цель'}</span>
                          <span className="font-medium">
                            {streamer.goal.current_amount}/{streamer.goal.target_amount}
                          </span>
                        </div>
                        <Progress 
                          value={(streamer.goal.current_amount / streamer.goal.target_amount) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => navigate(`/streamer/${streamer.id}`)}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Сделать донат
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredStreamers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Стримеры не найдены</p>
          </div>
        )}
      </div>

      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Пополнить баланс</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleDeposit(100)}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">+100</div>
                  <div className="text-xs text-gray-500">coins</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeposit(500)}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">+500</div>
                  <div className="text-xs text-gray-500">coins</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDeposit(1000)}
                className="h-16"
              >
                <div className="text-center">
                  <div className="text-lg font-bold">+1000</div>
                  <div className="text-xs text-gray-500">coins</div>
                </div>
              </Button>
            </div>

            <div>
              <Input
                type="number"
                placeholder="Или введите свою сумму"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="1"
              />
              <Button
                className="w-full mt-2"
                onClick={handleCustomDeposit}
                disabled={!depositAmount || Number(depositAmount) <= 0}
              >
                Пополнить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}