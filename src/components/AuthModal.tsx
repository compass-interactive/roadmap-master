import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
  onSwitchMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ type, onClose, onSwitchMode }) => {
  return (
    <Dialog open={!!type} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 bg-white/90 backdrop-blur-md">
        <div className="p-6">
          <CardHeader>
            <CardTitle className="text-center">
              {type === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          {type === 'login' ? (
            <LoginForm onClose={onClose} onSwitchMode={onSwitchMode} />
          ) : (
            <SignupForm onClose={onClose} onSwitchMode={onSwitchMode} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
