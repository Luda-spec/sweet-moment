'use client';

import { cn } from '@/lib/utils';
import { Api } from '@/services/api-client';
import { Product } from '@prisma/client';
import { Search } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useClickAway, useDebounce } from 'react-use';

interface Props {
  className?: string;
}

export const SearchInput: React.FC<Props> = ({ className }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const ref = React.useRef<HTMLDivElement>(null);

  useClickAway(ref, () => {
    setFocused(false);
  });

  useDebounce(
    async () => {
      try {
        if (searchQuery.length > 0) {
          const response = await Api.products.search(searchQuery);
          setProducts(response);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.log(error);
      }
    },
    250,
    [searchQuery],
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery('');
    setProducts([]);
  };

  return (
    <>
      {focused && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 transition-opacity md:hidden" 
          onClick={() => setFocused(false)} 
        />
      )}

      <div
        ref={ref}
        className={cn('relative z-30 w-full', className)}
      >
        <div 
          className={cn(
            'flex items-center h-11 md:h-12 rounded-2xl overflow-hidden transition-all duration-300 border ml-3 mr-3',
            focused 
              ? 'bg-white border-transparent ring-2 ring-primary/20 shadow-lg' 
              : 'bg-gray-100 border-transparent hover:bg-gray-200/70'
          )}
        >
          <Search className={cn(
            'ml-3 h-5 w-5 shrink-0 transition-colors',
            focused ? 'text-primary' : 'text-gray-400'
          )} />
          
          <input
            className="bg-transparent border-none outline-none w-full px-3 text-sm md:text-base placeholder:text-gray-400 text-gray-900"
            type="text"
            placeholder="Найти товар..."
            onFocus={() => setFocused(true)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {products.length > 0 && (
          <div
            className={cn(
              'absolute w-full bg-white rounded-xl py-2 mt-2 shadow-xl border border-gray-100 transition-all duration-200 z-30',
              focused ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2 pointer-events-none',
            )}
          >
            <div className="max-h-[300px] md:max-h-[400px] overflow-y-auto scrollbar-hide">
              {products.map((product) => (
                <Link
                  onClick={onClickItem}
                  key={product.id}
                  href={`?product=${product.id}`}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 truncate">{product.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};