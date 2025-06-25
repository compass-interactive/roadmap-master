import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AuthModalProps {
  type: 'login' | 'signup' | null;
  onClose: () => void;
  onSwitchMode?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ type, onClose, onSwitchMode }) => {
  const title = type === 'login' ? 'Welcome Back' : 'Create Account';
  return (
    <Dialog open={!!type} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md p-0 bg-white/90 backdrop-blur-md">
        <VisuallyHidden>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </VisuallyHidden>
        <div className="p-6">
          <CardHeader>
              <CardTitle className="text-center">{title}</CardTitle>
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
