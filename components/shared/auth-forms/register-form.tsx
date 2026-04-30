'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  lastName: z.string().min(2, 'Фамилия должна быть не менее 2 символов'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { setMode, resetForm } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка регистрации');
      }

      toast.success('Регистрация успешна!', {
        description: 'Теперь вы можете войти в аккаунт',
      });
      
      setMode('login');
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Что-то пошло не так';
      toast.error('Ошибка регистрации', {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            type="text"
            placeholder="Имя"
            className="h-12 text-base"
            {...register('firstName')}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <Input
            type="text"
            placeholder="Фамилия"
            className="h-12 text-base"
            {...register('lastName')}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Input
          type="email"
          placeholder="Email"
          className="h-12 text-base"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Пароль"
          className="h-12 text-base"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-12 bg-primary hover:bg-primary/90 text-base font-bold cursor-pointer"
        disabled={loading}
      >
        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>

      <div className="text-center text-sm text-gray-500">
        Уже есть аккаунт?{' '}
        <button
          type="button"
          onClick={() => setMode('login')}
          className="text-primary hover:underline font-medium cursor-pointer"
        >
          Войти
        </button>
      </div>
    </form>
  );
};