import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export function StopWords() {
  const [stopWords, setStopWords] = useState(['спам', 'реклама', 'токсик']);
  const [newWord, setNewWord] = useState('');

  const handleAddWord = () => {
    if (newWord.trim() && !stopWords.includes(newWord.trim().toLowerCase())) {
      setStopWords([...stopWords, newWord.trim().toLowerCase()]);
      setNewWord('');
      toast.success(`Слово "${newWord.trim()}" добавлено в стоп-лист`);
    }
  };

  const handleRemoveWord = (word: string) => {
    setStopWords(stopWords.filter(w => w !== word));
    toast.info(`Слово "${word}" удалено из стоп-листа`);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Управление стоп-словами</CardTitle>
        <CardDescription>
          Донаты с этими словами будут автоматически отклонены системой
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <AlertDescription>
            Система проверяет сообщения на наличие запрещенных слов перед отображением алерта
          </AlertDescription>
        </Alert>

        {/* Add Word */}
        <div className="flex gap-2">
          <Input
            placeholder="Добавить новое слово..."
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
          />
          <Button onClick={handleAddWord} className="gap-2">
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        </div>

        {/* Words List */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700">
            Список запрещенных слов ({stopWords.length})
          </h3>
          
          {stopWords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Список пуст</p>
              <p className="text-sm mt-1">Добавьте первое стоп-слово</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stopWords.map((word) => (
                <div
                  key={word}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{word}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveWord(word)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Статистика:</span> За последнюю неделю было автоматически отклонено 12 донатов из-за стоп-слов
          </p>
        </div>
      </CardContent>
    </Card>
  );
}