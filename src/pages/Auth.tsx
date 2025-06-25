
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

const Auth = () => {
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AppName</h1>
          <p className="text-gray-600 mt-2">
            {authType === 'login' ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <AuthModal 
          type={authType} 
          onClose={() => {}} 
          onSwitchMode={() => setAuthType(authType === 'login' ? 'signup' : 'login')}
        />
      </div>
    </div>
  );
};

export default Auth;
