import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { mockUser } from '../mock-data';
import { toast } from 'sonner';

const FONTS = ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Times New Roman', 'Verdana'];

export function AlertCustomizer() {
  const [backgroundColor, setBackgroundColor] = useState('#6366f1');
  const [textColor, setTextColor] = useState('#ffffff');
  const [font, setFont] = useState('Arial');
  const [duration, setDuration] = useState([5]);
  const [showPreview, setShowPreview] = useState(false);

  const handleTestAlert = () => {
    setShowPreview(true);
    toast.info('Тестовый алерт запущен');
    setTimeout(() => setShowPreview(false), duration[0] * 1000);
  };

  const handleSave = () => {
    toast.success('Настройки алертов сохранены!');
  };

  return (
    <div className="space-y-6">
      {/* Settings */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Редактор стиля алертов</CardTitle>
          <CardDescription>
            Настройте внешний вид уведомлений о донатах
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Background Color */}
          <div className="space-y-2">
            <Label>Цвет фона</Label>
            <div className="flex gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label>Цвет текста</Label>
            <div className="flex gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <Label>Шрифт</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONTS.map((f) => (
                  <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Длительность показа</Label>
              <span className="text-sm font-medium">{duration[0]} сек</span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={3}
              max={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleTestAlert}
              className="flex-1 gap-2"
            >
              <Play className="w-4 h-4" />
              Тест
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Сохранить настройки
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Предпросмотр</CardTitle>
          <CardDescription>
            Так будет выглядеть алерт в OBS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 10px, transparent 10px, transparent 20px)',
              }} />
            </div>

            {/* Preview Alert */}
            <div
              className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                showPreview ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
              style={{
                backgroundColor,
                color: textColor,
                fontFamily: font,
                padding: '2rem',
                borderRadius: '1rem',
                minWidth: '300px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              }}
            >
              <p className="text-2xl font-bold mb-2">{mockUser.username}</p>
              <p className="text-5xl font-bold mb-2">500 ₽</p>
              <p className="text-xl">Спасибо за стрим!</p>
            </div>

            {/* Info text */}
            {!showPreview && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                <div>
                  <p className="text-lg mb-2">Нажмите "Тест" чтобы увидеть алерт</p>
                  <p className="text-sm text-gray-400">
                    Алерт будет отображаться {duration[0]} секунд
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}