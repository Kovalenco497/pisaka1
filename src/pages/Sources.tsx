import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { logActivity } from '../services/activity';
import type { Source } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export default function Sources() {
  const sources = useLiveQuery(() => db.sources.toArray(), []) || [];
  const [showAdd, setShowAdd] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить источник?')) return;
    await db.sources.delete(id);
    await logActivity('success', 'Source deleted');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Источники</h1>
          <p className="text-gray-600 mt-1">Управление источниками контента</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18} />
          Добавить источник
        </button>
      </div>

      {sources.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">Нет источников</p>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Добавить первый источник
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map(source => (
            <div key={source.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{source.name}</h3>
                  <p className="text-sm text-gray-500">{source.type}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className="text-xs text-gray-500 mb-4 break-all">{source.url}</p>
              <button
                onClick={() => handleDelete(source.id!)}
                className="w-full px-3 py-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
              >
                <Trash2 size={12} />
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddSourceModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function AddSourceModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Source['type']>('rss');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('local');

  const handleSave = async () => {
    if (!name || !url) {
      alert('Заполните название и URL');
      return;
    }

    await db.sources.add({
      name,
      type,
      url,
      category,
      language: 'en',
      country: 'CA',
      includeKeywords: '',
      excludeKeywords: '',
      refreshIntervalMinutes: 60,
      active: true
    });

    await logActivity('success', `Source "${name}" added`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Добавить источник</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="rss">RSS</option>
              <option value="google_news">Google News</option>
              <option value="perplexity">Perplexity</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="local">Local</option>
              <option value="sales">Sales</option>
              <option value="trust">Trust</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Отмена</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Сохранить</button>
        </div>
      </div>
    </div>
  );
}
