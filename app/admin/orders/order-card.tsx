'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '../actions';
import { OrderStatus } from '@prisma/client';
import {
  ChevronDown,
  ChevronUp,
  Package,
  User,
  MapPin,
  Clock,
  CreditCard,
  MessageSquare,
  Cake,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  fillingName?: string;
  weight?: number;
};

type Order = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryPrice?: number | null;
  paymentMethod: 'CASH' | 'CARD';
  items: OrderItem[];
  fullName: string;
  phone: string;
  address: string;
  deliveryDate?: string | null;
  deliveryTime?: string | null;
  comment?: string | null;
  createdAt: Date | string;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; classes: string }> = {
  PENDING: {
    label: 'В обработке',
    classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  SUCCEEDED: {
    label: 'Выполнен',
    classes: 'bg-green-100 text-green-700 border-green-200',
  },
  CANCELLED: {
    label: 'Отменён',
    classes: 'bg-red-100 text-red-700 border-red-200',
  },
};

export function OrderCard({ order }: { order: Order }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStatus = formData.get('status') as string;
    
    if (newStatus === order.status) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      router.refresh();
      toast.success('Статус заказа обновлен');
    } catch {
      toast.error('Ошибка при обновлении статуса');
    } finally {
      setIsUpdating(false);
    }
  };

  const productsTotal = order.totalAmount - (order.deliveryPrice || 0);
  const isFreeDelivery = order.deliveryPrice == null || order.deliveryPrice === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div
        className="p-4 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
            <Package size={18} className="text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Заказ #{order.id}</h3>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${STATUS_CONFIG[order.status].classes}`}>
            {STATUS_CONFIG[order.status].label}
          </span>
          <span className="font-bold text-gray-900">{order.totalAmount} ₽</span>
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-400 shrink-0" />
          ) : (
            <ChevronDown size={20} className="text-gray-400 shrink-0" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="px-4 pb-6 pt-2 border-t border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
            <div className="flex items-start gap-2">
              <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">Клиент</p>
                <p className="text-sm font-semibold">{order.fullName}</p>
                <p className="text-xs text-gray-500">{order.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-500">Адрес</p>
                <p className="text-sm">{order.address}</p>
              </div>
            </div>
            {(order.deliveryDate || order.deliveryTime) && (
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="flex flex-col gap-1">
                  {order.deliveryDate && (
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-medium text-gray-500">Дата:</span>
                       <span className="text-sm">{order.deliveryDate}</span>
                    </div>
                  )}
                  {order.deliveryTime && (
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-medium text-gray-500">Время:</span>
                       <span className="text-sm">{order.deliveryTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-3">Товары в заказе</p>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200 bg-white shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                    {(item.weight || item.fillingName) && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.weight && <span className="font-medium">{item.weight} г</span>}
                        {item.weight && item.fillingName && <span className="mx-1">•</span>}
                        {item.fillingName && <span>{item.fillingName}</span>}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-900">{item.price * item.quantity} ₽</p>
                    <p className="text-xs text-gray-400">× {item.quantity} шт.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <CreditCard size={16} />
              <span className="text-gray-500">Оплата:</span> 
              <span className="font-medium">{order.paymentMethod === 'CASH' ? 'Наличные' : 'Карта'}</span>
            </div>
            {order.comment && (
              <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-100">
                <MessageSquare size={16} className="shrink-0 mt-0.5 text-yellow-600" />
                <span className="italic text-yellow-800">{order.comment}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Товары:</span>
              <span>{productsTotal} ₽</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1.5">
                <Truck size={14} className="text-gray-400" /> Доставка:
              </span>
              <span className={isFreeDelivery ? 'text-green-600 font-medium' : ''}>
                {isFreeDelivery ? 'Бесплатно' : `${order.deliveryPrice} ₽`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Итого к оплате:</span>
              <span className="text-base">{order.totalAmount} ₽</span>
            </div>
          </div>

          <form onSubmit={handleStatusChange} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700 shrink-0">Обновить статус:</span>
            <select
              name="status"
              defaultValue={order.status}
              className="flex-1 sm:max-w-[240px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition bg-white"
              disabled={isUpdating}
            >
              <option value="PENDING">В обработке</option>
              <option value="SUCCEEDED">Выполнен</option>
              <option value="CANCELLED">Отменён</option>
            </select>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 shrink-0"
            >
              {isUpdating ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}