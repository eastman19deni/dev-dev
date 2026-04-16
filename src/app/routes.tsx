import { createBrowserRouter, Navigate, redirect } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { StreamerPage } from './pages/StreamerPage';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

// Проверка авторизации
const authLoader = async () => {
  // При использовании кук, можно проверить наличие сессии
  // или просто положиться на сервер (если не авторизован - API вернет 401)
  const token = localStorage.getItem('auth_token'); // временно, пока не перешли на куки полностью
  if (!token) {
    return redirect('/auth');
  }
  return null;
};

// Проверка роли стримера
const streamerLoader = async () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return redirect('/auth');
  }
  // Можно добавить запрос к API для проверки роли
  return null;
};

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'streamer/:streamerId', Component: StreamerPage },
      { 
        path: 'dashboard', 
        Component: Dashboard,
        loader: streamerLoader,
      },
      { 
        path: 'settings', 
        Component: Settings,
        loader: authLoader,
      },
      { 
        path: 'profile', 
        Component: Profile,
        loader: authLoader,
      },
      { path: 'auth', element: <Navigate to="/" replace /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);