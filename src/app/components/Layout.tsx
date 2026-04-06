import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Home, User, Settings, TrendingUp } from 'lucide-react';
import { mockUser } from '../mock-data';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isStreamer = mockUser.role === 'streamer';

  const viewerTabs = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/profile', icon: User, label: 'Профиль' }
  ];

  const streamerTabs = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/dashboard', icon: TrendingUp, label: 'Dashboard' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
    { path: '/profile', icon: User, label: 'Профиль' }
  ];

  const tabs = isStreamer ? streamerTabs : viewerTabs;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}