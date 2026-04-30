import { prisma } from '@/prisma/prisma-client';
import { DateFilter } from './date-filter';
import { OrderCard } from './order-card';
import { Package } from 'lucide-react';

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  productId?: number;
  imageUrl?: string;
  fillingName?: string;
  weight?: number;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const startDate = params.startDate;
  const endDate = params.endDate;

  const dateFilter: Record<string, Date> = {};
  
  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); 
    dateFilter.gte = start;
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); 
    dateFilter.lte = end;
  }

  const where = Object.keys(dateFilter).length > 0 
    ? { createdAt: dateFilter } 
    : {};

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Заказы</h1>
        <p className="text-gray-500 mt-1">Просмотр деталей и управление статусами</p>
      </div>

      <DateFilter 
        initialStartDate={startDate} 
        initialEndDate={endDate} 
      />

      <div className="space-y-4 mt-6">
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={{
                ...order,
                items: order.items as unknown as OrderItem[], 
              }} 
            />
          ))
        ) : (
          <div className="text-center py-16 text-gray-500 bg-white rounded-2xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} className="text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-1">Заказов не найдено</p>
            <p className="text-sm">Попробуйте изменить период фильтрации</p>
          </div>
        )}
      </div>
    </div>
  );
}