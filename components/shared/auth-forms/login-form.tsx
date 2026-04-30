'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setMode } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Ошибка входа', {
          description: 'Неверный email или пароль',
        });
      } else {
        toast.success('Успешный вход!', {
          description: 'Добро пожаловать!',
        });
        router.refresh();
        window.location.reload(); 
      }
    } catch (error) {
      toast.error('Ошибка', {
        description: 'Что-то пошло не так',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {loading ? 'Вход...' : 'Войти'}
      </Button>

      <div className="text-center text-sm text-gray-500">
        Нет аккаунта?{' '}
        <button
          type="button"
          onClick={() => setMode('register')}
          className="text-primary hover:underline font-medium cursor-pointer"
        >
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
};