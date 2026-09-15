import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { testTelegramConnection } from '../services/telegram';
import { logActivity } from '../services/activity';
import { encryptKey } from '../services/crypto';
import type { Channel, ChannelProfile } from '../types';
import { Plus, Settings, Trash2 } from 'lucide-react';

export default function Channels() {
  const channels = useLiveQuery(() => db.channels.toArray(), []) || [];
  const [showAdd, setShowAdd] = useState(false);
  const [editChannel, setEditChannel] = useState<Channel | null>(null);
  const [showProfile, setShowProfile] = useState<Channel | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить канал?')) return;
    await db.channels.delete(id);
    await logActivity('success', 'Channel deleted');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Каналы</h1>
          <p className="text-gray-600 mt-1">Управление Telegram каналами</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Добавить канал
        </button>
      </div>

      {channels.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">Нет каналов</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Добавить первый канал
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map(channel => (
            <div key={channel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{channel.name}</h3>
                  <p className="text-sm text-gray-500">@{channel.username}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${channel.botToken ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowProfile(channel)}
                  className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Профиль
                </button>
                <button
                  onClick={() => setEditChannel(channel)}
                  className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                >
                  <Settings size={12} />
                  Настройки
                </button>
                <button
                  onClick={() => handleDelete(channel.id!)}
                  className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddChannelModal onClose={() => setShowAdd(false)} />}
      {editChannel && <EditChannelModal channel={editChannel} onClose={() => setEditChannel(null)} />}
      {showProfile && <ChannelProfileModal channel={showProfile} onClose={() => setShowProfile(null)} />}
    </div>
  );
}

function AddChannelModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [chatId, setChatId] = useState('');
  const [botToken, setBotToken] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    if (!botToken) return;
    setTesting(true);
    const result = await testTelegramConnection(botToken);
    if (result.success) {
      setTestResult({ success: true, message: `✓ Бот @${result.bot?.username} подключён` });
    } else {
      setTestResult({ success: false, message: result.error || 'Ошибка' });
    }
    setTesting(false);
  };

  const handleSave = async () => {
    if (!name || !username) {
      alert('Заполните название и username');
      return;
    }

    await db.channels.add({
      name,
      username,
      telegramChatId: chatId,
      botToken: encryptKey(botToken),
      autopilotEnabled: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await db.channelProfiles.add({
      channelId: (await db.channels.orderBy('id').reverse().first())!.id!,
      brand: name,
      businessDescription: '',
      niche: '',
      country: '',
      city: '',
      language: 'Russian',
      audience: '',
      toneOfVoice: '',
      requiredCTA: '',
      hashtags: '',
      brandMention: name,
      forbiddenElements: ''
    });

    await logActivity('success', `Channel "${name}" added`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Добавить канал</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Channel ID</label>
            <input
              type="text"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
            <input
              type="password"
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          {botToken && (
            <button
              onClick={handleTest}
              disabled={testing}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              {testing ? 'Проверка...' : '🔍 Проверить подключение'}
            </button>
          )}
          {testResult && (
            <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.message}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Отмена
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function EditChannelModal({ channel, onClose }: { channel: Channel; onClose: () => void }) {
  const [name, setName] = useState(channel.name);
  const [username, setUsername] = useState(channel.username);
  const [chatId, setChatId] = useState(channel.telegramChatId || '');
  const [botToken, setBotToken] = useState('');

  const handleSave = async () => {
    const updateData: any = {
      name,
      username,
      telegramChatId: chatId,
      updatedAt: new Date().toISOString()
    };

    if (botToken) {
      updateData.botToken = encryptKey(botToken);
    }

    await db.channels.update(channel.id!, updateData);
    await logActivity('success', `Channel "${name}" updated`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Настройки канала</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Channel ID</label>
            <input
              type="text"
              value={chatId}
              onChange={e => setChatId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token (оставьте пустым чтобы не менять)</label>
            <input
              type="password"
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Отмена
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

function ChannelProfileModal({ channel, onClose }: { channel: Channel; onClose: () => void }) {
  const profile = useLiveQuery(() => db.channelProfiles.where('channelId').equals(channel.id!).first(), [channel.id]);
  const [formData, setFormData] = useState<any>({});

  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSave = async () => {
    if (profile?.id) {
      await db.channelProfiles.update(profile.id, formData);
      await logActivity('success', 'Profile updated');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Профиль канала: {channel.name}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Бренд</label>
            <input
              type="text"
              value={formData.brand || ''}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание бизнеса</label>
            <textarea
              value={formData.businessDescription || ''}
              onChange={e => setFormData({ ...formData, businessDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Страна</label>
              <input
                type="text"
                value={formData.country || ''}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Аудитория</label>
            <textarea
              value={formData.audience || ''}
              onChange={e => setFormData({ ...formData, audience: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone of Voice</label>
            <input
              type="text"
              value={formData.toneOfVoice || ''}
              onChange={e => setFormData({ ...formData, toneOfVoice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CTA</label>
            <input
              type="text"
              value={formData.requiredCTA || ''}
              onChange={e => setFormData({ ...formData, requiredCTA: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Хештеги</label>
            <input
              type="text"
              value={formData.hashtags || ''}
              onChange={e => setFormData({ ...formData, hashtags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Отмена
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
