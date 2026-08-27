import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './i18n';
import './index.css';

const RootApp: React.FC = () => {
  const { user } = useAuth();
  return (
    <SocketProvider userId={user?.id}>
      <App />
    </SocketProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RootApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
