import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { generatePostWithPipeline } from '../services/perplexity';
import { generateImageFromPost } from '../services/image';
import { publishPost } from '../services/telegram';
import { logActivity } from '../services/activity';
import { detectCategory } from '../services/research';
import type { Channel, ChannelProfile } from '../types';

export default function CreatePost() {
  const channels = useLiveQuery(() => db.channels.toArray(), []) || [];
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<string>('auto');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatingText, setGeneratingText] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [publishError, setPublishError] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const channel = channels.find((c: Channel) => c.id === selectedChannel);
  const profile = useLiveQuery(() => 
    selectedChannel ? db.channelProfiles.where('channelId').equals(selectedChannel).first() : undefined, 
    [selectedChannel]
  );

  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id!);
    }
  }, [channels, selectedChannel]);

  const isTelegramConfigured = !!(channel?.botToken && channel?.telegramChatId);

  const handleGenerateText = async () => {
    if (!topic.trim()) {
      setToast({ message: 'Введите тему поста', type: 'error' });
      return;
    }

    setGeneratingText(true);
    try {
      const effectiveCategory = category === 'auto' ? detectCategory(topic) : category;
      
      const result = await generatePostWithPipeline(
        profile,
        channel,
        effectiveCategory,
        topic
      );

      if (result.success && result.content) {
        setContent(result.content);
        setCategory(effectiveCategory);
        setToast({ message: '✓ Текст успешно сгенерирован!', type: 'success' });
        await logActivity('success', `Post generated: ${result.content.length} characters`);
      } else {
        setToast({ message: `Ошибка генерации: ${result.error}`, type: 'error' });
      }
    } catch (error) {
      setToast({ message: `Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    } finally {
      setGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!content) {
      setToast({ message: 'Сначала сгенерируйте текст поста', type: 'error' });
      return;
    }

    setGeneratingImage(true);
    try {
      const result = await generateImageFromPost(
        content,
        category,
        profile?.brand || channel?.name || '',
        topic
      );

      if (result.success && result.imageUrl) {
        setImageUrl(result.imageUrl);
        setImagePrompt(result.imagePrompt || '');
        setToast({ message: '✓ Изображение успешно сгенерировано!', type: 'success' });
        await logActivity('success', 'Image generated successfully');
      } else {
        setToast({ message: `Ошибка генерации изображения: ${result.error}`, type: 'error' });
      }
    } catch (error) {
      setToast({ message: `Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!content) {
      setToast({ message: 'Нет контента для сохранения', type: 'error' });
      return;
    }

    try {
      await db.posts.add({
        channelId: selectedChannel!,
        topic,
        category: category as any,
        content,
        status: 'draft',
        imageUrl: imageUrl || undefined,
        imagePrompt: imagePrompt || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await logActivity('success', 'Draft saved');
      setToast({ message: '✓ Черновик сохранен!', type: 'success' });
    } catch (error) {
      setToast({ message: `Ошибка сохранения: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    }
  };

  const handlePublish = async () => {
    if (!content) {
      setPublishError('Нет текста поста');
      return;
    }

    if (!selectedChannel) {
      setPublishError('Не выбран канал');
      return;
    }

    if (!isTelegramConfigured) {
      setPublishError('Telegram не настроен. Откройте "Каналы" и настройте Bot Token и Channel ID');
      return;
    }

    setGenerating(true);
    setPublishError('');

    try {
      const postId = await db.posts.add({
        channelId: selectedChannel,
        topic,
        category: category as any,
        content,
        status: 'approved',
        imageUrl: imageUrl || undefined,
        imagePrompt: imagePrompt || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      const result = await publishPost(selectedChannel, postId as number);

      if (result.success) {
        await logActivity('success', 'Post published to Telegram');
        setToast({ message: '✓ Пост опубликован!', type: 'success' });
        setContent('');
        setImageUrl('');
        setTopic('');
      } else {
        setPublishError(`Ошибка публикации: ${result.error}`);
      }
    } catch (error) {
      setPublishError(`Ошибка: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const publishDisabled = !content || !selectedChannel || !isTelegramConfigured || generating;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border ${
          toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center gap-2">
            <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : 'ℹ'}</span>
            <span className="text-sm font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Создать пост</h1>
          <p className="text-gray-600 mt-1">Генерация и публикация контента</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Настройки</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Канал</label>
                  <select
                    value={selectedChannel || ''}
                    onChange={(e) => setSelectedChannel(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {channels.map((ch: Channel) => (
                      <option key={ch.id} value={ch.id}>{ch.name}</option>
                    ))}
                  </select>
                  {!isTelegramConfigured && channel && (
                    <p className="text-xs text-orange-600 mt-2">⚠️ Telegram не настроен</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="auto">🤖 Автоматически</option>
                    <option value="sales">💰 Sales</option>
                    <option value="trust">🤝 Trust</option>
                    <option value="local">📍 Local</option>
                    <option value="interactive">💬 Interactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тема поста</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Например: Toyota Camry для аренды"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Генерация</h2>
              
              <div className="space-y-3">
                <button
                  onClick={handleGenerateText}
                  disabled={!topic.trim() || generatingText}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {generatingText ? 'Генерация текста...' : '✨ Сгенерировать текст'}
                </button>

                <button
                  onClick={handleGenerateImage}
                  disabled={!content || generatingImage}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {generatingImage ? 'Генерация изображения...' : '🎨 Сгенерировать изображение'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Текст поста</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Текст поста появится здесь после генерации..."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {imageUrl && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Изображение</h2>
                <img src={imageUrl} alt="Generated" className="w-full rounded-lg" />
                {imagePrompt && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-600 cursor-pointer">Image Prompt</summary>
                    <p className="text-xs text-gray-500 mt-2">{imagePrompt}</p>
                  </details>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {showPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {category === 'auto' ? 'Auto' : category}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="w-full rounded-lg mb-4" />
                  )}
                  {content ? (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{content}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Введите текст или сгенерируйте пост для предпросмотра...</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Действия</h2>
              <div className="space-y-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={!content}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
                >
                  💾 Сохранить черновик
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  👁️ {showPreview ? 'Скрыть' : 'Показать'} Preview
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishDisabled}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  title={publishError}
                >
                  📤 Опубликовать
                </button>
              </div>
              {publishError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">✗ {publishError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
