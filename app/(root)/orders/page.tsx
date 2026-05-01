'use client';

import React, { useState, useEffect } from 'react';
import { Container, Title } from '@/components/shared';
import { 
  ChevronDown, ChevronUp, Package, User, MapPin, 
  Calendar, Clock, CreditCard, MessageSquare, Cake, Gift 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
  fillingName?: string;
  weight?: number;
}

interface Order {
  id: number;
  createdAt: string;
  status: 'PENDING' | 'SUCCEEDED' | 'CANCELLED'; 
  paymentMethod: 'CASH' | 'CARD';
  totalAmount: number;
  deliveryPrice?: number | null;
  items: OrderItem[];
  fullName: string;
  email: string;
  phone: string;
  address: string;
  deliveryDate?: string;
  deliveryTime?: string;
  comment?: string;
}

const STATUS_CONFIG = {
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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <Container className="py-10 px-4 md:px-0">
        <Title text="Мои заказы" size="lg" className="font-extrabold mb-8" />
        <div className="space-y-4 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-20 px-4 md:px-0">
        <Title text="Мои заказы" size="lg" className="font-extrabold mb-8" />
        <div className="text-center py-20 max-w-3xl mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">У вас пока нет заказов</h3>
          <p className="text-gray-500 mb-6">Оформите первый заказ, и он появится здесь</p>
          <button 
            onClick={() => router.push('/')}
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition cursor-pointer"
          >
            Перейти в каталог
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10 px-4 md:px-0">
      <Title text="Мои заказы" size="lg" className="font-extrabold mb-8" />
      <div className="space-y-4 max-w-3xl mx-auto">
        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const statusKey = order.status as keyof typeof STATUS_CONFIG;
          const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;

          const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const deliveryPrice = order.deliveryPrice || 0;
          const originalTotal = itemsTotal + deliveryPrice;
          const discountAmount = originalTotal - order.totalAmount;
          const discountPercent = itemsTotal > 0 && discountAmount > 0 
            ? Math.round((discountAmount / itemsTotal) * 100) 
            : 0;

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
            >
              <div
                className="p-6 cursor-pointer"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold">Заказ #{order.id}</h3>
                    <span className="text-sm text-gray-400">
                      {format(new Date(order.createdAt), 'd MMMM yyyy, в HH:mm', { locale: ru })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-1 text-xs font-semibold rounded-full border ${status.classes}`}>
                      {status.label}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {order.items.length > 0 && (
                    <div className="p-6 space-y-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Товары в заказе</p>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0" />
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
                  )}

                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Получатель</p>
                          <p className="text-sm font-semibold">{order.fullName}</p>
                          <p className="text-xs text-gray-500">{order.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Адрес доставки</p>
                          <p className="text-sm">{order.address}</p>
                        </div>
                      </div>
                      {order.deliveryDate && (
                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Дата</p>
                            <p className="text-sm">{format(parseISO(order.deliveryDate), 'd MMMM yyyy', { locale: ru })}</p>
                          </div>
                        </div>
                      )}
                      {order.deliveryTime && (
                        <div className="flex items-start gap-2">
                          <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Время</p>
                            <p className="text-sm">{order.deliveryTime}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <CreditCard size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Способ оплаты</p>
                          <p className="text-sm">{order.paymentMethod === 'CASH' ? 'Наличные' : 'Карта'}</p>
                        </div>
                      </div>
                      {order.comment && (
                        <div className="flex items-start gap-2">
                          <MessageSquare size={16} className="text-gray-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-gray-500">Комментарий</p>
                            <p className="text-sm italic text-gray-600">{order.comment}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="space-y-2 mb-3 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Товары</span>
                        <span>{itemsTotal} ₽</span>
                      </div>
                      
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                          <div className="flex items-center gap-1.5">
                            <Gift size={14} className="text-green-500" />
                            <span>Скидка {discountPercent}%</span>
                          </div>
                          <span>-{discountAmount} ₽</span>
                        </div>
                      )}
                      
                      {deliveryPrice > 0 ? (
                        <div className="flex justify-between text-gray-500">
                          <span>Доставка</span>
                          <span>{deliveryPrice} ₽</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-gray-500">
                          <span>Доставка</span>
                          <span className="text-green-600 font-medium">Бесплатно</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="font-bold text-gray-900">Итого к оплате</span>
                      <span className="text-xl font-black text-gray-900">{order.totalAmount} ₽</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Container>
  );
}