import { useState, useEffect } from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { alertApi } from '../../services/api';
import { userApi } from '../../services/api';
import type { AlertSettings, User } from '../types';

const FONTS = ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Times New Roman', 'Verdana'];
const TTS_VOICES = ['default', 'male', 'female', 'robot'];

export function AlertCustomizer() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AlertSettings>({
    bg_color: '#6366f1',
    text_color: '#ffffff',
    font: 'Arial',
    duration_sec: 5,
    image_enabled: false,
    tts_enabled: false,
    tts_voice: 'default',
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [userData, alertSettings] = await Promise.all([
        userApi.getMe(),
        alertApi.getSettings().catch(() => null),
      ]);
      
      setUser(userData);
      if (alertSettings) {
        setSettings(alertSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Не удалось загрузить настройки');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAlert = () => {
    setShowPreview(true);
    toast.info('Тестовый алерт запущен');
    setTimeout(() => setShowPreview(false), settings.duration_sec * 1000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = await alertApi.updateSettings({
        bg_color: settings.bg_color,
        text_color: settings.text_color,
        font: settings.font,
        duration_sec: settings.duration_sec,
        image_enabled: settings.image_enabled,
        tts_enabled: settings.tts_enabled,
        tts_voice: settings.tts_voice,
      });
      setSettings(updatedSettings);
      toast.success('Настройки алертов сохранены!');
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error?.message || 'Ошибка при сохранении настроек');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
                value={settings.bg_color}
                onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={settings.bg_color}
                onChange={(e) => setSettings({ ...settings, bg_color: e.target.value })}
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
                value={settings.text_color}
                onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-200"
              />
              <input
                type="text"
                value={settings.text_color}
                onChange={(e) => setSettings({ ...settings, text_color: e.target.value })}
                className="flex-1 px-4 py-2 border rounded-lg"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* Font */}
          <div className="space-y-2">
            <Label>Шрифт</Label>
            <Select 
              value={settings.font} 
              onValueChange={(value) => setSettings({ ...settings, font: value })}
            >
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
              <span className="text-sm font-medium">{settings.duration_sec} сек</span>
            </div>
            <Slider
              value={[settings.duration_sec]}
              onValueChange={([value]) => setSettings({ ...settings, duration_sec: value })}
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
              disabled={isSaving}
            >
              <Play className="w-4 h-4" />
              Тест
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить настройки'
              )}
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
                backgroundColor: settings.bg_color,
                color: settings.text_color,
                fontFamily: settings.font,
                padding: '2rem',
                borderRadius: '1rem',
                minWidth: '300px',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              }}
            >
              <p className="text-2xl font-bold mb-2">
                {user?.display_name || user?.username || 'Зритель'}
              </p>
              <p className="text-5xl font-bold mb-2">500 coins</p>
              <p className="text-xl">Спасибо за стрим!</p>
            </div>

            {/* Info text */}
            {!showPreview && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-4">
                <div>
                  <p className="text-lg mb-2">Нажмите "Тест" чтобы увидеть алерт</p>
                  <p className="text-sm text-gray-400">
                    Алерт будет отображаться {settings.duration_sec} секунд
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