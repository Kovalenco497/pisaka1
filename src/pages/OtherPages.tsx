import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { logActivity } from '../services/activity';
import type { Channel, Post, Schedule } from '../types';
import { Plus, Trash2 } from 'lucide-react';

// Dashboard
export function Dashboard() {
  const channels = useLiveQuery(() => db.channels.toArray(), []) || [];
  const posts = useLiveQuery(() => db.posts.toArray(), []) || [];
  const sources = useLiveQuery(() => db.sources.toArray(), []) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Дашборд</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Каналы</p>
          <p className="text-3xl font-bold text-gray-900">{channels.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Посты</p>
          <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Источники</p>
          <p className="text-3xl font-bold text-gray-900">{sources.length}</p>
        </div>
      </div>
    </div>
  );
}

// API Settings
export function ApiSettingsPage() {
  const providers = useLiveQuery(() => db.aiProviders.toArray(), []) || [];
  const imageProviders = useLiveQuery(() => db.imageProviders.toArray(), []) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">API и интеграции</h1>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Провайдеры</h2>
          {providers.length === 0 ? (
            <p className="text-gray-500">Нет настроенных AI провайдеров</p>
          ) : (
            <div className="space-y-2">
              {providers.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.type} - {p.model}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.active ? 'Активен' : 'Выключен'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Image Провайдеры</h2>
          {imageProviders.length === 0 ? (
            <p className="text-gray-500">Нет настроенных Image провайдеров</p>
          ) : (
            <div className="space-y-2">
              {imageProviders.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.type} - {p.model}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {p.active ? 'Активен' : 'Выключен'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Autopilot
export function AutopilotPage() {
  const channels = useLiveQuery(() => db.channels.toArray(), []) || [];
  const schedules = useLiveQuery(() => db.schedules.toArray(), []) || [];
  const [activeChannel, setActiveChannel] = useState<number | null>(channels[0]?.id || null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const handleAddSchedule = async (dayOfWeek: number, time: string, category: string) => {
    if (!activeChannel) return;
    await db.schedules.add({
      channelId: activeChannel,
      dayOfWeek,
      time,
      category,
      active: true,
      maxPostsPerDay: 1,
      minIntervalHours: 2
    });
    setShowAddSchedule(false);
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    await db.schedules.delete(scheduleId);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Автопилот</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Канал</h2>
          <select
            value={activeChannel || ''}
            onChange={(e) => setActiveChannel(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            {channels.map((ch: Channel) => (
              <option key={ch.id} value={ch.id}>{ch.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Расписание</h2>
          <button onClick={() => setShowAddSchedule(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus size={18} />
            Добавить
          </button>
        </div>

        {schedules.filter(s => s.channelId === activeChannel).length === 0 ? (
          <p className="text-gray-500">Нет расписания</p>
        ) : (
          <div className="space-y-2">
            {schedules.filter(s => s.channelId === activeChannel).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{dayNames[s.dayOfWeek]} {s.time}</p>
                  <p className="text-sm text-gray-500">{s.category}</p>
                </div>
                <button onClick={() => handleDeleteSchedule(s.id!)} className="px-3 py-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <AddScheduleForm onClose={() => setShowAddSchedule(false)} onAdd={handleAddSchedule} />
        </div>
      )}
    </div>
  );
}

function AddScheduleForm({ onClose, onAdd }: { onClose: () => void; onAdd: (day: number, time: string, category: string) => void }) {
  const [day, setDay] = useState(1);
  const [time, setTime] = useState('12:00');
  const [category, setCategory] = useState('sales');
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="bg-white rounded-xl w-full max-w-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Добавить расписание</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">День</label>
          <select value={day} onChange={e => setDay(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            {dayNames.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Время</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
            <option value="sales">Sales</option>
            <option value="trust">Trust</option>
            <option value="local">Local</option>
            <option value="interactive">Interactive</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Отмена</button>
        <button onClick={() => onAdd(day, time, category)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Добавить</button>
      </div>
    </div>
  );
}

// Drafts
export function DraftsPage() {
  const posts = useLiveQuery(() => db.posts.where('status').equals('draft').toArray(), []) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Черновики</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">Нет черновиков</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">{post.topic}</h3>
              <p className="text-sm text-gray-600 mt-2">{post.content.substring(0, 200)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Moderation
export function ModerationPage() {
  const posts = useLiveQuery(() => db.posts.where('status').equals('moderation').toArray(), []) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Модерация</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">Нет постов на модерации</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">{post.topic}</h3>
              <p className="text-sm text-gray-600 mt-2">{post.content.substring(0, 200)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// History
export function HistoryPage() {
  const posts = useLiveQuery(() => db.posts.where('status').equals('published').toArray(), []) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">История</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">Нет опубликованных постов</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900">{post.topic}</h3>
              <p className="text-sm text-gray-600 mt-2">{post.content.substring(0, 200)}...</p>
              <p className="text-xs text-gray-500 mt-2">Опубликовано: {post.publishedAt ? new Date(post.publishedAt).toLocaleString() : 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Activity
export function ActivityPage() {
  const logs = useLiveQuery(() => db.activityLogs.orderBy('timestamp').reverse().limit(50).toArray(), []) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Активность</h1>
      {logs.length === 0 ? (
        <p className="text-gray-500">Нет активности</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-2 border-b border-gray-100">
                <span className={`text-xs ${
                  log.type === 'success' ? 'text-green-600' :
                  log.type === 'error' ? 'text-red-600' :
                  log.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : log.type === 'warning' ? '⚠' : 'ℹ'}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{log.message}</p>
                  <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Settings
export function SettingsPage() {
  const settings = useLiveQuery(() => db.appSettings.toArray(), []) || [];
  const [formData, setFormData] = useState<any>({});

  React.useEffect(() => {
    if (settings.length > 0) {
      setFormData(settings[0]);
    }
  }, [settings]);

  const handleSave = async () => {
    if (settings.length > 0) {
      await db.appSettings.update(settings[0].id!, formData);
      await logActivity('success', 'Settings updated');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Настройки</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Часовой пояс</label>
            <input
              type="text"
              value={formData.timezone || ''}
              onChange={e => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Язык</label>
            <select
              value={formData.language || 'ru'}
              onChange={e => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}

// Content Plan
export function ContentPlanPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Контент-план</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Контент-план будет доступен в следующих обновлениях</p>
      </div>
    </div>
  );
}
