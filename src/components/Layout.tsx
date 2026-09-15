import React from 'react';
import type { PageType } from '../types';
import { LayoutDashboard, Radio, Rss, Key, Calendar, Play, PlusCircle, FileEdit, ShieldCheck, Clock, Activity, Settings } from 'lucide-react';

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
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-600 to-purple-600">
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
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">AI Powered Content</p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
