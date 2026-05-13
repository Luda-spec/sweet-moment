'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Prisma } from '@prisma/client';
import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui';
import { useCartStore } from '@/store/cart';
import { toast } from 'sonner';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    occasion: true;
    items: { include: { fillings: true } };
  };
}>;

interface Props {
  product: ProductWithRelations;
  className?: string;
}

export const ChooseCakeModal: React.FC<Props> = ({ product, className }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCartStore();
  const { track } = useRecentlyViewed();

  const availableItems = product.items.filter((item) => item.weight !== null);
  const firstWeight = availableItems[0]?.weight ?? 1000;

  const [selectedWeight, setSelectedWeight] = useState<number>(firstWeight);
  const [selectedFillingId, setSelectedFillingId] = useState<number>(
    product.items.flatMap((item) => item.fillings)[0]?.id
  );

  useEffect(() => {
    if (product) {
      const previewPrice = product.items[0]?.price || 0;
      track({
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: previewPrice,
      });
    }
  }, [product.id, track]);

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('product');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const uniqueFillings = useMemo(() => {
    const allFillings = product.items.flatMap((item) => item.fillings);
    const uniqueMap = new Map();
    allFillings.forEach((filling) => {
      if (!uniqueMap.has(filling.id)) {
        uniqueMap.set(filling.id, filling);
      }
    });
    return Array.from(uniqueMap.values());
  }, [product.items]);

  const selectedFilling =
    uniqueFillings.find((f) => f.id === selectedFillingId) ||
    uniqueFillings[0];

  const selectedItem = availableItems.find(
    (item) => item.weight === selectedWeight
  );

  const currentPrice = selectedItem?.price || 0;

  const handleAddToCart = () => {
    if (!selectedFilling) return;

    addItem({
      id: `${product.id}-${selectedWeight}-${selectedFillingId}`,
      productId: product.id,
      name: product.name,
      price: currentPrice,
      imageUrl: product.imageUrl,
      weight: selectedWeight,
      fillingName: selectedFilling.name,
    });

    toast.success('Добавлено в корзину');
    handleClose();
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          'p-0 w-[95vw] max-h-[90vh] md:w-[900px] max-w-[900px] bg-white overflow-hidden rounded-2xl md:rounded-3xl shadow-xl',
          className
        )}
      >
        <DialogTitle className="sr-only">{product.name}</DialogTitle>

        <DialogDescription className="sr-only">
          Выбор параметров торта: вес, начинка и добавление в корзину
        </DialogDescription>

        <div className="flex flex-col md:flex-row max-h-[90vh]">

          <div className="w-full md:w-[360px] p-3 md:p-5 flex items-center justify-center bg-gray-50 shrink-0">
            <div className="w-full max-w-[200px] md:max-w-[260px] aspect-square overflow-hidden rounded-xl md:rounded-2xl shadow-md bg-white">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-[500px] flex flex-col overflow-hidden p-4 md:p-6">

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">

              <div className="mb-4">
                <h2 className="text-xl md:text-2xl font-bold mb-2">
                  {product.name}
                </h2>

                {product.occasion && (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 w-fit mb-2">
                    <span className="text-xs md:text-sm font-medium text-gray-600">
                      Повод: {product.occasion.name}
                    </span>
                  </div>
                )}
              </div>

              {availableItems.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Вес:</p>
                  <div className="flex gap-2">
                    {availableItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          item.weight && setSelectedWeight(item.weight)
                        }
                        className={cn(
                          'flex-1 py-2 px-3 border-2 rounded-xl font-medium transition text-sm cursor-pointer',
                          selectedWeight === item.weight
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {item.weight}г
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {uniqueFillings.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Начинка:</p>

                  <div className="space-y-2">
                    {uniqueFillings.map((filling) => (
                      <button
                        key={filling.id}
                        onClick={() => setSelectedFillingId(filling.id)}
                        className={cn(
                          'w-full flex items-center gap-3 p-2.5 border-2 rounded-xl transition text-left cursor-pointer',
                          selectedFillingId === filling.id
                            ? 'border-primary bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="w-12 h-12 overflow-hidden rounded-lg shrink-0">
                          <img
                            src={filling.imageUrl}
                            alt={filling.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {filling.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedFilling && (
                <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-semibold mb-1">
                    Состав начинки {selectedFilling.name}:
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {selectedFilling.composition}
                  </p>
                </div>
              )}

            </div>

            <div className="pt-4 shrink-0">
              <Button 
                onClick={handleAddToCart}
                className="w-full text-white px-4 py-3.5 rounded-xl font-medium text-sm md:text-base cursor-pointer"
              >
                Добавить в корзину за {currentPrice}₽
              </Button>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};