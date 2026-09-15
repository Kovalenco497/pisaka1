import React, { useState, useEffect } from 'react';
import { initializeDatabase } from './db';
import Layout from './components/Layout';
import CreatePost from './pages/CreatePost';
import Channels from './pages/Channels';
import Sources from './pages/Sources';
import { 
  Dashboard, 
  AutopilotPage, 
  DraftsPage, 
  ModerationPage, 
  HistoryPage, 
  ActivityPage, 
  SettingsPage, 
  ApiSettingsPage,
  ContentPlanPage
} from './pages/OtherPages';
import type { PageType } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-lg font-bold">AI</span>
          </div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'channels': return <Channels />;
      case 'sources': return <Sources />;
      case 'api': return <ApiSettingsPage />;
      case 'content-plan': return <ContentPlanPage />;
      case 'autopilot': return <AutopilotPage />;
      case 'create-post': return <CreatePost />;
      case 'drafts': return <DraftsPage />;
      case 'moderation': return <ModerationPage />;
      case 'history': return <HistoryPage />;
      case 'activity': return <ActivityPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default App;
