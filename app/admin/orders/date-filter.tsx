'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Calendar, X } from 'lucide-react';

interface DateFilterProps {
  initialStartDate?: string;
  initialEndDate?: string;
}

export function DateFilter({ initialStartDate = '', initialEndDate = '' }: DateFilterProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  const applyFilter = () => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    router.push(`/admin/orders?${params.toString()}`);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    router.push('/admin/orders');
  };

  const isActive = startDate || endDate;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">С даты</label>
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-gray-500 mb-1.5">По дату</label>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
          />
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <button
        onClick={applyFilter}
        className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition active:scale-95"
      >
        Применить
      </button>

      {isActive && (
        <button
          onClick={clearFilter}
          className="flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition"
        >
          <X size={16} /> Сбросить
        </button>
      )}
    </div>
  );
}