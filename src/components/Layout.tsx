import React, { useState, useEffect } from 'react';
import type { PageType } from '../types';
import { LayoutDashboard, Radio, Rss, Key, Calendar, Play, PlusCircle, FileEdit, ShieldCheck, Clock, Activity, Settings, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  children: React.ReactNode;
}

const menuItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard size={18} /> },
  { id: 'channels', label: 'Каналы', icon: <Radio size={18} /> },
  { id: 'sources', label: 'Источники', icon: <Rss size={18} /> },
  { id: 'api', label: 'API и интеграции', icon: <Key size={18} /> },
  { id: 'content-plan', label: 'Контент-план', icon: <Calendar size={18} /> },
  { id: 'autopilot', label: 'Автопилот', icon: <Play size={18} /> },
  { id: 'create-post', label: 'Создать пост', icon: <PlusCircle size={18} /> },
  { id: 'drafts', label: 'Черновики', icon: <FileEdit size={18} /> },
  { id: 'moderation', label: 'Модерация', icon: <ShieldCheck size={18} /> },
  { id: 'history', label: 'История', icon: <Clock size={18} /> },
  { id: 'activity', label: 'Активность', icon: <Activity size={18} /> },
  { id: 'settings', label: 'Настройки', icon: <Settings size={18} /> },
];

export default function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-br from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Content</h1>
              <p className="text-xs text-white/80">Director</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg mb-1 transition-all ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">AI Powered Content</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed bottom-4 right-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <Sun size={24} className="text-yellow-500" />
        ) : (
          <Moon size={24} className="text-gray-700" />
        )}
      </button>
    </div>
  );
}
