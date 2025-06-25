
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
  onSwitchMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ type, onClose, onSwitchMode }) => {
  if (!type) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'login' ? (
          <LoginForm onClose={onClose} onSwitchMode={onSwitchMode} />
        ) : (
          <SignupForm onClose={onClose} onSwitchMode={onSwitchMode} />
        )}
      </CardContent>
    </Card>
  );
};
