import { useState, useEffect } from 'react';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { stopWordsApi } from '../../services/api';
import type { StopWord } from '../types';

export function StopWords() {
  const [stopWords, setStopWords] = useState<StopWord[]>([]);
  const [newWord, setNewWord] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadStopWords();
  }, []);

  const loadStopWords = async () => {
    try {
      setIsLoading(true);
      const words = await stopWordsApi.getAll();
      setStopWords(words);
    } catch (error) {
      console.error('Failed to load stop words:', error);
      toast.error('Не удалось загрузить стоп-слова');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWord = async () => {
    const trimmedWord = newWord.trim().toLowerCase();
    
    if (!trimmedWord) {
      toast.error('Введите слово');
      return;
    }

    if (stopWords.some(w => w.word.toLowerCase() === trimmedWord)) {
      toast.error('Это слово уже в списке');
      return;
    }

    setIsAdding(true);
    try {
      const addedWord = await stopWordsApi.add(trimmedWord);
      setStopWords([...stopWords, addedWord]);
      setNewWord('');
      toast.success(`Слово "${trimmedWord}" добавлено в стоп-лист`);
    } catch (error: any) {
      console.error('Failed to add stop word:', error);
      toast.error(error?.message || 'Ошибка при добавлении слова');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveWord = async (wordId: number, word: string) => {
    setDeletingId(wordId);
    try {
      await stopWordsApi.remove(wordId);
      setStopWords(stopWords.filter(w => w.id !== wordId));
      toast.info(`Слово "${word}" удалено из стоп-листа`);
    } catch (error: any) {
      console.error('Failed to remove stop word:', error);
      toast.error(error?.message || 'Ошибка при удалении слова');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
            onKeyPress={(e) => e.key === 'Enter' && !isAdding && handleAddWord()}
            disabled={isAdding}
          />
          <Button 
            onClick={handleAddWord} 
            className="gap-2"
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
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
                  key={word.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{word.word}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveWord(word.id, word.word)}
                    disabled={deletingId === word.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === word.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}