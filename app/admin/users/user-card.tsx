'use client';

import { useState } from 'react';
import { updateUserRole, deleteUser } from '../actions';
import { Shield, Mail, Calendar, Trash2, AlertTriangle, UserCircle } from 'lucide-react';
import { toast } from 'sonner';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
};

interface UserCardProps {
  user: User;
  currentUserId?: number;
}

export function UserCard({ user, currentUserId }: UserCardProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<'USER' | 'ADMIN' | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  const isMe = user.id === currentUserId;

  const confirmRoleChange = async () => {
    if (!pendingRole) return;
    setIsProcessing(true);
    try {
      await updateUserRole(user.id, pendingRole);
      toast.success('Роль обновлена');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setShowRoleModal(false);
      setPendingRole(null);
    }
  };

  const confirmDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteUser(user.id);
      toast.success('Пользователь удален');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Произошла ошибка';
      toast.error(message);
    } finally {
      setIsProcessing(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col relative">
        {isMe && (
          <div className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <UserCircle size={12} /> Вы
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-100 text-primary rounded-full flex items-center justify-center font-bold text-lg shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
              <Mail size={14} className="shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} className="shrink-0" />
            <span>Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield size={14} className={`shrink-0 ${user.role === 'ADMIN' ? 'text-green-500' : 'text-gray-400'}`} />
            <span className={user.role === 'ADMIN' ? 'font-medium text-green-600' : 'text-gray-500'}>
              {user.role === 'ADMIN' ? 'Администратор' : 'Пользователь'}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          {isMe ? (
            <p className="text-center text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              Вы не можете изменить свою роль или удалить себя
            </p>
          ) : (
            <>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => { setPendingRole('USER'); setShowRoleModal(true); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    user.role === 'USER' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >Юзер</button>
                <button
                  onClick={() => { setPendingRole('ADMIN'); setShowRoleModal(true); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition ${
                    user.role === 'ADMIN' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >Админ</button>
              </div>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition"
              >
                <Trash2 size={16} /> Удалить
              </button>
            </>
          )}
        </div>
      </div>

     {showRoleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setShowRoleModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold mb-2">Сменить роль?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Вы точно хотите назначить роль <span className="font-semibold text-gray-900">{pendingRole === 'ADMIN' ? 'Администратор' : 'Пользователь'}</span> для {user.firstName}?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowRoleModal(false)} className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 transition">Отмена</button>
              <button onClick={confirmRoleChange} disabled={isProcessing} className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition disabled:opacity-50">
                {isProcessing ? '...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="text-primary" size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">Удалить пользователя?</h3>
            <p className="text-sm text-gray-500 mb-5 text-center">Это действие нельзя отменить. Все данные {user.firstName} будут удалены.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-2 border rounded-xl hover:bg-gray-50 transition">Отмена</button>
              <button onClick={confirmDelete} disabled={isProcessing} className="flex-1 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/80 transition disabled:opacity-50">
                {isProcessing ? '...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}