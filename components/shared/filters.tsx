'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Title } from './title';
import { FilterCheckbox } from './filter-checkbox';
import { Input } from '../ui';
import { RangeSlider } from './range-slider';
import { CheckboxFiltersGroup } from './checkbox-filters-group';
import { useFilterOccasions } from '@/hooks/useFilterOccasions';
import qs from 'qs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSet } from 'react-use'; 
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface Props {
  className?: string;
}

interface PriceProps {
  priceFrom?: number;
  priceTo?: number;
}

interface FiltersQuery {
  priceFrom?: number;
  priceTo?: number;
  types?: string;
  occasions?: string;
}

export const Filters: React.FC<React.PropsWithChildren<Props>> = ({ className }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { occasions, loading: loadingOccasions, selectedIds, onAddId } = useFilterOccasions();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [prices, setPrice] = useState<PriceProps>(() => ({
    priceFrom: searchParams.get('priceFrom') ? Number(searchParams.get('priceFrom')) : undefined,
    priceTo: searchParams.get('priceTo') ? Number(searchParams.get('priceTo')) : undefined,
  }));

  const [types, { toggle: toggleTypes }] = useSet(
    new Set<string>(
      searchParams.get('types')?.split(',').filter(Boolean) || []
    )
  );

  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoadingTypes(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  const typeItems = [
    { value: 'cake', text: 'Можно выбирать начинку' },
    { value: 'other', text: 'Другое' },
  ];

  const items = useMemo(() => occasions.map((item) => ({
    value: String(item.id),
    text: item.name,
  })), [occasions]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const filters: FiltersQuery = {};
      
      if (prices.priceFrom) filters.priceFrom = prices.priceFrom;
      if (prices.priceTo) filters.priceTo = prices.priceTo;
      
      const typesArray = Array.from(types);
      if (typesArray.length > 0) filters.types = typesArray.join(',');
      
      const occasionsArray = Array.from(selectedIds);
      if (occasionsArray.length > 0) filters.occasions = occasionsArray.join(',');

      const query = Object.keys(filters).length > 0 
        ? qs.stringify(filters, { arrayFormat: 'comma' })
        : '';

      const newUrl = query ? `?${query}` : '/';
      const currentQuery = window.location.search;
      const newQuery = query ? `?${query}` : '';
      
      if (currentQuery !== newQuery) {
        router.push(newUrl, { scroll: false });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [prices, types, selectedIds, router]);

  const updatePrice = (name: keyof PriceProps, value: number) => {
    setPrice((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  return (
    <>
      <button 
        className="md:hidden fixed bottom-5 right-5 z-40 bg-primary text-white w-14 h-14 rounded-full shadow-lg shadow-purple-200 flex items-center justify-center active:scale-95 transition-transform"
        onClick={() => setIsMobileOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
        </svg>
      </button>

      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={cn(
        'bg-white md:bg-transparent rounded-t-3xl md:rounded-none',
        'fixed md:static bottom-0 left-0 right-0 z-50 md:z-auto',
        'transition-transform duration-300 ease-in-out',
        'md:transform-none',
        isMobileOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0',
        className
      )}>

        <div className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-3xl">
          <Title text="Фильтры" size="sm" className="font-bold" />
          <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 md:p-0 max-h-[70vh] md:max-h-none overflow-y-auto md:overflow-visible">
          <Title text="Фильтрация" size="sm" className="mb-4 md:mb-5 font-bold hidden md:block" />

          <div className="flex flex-col gap-3 md:gap-4">
            {loadingTypes
              ? typeItems.map((_, idx) => (
                  <Skeleton key={idx} className="h-6 w-full rounded-md" />
                ))
              : typeItems.map((item) => (
                  <FilterCheckbox
                    key={item.value}
                    name="type"
                    text={item.text}
                    value={item.value}
                    onCheckedChange={() => toggleTypes(item.value)}
                    checked={types.has(item.value)}
                  />
                ))}
          </div>

          <div className="mt-4 md:mt-5 border-y md:border-y-neutral-100 py-4 md:py-6">
            <p className="font-bold mb-3 text-sm md:text-base">Цена от и до:</p>

            <div className="flex gap-2 md:gap-3 mb-4">
              <Input
                type="number"
                placeholder="0"
                min={0}
                max={20000}
                value={prices.priceFrom ?? ''}
                onChange={(e) => updatePrice('priceFrom', Number(e.target.value))}
                className="h-10 text-sm"
              />
              <Input
                type="number"
                placeholder="20000"
                min={0}
                max={20000}
                value={prices.priceTo ?? ''}
                onChange={(e) => updatePrice('priceTo', Number(e.target.value))}
                className="h-10 text-sm"
              />
            </div>

            <RangeSlider
              min={0}
              max={20000}
              step={100}
              value={[prices.priceFrom || 0, prices.priceTo || 20000]}
              onValueChange={([priceFrom, priceTo]) =>
                setPrice({ 
                  priceFrom: priceFrom || undefined, 
                  priceTo: priceTo === 20000 ? undefined : priceTo 
                })
              }
            />
          </div>

          <CheckboxFiltersGroup
            title="Повод:"
            name="occasions"
            className="mt-4 md:mt-5"
            limit={6}
            defaultItems={items.slice(0, 6)}
            items={items}
            loading={loadingOccasions}
            onClickCheckbox={onAddId}
            selectedIds={selectedIds}
          />
        </div>

        <div className="md:hidden p-4 border-t bg-white sticky bottom-0">
          <button 
            className="w-full bg-primary text-white py-3.5 rounded-xl font-medium active:scale-[0.98] transition-transform"
            onClick={() => setIsMobileOpen(false)}
          >
            Показать результаты
          </button>
        </div>
      </div>
    </>
  );
};