import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

export function PassiveIncome() {
  const [enabled, setEnabled] = useState(true);
  const [amount, setAmount] = useState('10');
  const [interval, setInterval] = useState('5');

  const handleSave = () => {
    toast.success('Настройки пассивного дохода сохранены!');
  };

  const estimatedPerHour = enabled 
    ? Math.floor((60 / Number(interval)) * Number(amount)) 
    : 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Настройка пассивного дохода</CardTitle>
        <CardDescription>
          Автоматическое начисление монет зрителям во время стрима
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Label htmlFor="passive-toggle" className="text-base font-medium cursor-pointer">
              Включить пассивный доход
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Зрители будут получать монеты за просмотр
            </p>
          </div>
          <Switch
            id="passive-toggle"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {/* Settings */}
        {enabled && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма начисления (монет)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                От 1 до 100 монет за начисление
              </p>
            </div>

            {/* Interval */}
            <div className="space-y-2">
              <Label htmlFor="interval">Интервал начисления (минут)</Label>
              <Input
                id="interval"
                type="number"
                min="1"
                max="60"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                От 1 до 60 минут между начислениями
              </p>
            </div>

            {/* Info Block */}
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Зрители будут получать <span className="font-bold">{amount} монет</span> каждые{' '}
                <span className="font-bold">{interval} минут</span>, пока вы в эфире
              </AlertDescription>
            </Alert>

            {/* Estimation */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-1">Примерный расход за час стрима:</p>
              <p className="text-3xl font-bold text-green-600">
                ~{estimatedPerHour} монет
              </p>
              <p className="text-xs text-gray-600 mt-1">на одного зрителя</p>
            </div>
          </div>
        )}

        {/* Disabled State */}
        {!enabled && (
          <div className="text-center py-8 text-gray-500">
            <p>Пассивный доход отключен</p>
            <p className="text-sm mt-1">
              Включите, чтобы награждать зрителей за просмотр
            </p>
          </div>
        )}

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={!enabled}
        >
          Сохранить настройки
        </Button>

        {/* Additional Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <p className="font-medium">Как это работает:</p>
          <ul className="space-y-1 ml-4">
            <li className="flex gap-2">
              <span>•</span>
              <span>Зрители получают монеты автоматически во время просмотра</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Начисления происходят только когда вы в эфире</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Полученные монеты можно потратить на донаты</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}