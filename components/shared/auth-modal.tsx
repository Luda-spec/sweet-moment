'use client';

import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { LoginForm } from './auth-forms/login-form';
import { RegisterForm } from './auth-forms/register-form';

export const AuthModal: React.FC = () => {
  const { isOpen, setIsOpen, mode } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const title = mode === 'login' ? 'Вход в аккаунт' 
            : mode === 'register' ? 'Регистрация' 
            : 'Введите код';
            
  const subtitle = mode === 'login' ? 'Введите email и пароль' 
                 : mode === 'register' ? 'Заполните данные для создания аккаунта' 
                 : 'Код подтверждения отправлен на вашу почту';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className={cn(
        'relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-6 md:p-8',
        'animate-in fade-in zoom-in-95 duration-200'
      )}>
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>

        <div className="w-full">
          {mode === 'login' && <LoginForm />}
          {mode === 'register' && <RegisterForm />}
        </div>
      </div>
    </div>
  );
};