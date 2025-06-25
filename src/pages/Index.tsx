import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : !user ? (
        <LandingPage navigate={navigate} />
      ) : (
        <Dashboard />
      )}
    </SidebarProvider>
  );
};

export default Index;
