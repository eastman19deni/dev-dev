import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout.tsx';
import { Home } from './pages/Home';
import { StreamerPage } from './pages/StreamerPage';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { AuthPage } from './pages/AuthPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'streamer/:streamerId', Component: StreamerPage },
      { path: 'dashboard', Component: Dashboard },
      { path: 'settings', Component: Settings },
      { path: 'profile', Component: Profile },
      { path: 'auth', Component: AuthPage },
    ],
  },
]);
