'use client';

import { useState, useEffect } from 'react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import Link from 'next/link';
import { Container } from '@/components/shared';

export function RecentlyViewedBlock() {
  const { products } = useRecentlyViewed();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setIsMounted(prev => prev);
    };

    window.addEventListener('recentlyViewedChange', handleUpdate);
    return () => window.removeEventListener('recentlyViewedChange', handleUpdate);
  }, []);

  if (!isMounted || products.length === 0) return null;

  return (
    <Container className="mt-10 mb-8 px-4 sm:px-6 lg:px-8">
      <h3 className="text-2xl font-extrabold mb-6 text-gray-900">
        Вы недавно смотрели:
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/?product=${p.id}`}
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-square bg-gray-50 relative overflow-hidden rounded-xl">
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary transition">
                {p.name}
              </p>
              <p className="text-base font-bold mt-1 text-gray-900">
                {p.price} ₽
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
}